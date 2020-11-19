<template>
  <div>
    <h2>{{ pluginInfo.name }}</h2>
    <p>{{ pluginInfo.synopsis }}</p>
    <div class="scroll">
      <h3>Information</h3>
      <p>{{ pluginInfo.info }}</p>
      <h3>Parameters</h3>
      <plugin-param-info-table />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import PluginParamInfoTable from './PluginParamInfoTable.vue'

export default {
  computed: mapState({
    pluginInfo: state => state.displayedPluginInfo
  }),
  components: {
    'plugin-param-info-table': PluginParamInfoTable
  }
}
</script>
