<template>
  <div>
    <div class="flex select-none cursor-pointer p-1 hover:bg-gray-200"
      v-on:click="toggleChildrenVisibility">
      <span v-if="!showChildren">
        <i class="fa fa-angle-right m-1"></i>
      </span>
      <span v-else>
        <i class="fa fa-angle-down m-1"></i>
      </span>
      <p>
        {{ header }}
      </p>
    </div>
    <div class="ml-4" v-show="showChildren">
      <plugin-browser-menu-entry
        v-for="pluginName in children['plugins']"
        :entry="pluginName"
        :key="header + '.' + pluginName" />
      <plugin-browser-menu-header
        v-for="(collection, collectionName) in children['collections']"
        :header="collectionName"
        :children="collection"
        :key="collectionName" />
    </div>
  </div>
</template>

<script>
import PluginBrowserMenuEntry from './PluginBrowserMenuEntry.vue'

export default {
  name: 'plugin-browser-menu-header',
  components: {
    'plugin-browser-menu-entry': PluginBrowserMenuEntry
  },

  data: function () {
    return {
      showChildren: false
    }
  },

  props: {
    header: String,
    children: Object
  },

  methods: {
    toggleChildrenVisibility: function () {
      this.showChildren = !this.showChildren
    }
  }
}
</script>
