import Vue from 'vue'
import Vuex from 'vuex'
import axios from "axios"

Vue.use(Vuex)

import {
  searchAvailablePlugins,
  getPluginDetails,
  getAvailableProcessLists,
  getProcessList,
  modifyParamVal,
  updateProcessList,
  newProcessList,
  addPluginToProcessList,
  getPluginCollections,
  getDirStructure
} from './api_savu.js'

export const store = new Vuex.Store({

  state: {
    pluginSearchResults: [],
    displayedPluginInfo: {},
    plFilepathSearchText: '/data/process_lists',
    plFilepathSearchResults: {},
    plPluginElements: [],
    plEditorFilepath: '',
    jobTabDataText: '',
    jobTabPlText: '',
    jobTabOutputText: '/data',
    jobStatusText: '',
    pluginCollections: [],
    dirStructure: [],
    rootDirs: [],
    currentDirPath: '/',
    dirContents: [],
    isCurrentProcessListModified: false,
    tabCompletionDirContents: [],
    filepathInputFieldText: '',
    addPluginIndexInputFieldText: '0'
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
          context.dispatch('changePlEditorFilepath', filename)
          context.commit('updateIsProcessListModified', false)
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
          context.commit('updateIsProcessListModified', true)
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
          context.commit('updateIsProcessListModified', false)
        },
        function () {
          console.log("Failed to save process list: " + filename)
        }
      )
    },

    saveNewPl(context, filename) {
      var store = this
      newProcessList(
        filename,
        generateProcessListObjectHelper(this.state.plPluginElements),
        function (data) {
          context.commit('saveOpenPl', data)
          // refreshes the process list search in the LHS pane's "Process
          // Lists" tab
          context.dispatch('loadPlFilepathSearchResults', store.state.plFilepathSearchText)
          // refreshes the dropdown file browser
          context.dispatch('loadDirStructure')
          // refresh file browser's dir contents
          context.dispatch('loadFileBrowserDirContents', store.state.currentDirPath)
          context.commit('updateIsProcessListModified', false)
        },
        function () {
          console.log("Failed to save new process list: " + filename)
        }
      )
    },

    addPluginToPl(context, payload) {
      var store = this
      addPluginToProcessList(
        payload.pluginName,
        function (plugin) {
          context.commit('addPluginToPlPluginElements', {
            'plugin': plugin,
            'pluginIndex': payload.pluginIndex
          })
          context.dispatch('changeIsProcessListModified', true)
          // update the index in the input field that specifies the index to
          // add a plugin to, to be the new end position in the process list
          var newIndex = store.state.plPluginElements.length
          context.dispatch('changeAddPluginIndexInputFieldText', newIndex.toString())
        },
        function () {
          console.log("Failed to add plugin to process list")
        }
      )
    },

    removePluginFromPl(context, pluginIndex) {
      context.commit('removePlugin', pluginIndex)
      context.commit('updateIsProcessListModified', true)
      // update the index in the input field that specifies the index to
      // add a plugin to, to be the new end position in the process list
      var newIndex = this.state.plPluginElements.length
      context.dispatch('changeAddPluginIndexInputFieldText', newIndex.toString())
    },

    movePluginIndex(context, payload) {

      // Nothing to do in this case
      if (payload.direction == 0) {
        return
      }

      // Calculate new position (plugin to swap position with)
      var newPosition = payload.pluginIndex + payload.direction;

      // Check the new position is within the valid plugin indices
      if (newPosition < 0 || newPosition > this.state.plPluginElements.length - 1) {
        console.log("New position (" + newPosition + ") not valid");
        return
      }

      context.commit('movePluginIndex', {
        'pluginIndex': payload.pluginIndex,
        'newPosition': newPosition
      })

      context.commit('updateIsProcessListModified', true)
    },

    togglePluginActiveState(context, pluginIndex) {
      context.commit('togglePluginActiveState', pluginIndex)
      context.commit('updateIsProcessListModified', true)
    },

    changePlEditorFilepath(context, filepath) {
      context.commit('changePlEditorFilepath', filepath)
    },

    updatePlFilepathSearchText(context, filepath) {
      context.commit('updatePlFilepathSearchText', filepath)
    },

    loadPluginCollections(context) {
      getPluginCollections(
        (collectionsDict) => {
          var collectionsTreeView = createCollectionTreeViewBranch(collectionsDict)
          context.commit('setPluginCollections', collectionsTreeView)
        },
        () => {
          console.log('Failed to get plugin collections')
        }
      )
    },

    loadDirStructure(context) {
      getDirStructure(
        (dirDict) => {
          var filesystemTreeView = createFilesystemTreeViewBranch("/data", dirDict)
          context.commit('updateDirStructure', filesystemTreeView)
        },
        () => {
          console.log('Failed to get dir structure')
        }
      )
    },

    changeCurrentDir(context, dirPath) {
      context.commit('updateCurrentDirPath', dirPath)
      // update the dir contents view to reflect the change of dir
      context.dispatch('loadFileBrowserDirContents', dirPath)
    },

    async loadRootDirs(context) {
      var config = {
        // hardcode for now, based on the dir in the file browser server
        // container in which all the dirs from Diamond filesystems are mounted
        // into
        baseURL: '/files/',
        url: endpoints.list.url.replace(new RegExp("{path}", "g"), '/'),
        method: endpoints.list.method || "get"
      }

      var response = await axiosInstance.request(config)
      context.commit('getRootDirs', response.data)
    },

    async loadFileBrowserDirContents(context, dirPath) {
      var config = {
        // hardcode for now, based on the dir in the file browser server
        // container in which all the dirs from Diamond filesystems are mounted
        // into
        baseURL: '/files/',
        url: endpoints.list.url.replace(new RegExp("{path}", "g"), dirPath),
        method: endpoints.list.method || "get"
      }

      var response = await axiosInstance.request(config)
      context.commit('updateFileBrowserDirContents', response.data)
    },

    changeIsProcessListModified(context, isModified) {
      context.commit('updateIsProcessListModified', isModified)
    },

    loadTabCompletionDirContents(context, dirPath) {

      var config = {
        // hardcode for now, based on the dir in the file browser server
        // container in which all the dirs from Diamond filesystems are mounted
        // into
        baseURL: '/files/',
        url: endpoints.list.url.replace(new RegExp("{path}", "g"), dirPath),
        method: endpoints.list.method || "get"
      }

      return new Promise((resolve, reject) => {
        axiosInstance.request(config).then(response => {
          var dirContentsStrings = response.data.reduce((result, dirChild) => {
            if (dirChild.type === 'dir') {
              result.push(dirChild.basename)
            }
            return result
          }, [])

          context.commit('updateTabCompletionDirContents', dirContentsStrings)
          resolve(response)
        })
      }, error => {
        reject(error)
      })
    },

    changeFilepathInputFieldText(context, filepath) {
      context.commit('updateFilepathInputFieldText', filepath)
    },

    changeAddPluginIndexInputFieldText(context, index) {
      context.commit('updateAddPluginIndexInputFieldText', index)
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
      var newPlPluginElements = []

      for (var plugin of data.plugins) {
        addPluginHelper({
            'plugin': plugin,
            'pluginIndex': ''
          },
          newPlPluginElements
        )
      }

      state.plPluginElements = newPlPluginElements
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

          // update the "display" attribute, in case this parameter value
          // modification changed whether any of the other parameters should be
          // displayed or not
          parameter["display"] = response.plugin_data.parameters[parameterIdx].display;

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
            parameter["value"] = response.errored_param_value;
            // add a type error
            parameter["typeError"]["hasError"] = true;
            parameter["typeError"]["errorString"] = response.error_str;
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

    addPluginToPlPluginElements(state, payload) {
      addPluginHelper(payload, this.state.plPluginElements)
    },

    removePlugin(state, pluginIndex) {
      state.plPluginElements.splice(pluginIndex, 1)
    },

    movePluginIndex(state, payload) {
      // Reorder cached elements
      var cache = state.plPluginElements.splice(payload.pluginIndex, 1)[0];
      state.plPluginElements.splice(payload.newPosition, 0, cache);
    },

    togglePluginActiveState(state, pluginIndex) {
      state.plPluginElements[pluginIndex].active = !state.plPluginElements[pluginIndex].active
    },

    changePlEditorFilepath(state, filepath) {
      state.plEditorFilepath = filepath
    },

    updatePlFilepathSearchText(state, filepath) {
      state.plFilepathSearchText = filepath
    },

    setPluginCollections(state, collectionsDict) {
      state.pluginCollections = collectionsDict
    },

    updateDirStructure(state, dirDict) {
      state.dirStructure = dirDict
    },

    updateCurrentDirPath(state, dirPath) {
      state.currentDirPath = dirPath
    },

    getRootDirs(state, data) {
      state.rootDirs = data
    },

    updateFileBrowserDirContents(state, data) {
      state.dirContents = data
    },

    updateIsProcessListModified(state, isModified) {
      state.isCurrentProcessListModified = isModified
    },

    updateTabCompletionDirContents(state, dirContents) {
      state.tabCompletionDirContents = dirContents
    },

    updateFilepathInputFieldText(state, filepath) {
      state.filepathInputFieldText = filepath
    },

    updateAddPluginIndexInputFieldText(state, index) {
      state.addPluginIndexInputFieldText = index
    }

  },

  getters: {
    pluginSearchResults: state => state.pluginSearchResults,
    displayedPluginInfo: state => state.displayedPluginInfo,
    plFilepathSearchResults: state => state.plFilepathSearchResults,
    plEditorFilepath: state => state.plEditorFilepath,
    plFilepathSearchText: state => state.plFilepathSearchText,
    pluginCollections: state => state.pluginCollections,
    dirStructure: state => state.dirStructure,
    currentDirPath: state => state.currentDirPath,
    rootDirs: state => state.rootDirs,
    dirContents: state => state.dirContents,
    isCurrentProcessListModified: state => state.isCurrentProcessListModified,
    tabCompletionDirContents: state => state.tabCompletionDirContents,
    filepathInputFieldText: state => state.filepathInputFieldText,
    addPluginIndexInputFieldText: state => state.addPluginIndexInputFieldText
  }
})

const axiosInstance = axios.create({})

const endpoints = {
  list: { url: "/storage/local/list?path={path}", method: "get" }
}

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

var addPluginHelper = function (data, plPluginElements) {

  var elements = {
    "name": data.plugin.name,
    "synopsis": data.plugin.synopsis,
    "docLink": data.plugin.doc_link,
    "active": data.plugin.active,
    "warn": data.plugin.warn.replace(/\n/gm, " "),
    "parameters": []
  };

  for (var parameterIdx in data.plugin.parameters) {
    var parameter = data.plugin.parameters[parameterIdx];

    var paramInfo = {
      "name": parameter.name,
      "description": parameter.description,
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

  if (data.pluginIndex === '') {
    plPluginElements.push(elements)
  } else {
    var idx = parseInt(data.pluginIndex)
    if (idx <= 0) {
      plPluginElements.splice(0, 0, elements)
    } else {
      plPluginElements.splice(idx, 0, elements)
    }
  }

}

var createCollectionTreeViewBranch = function (collsAndPluginsDict) {

  var children = []

  for (var pluginIdx in collsAndPluginsDict['plugins']) {
    var leaf = {
      'id': collsAndPluginsDict['plugins'][pluginIdx],
      'label': collsAndPluginsDict['plugins'][pluginIdx]
    }
    children.push(leaf)
  }

  for (var collectionName in collsAndPluginsDict['collections']) {
    var branch = {
      'id': collectionName,
      'label': collectionName,
      'children': createCollectionTreeViewBranch(collsAndPluginsDict['collections'][collectionName])
    }
    children.push(branch)
  }

  return children
}

var createFilesystemTreeViewBranch = function (parentDirName, filesAndDirsDict) {

  var children = []

  for (var node in filesAndDirsDict) {
    var child = {}

    // set the 'label' attribute (the string that is displayed in the UI) as
    // the file or directory name
    child['label'] = node

    // set the 'id' attribute to be the full path to the file or directory
    if (node !== parentDirName) {
      child['id'] = parentDirName + "/" + node
    } else {
      child['id'] = node
    }

    if (filesAndDirsDict[node] !== null) {
      child['children'] = createFilesystemTreeViewBranch(child['id'], filesAndDirsDict[node])
    }
    children.push(child)
  }

  return children
}
