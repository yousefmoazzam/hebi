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
      <div class="p-4">
        <component v-bind:is="openTab.component" />
      </div>
    </div>
  `
}

var labelledInputFieldAndButton = {
  props: {
    'label': String,
    'placeholder': String,
    'inputFieldText': String,
    'buttons': Array
  },
  methods: {
    inputFieldListener (e) {
      this.$emit('changed-input-field-text', e)
    }
  },
  template: `
    <div class="flex mb-4">
      <span class="text-sm border border-2 rounded-l px-4 py-2 bg-gray-300 whitespace-no-wrap">
        {{ label }}
      </span>
      <input class="border border-2 px-4 py-2 w-full" type="text"
        v-bind:placeholder="placeholder"
        v-on:input="inputFieldListener($event)"
        :value="inputFieldText" />
      <button v-for="button in buttons"
        :class="button.bgColour + ' hover:' + button.bgHoverColour + ' text-white font-bold py-2 px-4'"
        v-on:click="button.listener">
        {{ button.text }}
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
      <td class="px-2 py-2">
        <i class="fas fa-folder-open" v-on:click="folderIconListener" />
      </td>
      <td class="px-2 py-2">
        <i class="fas fa-download" v-on:click="downloadIconListener" />
      </td>
      <td class="px-2 py-2">
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
      <table class="w-full border-collapse border border-gray-300">
        <thead class="bg-gray-100 border-2 border border-gray-300">
          <tr class="text-left">
            <th class="px-2 py-2">Filename</th>
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
  data: function () {
    return {
      inputFieldButtons: [
        {
          'text': 'Refresh',
          'bgColour': 'bg-blue-500',
          'bgHoverColour': 'bg-blue-700',
          'listener': () => {
            this.$store.dispatch('loadPlFilepathSearchResults', this.plFilepathSearchText)
          }
        }
      ]
    }
  },
  components: {
    'labelled-input-field-button': labelledInputFieldAndButton,
    'pl-tab-contents-table': plTabContentsTable
  },
  methods: {
    inputListener: function (e) {
      this.$store.dispatch('updatePlFilepathSearchText', e.target.value)
    }
  },
  template: `
    <div>
      <labelled-input-field-button
        label="Search Path"
        placeholder="Path"
        :inputFieldText="plFilepathSearchText"
        :buttons="inputFieldButtons"
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
  data: function () {
    return {
      latestInputValue: this.param.value
    }
  },
  props: {
    pluginIndex: Number,
    param: Object
  },
  computed: {
    hasInputBeenChanged: function () {
      return this.latestInputValue !== String(this.param.value)
    },

    inputFieldClass: function () {
      var classString = 'w-full shadow rounded px-2 py-2 '

      if (this.hasInputBeenChanged) {
        classString += 'italic text-gray-500 '
      }

      if (this.param.typeError.hasError) {
        classString += 'border-2 border-red-500'
      }

      return classString
    }
  },
  methods: {
    valueChangeListener: function (e) {
      this.$store.dispatch('loadPlPluginElements', {
        'pluginIndex': this.pluginIndex,
        'paramName': this.param.name,
        'paramValue': e.target.value
      })
    },
    valueInputListener: function (e) {
      this.latestInputValue = e.target.value
    }
  },
  template: `
    <div>
      <td class="px-2 py-2">
      </td>
      <td class="px-2 py-2 w-full">
        <input type="text" :value="latestInputValue" :class="inputFieldClass"
          v-on:change="valueChangeListener"
          v-on:input="valueInputListener">
        <p v-if="param.typeError.hasError" class="pt-2">
          {{ param.typeError.errorString }}
        </p>
      </td>
    </div>
  `
}

var pluginParamDropdownMenu = {
  data: function () {
    return {
      optionIndex: this.getChosenOptionIndex(this.param.value)
    }
  },
  props: {
    pluginIndex: Number,
    param: Object
  },
  computed: {
    tooltipOptions: function () {
      return {
        content: this.param['options'][this.optionIndex][1],
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
  methods: {
    valueChangeListener: function (e) {
      this.$store.dispatch('loadPlPluginElements', {
        'pluginIndex': this.pluginIndex,
        'paramName': this.param.name,
        'paramValue': e.target.value
      })
      this.optionIndex = this.getChosenOptionIndex(e.target.value)
    },

    getChosenOptionIndex: function (optionName) {
      for (var optionIndex in this.param['options']) {
        if (this.param['options'][optionIndex][0] === optionName) {
          return optionIndex
        }
      }
    }
  },
  template: `
    <div>
      <td class="px-2 py-2">
        <span>
          <i class="fas fa-question" v-tooltip="tooltipOptions">
          </i>
        </span>
      </td>
      <td class="mx-2 my-2 w-full">
        <select :value="param.value" v-on:change="valueChangeListener">
          <option v-for="option in param.options">{{ option[0] }}</option>
        </select>
      </td>
    </div>
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
      <td class="px-2 py-2">
        <div>
          <a class="float-left">
            {{ param.name }}
          </a>
          <span>
            <i class="fas fa-question fa-xs float-left" v-tooltip="tooltipOptions">
            </i>
          </span>
        </div>
      </td>
      <plugin-param-dropdown-menu v-if="'options' in param"
        :param="param"
        :key="param.name + param.value"
        :pluginIndex="pluginIndex" />
      <plugin-param-input-field v-else
        :param="param"
        :key="param.name + param.value"
        :pluginIndex="pluginIndex" />
    </tr>
  `
}

var pluginParamEditorTable = {
  created: function () {
    const VisibilityOrdering = {
      'HIDDEN': 0,
      'BASIC': 1,
      'INTERMEDIATE': 2,
      'ADVANCED': 3
    }
    this.visibilityOrdering = VisibilityOrdering
  },
  props: {
    pluginIndex: Number,
    plugin: Object,
    chosenParamVisibility: String
  },
  methods: {
    isVisible: function (param) {
      if (param.visibility === 'datasets') {
        if (this.chosenParamVisibility === 'datasets' ||
            this.chosenParamVisibility === 'advanced') {
          // if the chosen visibility is "datasets" or "advanced", then show
          // the parameters with a visibility of "datasets"
          return true
        } else {
          // for any other chosen visibility, parameters with a visibility of
          // "datasets" shouldn't be displayed
          return false
        }
      } else {
        if (this.chosenParamVisibility === 'datasets') {
          // the parameter visibility isn't "datasets", so if the chosen
          // visibility is "datasets" then the parameter shouldn't be displayed
          return false
        } else {
          // the parameter visibility nor the chosen visibility is "datasets",
          // so they have a value in "hidden", "basic", "intermediate", or
          // "advanced", and can be compared using the "enum" called
          // this.visibilityOrdering defined in the created() function of this
          // component to determine whether or not the parameter should be
          // displayed
          var chosenVisibilityUppercase = this.chosenParamVisibility.toUpperCase()
          var paramVisibilityUppercase = param.visibility.toUpperCase()
          var visibilityConditionSatisfied = false

          if (this.visibilityOrdering[chosenVisibilityUppercase] >=
              this.visibilityOrdering[paramVisibilityUppercase]) {
            visibilityConditionSatisfied = true
          } else {
            visibilityConditionSatisfied = false
          }

          return ((param.display !== 'off') && visibilityConditionSatisfied)
        }
      }
    }
  },
  components: {
    'plugin-param-editor-table-row': pluginParamEditorTableRow
  },
  template: `
    <table class="w-full border-collapse border border-gray-300 mb-4">
      <tbody>
        <plugin-param-editor-table-row v-for="(param, paramIndex) in plugin.parameters"
          v-if="isVisible(param)"
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

var paramVisibilityDropdown = {
  data: function () {
    return {
      visibilityOptions: [
        'basic',
        'intermediate',
        'advanced',
        'datasets'
      ]
    }
  },
  props: {
    chosenParamVisibility: String
  },
  methods: {
    valueChangeListener: function (e) {
      this.$emit('change-param-visibility', e)
    }
  },
  template: `
    <select class="mx-2" :value="chosenParamVisibility" v-on:change="valueChangeListener">
      <option v-for="option in visibilityOptions">{{ option }}</option>
    </select>
  `
}

var plEditorPluginEntry = {
  components: {
    'plugin-param-editor-table': pluginParamEditorTable,
    'toggle-switch': toggleSwitch,
    'param-visibility-dropdown': paramVisibilityDropdown
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
    },

    paramVisibilityDropdownListener: function (e) {
      this.chosenParamVisibility = e.target.value
    },

    infoIconClickListener: function () {
      window.open(this.plugin.docLink)
    }

  },
  data: function () {
    return {
      collapsed: true,
      chosenParamVisibility: 'advanced',
      tooltipOptions: {
        content: this.plugin.synopsis,
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
    pluginName: String,
    plugin: Object
  },
  template: `
    <div>
      <div class="flex flex-wrap mb-2">
        <div class="pr-2">
          <div v-if="collapsed" v-on:click="collapsed = !collapsed" class="cursor-pointer rounded-full border border-grey-500 w-7 h-7 hover:bg-gray-200">
            <svg aria-hidden="true" class="" data-reactid="266" fill="none" height="24" stroke="#606F7B" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewbox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
          <div v-else v-on:click="collapsed = !collapsed" class="cursor-pointer rounded-full border w-7 h-7 bg-blue-500 hover:bg-blue-700">
            <svg aria-hidden="true" data-reactid="281" fill="none" height="24" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewbox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
        <div>
          <h3>
            <span class="pr-2">{{ pluginIndex }}</span>
            <span class="pr-2">{{ pluginName }}</span>
            <span class="pr-2">
              <i class="fas fa-info-circle cursor-pointer"
                v-tooltip="tooltipOptions"
                v-on:click="infoIconClickListener">
              </i>
            </span>
          </h3>
        </div>
        <toggle-switch :pluginIndex="pluginIndex" :active="plugin.active"/>
        <param-visibility-dropdown
          v-on:change-param-visibility="paramVisibilityDropdownListener($event)"
          :chosenParamVisibility="chosenParamVisibility" />
        <div class="flex-1"></div>
        <div class="icons">
          <i class="fas action fa-lg fa-trash m-1" v-on:click="trashIconListener">
          </i>
          <i class="fas action fa-lg fa-arrow-up m-1" v-on:click="upArrowIconListener">
          </i>
          <i class="fas action fa-lg fa-arrow-down m-1" v-on:click="downArrowIconListener">
          </i>
        </div>
      </div>
      <plugin-param-editor-table v-show="!collapsed" :plugin="plugin"
        :chosenParamVisibility="chosenParamVisibility"
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

var addPluginTreeView = {
  mounted: function () {
    this.$store.dispatch('loadPluginCollections')
  },
  computed: {
    ...Vuex.mapGetters([
      'pluginCollections'
    ])
  },
  data: function () {
    return {
      inputFieldText: null
    }
  },
  components: {
    'tree-view': VueTreeselect.Treeselect
  },
  methods: {
    buttonClickListener: function () {
      this.$store.dispatch('addPluginToPl', this.inputFieldText)
    }
  },
  template: `
    <div class="flex mb-2">
      <tree-view v-model="inputFieldText"
        placeholder="Search plugins..."
        :options="pluginCollections"
        :disable-branch-nodes="true" />
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4"
        v-on:click="buttonClickListener">Add Plugin</button>
    </div>
  `
}

var plEditorTabContent = {
  computed: Vuex.mapState({
    plPluginElements: state => state.plPluginElements,
    plEditorFilepath: state => state.plEditorFilepath
  }),
  data: function () {
    return {
      inputFieldButtons: [
        {
          'text': 'Save Changes',
          'bgColour': 'bg-blue-500',
          'bgHoverColour': 'bg-blue-700',
          'listener': () => {
            this.$store.dispatch('savePl', this.plEditorFilepath)
          }
        },
        {
          'text': 'Save As New',
          'bgColour': 'bg-gray-500',
          'bgHoverColour': 'bg-gray-600',
          'listener': () => {
            this.$store.dispatch('saveNewPl', this.plEditorFilepath)
          }
        }
      ]
    }
  },
  methods: {
    buttonListener: function () {
      this.$store.dispatch('savePl', this.plEditorFilepath)
    },
    inputListener: function (e) {
      this.$store.dispatch('changePlEditorFilepath', e.target.value)
    },
    changeAllPluginsCollapsedState: function (e, collapseAll) {
      for (var pluginEntry in this.$refs) {
        if (this.$refs[pluginEntry].length !== 0) {
          this.$refs[pluginEntry][0]._data.collapsed = collapseAll
        }
      }
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
        :inputFieldText="plEditorFilepath"
        :buttons="inputFieldButtons"
        v-on:changed-input-field-text="inputListener($event)" />
      <div class="pb-4">
        <button class="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4"
          v-on:click="changeAllPluginsCollapsedState($event, true)" >
          Collapse All
        </button>
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4"
          v-on:click="changeAllPluginsCollapsedState($event, false)" >
          Expand All
        </button>
      </div>
      <pl-editor-plugin-entry v-for="(plugin, index) in plPluginElements"
        :key="plugin.name"
        :ref="plugin.name"
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
