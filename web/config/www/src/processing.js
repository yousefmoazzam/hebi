import { store } from './store.js'
import { pageTitle } from './plugins.js'

var tabContent = {
  props: ['text'],
  template: `
    <div>
      <p>{{ text }}</p>
    </div>
  `
}

var paneTab = {
  methods: {
    tabClickListener: function (e) {
      this.$emit('click', this.tabTitle)
    }
  },
  props: ['tabTitle', 'active'],
  template: `
    <li v-on:click="tabClickListener">
      <a v-bind:class="[active ? 'bg-gray-400 -mb-px text-blue-700' : 'bg-white text-blue-500 hover:text-blue-800', 'inline-block py-2 px-4 mr-1 hover:cursor-pointer font-semibold']">
      {{ tabTitle }}
      </a>
    </li>
  `
}

var tabbedDisplay = {
  components: {
    'pane-tab': paneTab,
    'tab-content': tabContent
  },
  data: function () {
    return {
      openTab: this.tabs[0]
    }
  },
  props: {
    tabs: Array
  },
  methods: {
    updateOpenTab: function (title) {
      for (var tabIdx in this.tabs) {
        if (this.tabs[tabIdx].name === title) {
          this.openTab = this.tabs[tabIdx];
          break;
        }
      }
    }
  },
  template: `
    <div class="border">
      <ul class="flex border-b">
        <pane-tab v-for="tab in tabs"
          v-on:click="updateOpenTab"
          v-bind:active="openTab.name === tab.name"
          :key="tab.name"
          :tabTitle="tab.name" />
      </ul>
      <component v-bind:is="openTab.component" />
    </div>
  `
}

var labelledInputFieldAndButton = {
  props: {
    'label': String,
    'placeholder': String,
    'buttonText': String,
    'inputFieldText': String
  },
  methods: {
    buttonClickListener () {
      this.$emit('button-clicked')
    },
    inputFieldListener (e) {
      this.$emit('changed-input-field-text', e)
    }
  },
  template: `
    <div class="flex">
      <span class="text-sm border border-2 rounded-l px-4 py-2 bg-gray-300 whitespace-no-wrap">
        {{ label }}
      </span>
      <input class="border border-2 px-4 py-2 w-full" type="text"
        v-bind:placeholder="placeholder"
        v-on:input="inputFieldListener($event)"
        :value="inputFieldText" />
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4"
        v-on:click="buttonClickListener">
        {{ buttonText }}
      </button>
    </div>
  `
}

var plTabContentsTableRow = {
  computed: Vuex.mapState({
    plFilepathSearchText: state => state.plFilepathSearchText
  }),
  methods: {
    folderIconListener: function () {
      this.$store.dispatch('loadPl', this.filepath)
    },

    downloadIconListener: function () {
      var url = getProcessListDownloadUrl(this.filepath)
      window.open(url, "_blank")
    },

    trashIconListener: function () {
      var comp = this
      deleteProcessList(
        this.filepath,
        function () {
          console.log('Deleting process list: ' + comp.filepath)
          comp.$store.dispatch('loadPlFilepathSearchResults', comp.plFilepathSearchText)
        },
        function () {
          console.log("Failed to delete process list")
        }
      )
    }
  },
  props: {
    filepath: String
  },
  template: `
    <tr>
      <td class="px-2 py-2">
        {{ filepath }}
      </td>
      <td>
        <i class="fas fa-folder-open" v-on:click="folderIconListener" />
      </td>
      <td>
        <i class="fas fa-download" v-on:click="downloadIconListener" />
      </td>
      <td>
        <i class="fas fa-trash" v-on:click="trashIconListener" />
      </td>
    </tr>
  `
}

var plTabContentsTable = {
  computed: Vuex.mapState({
    plFilepathSearchResults: state => state.plFilepathSearchResults
  }),
  components: {
    'pl-table-row': plTabContentsTableRow
  },
  template: `
    <div class="scroll">
      <table class="w-full border-collapse">
        <thead>
          <tr class="text-left">
            <th>Filename</th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        <pl-table-row
          v-for="filepath in plFilepathSearchResults.files"
          :key="filepath"
          :filepath="filepath" />
        </tbody>
      </table>
    </div>
  `
}

var lhsProcessListsTabContent = {
  computed: Vuex.mapState({
    plFilepathSearchText: state => state.plFilepathSearchText
  }),
  components: {
    'labelled-input-field-button': labelledInputFieldAndButton,
    'pl-tab-contents-table': plTabContentsTable
  },
  methods: {
    buttonListener: function () {
      this.$store.dispatch('loadPlFilepathSearchResults', this.plFilepathSearchText)
    },
    inputListener: function (e) {
      this.$store.dispatch('updatePlFilepathSearchText', e.target.value)
    }
  },
  template: `
    <div>
      <labelled-input-field-button
        label="Search Path"
        placeholder="Path"
        buttonText="Refresh"
        :inputFieldText="plFilepathSearchText"
        v-on:button-clicked="buttonListener"
        v-on:changed-input-field-text="inputListener($event)" />
      <pl-tab-contents-table />
    </div>
  `
}

var labelledInput = {
  props: {
    'label': String,
    'placeholder': String,
    'inputFieldText': String
  },
  methods: {
    inputFieldListener (e) {
      this.$emit('changed-input-field-text', e)
    }
  },
  template: `
    <div class="w-full flex mb-4">
      <span class="text-sm border border-2 rounded-l px-4 py-2 bg-gray-300 whitespace-no-wrap">
        {{ label }}
      </span>
      <input class="border border-2 px-4 py-2 w-full" type="text"
        v-bind:placeholder="placeholder"
        v-on:input="inputFieldListener($event)"
        :value="inputFieldText" />
    </div>
  `
}

var jobTabStatusDisplay = {
  props: {
    statusText: String
  },
  template: `
    <div class="w-full flex flex-wrap">
      <p class="w-full">Status:</p>
      <span class="w-full">{{ statusText }}</span>
    </div>
  `
}

var lhsJobTabContent = {
  computed: Vuex.mapState({
    jobTabDataText: state => state.jobTabDataText,
    jobTabPlText: state => state.jobTabPlText,
    jobTabOutputText: state => state.jobTabOutputText,
    jobStatusText: state => state.jobStatusText
  }),
  components: {
    'labelled-input': labelledInput,
    'job-status-display': jobTabStatusDisplay
  },
  methods: {
    dataInputListener: function (e) {
    },
    plInputListener: function (e) {
    },
    outputInputListener: function (e) {
    },
    previewJobButtonListener: function (e) {
    },
    fullJobButtonListener: function (e) {
    }
  },
  template: `
    <div class="flex flex-wrap" >
      <labelled-input
        label="Data"
        placeholder="data.nxs"
        :inputFieldText="jobTabDataText"
        v-on:changed-input-field-text="dataInputListener($event)" />
      <labelled-input
        label="Process List"
        placeholder="process_list.nxs"
        :inputFieldText="jobTabPlText"
        v-on:changed-input-field-text="plInputListener($event)" />
      <labelled-input
        label="Ouput"
        placeholder="/path/to/output"
        :inputFieldText="jobTabOutputText"
        v-on:changed-input-field-text="outputInputListener($event)" />
      <div class="w-full flex mb-2">
        <button class="w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mr-1"
          v-on:click="previewJobButtonListener">
          Preview
        </button>
        <button class="w-1/2 bg-orange-400 hover:bg-orange-600 text-black font-bold py-2 px-4"
          v-on:click="fullJobButtonListener">
          Full
        </button>
      </div>
      <job-status-display :statusText="jobStatusText" />
    </div>
  `
}

var leftPane = {
  components: {
    'tabbed-display': tabbedDisplay
  },
  data: function () {
    return {
      tabs: [
        {
          name: 'Data',
          component: {
            template: `<p>Data</p>`
          }
        },
        {
          name: 'Process Lists',
          component: {
            components: {
              'lhs-process-lists-tab-content': lhsProcessListsTabContent
            },
            template: `<lhs-process-lists-tab-content />`
          }
        },
        {
          name: 'Job',
          component: {
            components: {
              'lhs-job-tab-content': lhsJobTabContent
            },
            template: `<lhs-job-tab-content />`
          }
        }
      ]
    }
  },
  template: `
    <tabbed-display v-bind:tabs="tabs" />
  `
}

var pluginParamInputField = {
  props: {
    name: String,
    pluginIndex: Number,
    value: null
  },
  methods: {
    valueChangeListener: function (e) {
      this.$store.dispatch('loadPlPluginElements', {
        'pluginIndex': this.pluginIndex,
        'paramName': this.name,
        'paramValue': e.target.value
      })
    }
  },
  template: `
    <input type="text" :value="value" class="w-full shadow rounded px-2 py-2"
      v-on:change="valueChangeListener">
  `
}

var pluginParamDropdownMenu = {
  props: {
    name: String,
    pluginIndex: Number,
    value: null,
    options: Array
  },
  methods: {
    valueChangeListener: function (e) {
      this.$store.dispatch('loadPlPluginElements', {
        'pluginIndex': this.pluginIndex,
        'paramName': this.name,
        'paramValue': e.target.value
      })
    }
  },
  template: `
    <select :value="value" v-on:change="valueChangeListener">
      <option v-for="option in options">{{ option }}</option>
    </select>
  `
}

var pluginParamEditorTableRow = {
  components: {
    'plugin-param-input-field': pluginParamInputField,
    'plugin-param-dropdown-menu': pluginParamDropdownMenu
  },
  data: function () {
    return {
      tooltipOptions: {
        content: this.param.description,
        placement: 'top-center',
        offset: 10,
        trigger: 'hover',
        delay: {
          show: 100,
          hide: 0
        }
      }
    }
  },
  props: {
    pluginIndex: Number,
    param: Object
  },
  template: `
    <tr>
      <td>
        {{ param.name }}
        <span>
          <i class="fas fa-question" v-tooltip="tooltipOptions">
          </i>
        </span>
      </td>
      <td>
        <plugin-param-dropdown-menu v-if="'options' in param"
          :name="param.name"
          :value="param.value"
          :options="param.options"
          :pluginIndex="pluginIndex" />
        <plugin-param-input-field v-else
          v-bind:class="{ 'border-2 border-red-500': param.typeError.hasError }"
          :name="param.name"
          :value="param.value"
          :pluginIndex="pluginIndex" />
        <p v-if="param.typeError.hasError">{{ param.typeError.errorString }}</p>
      </td>
    </tr>
  `
}

var pluginParamEditorTable = {
  props: {
    pluginIndex: Number,
    plugin: Object
  },
  components: {
    'plugin-param-editor-table-row': pluginParamEditorTableRow
  },
  template: `
    <table>
      <tbody>
        <plugin-param-editor-table-row v-for="(param, paramIndex) in plugin.parameters"
          v-if="param.visibility !== 'hidden' && param.display !== 'off'"
          :key="paramIndex"
          :param="param"
          :pluginIndex="pluginIndex" />
      </tbody>
    </table>
  `
}

var toggleSwitch = {
  props: {
    pluginIndex: Number,
    active: Boolean
  },
  methods: {
    clickListener: function () {
      this.$store.dispatch('togglePluginActiveState', this.pluginIndex)
    }
  },
  template: `
    <div class="flex justify-center items-center">
      <div class="relative rounded-full w-12 h-6 transition duration-200 ease-linear"
           :class="[active ? 'bg-blue-500' : 'bg-gray-400']">
        <label :for="pluginIndex"
          class="absolute left-0 bg-white border-2 mb-2 w-6 h-6 rounded-full transition transform duration-100 ease-linear cursor-pointer"
          :class="[active ? 'translate-x-full border-blue-500' : 'translate-x-0 border-gray-400']" />
        <input type="checkbox" :id="pluginIndex"
          class="appearance-none w-full h-full active:outline-none focus:outline-none cursor-pointer"
          v-on:click="clickListener"/>
      </div>
    </div>
  `
}

var plEditorPluginEntry = {
  components: {
    'plugin-param-editor-table': pluginParamEditorTable,
    'toggle-switch': toggleSwitch
  },
  methods: {
    trashIconListener: function () {
      this.$store.dispatch('removePluginFromPl', this.pluginIndex)
    },

    upArrowIconListener: function () {
      this.$store.dispatch('movePluginIndex', {
        'pluginIndex': this.pluginIndex,
        'direction': -1
      })
    },

    downArrowIconListener: function () {
      this.$store.dispatch('movePluginIndex', {
        'pluginIndex': this.pluginIndex,
        'direction': 1
      })
    }

  },
  props: {
    pluginIndex: Number,
    pluginName: String,
    plugin: Object
  },
  template: `
    <div>
      <div class="flex flex-wrap">
        <div>
          <h3>
            <span>{{ pluginIndex }}</span>
            <span>{{ pluginName }}</span>
            <span>
              <i class="fas fa-question">
              </i>
            </span>
          </h3>
        </div>
        <toggle-switch :pluginIndex="pluginIndex" :active="plugin.active"/>
        <div class="icons">
          <i class="fas action fa-lg fa-trash" v-on:click="trashIconListener">
          </i>
          <i class="fas action fa-lg fa-arrow-up" v-on:click="upArrowIconListener">
          </i>
          <i class="fas action fa-lg fa-arrow-down" v-on:click="downArrowIconListener">
          </i>
        </div>
      </div>
      <plugin-param-editor-table :plugin="plugin"
        :pluginIndex="pluginIndex" />
    </div>
  `
}

var addPluginSearchInput = {
  data: function () {
    return {
      allPlugins: [],
      inputFieldText: ''
    }
  },
  created: function () {
    // fetch the list of all available plugins for the list used for
    // plugin name autocompletion
    var comp = this
    searchAvailablePlugins(
      '',
      function (plugins) {
        comp.allPlugins = plugins
      },
      function () {
        console.log("Failed to fetch available plugins for autocompletion list")
      }
    )
  },
  methods: {
    buttonClickListener: function () {
      this.$store.dispatch('addPluginToPl', this.inputFieldText)
    }
  },
  template: `
    <div>
      <datalist id="available_plugins">
        <option v-for="plugin in allPlugins">{{ plugin }}</option>
      </datalist>
      <div class="flex">
        <input class="border border-2 px-4 py-2 w-full"
          type="search"
          list="available_plugins"
          placeholder="Search plugins"
          v-model="inputFieldText" />
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4"
          v-on:click="buttonClickListener">Add Plugin</button>
      </div>
    </div>
  `
}

var plEditorTabContent = {
  computed: Vuex.mapState({
    plPluginElements: state => state.plPluginElements,
    plEditorFilepath: state => state.plEditorFilepath
  }),
  methods: {
    buttonListener: function () {
      this.$store.dispatch('savePl', this.plEditorFilepath)
    },
    inputListener: function (e) {
      this.$store.dispatch('changePlEditorFilepath', e.target.value)
    }
  },
  components: {
    'pl-editor-plugin-entry': plEditorPluginEntry,
    'labelled-input-field-button': labelledInputFieldAndButton,
    'add-plugin-search-input': addPluginSearchInput
  },
  template: `
    <div>
      <labelled-input-field-button
        label="File"
        placeholder="process_list.nxs"
        buttonText="Save Changes"
        :inputFieldText="plEditorFilepath"
        v-on:button-clicked="buttonListener"
        v-on:changed-input-field-text="inputListener($event)" />
      <pl-editor-plugin-entry v-for="(plugin, index) in plPluginElements"
        :key="index + plugin.name"
        :plugin="plugin"
        :pluginName="plugin.name"
        :pluginIndex="index" />
      <add-plugin-search-input />
    </div>
  `
}

var rightPane = {
  components: {
    'tabbed-display': tabbedDisplay
  },
  data: function () {
    return {
      tabs: [
        {
          name: 'Process List',
          component: {
            components: {
              'pl-editor-tab-content': plEditorTabContent
            },
            template: `<pl-editor-tab-content />`
          }
        },
        {
          name: 'Preview',
          component: {
            template: `<p>Preview</p>`
          }
        },
      ]
    }
  },
  template: `
    <tabbed-display v-bind:tabs="tabs" />
  `
}

var processingPageGrid = {
  components: {
    'left-pane': leftPane,
    'right-pane': rightPane,
  },
  template: `
    <div class="flex flex-wrap">
      <div class="w-1/3" >
        <left-pane />
      </div>
      <div class="w-2/3 px-2" >
        <right-pane />
      </div>
    </div>
  `
}

var processingPage = {
  components: {
    'page-title': pageTitle,
    'processing-page-grid': processingPageGrid
  },
  template: `
    <div id="root">
      <page-title text="Processing" />
      <processing-page-grid />
    </div>
  `
}

var vueApp = new Vue({
  components: {
    'processing-page': processingPage
  },
  el: '#vapp',
  store
})
