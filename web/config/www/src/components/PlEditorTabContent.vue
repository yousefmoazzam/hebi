<template>
  <div>
    <file-browser />
    <div class="pb-4">
      <h1 class="mb-2">Editor</h1>
      <button class="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4"
        v-on:click="changeAllPluginsCollapsedState($event, true)" >
        Collapse All
      </button>
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4"
        v-on:click="changeAllPluginsCollapsedState($event, false)" >
        Expand All
      </button>
    </div>
    <pl-editor-plugin-entry v-for="(plugin, index) in plPluginElements"
      :key="plugin.name"
      :ref="plugin.name"
      :plugin="plugin"
      :pluginName="plugin.name"
      :pluginIndex="index" />
    <add-plugin-search-input />
    <add-plugin-tree-view />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import PlEditorPluginEntry from './PlEditorPluginEntry.vue'
import LabelledInputFieldAndButton from './LabelledInputFieldAndButton.vue'
import AddPluginSearchInput from './AddPluginSearchInput.vue'
import AddPluginTreeView from './AddPluginTreeView.vue'
import FileBrowser from './FileBrowser.vue'

export default {
  components: {
    'pl-editor-plugin-entry': PlEditorPluginEntry,
    'labelled-input-field-button': LabelledInputFieldAndButton,
    'add-plugin-search-input': AddPluginSearchInput,
    'add-plugin-tree-view': AddPluginTreeView,
    'file-browser': FileBrowser
  },
  computed: mapState({
    plPluginElements: state => state.plPluginElements,
    plEditorFilepath: state => state.plEditorFilepath
  }),
  data: function () {
    return {
      inputFieldButtons: [
        {
          'text': 'Save Changes',
          'bgColour': 'bg-blue-500',
          'bgHoverColour': 'bg-blue-700',
          'listener': () => {
            this.$store.dispatch('savePl', this.plEditorFilepath)
          }
        },
        {
          'text': 'Save As New',
          'bgColour': 'bg-gray-500',
          'bgHoverColour': 'bg-gray-600',
          'listener': () => {
            this.$store.dispatch('saveNewPl', this.plEditorFilepath)
          }
        }
      ]
    }
  },
  methods: {
    buttonListener: function () {
      this.$store.dispatch('savePl', this.plEditorFilepath)
    },
    inputListener: function (e) {
      this.$store.dispatch('changePlEditorFilepath', e.target.value)
    },
    changeAllPluginsCollapsedState: function (e, collapseAll) {
      for (var pluginEntry in this.$refs) {
        if (this.$refs[pluginEntry].length !== 0) {
          this.$refs[pluginEntry][0]._data.collapsed = collapseAll
        }
      }
    }
  }
}
</script>
