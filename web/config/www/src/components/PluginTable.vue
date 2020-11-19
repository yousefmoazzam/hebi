<template>
  <div class="scroll">
    <table class="w-full border-collapse">
      <tbody>
      <plugin-table-row
        v-for="value in pluginSearchResults"
        :key="value"
        :pluginName="value" />
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import PluginTableRow from './PluginTableRow.vue'

export default {
  computed: mapState({
    pluginSearchResults: state => state.pluginSearchResults
  }),
  components: {
    'plugin-table-row': PluginTableRow
  }
}
</script>
