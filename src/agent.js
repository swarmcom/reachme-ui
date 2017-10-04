import Vue from 'vue'
import WsProto from './ws-proto.js'
import {EventBus} from './event-bus.js'
import config from 'config'

function cfg(key, default_value) {
  return config[key] ? config[key] : default_value
}

function guess_ws () {
  let proto = window.location.protocol == "http:" ? "ws://" : "wss://"
  let port = window.location.port ? ":" + window.location.port : ""
  return proto + window.location.hostname + port + "/reach/ws"
}

export default class Agent extends WsProto {

  constructor () {
    super(cfg('reach_ws', guess_ws()))
    this.vm = new Vue({
      data: {
        agent: undefined,
        state: undefined,
        hangup_state: undefined
      }
    }),
    EventBus.$on('agent_state', (S) => this.handleState(S.state))
  }

  getData () {
    return this.vm
  }

  onDisconnect () {
    super.onDisconnect()
    this.handleAuth()
  }

  // MONITOR API
  subscribe (Channel) { this.mfa('ws_admin', 'subscribe', [Channel]) }
  agents (Cb = (A) => A) { this.mfa('ws_admin', 'agents', ['all'], Cb) }
  inqueues (Cb = (A) => A) { this.mfa('ws_admin', 'inqueues', ['all'], Cb) }

  // AGENT API
  logout () { this.call('stop', [], () => this.handleAuth()) }
  release (Id) { this.call('release', [Id]) }
  available () { this.call('available') }
  hangup () { this.call('hangup') }
  hold () { this.call('hold') }
  unhold () { this.call('unhold') }
  make_call (Target) { this.call('call', [Target]) }
  record (Cmd) { this.call('record', [Cmd]) }
  play (UUID) { this.call('record', ['play', UUID]) }
  end_wrapup () { this.call('end_wrapup') }

  transfer_to_agent (Agent) { this.call('transfer_to_agent', [Agent]) }
  transfer_to_queue (Queue) { this.call('transfer_to_queue', [Queue]) }
  transfer_to_uri (Uri) { this.call('transfer_to_uri', [Uri]) }
  conference_to_agent (Agent) { this.call('conference_to_agent', [Agent]) }
  conference_to_queue (Queue) { this.call('conference_to_queue', [Queue]) }
  conference_to_uri (Uri) { this.call('conference_to_uri', [Uri]) }

  login (Login, Password, Cb = (A) => A) {
    if (this.isAuth()) {
      this.handleAuth(this.vm.agent)
    } else {
      this.call('auth', [Login, Password], (A) => this.handleAuth(A, Cb))
    }
  }

  handleState (S) {
    if (S && this.vm.agent && this.vm.agent.id === S.agent_id) {
      this.vm.hangup_state = S.hangup_state
      this.vm.state = S.state
    }
  }

  isAuth () { return this.vm.agent !== undefined }

  is_active () { return (this.vm.state !== 'release' || this.vm.state !== 'available') }
  is_idle() { return (this.vm.state == 'release' || this.vm.state == 'available') }
  is_ringing () { return this.vm && this.vm.state == 'ringing' }
  is_oncall () { return this.vm && this.vm.state == 'oncall' }
  is_wrapup () { return this.vm && this.vm.state == 'wrapup' }
  is_hold () { return this.vm && this.vm.state == 'hold' }
  can_call () { return this.vm && this.vm.agent.line_id && this.vm.agent.line_id != "undefined"}

  handleAuth (Re, Cb = (A) => A) {
    if (Re && Re.reply) {
      this.vm.agent = Re.reply
    } else {
      this.vm.agent = undefined
    }
    Cb(Re)
    EventBus.$emit('agent-auth', this.isAuth())
  }

}
