<template>
  <div>
    <b-row style="margin-bottom: 10px">
      <b-col>
        <h3>
          Permissions - {{ roleName }}:
          <b-btn
            variant="link"
            @click="selectAll()"
          >
            all
          </b-btn>
          |
          <b-btn
            variant="link"
            @click="unselectAll()"
          >
            none
          </b-btn>
        </h3>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-row>
          <b-col cols="6">
            <h4>
              Available Tabs:
            </h4>
          </b-col>
          <b-col>
            <b-btn
              variant="link"
              @click="select(tabs)"
            >
              all
            </b-btn>
            |
            <b-btn
              variant="link"
              @click="unselect(tabs)"
            >
              none
            </b-btn>
          </b-col>
        </b-row>
        <b-col
          v-for="(p) of visibleTabs"
          :key="p"
          offset="1"
          class="form-check"
        >
          <input
            :id="p"
            v-model="effective[p]"
            class="form-check-input"
            type="checkbox"
          >
          <label
            class="form-check-label"
            :for="p"
          >
            {{ names[p].name }}
          </label>
        </b-col>

        <b-row style="margin-top: 15px">
          <b-col
            cols="6"
          >
            <h4>
              UI Features:
            </h4>
          </b-col>
          <b-col>
            <b-btn
              variant="link"
              @click="select(features)"
            >
              all
            </b-btn>
            |
            <b-btn
              variant="link"
              @click="unselect(features)"
            >
              none
            </b-btn>
          </b-col>
        </b-row>
        <b-col
          v-for="(p) of features"
          :key="p"
          offset="1"
          class="form-check"
        >
          <input 
            :id="p"
            v-model="effective[p]"
            class="form-check-input"
            type="checkbox"
          >
          <label
            class="form-check-label"
            :for="p"
          >
            {{ names[p].name }}
          </label>
        </b-col>
      </b-col>
      <b-col>
        <b-row>
          <b-col cols="6">
            <h4>
              Available Widgets:
            </h4>
          </b-col>
          <b-col>
            <b-btn
              variant="link"
              @click="select(widgets)"
            >
              all
            </b-btn>
            |
            <b-btn
              variant="link"
              @click="unselect(widgets)"
            >
              none
            </b-btn>
          </b-col>
        </b-row>
        <b-col
          v-for="(p) of widgets"
          :key="p"
          offset="1"
          class="form-check"
        >
          <input
            :id="p"
            v-model="effective[p]"
            class="form-check-input"
            type="checkbox"
          >          
          <label
            class="form-check-label"
            :for="p"
          >
            {{ names[p].name }}
          </label>
        </b-col>
        <b-row
          v-if="ui != 'agent' && effective['monitor-ui']"
          style="margin-top: 15px"
        >
          <b-col cols="6">
            <h4>
              Call Features:
            </h4>
          </b-col>
          <b-col>
            <b-btn
              variant="link"
              @click="select(call_features)"
            >
              all
            </b-btn>
            |
            <b-btn
              variant="link"
              @click="unselect(call_features)"
            >
              none
            </b-btn>
          </b-col>
        </b-row>
        <b-col
          v-for="(p) of visibleCallFeatures"
          :key="p"
          offset="1"
          class="form-check"
        >
          <input
            :id="p"
            v-model="effective[p]"
            class="form-check-input"
            type="checkbox"
          >
          <label
            class="form-check-label"
            :for="p"
          >
            {{ names[p].name }}
          </label>
        </b-col>
        <b-row 
          v-if="effective['profile-ui']"
          style="margin-top: 15px"
        >
          <b-col cols="6">
            <h4>
              Agent Profile:
            </h4>
          </b-col>
          <b-col>
            <b-btn
              variant="link"
              @click="select(agent_features)"
            >
              all
            </b-btn>
            |
            <b-btn
              variant="link"
              @click="unselect(agent_features)"
            >
              none
            </b-btn>
          </b-col>
        </b-row>
        <b-col
          v-for="p of visibleProfileTabs"
          :key="p"
          offset="1"
          class="form-check"
        >
          <input
            :id="p"
            v-model="effective[p]"
            class="form-check-input"
            type="checkbox"
          >
          <label
            class="form-check-label"
            :for="p"
          >
            {{ names[p].name }}
          </label>
        </b-col>
      </b-col>
    </b-row>
    <b-btn
      variant="primary"
      @click="onCommit"
    >
      Save
    </b-btn>
    <b-btn
      variant="outline-primary"
      @click="onCancel"
    >
      Cancel
    </b-btn>
  </div>
</template>

<script>
export default {
  name: 'AdminRolePermissions',
  props: {
    id: {
      type: String,
      default: ""
    },
    ui: {
      type: String,
      default: ""
    },
    roleName: {
      type: String,
      default: ""
    }
  },
  data () {
    return {
      name: undefined,
      effective: {
        "profile-ui": false,
        "reports-ui": false,
        "monitor-ui": false,
        "widget-my-statistics": false,
        "widget-call-details": false,
        "supervisor-feature-control-agent-state": false,
        "supervisor-feature-barge": false,
        "supervisor-feature-take-over": false,
        "supervisor-feature-take-call-queue": false,
        "supervisor-feature-hangup-call-queue": false,
        "agent-feature-my-phone": false,
        "agent-feature-outbound-calling": false,
        "agent-feature-call-recording-on-demand": false,
        "agent-feature-transfer-agent": false,
        "agent-feature-transfer-queue": false,
        "agent-feature-transfer-number": false,
        "agent-feature-conference-agent": false,
        "agent-feature-conference-queue": false,
        "agent-feature-conference-number": false,
        "agent-feature-conference-change-skills": false,
        "agent-profile-edit-name": false,
        "agent-profile-edit-password": false,
        "agent-profile-edit-line-out": false,
        "agent-profile-edit-primary-sip": false,
        "agent-profile-edit-additional-sip": false,
        "agent-profile-edit-ring-timeout": false,
        "agent-profile-edit-max-missed-calls": false,
        "agent-profile-edit-max-ring-success": false,
        "agent-profile-edit-autologout": false,
        "agent-profile-edit-avatar": false,
        "agent-profile-edit-agent-skills": false
      },
      tabs: [
        'profile-ui',
        'reports-ui',
        'monitor-ui'
      ],
      widgets: [
        'widget-my-statistics',
        'widget-call-details'
      ],
      features: [
        'agent-feature-my-phone',
        'agent-feature-outbound-calling',
        'agent-feature-call-recording-on-demand',
        'agent-feature-transfer-agent',
        'agent-feature-transfer-queue',
        'agent-feature-transfer-number',
        'agent-feature-conference-agent',
        'agent-feature-conference-queue',
        'agent-feature-conference-number',
        'agent-feature-conference-change-skills'
      ],
      call_features: [
        'supervisor-feature-control-agent-state',
        'supervisor-feature-barge',
        'supervisor-feature-take-over',
        'supervisor-feature-take-call-queue',
        'supervisor-feature-hangup-call-queue'
      ],
      agent_features: [
        "agent-profile-edit-name",
        "agent-profile-edit-password",
        "agent-profile-edit-line-out",
        "agent-profile-edit-primary-sip",
        "agent-profile-edit-additional-sip",
        "agent-profile-edit-ring-timeout",
        "agent-profile-edit-max-missed-calls",
        "agent-profile-edit-max-ring-success",
        "agent-profile-edit-autologout",
        "agent-profile-edit-avatar",
        "agent-profile-edit-agent-skills"
      ],
      names: {
        "profile-ui": { name: "Profile" },
        "reports-ui": { name: "Reports" },
        "monitor-ui": { name: "Monitor" },
        "widget-my-statistics": { name: "My Statistics" },
        "widget-call-details": { name: "Call Details" },
        "supervisor-feature-control-agent-state": { name: "Control Agent State" },
        "supervisor-feature-barge": { name: "Barge" },
        "supervisor-feature-take-over": { name: "Take Over" },
        "supervisor-feature-take-call-queue": { name: "Take call from queue" },
        "supervisor-feature-hangup-call-queue": { name: "Hangup call from queue"},
        "agent-feature-my-phone": { name: "Set My Phone" },
        "agent-feature-outbound-calling": { name: "Allow Outbound" },
        "agent-feature-call-recording-on-demand": { name: "Allow On Demand Call Recording" },
        "agent-feature-transfer-agent": { name: "Transfer to Agent" },
        "agent-feature-transfer-queue": { name: "Transfer to Queue" },
        "agent-feature-transfer-number": { name: "Transfer to Number" },
        "agent-feature-conference-agent": { name: "Conference to Agent" },
        "agent-feature-conference-queue": { name: "Conference to Queue" },
        "agent-feature-conference-number": { name: "Conference to Number" },
        "agent-feature-conference-change-skills": { name: "Change Skills on Conf/Tran" },
        "agent-profile-edit-name": { name: "Name" },
        "agent-profile-edit-password": { name: "Password" },
        "agent-profile-edit-line-out": { name: "Line Out" },
        "agent-profile-edit-primary-sip": { name: "Primary SIP Contact" },
        "agent-profile-edit-additional-sip": { name: "SIP Contacts" },
        "agent-profile-edit-ring-timeout": { name: "Ring Timeout" },
        "agent-profile-edit-max-missed-calls": { name: "Max Missed Calls" },
        "agent-profile-edit-max-ring-success": { name: "Reset Max Rings On Success" },
        "agent-profile-edit-autologout": { name: "Auto Logout" },
        "agent-profile-edit-avatar": { name: "Avatar" },
        "agent-profile-edit-agent-skills": { name: "Agent Skills" }
      }
    }
  },
  computed: {
    visibleTabs: function () {
      if (this.ui == 'agent') {
        return ['profile-ui']
      } else {
        return this.tabs
      }
    },
    visibleProfileTabs: function () {
      if (this.effective['profile-ui']) {
        return this.agent_features
      } else {
        return []
      }
    },
    visibleCallFeatures: function () {
      if (this.ui == 'agent' || !this.effective['monitor-ui']) {
        return []
      } else {
        return this.call_features
      }
    }
  },
  created () {
    this.query()
  },
  methods: {
    query: async function () {
      this.effective = await this.$agent.p_mfa('ws_db_permission', 'map', [this.id])
    },
    onChange: async function (perm) {
      if (this.effective[perm]) {
        await this.$agent.p_mfa('ws_db_permission', 'set', [this.id, perm])
      } else {
        await this.$agent.p_mfa('ws_db_permission', 'unset', [this.id, perm])
      }
    },
    isVisible: function (perm) {
      if (this.ui == 'supervisor') {
        return (perm != 'admin-ui')
      }
      else if (this.ui == 'agent') {
        return (perm != 'admin-ui' && perm != 'reports-ui' && perm != 'monitor-ui' &&
          !perm.includes("supervisor-feature"))
      }
    },
    isAgent () {
      return this.ui == 'agent'
    },
    setKey (key, value) {
      if (this.isVisible(key)) {
        this.$agent.vm.$set(this.effective, key, value)
      }
    },
    onCancel () {
      this.$router.go(-1)
    },
    onCommit () {
      Object.keys(this.names).forEach(key => { if (this.isVisible(key)) { this.onChange(key) } })
      this.$router.go(-1)
    },
    selectAll () {
      Object.keys(this.names).forEach(key => this.setKey(key, true))
    },
    unselectAll () {
      Object.keys(this.names).forEach(key => this.setKey(key, false))
    },
    select (group) {
      group.forEach(key => this.setKey(key, true))
    },
    unselect (group) {
      group.forEach(key => this.setKey(key, false))
    }
  }
}
</script>
