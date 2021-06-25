<template>
  <div id="root">
    <processing-page-grid />
  </div>
</template>

<script>
import PageTitle from './PageTitle.vue'
import ProcessingPageGrid from './ProcessingPageGrid.vue'

import heartbeat from '../heartbeat.js'

export default {
  mounted: function () {
    if (ACTIVATE_WEBSOCKET === 'True') {
      heartbeat.setupHeartbeatSocket()
    }
  },

  components: {
    'page-title': PageTitle,
    'processing-page-grid': ProcessingPageGrid
  }
}
</script>
