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
  data: function () {
    return {
      inputFieldText: this.initialInputFieldText
    }
  },
  props: {
    'label': String,
    'placeholder': String,
    'buttonText': String,
    'action': String,
    'initialInputFieldText': String
  },
  methods: {
    buttonClickListener (e) {
      this.$store.dispatch(this.action, this.inputFieldText)
    }
  },
  template: `
    <div class="flex">
      <span class="text-sm border border-2 rounded-l px-4 py-2 bg-gray-300 whitespace-no-wrap">
        {{ label }}
      </span>
      <input class="border border-2 px-4 py-2 w-full" type="text"
        v-bind:placeholder="placeholder"
        v-model="inputFieldText" />
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4"
        v-on:click="buttonClickListener">
        {{ buttonText }}
      </button>
    </div>
  `
}

var plTabContentsTableRow = {
  props: {
    filepath: String
  },
  template: `
    <tr>
      <td class="px-2 py-2">
        {{ filepath }}
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
  components: {
    'labelled-input-field-and-button': labelledInputFieldAndButton,
    'pl-tab-contents-table': plTabContentsTable
  },
  template: `
    <div>
      <labelled-input-field-and-button
        label="Search Path"
        placeholder="Path"
        buttonText="Refresh"
        action="loadPlFilepathSearchResults"
        initialInputFieldText="/data/process_lists"/>
      <pl-tab-contents-table />
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
            template: `<p>Job</p>`
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
  template: `
    <select :value="value">
      <option v-for="option in options">{{ option }}</option>
    </select>
  `
}

var pluginParamEditorTableRow = {
  components: {
    'plugin-param-input-field': pluginParamInputField,
    'plugin-param-dropdown-menu': pluginParamDropdownMenu
  },
  props: {
    pluginIndex: Number,
    param: Object
  },
  template: `
    <tr>
      <td>{{ param.name }}</td>
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

var plEditorPluginEntry = {
  components: {
    'plugin-param-editor-table': pluginParamEditorTable
  },
  methods: {
    trashIconListener: function () {
      this.$store.dispatch('removePluginFromPl', this.pluginIndex)
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
        <div class="toggle-switch">
        </div>
        <div class="icons">
          <i class="fas action fa-lg fa-trash" v-on:click="trashIconListener">
          </i>
          <i class="fas action fa-lg fa-arrow-up">
          </i>
          <i class="fas action fa-lg fa-arrow-down">
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
  mounted: function () {
    // hardcode a specific process list to load when the app first loads for
    // now, just to make development easier
    this.$store.dispatch('loadPl', '/data/process_lists/simple_tomo_pipeline_cpu_param.nxs')
  },
  computed: Vuex.mapState({
    plPluginElements: state => state.plPluginElements
  }),
  components: {
    'pl-editor-plugin-entry': plEditorPluginEntry,
    'labelled-input-field-and-button': labelledInputFieldAndButton,
    'add-plugin-search-input': addPluginSearchInput
  },
  template: `
    <div>
      <labelled-input-field-and-button
        label="File"
        placeholder="process_list.nxs"
        buttonText="Save Changes"
        action="savePl"
        initialInputFieldText="/data/process_lists/simple_tomo_pipeline_cpu_param.nxs" />
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
