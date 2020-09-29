Vue.use(Vuex)

export const store = new Vuex.Store({

  state: {
    pluginSearchResults: [],
    displayedPluginInfo: {
      // Hardcode the citation attribute for now to prevent the
      // pluginInfoDisplay component erroring when trying to dynamically set
      // the "hidden" class name when the page first loads.
      //
      // This is possibly due to the data not having been fetched before that
      // component is attempted to be mounted (and hence the attribute not
      // existing on state.displayedPluginInfo yet to then be used to set the
      // "hidden" class name), but this should be addressed at some point, most
      // likely by using the right lifecycle hook:
      // https://vuejs.org/v2/guide/instance.html#Instance-Lifecycle-Hooks
      citation: {}
    }
  },

  actions: {
    loadPluginSearchResults(context, searchText) {
      searchAvailablePlugins(
        searchText,
        function (plugins) {
          context.commit('updatePluginSearchResults', plugins)
          // automatically load details of the plugin that appears first in the
          // search results
          context.dispatch('loadPluginDetails', plugins[0])
        },
        function () {
          console.log("Failed to list available plugins");
        }
      );
    },

    loadPluginDetails(context, pluginName) {
      getPluginDetails(
        pluginName,
        function (plugin) {
          context.commit('updateDisplayedPluginInfo', plugin)
        },
        function () {
          console.log("Failed to query plugin details")
        }
      )
    }
  },

  mutations: {
    updatePluginSearchResults(state, pluginSearchResults) {
      state.pluginSearchResults = pluginSearchResults
    },

    updateDisplayedPluginInfo(state, pluginInfo) {
      state.displayedPluginInfo = pluginInfo
    }
  },

  getters: {
    pluginSearchResults: state => state.pluginSearchResults,
    displayedPluginInfo: state => state.displayedPluginInfo
  }
})
