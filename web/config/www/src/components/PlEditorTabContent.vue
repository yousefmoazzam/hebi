<template>
  <div>
    <file-browser />
    <add-plugin-tree-view />
    <prompt-modal-box v-for="(modal, index) in promptModalBoxes"
      :promptText="modal.promptText" :key="index"
      v-on:prompt-yes-response="modal.yesResponseListener"
      v-on:prompt-no-response="modal.noResponseListener" />
    <div :class="[plPluginElements.length === 0 ? '' : 'pb-4']">
      <button class="bg-gray-400 hover:bg-gray-600 py-2 px-4 rounded"
        v-on:click="changeAllPluginsCollapsedState($event, true)" >
        Collapse All
      </button>
      <button class="bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded"
        v-on:click="changeAllPluginsCollapsedState($event, false)" >
        Expand All
      </button>
      <button class="bg-red-500 hover:bg-red-700 py-2 px-4 rounded"
        v-on:click="deleteAllListener" >
        Delete All
      </button>
    </div>
    <pl-editor-plugin-entry v-for="(plugin, index) in plPluginElements"
      :key="plugin.name"
      :ref="plugin.name"
      :plugin="plugin"
      :pluginName="plugin.name"
      :pluginIndex="index" />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import PlEditorPluginEntry from './PlEditorPluginEntry.vue'
import LabelledInputFieldAndButton from './LabelledInputFieldAndButton.vue'
import AddPluginTreeView from './AddPluginTreeView.vue'
import FileBrowser from './FileBrowser.vue'
import PromptModalBox from './PromptModalBox.vue'

export default {
  components: {
    'pl-editor-plugin-entry': PlEditorPluginEntry,
    'labelled-input-field-button': LabelledInputFieldAndButton,
    'add-plugin-tree-view': AddPluginTreeView,
    'file-browser': FileBrowser,
    'prompt-modal-box': PromptModalBox
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
      ],
      promptModalBoxes: []
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
    },
    deleteAllListener: function () {
      var promptText = 'Are you sure you want to delete ALL plugins in the ' +
        'process list?'
      this.promptModalBoxes.push({
        promptText: promptText,
        yesResponseListener: this.deleteAllYesResponse,
        noResponseListener: this.deleteAllNoResponse
      })
    },
    deleteAllYesResponse: function () {
      console.log('Deleting all plugins')
      for (var idx = this.plPluginElements.length - 1; idx >= 0; idx--) {
        this.$store.dispatch('removePluginFromPl', idx)
      }
      this.promptModalBoxes.pop()
    },
    deleteAllNoResponse: function () {
      console.log('Not deleting all plugins')
      this.promptModalBoxes.pop()
    }
  }
}
</script>
