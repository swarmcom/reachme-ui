import Vue from 'vue'
import WsProto from '@/ws-proto.js'
import {EventBus} from '@/event-bus.js'
import config from 'config'

function cfg(key, default_value) {
  return config[key] ? config[key] : default_value
}

function guess_ws () {
  let proto = window.location.protocol == "http:" ? "ws://" : "wss://"
  let port = window.location.port ? ":" + window.location.port : ""
  return proto + window.location.hostname + port + "/reach/ws"
}

function guess_http () {
  return window.location.origin + "/reach"
}

function guess_rr () {
  return window.location.origin + "/rr"
}

async function session_auth(agent) {
  try {
    let SessionKey = localStorage.getItem('session-key')
    if (SessionKey) {
      let Agent = await agent.p_mfa('ws_auth', 'login', [SessionKey])
      agent.vm.agent = Agent
      localStorage.setItem('session-key', Agent.session_key)
      EventBus.$emit('agent-auth', agent.isAuth())
    }
  }
  catch (error) {
    console.log("failed to login with session key:", error)
  }
  agent.vm.session_auth = true
}

async function update_agent(agent) {
  agent.vm.agent = await agent.p_mfa('ws_agent', 'get', [])
}

export default class Agent extends WsProto {
  constructor () {
    super(cfg('reach_ws', guess_ws()))
    this.vm = new Vue({
      data: {
        session_auth: false,
        agent: null,
        state: null,
        hangup_state: null,
        activity_time: undefined,
        release_id: undefined,
        storage_data: {},
        reports_cache: {},
        live_cache: {},
        wide_page: {},
        layoutSM: { isActiveAM: false, isActiveQM: false, isActiveMS: true, isActiveCD: true},
        canLogout: true,
        notification: null
      }
    }),
    this.loadDataStorage("reach-ui")
    this.maybeLoadWidePage()
    Notification.requestPermission()
    EventBus.$on('agent_update', () => update_agent(this))
    EventBus.$on('agent_state', (S) => this.handleState(S.state))
    EventBus.$on('takeover', (S) => this.handleTakeOver(S))
  }

  maybeLoadWidePage () {
    let data = localStorage.getItem("wide_page")
    if (data) {
      this.vm.wide_page = JSON.parse(data)
    }
  }

  saveWidePage () {
    localStorage.setItem("wide_page", JSON.stringify(this.vm.wide_page))
  }

  loadDataStorage(name) {
    let data = localStorage.getItem(name)
    if(data) {
      this.vm.storage_data = JSON.parse(data)
      if (this.vm.storage_data.isActiveAM != undefined) {
        this.vm.layoutSM.isActiveAM = this.vm.storage_data.isActiveAM
      }
      if (this.vm.storage_data.isActiveMS != undefined) {
        this.vm.layoutSM.isActiveMS = this.vm.storage_data.isActiveMS
      }
      if (this.vm.storage_data.isActiveCD != undefined) {
        this.vm.layoutSM.isActiveCD = this.vm.storage_data.isActiveCD
      }
      if (this.vm.storage_data.live) {
        this.vm.live_cache = this.vm.storage_data.live
      }
    }
  }
  saveCache(name) {
    this.vm.storage_data['live'] = this.vm.live_cache
    localStorage.setItem(name, JSON.stringify(this.vm.storage_data))
  }

  getData () {
    return this.vm
  }

  get_api () {
    return cfg('reach_http', guess_http())
  }

  get_rr_uri () {
    return cfg('reach_rr', guess_rr())
  }

  avatar_uri (avatar) {
    return this.get_rr_uri()+'/avatar/'+avatar
  }

  onDisconnect () {
    if(this.vm.canLogout) {
      super.onDisconnect()
      this.handleAuth()
    }
  }

  onConnect () {
    super.onConnect()
    session_auth(this)
  }

  // AGENT API
  logout () {
    this.saveCache('reach-ui')
    if (this.vm.state === 'wrapup') {
      this.end_wrapup()
    }
    window.location.href = '#'
    localStorage.removeItem('session-key')
    this.mfa('ws_auth', 'logout', [], () => this.handleAuth())
    this.connect()
  }

  release (Id) {
    this.call('release', [Id])
    this.vm.release_id = Id;
  }
  default_release () { this.call('release', []) }
  available () { this.call('available') }
  hangup () { this.call('hangup') }
  hold () { this.call('hold') }
  unhold () { this.call('unhold') }
  place_call (LineId, Target) { this.call('place_call', [LineId, Target]) }
  record (Cmd) { this.call('record', [Cmd]) }
  play (UUID) { this.call('record', ['play', UUID]) }
  end_wrapup () { this.call('end_wrapup') }

  transfer_to_agent (Agent) { this.call('transfer_to_agent', [Agent]) }
  transfer_to_queue (Queue) { this.call('transfer_to_queue', [Queue]) }
  transfer_to_uri (Uri, LineId) { this.call('transfer_to_uri', [Uri, LineId]) }
  conference_to_agent (Agent) { this.call('conference_to_agent', [Agent]) }
  conference_to_queue (Queue) { this.call('conference_to_queue', [Queue]) }
  conference_to_uri (Uri, LineId) { this.call('conference_to_uri', [Uri, LineId]) }

  login (Login, Password, Domain, Cb = (A) => A) {
    if (this.isAuth()) {
      this.handleAuth(this.vm.agent)
    } else {
      this.mfa('ws_auth', 'login', [Domain, Login, Password, false], (A) => this.handleAuth(A, Cb))
    }
  }

  takeover (Login, Password, Domain, Cb = (A) => A) {
    if (this.isAuth()) {
      this.handleAuth(this.vm.agent)
    } else {
      this.mfa('ws_auth', 'login', [Domain, Login, Password, true], (A) => this.handleAuth(A, Cb))
    }
  }

  handleTakeOver(S) {
    this.vm.canLogout = false
  }

  handleState (S) {
    if (S && this.vm.agent && this.vm.agent.id === S.agent_id) {
      this.vm.hangup_state = S.hangup_state
      this.vm.state = S.state
      this.vm.release_id = S.release_id
      if(S.state === 'ringing') {
        if (!this.vm.notification) {
          this.show_callnotification(S.inqueue)
        }
      }
      else if (this.vm.notification) {
        this.vm.notification = null
      }
    }
  }

  showNotification(theBody, TheIcon, theTitle) {
    let options = {
      body: theBody,
      icon: TheIcon
    }
    let n = new Notification(theTitle, options);
  }

  show_callnotification (inqueue) {
    if (!("Notification" in window)) {
      return
    } else if (Notification.permission === "granted" && inqueue.line_in) {
      let body = `Client: ${inqueue.line_in.client.name}\nQueue: ${inqueue.queue.name}`
      this.vm.notification = new Notification("Incoming call", { body: body })
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission()
    }
  }

  isAuth () { return this.vm.agent }
  role() { return this.vm.agent.role.ui }
  permAllowed(name) {
    if(this.vm.agent.permissions && this.vm.agent.permissions[name])
      return true
    else
      return false
  }

  is_active () { return (this.vm.state !== 'release' || this.vm.state !== 'available') }
  is_idle() { return (this.vm.state == 'release' || this.vm.state == 'available') }
  is_ringing () { return this.vm && this.vm.state == 'ringing' }
  is_oncall () { return this.vm && this.vm.state == 'oncall' }
  is_wrapup () { return this.vm && this.vm.state == 'wrapup' }
  is_hold () { return this.vm && this.vm.state == 'hold' }
  is_onsession() { return this.vm && ( this.vm.state == 'oncall' || this.vm.state == 'conference' || this.vm.state == 'inconference' ) }
  is_barge () { return this.vm && this.vm.state == 'barge' }
  is_conference () { return this.vm && ( this.vm.state == 'conference' || this.vm.state == 'inconference' ) }
  can_login () { return this.vm.session_auth }
  can_call () { return this.vm && this.permAllowed('agent-feature-outbound-calling') }
  can_hangup () { return this.vm && ( this.vm.state == 'hold' || this.vm.state == 'oncall' || this.vm.state == 'outgoing' || this.vm.state == 'ringing' || this.vm.state == 'conference' || this.vm.state == 'inconference' || this.vm.state == 'test') }
  can_conference () { return this.vm && ( this.vm.state == 'oncall' || this.vm.state == 'conference' || this.vm.state == 'inconference') }
  can_transfer () { return this.vm && ( this.vm.state == 'oncall' || this.vm.state == 'conference' || this.vm.state == 'inconference') }

  handleAuth (Re, Cb = (A) => A) {
    if (Re && Re.reply) {
      this.vm.agent = Re.reply
      // $('title').text(`Reach: ${this.vm.agent.name}`)
      localStorage.setItem('session-key', Re.reply.session_key)
    } else {
      this.vm.agent = null
    }
    Cb(Re)
    EventBus.$emit('agent-auth', this.isAuth())
  }

}
