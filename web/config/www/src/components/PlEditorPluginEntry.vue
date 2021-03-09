<template>
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
          <span v-tooltip="{content: 'Click to show plugin warning', delay: {show: 100, hide: 0}}"
              v-show="showConfigWarnIcon" v-on:click="setConfigWarnDiplay(true)" class="pr-2">
            <i class="fas fa-comment-dots cursor-pointer"></i>
          </span>
          <span class="pr-2">
            <i class="fas fa-sync m-1 hover:text-gray-500 cursor-pointer"
              v-on:click="resetIconListener">
            </i>
          </span>
          <span v-if="plugin.citations.length > 0" class="pr-2">
            <i class="fa fa-quote-right m-1 hover:text-gray-500 cursor-pointer"
              v-on:click="citationIconListener(true)">
            </i>
          </span>
          <pl-editor-plugin-citations-popup
            :isVisible="isCitationsPopupVisible"
            :citations="plugin.citations"
            :pluginNames="[pluginName]"
            v-on:change-citations-popup-visibility="citationIconListener" />
        </h3>
      </div>
      <div class="flex-1"></div>
      <toggle-switch :pluginIndex="pluginIndex" :active="plugin.active"/>
      <div class="icons">
        <i class="fas action fa-lg fa-arrow-up m-1 hover:text-gray-500 cursor-pointer" v-on:click="upArrowIconListener">
        </i>
        <i class="fas action fa-lg fa-arrow-down m-1 hover:text-gray-500 cursor-pointer" v-on:click="downArrowIconListener">
        </i>
        <i class="fas action fa-lg fa-trash ml-1 hover:text-gray-500 cursor-pointer" v-on:click="trashIconListener">
        </i>
      </div>
    </div>
    <prompt-modal-box v-for="(modal, index) in promptModalBoxes"
      :promptText="modal.promptText" :key="index"
      v-on:prompt-yes-response="modal.yesResponseListener"
      v-on:prompt-no-response="modal.noResponseListener" />
    <div v-show="!collapsed">
      <div v-if="plugin.warn !== 'None'">
        <plugin-config-warn-modal-box
          :warningText="plugin.warn"
          :displayModal="displayConfigWarn"
          v-on:hide-modal="setConfigWarnDiplay"/>
      </div>
      <param-visibility-dropdown
        v-on:change-param-visibility="paramVisibilityDropdownListener($event)"
        :chosenParamVisibility="chosenParamVisibility" />
      <plugin-param-editor-table :plugin="plugin"
        :chosenParamVisibility="chosenParamVisibility"
        :pluginIndex="pluginIndex" />
    </div>
  </div>
</template>

<script>
import PluginParamEditorTable from './PluginParamEditorTable.vue'
import ToggleSwitch from './ToggleSwitch.vue'
import ParamVisibilityDropdown from './ParamVisibilityDropdown.vue'
import PluginConfigWarnModalBox from './PluginConfigWarnModalBox.vue'
import PromptModalBox from './PromptModalBox.vue'
import PlEditorPluginCitationsPopup from './PlEditorPluginCitationsPopup.vue'

export default {
  components: {
    'plugin-param-editor-table': PluginParamEditorTable,
    'toggle-switch': ToggleSwitch,
    'param-visibility-dropdown': ParamVisibilityDropdown,
    'plugin-config-warn-modal-box': PluginConfigWarnModalBox,
    'prompt-modal-box': PromptModalBox,
    'pl-editor-plugin-citations-popup': PlEditorPluginCitationsPopup
  },
  methods: {
    trashIconListener: function () {
      // prompt user if they really want to delete the plugin from the process
      // list editor
      var promptText = 'Are you sure you want to delete the plugin from the ' +
        'process list?'
      this.promptModalBoxes.push({
        promptText: promptText,
        yesResponseListener: this.deletePluginYesResponse,
        noResponseListener: this.deletePluginNoResponse
      })
    },

    deletePluginYesResponse: function () {
      console.log('Deleting plugin with index ' + this.pluginIndex)
      this.$store.dispatch('removePluginFromPl', this.pluginIndex)
      this.promptModalBoxes.pop()
    },

    deletePluginNoResponse: function () {
      console.log('Not deleting plugin with index ' + this.pluginIndex)
      this.promptModalBoxes.pop()
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
    },

    setConfigWarnDiplay: function (bool) {
      this.displayConfigWarn = bool
    },

    resetIconListener: function () {
      var promptText = 'Are you sure you want to reset all the parameters ' +
        'of ' + this.pluginName + ' to their default values?'
      this.promptModalBoxes.push({
        promptText: promptText,
        yesResponseListener: this.resetYesResponse,
        noResponseListener: this.resetNoResponse
      })
    },

    resetYesResponse: function () {
      this.$store.dispatch('resetPluginParamsToDefault', {
        'pluginName': this.pluginName,
        'pluginIndex': this.pluginIndex
      })
      this.promptModalBoxes.pop()
    },

    resetNoResponse: function () {
      this.promptModalBoxes.pop()
    },

    citationIconListener: function (bool) {
      this.isCitationsPopupVisible = bool
    }

  },
  data: function () {
    return {
      collapsed: true,
      chosenParamVisibility: 'advanced',
      displayConfigWarn: true,
      tooltipOptions: {
        content: this.plugin.synopsis + "<br><br>" + this.plugin.info +
          "<br><br>" + "Click for more information",
        placement: 'top-center',
        offset: 10,
        trigger: 'hover',
        delay: {
          show: 100,
          hide: 0
        }
      },
      promptModalBoxes: [],
      isCitationsPopupVisible: false
    }
  },
  computed: {
    showConfigWarnIcon: function () {
      return this.plugin.warn !== 'None' && !this.displayConfigWarn
    }
  },
  props: {
    pluginIndex: Number,
    pluginName: String,
    plugin: Object
  }
}
</script>
