import Vue from 'vue'
import Vuex from 'vuex'
import axios from "axios"
import yaml from 'js-yaml'

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
  searchPlugins,
  getFrameworkCitations
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
    rootDirs: [],
    currentDirPath: '/',
    dirContents: [],
    isCurrentProcessListModified: false,
    tabCompletionDirContents: [],
    filepathInputFieldText: '',
    addPluginIndexInputFieldText: '1',
    configObject: {},
    pluginSearchMatches: [],
    pluginBrowserSearchInputFieldText: '',
    isPluginBrowserDropdownVisible: false,
    frameworkCitations: []
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

    loadPluginSearchMatches(context, query) {
      searchPlugins(
        query,
        function (plugins) {
          context.commit('setPluginSearchMatches', plugins)
        },
        function () {
          console.log('Failed to search for plugins using the query: ' + query)
        }
      )
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
      var store = this
      getProcessList(
        filename,
        function (data) {
          context.commit('updateOpenPl', data)
          context.dispatch('changePlEditorFilepath', filename)
          context.dispatch('changeIsProcessListModified', false)
          var newIndex = store.state.plPluginElements.length + 1
          context.dispatch('changeAddPluginIndexInputFieldText', newIndex.toString())
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
          context.dispatch('changeIsProcessListModified', true)
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
          context.dispatch('changeIsProcessListModified', false)
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
          // refresh file browser's dir contents
          context.dispatch('loadFileBrowserDirContents', store.state.currentDirPath)
          context.dispatch('changeIsProcessListModified', false)
        },
        function () {
          console.log("Failed to save new process list: " + filename)
        }
      )
    },

    addPluginToPl(context, payload) {
      var store = this
      if (payload.pluginIndex === '') {
        // default to adding the plugin to the end of the process list
        payload.pluginIndex = String(this.state.plPluginElements.length + 1)
      }

      addPluginToProcessList(
        payload,
        function (plugin) {
          context.commit('addPluginToPlPluginElements', plugin)
          context.dispatch('changeIsProcessListModified', true)
          // update the index in the input field that specifies the index to
          // add a plugin to, to be the new end position in the process list
          var newIndex = store.state.plPluginElements.length + 1
          context.dispatch('changeAddPluginIndexInputFieldText', newIndex.toString())
        },
        function () {
          console.log("Failed to add plugin to process list")
        }
      )
    },

    removePluginFromPl(context, pluginIndex) {
      context.commit('removePlugin', savuIndexToZeroBasedIndex(pluginIndex))
      context.dispatch('changeIsProcessListModified', true)
      // update the index in the input field that specifies the index to
      // add a plugin to, to be the new end position in the process list
      var newIndex = this.state.plPluginElements.length + 1
      context.dispatch('changeAddPluginIndexInputFieldText', newIndex.toString())
    },

    resetPluginParamsToDefault(context, payload) {
      // fetch the default param info for the plugin needing to be reset
      addPluginToProcessList(
        payload,
        function (plugin) {
          var defaultPluginParamData = createPlPluginElementsEntry(plugin)
          var mutationPayload = {
            'defaultPluginParamData': defaultPluginParamData,
            'pluginIndex': payload.pluginIndex
          }
          context.commit('resetPluginInPl', mutationPayload)
          context.dispatch('changeIsProcessListModified', true)
        },
        function () {
          console.log("Failed to reset a plugin")
        }
      )
    },

    movePluginIndex(context, payload) {

      // Nothing to do in this case
      if (payload.direction == 0) {
        return
      }

      // Calculate new position (plugin to swap position with)
      var zeroBasedIndex = savuIndexToZeroBasedIndex(payload.pluginIndex)
      var newZeroBasedIndex = zeroBasedIndex + payload.direction;
      var newSavuIndex = zeroBasedIndexToSavuIndex(newZeroBasedIndex)

      // Check the new position is within the valid plugin indices
      if (newZeroBasedIndex < 0 ||
          newZeroBasedIndex > this.state.plPluginElements.length - 1) {
        console.log("New Savu-index (" + newSavuIndex + ") not valid");
        return
      }

      context.commit('movePluginIndex', {
        'oldZeroBasedIndex': zeroBasedIndex,
        'oldSavuIndex': payload.pluginIndex,
        'newZeroBasedIndex': newZeroBasedIndex,
        'newSavuIndex': newSavuIndex
      })

      context.dispatch('changeIsProcessListModified', true)
    },

    togglePluginActiveState(context, pluginIndex) {
      context.commit('togglePluginActiveState',
        savuIndexToZeroBasedIndex(pluginIndex))
      context.dispatch('changeIsProcessListModified', true)
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
          context.commit('setPluginCollections', collectionsDict)
        },
        () => {
          console.log('Failed to get plugin collections')
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
      var modifiedData = response.data.map(dir => {
        return {
          ...dir,
          isFavourite: this.state.configObject.favourite_dirs.includes(dir.path)
        }
      })
      context.commit('updateFileBrowserDirContents', modifiedData)
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
    },

    addFavouriteDir(context, path) {
      var dirIdx = 0
      for (var childIdx in this.state.dirContents) {
        if (this.state.dirContents[childIdx].path === path) {
          dirIdx = childIdx
          break
        }
      }
      context.commit('addFavouriteDir', {
        dirContentsIdx: dirIdx,
        path: path
      })
      context.dispatch('saveConfig')
    },

    removeFavouriteDir(context, path) {
      var dirIdx = 0
      for (var childIdx in this.state.dirContents) {
        if (this.state.dirContents[childIdx].path === path) {
          dirIdx = childIdx
          break
        }
      }
      var favDirIndex = this.state.configObject.favourite_dirs.indexOf(path)
      context.commit('removeFavouriteDir', {
        dirContentsIdx: dirIdx,
        favDirIndex: favDirIndex
      })
      context.dispatch('saveConfig')
    },

    async loadConfig(context, nextAction) {
      var axiosConfig = {
        // hardcode for now, based on the dir in the file browser server
        // container in which all the dirs from Diamond filesystems are mounted
        // into
        baseURL: '/files/',
        url: endpoints.readTextFile.url.replace(new RegExp("{path}", "g"), YAML_CONFIG),
        method: endpoints.readTextFile.method || "get"
      }

      var response = await axiosInstance.request(axiosConfig)

      // check if the response to the read request of the config file was
      // successful or not
      if (typeof response.data !== 'string') {
        if (response.data.code === 'ENOENT') {
          // the config file doesn't exist, so create it and then set
          // state.configObject to be blank
          createConfig()
          context.commit('loadConfigObject', {
            favourite_dirs: []
          })
        }
      } else {
        if (response.data === '') {
          // an empty string in the file server response means that the config
          // file is empty; the YAML parser will return "undefined" when given
          // this, so set state.configObject to be blank instead
          context.commit('loadConfigObject', {
            favourite_dirs: []
          })
        } else {
          var config = yaml.safeLoad(response.data)
          context.commit('loadConfigObject', config)
        }
      }
      context.dispatch(nextAction.name, nextAction.data)
    },

    async saveConfig(context) {
      var axiosConfig = {
        // hardcode for now, based on the dir in the file browser server
        // container in which all the dirs from Diamond filesystems are mounted
        // into
        baseURL: '/files/',
        url: endpoints.writeTextFile.url.replace(new RegExp("{path}", "g"), YAML_CONFIG),
        method: endpoints.writeTextFile.method || "post",
        data: {
          configContent: yaml.safeDump(this.state.configObject)
        }
      }
      var response = await axiosInstance.request(axiosConfig)
    },

    changePluginBrowserSearchInputFieldText(context, text) {
      context.commit('updatePluginBrowserSearchInputFieldText', text)
      context.dispatch('loadPluginSearchMatches', text)
    },

    changePluginBrowserDropdownVisibility(context, bool) {
      context.commit('updatePluginBrowserDropdownVisibility', bool)
    },

    loadFrameworkCitations(context) {
      getFrameworkCitations(
        function (citations) {
          context.commit('updateFrameworkCitations', citations)
        },
        function () {
          console.log('Failed to get framework citations')
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
      var newPlPluginElements = []

      for (var plugin of data.plugins) {
        addPluginHelper(plugin, newPlPluginElements)
      }

      state.plPluginElements = newPlPluginElements
    },

    updatePlPluginElements(state, response) {
      var zeroBasedPluginIndex = savuIndexToZeroBasedIndex(response.plugin_index)

      if (response.is_valid) {
        var updatedPlugin = createPlPluginElementsEntry(response.plugin_data)
        // replace old state of plugin before the param modification with the
        // new state of the plugin after the param modification
        state.plPluginElements.splice(zeroBasedPluginIndex, 1, updatedPlugin)
      } else {
        // find param in plugin and set a type error by adding to the
        // typeError attribute
        for (var parameterIdx in state.plPluginElements[zeroBasedPluginIndex].parameters) {
          var parameter = state.plPluginElements[zeroBasedPluginIndex].parameters[parameterIdx];
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
      addPluginHelper(payload, state.plPluginElements)
    },

    removePlugin(state, pluginIndex) {
      // remove plugin
      state.plPluginElements.splice(pluginIndex, 1)

      // modify pos values of plugins that originally came after the now
      // deleted plugin
      updatePluginsPos(-1, pluginIndex, state.plPluginElements)
    },

    movePluginIndex(state, payload) {
      // Reorder cached elements
      var cache = state.plPluginElements.splice(payload.oldZeroBasedIndex, 1)[0];
      state.plPluginElements.splice(payload.newZeroBasedIndex, 0, cache);

      // swap the Savu-index of the two swapped plugins
      state.plPluginElements[payload.oldZeroBasedIndex]['pos'] = payload.oldSavuIndex
      state.plPluginElements[payload.newZeroBasedIndex]['pos'] = payload.newSavuIndex
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
    },

    addFavouriteDir(state, payload) {
      // change isFavourite attr in the dir's entry in state.dirContents
      state.dirContents[payload.dirContentsIdx].isFavourite = true
      // modify state.configObject
      state.configObject.favourite_dirs.push(payload.path)
    },

    removeFavouriteDir(state, payload) {
      // change isFavourite attr in the dir's entry in state.dirContents
      state.dirContents[payload.dirContentsIdx].isFavourite = false
      // modify state.configObject
      state.configObject.favourite_dirs.splice(payload.favDirIndex, 1)
    },

    loadConfigObject(state, data) {
      state.configObject = data
    },

    resetPluginInPl(state, payload) {
      state.plPluginElements.splice(
        savuIndexToZeroBasedIndex(payload.pluginIndex), 1,
        payload.defaultPluginParamData)
    },

    setPluginSearchMatches(state, matches) {
      state.pluginSearchMatches = matches
    },

    updatePluginBrowserSearchInputFieldText(state, text) {
      state.pluginBrowserSearchInputFieldText = text
    },

    updatePluginBrowserDropdownVisibility(state, bool) {
      state.isPluginBrowserDropdownVisible = bool
    },

    updateFrameworkCitations(state, citations) {
      state.frameworkCitations = citations
    }

  },

  getters: {
    pluginSearchResults: state => state.pluginSearchResults,
    displayedPluginInfo: state => state.displayedPluginInfo,
    plFilepathSearchResults: state => state.plFilepathSearchResults,
    plEditorFilepath: state => state.plEditorFilepath,
    plFilepathSearchText: state => state.plFilepathSearchText,
    pluginCollections: state => state.pluginCollections,
    currentDirPath: state => state.currentDirPath,
    rootDirs: state => state.rootDirs,
    dirContents: state => state.dirContents,
    isCurrentProcessListModified: state => state.isCurrentProcessListModified,
    tabCompletionDirContents: state => state.tabCompletionDirContents,
    filepathInputFieldText: state => state.filepathInputFieldText,
    addPluginIndexInputFieldText: state => state.addPluginIndexInputFieldText,
    favouritedDirs: state => state.configObject.favourite_dirs,
    pluginSearchMatches: state => state.pluginSearchMatches,
    pluginBrowserSearchInputFieldText: state => state.pluginBrowserSearchInputFieldText,
    isPluginBrowserDropdownVisible: state => state.isPluginBrowserDropdownVisible,
    frameworkCitations: state => state.frameworkCitations
  }
})

const axiosInstance = axios.create({})

const endpoints = {
  list: { url: "/storage/local/list?path={path}", method: "get" },
  readTextFile: { url: "/storage/local/readTextFile?path={path}", method: "get" },
  writeTextFile: { url: "/storage/local/writeTextFile?path={path}", method: "post" },
  mkdir: { url: "/storage/local/mkdir?path={path}", method: "post" }
}

const CONFIG_DIR = '/home/' + FEDID + '/.hebi/'
const YAML_CONFIG = CONFIG_DIR + 'config.yaml'

var generateProcessListObjectHelper = function (pluginElements) {
  // copy of code in plugin_editor.generateProcessListObject()

  var plugins = [];

  // For each plugin
  for (var plugin of pluginElements) {
    var parameters = [];
    // For each parameter
    for (var parameter of plugin.parameters) {
        parameters.push({
          "name": parameter.name,
          "value": parameter.value,
        });
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

var createPlPluginElementsEntry = function (plugin) {

  var elements = {
    "name": plugin.name,
    "pos": plugin.pos,
    "synopsis": plugin.synopsis,
    "info": plugin.info,
    "docLink": plugin.doc_link,
    "active": plugin.active,
    "warn": plugin.warn.replace(/\n/gm, " "),
    "citations": plugin.citations,
    "parameters": []
  };

  for (var parameterIdx in plugin.parameters) {
    var parameter = plugin.parameters[parameterIdx];

    var paramInfo = {
      "name": parameter.name,
      "description": parameter.description,
      "value": parameter.value,
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

  return elements
}

var addPluginToPlPluginElements = function (plugin, plPluginElements) {
  var zeroBasedIndex = savuIndexToZeroBasedIndex(plugin['pos'])

  if (zeroBasedIndex <= 0) {
    // put the plugin at the beginning of the process list, and set the pos
    // attribute (the Savu-index) to be 1
    plugin['pos'] = "1"
    plPluginElements.splice(0, 0, plugin)
    updatePluginsPos(1, 1, plPluginElements)
  } else if (zeroBasedIndex > 0 && zeroBasedIndex < plPluginElements.length) {
    plPluginElements.splice(zeroBasedIndex, 0, plugin)
    updatePluginsPos(1, zeroBasedIndex + 1, plPluginElements)
  } else {
    // put the plugin at the end of the process list, and set the pos
    // attribute (the Savu-index) to be the same as the new length of the
    // process list
    plugin['pos'] = String(plPluginElements.length + 1)
    plPluginElements.push(plugin)
  }

}

var updatePluginsPos = function (direction, index, plPluginElements) {
  // after adding or deleting a plugin, update the pos attribute of all plugins
  // after the one that's been added/deleted
  for (var idx = index; idx < plPluginElements.length; idx++) {
    var oldPos = plPluginElements[idx]['pos']
    if (direction === 1) {
      plPluginElements[idx]['pos'] = String(parseInt(oldPos) + 1)
    } else if (direction === -1) {
      plPluginElements[idx]['pos'] = String(parseInt(oldPos) - 1)
    }
  }
}

var zeroBasedIndexToSavuIndex = function (numberIndex) {
  return String(numberIndex + 1)
}

var savuIndexToZeroBasedIndex = function (stringIndex) {
  return parseInt(stringIndex) - 1
}

var addPluginHelper = function (plugin, plPluginElements) {
  var elements = createPlPluginElementsEntry(plugin)
  addPluginToPlPluginElements(elements, plPluginElements)
}

var createConfig = async function () {
  // create dir that will contain the config file
  await axiosInstance.request({
    baseURL: '/files/',
    url: endpoints.mkdir.url.replace(new RegExp("{path}", "g"), CONFIG_DIR),
    method: endpoints.mkdir.method || "post"
  })

  // create config file
  await axiosInstance.request({
    baseURL: '/files/',
    url: endpoints.writeTextFile.url.replace(new RegExp("{path}", "g"), YAML_CONFIG),
    method: endpoints.writeTextFile.method || "post",
    data: {
      configContent: ''
    }
  })
}
