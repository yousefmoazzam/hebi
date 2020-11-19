<template>
  <div class="flex mb-2 blah">
    <tree-view v-model="inputFieldText"
      placeholder="Search plugins..."
      :options="pluginCollections"
      :disable-branch-nodes="true" />
    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4"
      v-on:click="buttonClickListener">Add Plugin</button>
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
      inputFieldText: null
    }
  },
  components: {
    'tree-view': Treeselect
  },
  methods: {
    buttonClickListener: function () {
      this.$store.dispatch('addPluginToPl', this.inputFieldText)
    }
  }
}
</script>
