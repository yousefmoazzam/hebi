<template>
  <div class="border">
    <prompt-modal-box v-for="(modal, index) in promptModalBoxes"
      :promptText="modal.promptText" :key="index"
      v-on:prompt-yes-response="modal.yesResponseListener"
      v-on:prompt-no-response="modal.noResponseListener" />
    <div class="flex">
      <ul class="flex border-b">
        <pane-tab v-for="tab in tabs"
          v-on:click="updateOpenTab"
          v-bind:active="openTab.name === tab.name"
          :key="tab.name"
          :tabTitle="tab.name" />
      </ul>
      <div class="flex-1 border-r border-gray-300"></div>
      <button :class="[isCasAuthActivated === 'False' ? 'cursor-not-allowed bg-gray-200 text-gray-500' : 'cursor-pointer bg-red-500 hover:bg-red-700', 'rounded m-1 p-1']"
          :disabled="isCasAuthActivated === 'False'"
          v-on:click="logoutButtonListener">
          Logout
      </button>
    </div>
    <div class="p-4">
      <component v-bind:is="openTab.component" />
    </div>
  </div>
</template>

<script>
import PaneTab from './PaneTab.vue'
import TabContent from './TabContent.vue'
import PromptModalBox from './PromptModalBox.vue'

export default {
  components: {
    'pane-tab': PaneTab,
    'tab-content': TabContent,
    'prompt-modal-box': PromptModalBox,
  },
  data: function () {
    return {
      openTab: this.tabs[0],
      promptModalBoxes: [],
      isCasAuthActivated: ACTIVATE_CAS_AUTH
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
    },

    logoutButtonListener: function () {
      var promptText = 'Are you sure you would like to log out of Hebi?'
      this.promptModalBoxes.push({
        promptText: promptText,
        yesResponseListener: this.logoutYesResponse,
        noResponseListener: this.logoutNoResponse
      })
    },

    logoutYesResponse: function () {
      console.log('Logging out of Hebi')
      fetch('auth/logout')
          .then(() => {
              this.promptModalBoxes.pop()
              window.location.href = 'login.html'
          })
    },

    logoutNoResponse: function () {
      console.log('Not logging out of Hebi')
      this.promptModalBoxes.pop()
    }
  }
}
</script>
