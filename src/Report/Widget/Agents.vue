<template>
  <div class="form-inline">
    <autocomplete
      v-model="agent"
      :query="query"
      placeholder="Agent..."
    />
    <button
      v-for="itemAgent in selected"
      :key="itemAgent.id"
      class="btn btn-sm btn-outline-primary"
      style="margin-left: 10px"
      @click="remove(itemAgent)"
    >
      {{ itemAgent.name }}
    </button>
  </div>
</template>

<script>
import Autocomplete from '@/Widget/Autocomplete'

export default {
  name: 'ReportWidgetAgents',
  components: {Autocomplete},
  props: {
    value: {
      type: Array,
      default: () => ([])
    }
  },
  data () {
    return {
      agent: undefined,
      selected: []
    }
  },
  watch: {
    agent (value) {
      let index = this.selected.findIndex(el => el.id === value.id)
      if (index < 0) {
        this.selected.push(value)
      }
      return value
    },
    selected (value) {
      this.$emit('input', value)
      return value
    },
    value (value) {
      this.selected = value
    }
  },
  created () {
    this.value.forEach(id => this.get(id))
  },
  methods: {
    query (text) {
      return this.$agent.p_mfa('ws_agent', 'suggest', ['agent', text])
    },
    remove (agent) {
      let index = this.selected.findIndex(el => el.id === agent.id)
      if (index >= 0) {
        this.selected.splice(index, 1)
      }
    },
    get: async function (id) {
      let entity = await this.$agent.p_mfa('ws_agent', 'entity', ['agent', id])
      this.selected.push(entity)
    }
  }
}
</script>
