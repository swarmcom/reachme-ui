<template>
  <div>
    <b-row>
      <b-col><h3>Productivity</h3></b-col>
    </b-row>
    <widget-query
      v-model="query_params"
      enable="range:group_by"
      group-by="productivity"
      @reset="reset"
    />
    <b-row style="margin-top: 20px">
      <b-col>
        <b-btn
          class="cvs-download"
          size="sm"
          variant="light"
          :disabled="data.length===0"
        >
          <download-csv
            :data="comp_productivity"
            :labels="json_productivity_labels"
            name="productivity.csv"
          >
            <icon
              style="color:#838383"
              name="download"
              scale="1"
            />
            Download as CSV
          </download-csv>
        </b-btn>
      </b-col>
    </b-row>
    <b-table
      small
      striped
      hover
      :items="data"
      :fields="fields"
      tbody-tr-class="default_cursor"
    />
  </div>
</template>

<script>
import Query from '@/Report/Query'
import Base from '@/Report/Base'

export default {
  components: { 'widget-query': Query },
  mixins: [Base],
  data () {
    return {
      query_params: {},
      data: [],
      fields: {
        entity: {
          label: 'Name',
          key: 'entity.name',
          sortable: true
        },
        occupancy: {
          label: 'Ocpncy',
          formatter: v => v ? v + '%' : 0 + '%',
          sortable: true
        },
        cpt: {
          label: 'CPT',
          formatter: this.durationFormatter,
          sortable: true
        },
        total_time: {
          label: 'Logged In',
          formatter: this.durationFormatter,
          sortable: true
        },
        logged_out: {label: 'Logged Out', formatter: (v, _, item) => this.durationFormatter(item.range - item.total_time) },
        released: {
          label: 'Release',
          formatter: this.durationFormatter,
          sortable: true
        },
        suspended: {
          label: 'Suspend',
          formatter: this.durationFormatter,
          sortable: true
        },
        idle: {
          label: 'Idle',
          formatter: this.durationFormatter,
          sortable: true
        },
        ringing: {
          label: 'Ring',
          formatter: this.durationFormatter,
          sortable: true
        },
        talk_total: {
          label: 'Talk',
          formatter: this.durationFormatter,
          sortable: true
        },
        wrapup: {
          label: 'Wrap Up',
          formatter: this.durationFormatter,
          sortable: true
        },
      },
      json_productivity_labels: {
        name: "Name",
        occupancy: "Ocpncy",
        cpt: "CPT",
        total_time: "Logged In",
        logged_out: "Logged Out",
        released: "Release",
        suspended: "Suspend",
        idle: "Idle",
        ringing: "Ring",
        talk_total: "Talk",
        wrapup: "Wrap Up"
      },
    }
  },
  computed: {
    comp_productivity: function () {
      let array = []
      this.data.forEach( item => {
        let object = {}
        object['name'] = this.nameFormatter(item['entity'])
        object['occupancy'] = item['occupancy'] ? item['occupancy'] + '%' : 0 + '%'
        object['cpt'] = this.durationFormatter(item['cpt'])
        object['total_time'] = this.durationFormatter(item['total_time'])
        object['logged_out'] = this.durationFormatter(item['range'] - item['total_time'])
        object['released'] = this.durationFormatter(item['released'])
        object['suspended'] = this.durationFormatter(item['suspended'])
        object['idle'] = this.durationFormatter(item['idle'])
        object['ringing'] = this.durationFormatter(item['ringing'])
        object['talk_total'] = this.durationFormatter(item['talk_total'])
        object['wrapup'] = this.durationFormatter(item['wrapup'])
        array.push(object)
      })
      return array
    }
  },
  methods: {
    query (query) {
      return this.$agent.p_mfa('ws_report', 'query', ['productivity', 'report', query])
    },
  },
}
</script>

