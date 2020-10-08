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
    },
    plFilepathSearchResults: {},
    plPluginElements: []
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
    },

    loadPlFilepathSearchResults(context, searchText) {
      getAvailableProcessLists (
        searchText,
        function (data) {
          context.commit('updatePlFilepathSearchResults', data)
        },
        function () {
          console.log("Failed to search filepath: " + searchText)
        }
      )
    },

    loadPl(context, filename) {
      getProcessList(
        filename,
        function (data) {
          context.commit('updateOpenPl', data)
        }    ,
        function () {
          console.log("Failed to open process list: " + filename)
        }
      )
    },

    loadPlPluginElements(context, payload) {
      var pl = generateProcessListObjectHelper(this.state.plPluginElements)

      var data = {
        'processList': pl,
        'pluginIndex': payload["pluginIndex"],
        'paramName': payload["paramName"],
        'newParamVal': payload["paramValue"],
      }

      modifyParamVal (
        data,
        function (response) {
          context.commit('updatePlPluginElements', response)
        },
        function () {
          console.log("Failed to update plPluginElements")
        }
      )
    },

    savePl(context, filename) {
      updateProcessList(
        filename,
        generateProcessListObjectHelper(this.state.plPluginElements),
        function (data) {
          context.commit('saveOpenPl', data)
        },
        function () {
          console.log("Failed to save process list: " + filename)
        }
      )
    },

    addPluginToPl(context, pluginName) {
      getPluginDetails(
        pluginName,
        function (plugin) {
          context.commit('addPluginToPlPluginElements', plugin)
        },
        function () {
          console.log("Failed to add plugin to process list")
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
    },

    updatePlFilepathSearchResults(state, plFilepathSearchResults) {
      state.plFilepathSearchResults = plFilepathSearchResults
    },

    updateOpenPl(state, data) {
      var pl = generatePlPluginElementsHelper(data)
      state.plPluginElements = pl
    },

    updatePlPluginElements(state, response) {
      if (response.is_valid) {
        // update state.plPluginElements, so need to form the dict/object for
        // the modified plugin, that should then go in the array
        // state.plPluginElements (which is the array that this.pluginElements
        // was)

        var elements = {
          "name": response.plugin_data.name,
          "active": response.plugin_data.active,
          "parameters": []
        };

        // Modify parameter
        for (var parameterIdx in this.state.plPluginElements[response.plugin_index].parameters) {
          var parameter = this.state.plPluginElements[response.plugin_index].parameters[parameterIdx];
          if (parameter.name === response.param_name) {
            parameter["value"] = response.plugin_data.parameters[parameterIdx].value;
            // reset type error
            parameter["typeError"]["hasError"] = false;
            parameter["typeError"]["errorString"] = "";
          }
        }

      } else {
        // find param in plugin and set a type error by adding to the
        // typeError attribute
        for (var parameterIdx in this.state.plPluginElements[response.plugin_index].parameters) {
          var parameter = this.state.plPluginElements[response.plugin_index].parameters[parameterIdx];
          if (parameter.name === response.param_name) {
            // add a type error
            parameter["typeError"]["hasError"] = true;
            parameter["typeError"]["errorString"] = "Type error, must match the type: " +
              response.dtype;
          }
        }
      }
    },

    saveOpenPl(state, response) {
      // there's no state in the store to change due to the process list being
      // saved to the nexus file on the filesystem, perhaps the action/mutation
      // pattern isn't the best fit for the process of saving a process list to
      // a file?
    },

    addPluginToPlPluginElements(state, plugin) {
      plugin.active = true
      addPluginHelper(plugin, this.state.plPluginElements)
    }

  },

  getters: {
    pluginSearchResults: state => state.pluginSearchResults,
    displayedPluginInfo: state => state.displayedPluginInfo,
    plFilepathSearchResults: state => state.plFilepathSearchResults
  }
})


var generateProcessListObjectHelper = function (pluginElements) {
  // copy of code in plugin_editor.generateProcessListObject()

  var plugins = [];

  // For each plugin
  for (var plugin of pluginElements) {
    var parameters = [];
    // For each parameter
    for (var parameter of plugin.parameters) {
      if (parameter["visibility"] !== "hidden" &&
          parameter["display"] !== "off") {
          // Add the parameter value
          parameters.push({
            "name": parameter.name,
            "value": parameter.value,
          });
      }
    }

    // Add name, active/enabled flag and parameter list
    plugins.push({
      "name": plugin.name,
      "active": plugin.active,
      "parameters": parameters,
    });
  }

  return {"plugins": plugins}
}

var addPluginHelper = function (plugin, plPluginElements) {

  var elements = {
    "name": plugin.name,
    "active": plugin.active,
    "parameters": []
  };

  for (var parameterIdx in plugin.parameters) {
    var parameter = plugin.parameters[parameterIdx];

    var paramInfo = {
      "name": parameter.name,
      "value": parameter.value,
      "display": parameter.display,
      "visibility": parameter.visibility,
      "typeError": {
        "hasError": false,
        "errorString": ""
      }
    }

    if ("options" in parameter) {
      paramInfo["options"] = parameter.options
    }

    elements.parameters.push(paramInfo)
  }

  plPluginElements.push(elements)

}

var generatePlPluginElementsHelper = function (data) {
  // copy of code in plugin_editor.addPlugin(), without all the parts that
  // create and insert html elements

  var newPlPluginElements = []

  for (var plugin of data.plugins) {
    addPluginHelper(plugin, newPlPluginElements)
  }

  return newPlPluginElements
}
