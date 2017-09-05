import Vue from 'vue'
import WsProto from './ws-proto.js'
import {EventBus} from './event-bus.js'
import sys_config from './config.js'

function config(key, default_value) {
  return sys_config[key] ? sys_config[key] : default_value
}

export default class Agent extends WsProto {

  constructor () {
    super(config('reach_ws', 'ws://localhost:8937/ws'))
    this.vm = new Vue({
      data: {
        agent_auth: undefined,
        state: undefined,
        hangup_state: undefined
      }
    }),
    EventBus.$on('agent_state', (S) => this.handleState(S.info))
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

  // CRUD API
  get_agents (Cb = (A) => A) { this.mfa('ws_admin', 'get_agents', [], Cb) }
  get_agent (Id, Cb = (A) => A) { this.mfa('ws_admin', 'get_agent', [Id], Cb) }
  create_agent (Id, Obj, Cb = (A) => A) { this.mfa('ws_admin', 'create_agent', [Obj], Cb)  }
  update_agent (Id, Obj, Cb = (A) => A) { this.mfa('ws_admin', 'update_agent', [Id, Obj], Cb)  }
  delete_agent (Id, Cb = (A) => A) { this.mfa('ws_admin', 'delete_agent', [Id], Cb) }

  get_queues (Cb = (A) => A) { this.mfa('ws_admin', 'get_queues', [], Cb) }
  get_queue (Id, Cb = (A) => A) { this.mfa('ws_admin', 'get_queue', [Id], Cb) }
  create_queue (Obj, Cb = (A) => A) { this.mfa('ws_admin', 'create_queue', [Obj], Cb) }
  update_queue (Id, Obj, Cb = (A) => A) { this.mfa('ws_admin', 'update_queue', [Id, Obj], Cb) }
  delete_queue (Id, Cb = (A) => A) { this.mfa('ws_admin', 'delete_queue', [Id], Cb) }

  get_profiles (Cb = (A) => A) { this.mfa('ws_admin', 'get_profiles', [], Cb) }
  get_profile (Id, Cb = (A) => A) { this.mfa('ws_admin', 'get_profile', [Id], Cb) }
  create_profile (Obj, Cb = (A) => A) { this.mfa('ws_admin', 'create_profile', [Obj], Cb) }
  update_profile (Id, Obj, Cb = (A) => A) { this.mfa('ws_admin', 'update_profile', [Id, Obj], Cb) }
  delete_profile (Id, Cb = (A) => A) { this.mfa('ws_admin', 'delete_profile', [Id], Cb) }

  get_groups (Cb = (A) => A) { this.mfa('ws_admin', 'get_groups', [], Cb) }
  get_group (Id, Cb = (A) => A) { this.mfa('ws_admin', 'get_group', [Id], Cb) }
  create_group (Obj, Cb = (A) => A) { this.mfa('ws_admin', 'create_group', [Obj], Cb) }
  update_group (Id, Obj, Cb = (A) => A) { this.mfa('ws_admin', 'update_group', [Id, Obj], Cb) }
  delete_group (Id, Cb = (A) => A) { this.mfa('ws_admin', 'delete_group', [Id], Cb) }

  get_params (Cb = (A) => A) { this.mfa('ws_admin', 'get_params', [], Cb) }
  set_params (Params, Cb = (A) => A) { this.mfa('ws_admin', 'set_params', [Params], Cb) }

  // AGENT API
  logout () { this.call('stop', [], () => this.handleAuth()) }
  release () { this.call('release')  }
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

  get_transfer_agents (Cb = (A) => A) { this.call('get_transfer_agents', [], Cb) }
  get_transfer_queues (Cb = (A) => A) { this.call('get_transfer_queues', [], Cb) }

  isAuth () { return this.vm.agent_auth !== undefined }

  login (Login, Password, Cb = (A) => A) {
    if (this.isAuth()) {
      this.handleAuth(this.vm.agent_auth)
    } else {
      this.call('auth', [Login, Password], (A) => this.handleAuth(A, Cb))
    }
  }

  handleState (S) {
    if (S && this.vm.agent_auth && this.vm.agent_auth.agent_id === S.agent_id) {
      this.vm.hangup_state = S.hangup_state
      this.vm.state = S.state
    }
  }

  handleAuth (Re, Cb = (A) => A) {
    if (Re && Re.reply) {
      this.vm.agent_auth = Re.reply
    } else {
      this.vm.agent_auth = undefined
    }
    Cb(Re)
    EventBus.$emit('agent-auth', this.isAuth())
  }

}
