<template>
  <div>
    <page-title text="Plugins" />
    <plugin-page-grid />
  </div>
</template>

<script>
import PageTitle from './PageTitle.vue'
import PluginPageGrid from './PluginPageGrid.vue'

export default {
  components: {
    'page-title': PageTitle,
    'plugin-page-grid': PluginPageGrid
  }
}
</script>
