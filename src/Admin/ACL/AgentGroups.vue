<template>
  <div class="form-inline">
    <autocomplete
      v-model="obj"
      :query="query"
      placeholder="Agent group..."
    />
    <b-btn
      v-for="itemObj in selected"
      :key="itemObj.id"
      variant="outline-primary"
      size="sm"
      style="margin-left: 10px"
      @click="remove(itemObj)"
    >
      {{ itemObj.name }}
    </b-btn>
  </div>
</template>

<script>
import Autocomplete from '@/Widget/Autocomplete'
import API from '@/Admin/ACL/API'

export default {
  name: 'AclWidgetAgentGroups',
  components: {Autocomplete},
  mixins: [API],
  props: {
    value: {
      type: Array,
      default: () => ([])
    }
  },
  data () {
    return {
      module: 'ws_db_agent_group',
      obj: undefined,
      selected: []
    }
  }
}
</script>