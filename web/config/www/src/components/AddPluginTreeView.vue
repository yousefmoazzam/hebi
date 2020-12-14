<template>
  <div class="grid grid-flow-cols grid-cols-2 gap-1">
    <div>
      <tree-view v-model="inputFieldText"
        placeholder="Search plugins..."
        :options="pluginCollections"
        :disable-branch-nodes="true" />
    </div>
    <div class="flex">
      <input class="flex-1 border border-2 px-1 py-1 mr-1" type="text"
        placeholder="Insert plugin at index..."
        v-model="addPluginIndexText" />
      <button class="bg-blue-500 rounded hover:bg-blue-700 py-1 px-2"
        v-on:click="buttonClickListener">Add Plugin</button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  mounted: function () {
    this.$store.dispatch('loadPluginCollections')
  },
  computed: {
    ...mapGetters([
      'pluginCollections'
    ])
  },
  data: function () {
    return {
      inputFieldText: null,
      addPluginIndexText: ''
    }
  },
  components: {
    'tree-view': Treeselect
  },
  methods: {
    buttonClickListener: function () {
      this.$store.dispatch('addPluginToPl', {
        'pluginName': this.inputFieldText,
        'pluginIndex': this.addPluginIndexText
      })
      this.addPluginIndexText = ''
    }
  }
}
</script>
