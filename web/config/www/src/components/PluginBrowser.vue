<template>
  <div class="flex mb-1">
    <div class="w-1/2 mr-1">
      <input :class="[ isPluginBrowserDropdownVisible ? 'rounded-t' : 'rounded', 'w-full border outline-none px-1 py-1']"
        ref="pluginSearchInputField"
        type="text"
        placeholder="Search plugins..."
        :value="pluginBrowserSearchInputFieldText"
        v-on:input="inputListener($event)"
        v-on:focus="openDropdown"
        v-on:click.stop="dropdownClickListener($event)">
      <div class="relative"
        v-show="isPluginBrowserDropdownVisible"
        v-on:click.stop="dropdownClickListener($event)">
        <div class="plugin-browser-dropdown bg-white border-l border-r border-b w-full overflow-y-auto absolute">
          <plugin-browser-menu-header
            v-for="(collection, collectionName) in filteredPluginCollections"
            :header="collectionName"
            :children="collection"
            :key="collectionName" />
        </div>
      </div>
    </div>
    <input class="flex-1 rounded border px-1 py-1 mr-1" type="text"
      placeholder="Insert plugin at index..."
      :value="addPluginIndexInputFieldText"
      v-on:input="addPluginInputFieldListener($event)" />
    <button class="bg-blue-500 rounded hover:bg-blue-700 py-1 px-2"
      v-on:click="addPluginButtonClickListener">Add Plugin</button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import PluginBrowserDropdownNode from './PluginBrowserDropdownNode.vue'
import PluginBrowserMenuHeader from './PluginBrowserMenuHeader.vue'

export default {
  created: function () {
    // add listener for clicking on an element other than the plugin dropdown
    // list
    document.addEventListener('click', this.closeDropdown)
  },
  destroyed: function () {
    // remove listener for clicking on an element other than the plugin dropdown
    // list
    document.removeEventListener('click', this.closeDropdown)
  },
  mounted: function () {
    this.$store.dispatch('loadPluginCollections')
    this.$store.dispatch('loadPluginSearchMatches', '')
  },

  components: {
    'plugin-browser-dropdown-node': PluginBrowserDropdownNode,
    'plugin-browser-menu-header': PluginBrowserMenuHeader
  },

  computed: {
    ...mapGetters([
      'pluginCollections',
      'pluginSearchMatches',
      'pluginBrowserSearchInputFieldText',
      'isPluginBrowserDropdownVisible',
      'addPluginIndexInputFieldText'
    ]),

    filteredPluginCollections: function () {
      var filteredCollections = this.collectionFilteringHelper(
        'pluginCollections',
        this.pluginCollections
      )
      return filteredCollections['collections']
    }
  },

  methods: {
    inputListener: function (e) {
      this.$store.dispatch('changePluginBrowserSearchInputFieldText', e.target.value)
    },

    closeDropdown: function () {
      if (this.isPluginBrowserDropdownVisible) {
        this.$store.dispatch('changePluginBrowserDropdownVisibility', false)
      }
    },

    openDropdown: function () {
      this.$store.dispatch('changePluginBrowserDropdownVisibility', true)
    },

    dropdownClickListener: function (e) {
      // focus the input even when you click on a header in the dropdown, so
      // then the user can easily still type in the input field during
      // navigation
      this.$refs.pluginSearchInputField.focus()
    },

    collectionFilteringHelper: function (collectionName, collection) {
      var subcollections = {}
      var matchedPlugins = []

      for (var pluginIdx in collection['plugins']) {
        if (this.pluginSearchMatches.indexOf(collection['plugins'][pluginIdx]) > -1) {
          matchedPlugins.push(collection['plugins'][pluginIdx])
        }
      }

      for (var subcollectionName in collection['collections']) {
        var subcollection = this.collectionFilteringHelper(
          subcollectionName,
          collection['collections'][subcollectionName]
        )

        // check if the matched plugins array is non-empty or if the
        // subcollections are non-empty; if at least one is non-empty, then set
        // that collection in the subcollections var, if not, leave that
        // collection out
        if(subcollection['plugins'].length > 0 ||
          Object.keys(subcollection['collections']).length > 0) {
          subcollections[subcollectionName] = subcollection
        }
      }

      return {
        'plugins': matchedPlugins,
        'collections': subcollections
      }

    },

    addPluginButtonClickListener: function () {
      this.$store.dispatch('addPluginToPl', {
        'pluginName': this.pluginBrowserSearchInputFieldText,
        'pluginIndex': this.addPluginIndexInputFieldText
      })
    },
    addPluginInputFieldListener: function (e) {
      this.$store.dispatch('changeAddPluginIndexInputFieldText', e.target.value)
    }
  }
}
</script>

<style>
.plugin-browser-dropdown {
  max-height: 15rem;
}
</style>
