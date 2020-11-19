<template>
  <div class="flex flex-wrap">
    <div class="w-1/3" >
      <search-bar />
      <plugin-table />
    </div>
    <div class="w-2/3" >
      <plugin-info-display />
    </div>
  </div>
</template>

<script>
import SearchBar from './SearchBar.vue'
import PluginTable from './PluginTable.vue'
import PluginInfoDisplay from './PluginInfoDisplay.vue'

export default {
  components: {
    'search-bar': SearchBar,
    'plugin-table': PluginTable,
    'plugin-info-display': PluginInfoDisplay
  }
}
</script>
