<template>
  <div>
    <b-row>
      <b-col>
        <h6>
          Live calls in queue
        </h6>
      </b-col>
    </b-row>
    <b-table
      style="margin-top:10px"
      small
      bordered
      hover
      head-variant="light"
      thead-tr-class="table-header"
      tbody-tr-class="table-body"
      sort-by="time"
      :items="data"
      :fields="fields"
    >
      <template
        slot="time"
        slot-scope="data"
      >
        {{ durationFormatter(data.item.time) }}
      </template>
      <template
        slot="effective_time"
        slot-scope="data"
      >
        {{ data.item.effective_time.weight }} | {{ durationFormatter(data.item.effective_time.time) }}
      </template>
      <template
        slot="queue"
        slot-scope="data"
      >
        {{ data.item.queue.name }}
      </template>
      <template
        slot="skills"
        slot-scope="data"
      >
        {{ Object.keys(data.item.skills).toString() }}
      </template>
      <template
        slot="line_in"
        slot-scope="data"
      >
        <b-row>
          <b-col>
            <b-img
              v-if="data.item.line_in.client.avatar"
              :src="$agent.get_rr_uri()+'/avatar/'+data.item.line_in.client.avatar"
              style="width:16px;"
            />
            {{ data.item.line_in.client.name }}
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            {{ data.item.call_vars['Unique-ID'] }}
          </b-col>
        </b-row>
      </template>
      <template
        slot="actions"
        slot-scope="data"
      >
        <template v-if="data.item.state == 'oncall' && ($agent.vm.state == 'release' || $agent.vm.state == 'available')">
          <b-button
            v-if="$agent.vm.agent.permissions['supervisor-feature-take-over']"
            size="sm"
            variant="primary"
            class="pointer"
            @click="takeover(data.item)"
          >
            Takeover
          </b-button>
          <b-button
            v-if="$agent.vm.agent.permissions['supervisor-feature-barge']"
            size="sm"
            variant="success"
            class="pointer"
            @click="spy(data.item)"
          >
            Spy/Barge
          </b-button>
        </template>
        <template v-if="((data.item.state == 'inqueue' || data.item.state == 'agent') && ($agent.vm.state == 'release' || $agent.vm.state == 'available'))">
          <b-button
            v-if="$agent.vm.agent.permissions['supervisor-feature-take-call-queue']"
            size="sm"
            variant="primary"
            class="pointer"
            @click="take(data.item)"
          >
            Take
          </b-button>
        </template>
        <b-button
          v-if="$agent.vm.agent.permissions['supervisor-feature-hangup-call-queue'] && data.item.state !=='wrapup'"
          size="sm"
          variant="danger"
          class="pointer"
          @click="hangup(data.item)"
        >
          Hangup
        </b-button>
      </template>
    </b-table>
  </div>
</template>

<script>
import Base from '@/Live/Base'

export default {
  name: 'LiveInboundsMonitor',
  components: {
  },
  mixins: [Base],
  data () {
    return {
      fields: {
        state: { label: 'State', sortable: true },
        record: { label: 'Type', sortable: true },
        time: { label: 'Time', sortable: true },
        effective_time: { label: 'Eff.' },
        queue: { label: 'Queue' },
        skills: { label: 'Skills', sortable: true },
        line_in: { label: 'Call Details', sortable: true },
        actions: { label: 'Actions' }
      },
    }
  },
  watch: {
    type: async function (value, old) {
      if (this.skip_load) {
        this.skip_load = false
        return
      }
      await this.$agent.p_mfa('ws_live', 'unsubscribe', ['inbounds'])
      this.query(value)
    },
  },
  created () {
    this.loadCache()
    this.$bus.$on('live_inqueue_state', this.handleState)
    this.$bus.$on('live_inqueue_vm_state', this.handleState)
  },
  beforeDestroy () {
    this.$bus.$off('live_inqueue_state', this.handleState)
    this.$bus.$off('live_inqueue_vm_state', this.handleState)
    this.$agent.p_mfa('ws_live', 'unsubscribe', ['inbounds'])
  },
  methods: {
    handleState ({state}) {
      let i = this.data.findIndex(E => E.uuid === state.uuid && E.record === state.record)
      if (state.state === 'terminate') {
        if (i >= 0) {
          this.data.splice(i, 1)
        }
      } else {
        if (i >= 0) {
          this.data.splice(i, 1, state)
        } else {
          this.data.push(state)
        }
      }
    },
    query: async function (type) {
      this.data = await this.$agent.p_mfa('ws_live', 'inbounds')
      await this.$agent.p_mfa('ws_live', 'subscribe', ['inbounds'])
      this.saveCache()
    },
    onTimer () {
      this.data.forEach((E, i, Arr) => { 
        E.time = E.time + 1000
        E.effective_time.time = E.effective_time.time + (1000 * this.getAgingFactor(E))
        Arr.splice(i, 1, E)
      })
    },
    take ({record, uuid}) {
      this.$agent.p_mfa('ws_supervisor', 'take', [record, uuid])
    },
    takeover ({record, uuid}) {
      this.$agent.p_mfa('ws_supervisor', 'takeover', [record, uuid])
    },
    spy ({record, uuid}) {
      this.$agent.p_mfa('ws_supervisor', 'spy', [record, uuid])
    },
    hangup ({record, uuid}) {
      this.$agent.p_mfa('ws_supervisor', 'hangup', [record, uuid])
    },
    getAgingFactor(data) {
      if (data.queue.aging_factor) {
        return data.queue.aging_factor
      } else if (data.queue.group && data.queue.group.aging_factor) {
        return data.queue.group.aging_factor
      } else {
        return 1
      }
    }
  }
}
</script>
