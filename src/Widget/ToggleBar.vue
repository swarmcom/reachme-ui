<template>
  <div class="toggle-bar-custom">
    <button
      type="button"
      class="btn btn-sm pointer"
      :class="$parent.showCollapse ? 'collapsed' : null"
      aria-controls="collapse4"
      :aria-expanded="$parent.showCollapse ? 'true' : 'false'"
      @click="showCollapse"
    >
      <icon
        v-if="$parent.showCollapse"
        name="minus"
        scale="0.5"
      />
      <icon
        v-if="!$parent.showCollapse"
        name="plus"
        scale="0.5"
      />
    </button>
    <div class="title">
      {{ $parent.$options.widgetName || $options.widgetName }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToggleBar',
  data () {
    return {
    }
  },
  methods: {
    showCollapse () {
      this.$parent.showCollapse = !(this.$parent.showCollapse)
    }
  }
}
</script>