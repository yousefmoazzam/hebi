<template>
  <div>
    <h1 class="mb-2">Filebrowser</h1>
    <div class="flex mb-2">
      <tree-view v-model="inputFieldText"
        placeholder="Search files..."
        :options="dirStructure"
        :disable-branch-nodes="true" />
      <filebrowser-split-button :options="splitButtonOptions" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import FileBrowserSplitButton from './FileBrowserSplitButton'

import { deleteProcessList } from '../api_savu.js'

export default {
  mounted: function () {
    this.$store.dispatch('loadDirStructure')
  },
  data: function () {
    return {
      inputFieldText: null,
      splitButtonOptions: [
        {
          text: 'Open',
          listener: () => {
            this.$store.dispatch('loadPl', this.inputFieldText)
          }
        },
        {
          text: 'Delete',
          listener: () => {
            var comp = this
            deleteProcessList(
              this.inputFieldText,
              function () {
                comp.$store.dispatch('loadDirStructure')
              },
              function () {
                console.log("Failed to delete process list")
              }
            )
          }
        }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'dirStructure'
    ])
  },
  components: {
    'tree-view': Treeselect,
    'filebrowser-split-button': FileBrowserSplitButton
  },
  methods: {
    buttonClickListener: function () {
      this.$store.dispatch('loadPl', this.inputFieldText)
    }
  }
}
</script>
