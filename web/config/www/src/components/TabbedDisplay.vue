<template>
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
</template>

<script>
import PaneTab from './PaneTab.vue'
import TabContent from './TabContent.vue'

export default {
  components: {
    'pane-tab': PaneTab,
    'tab-content': TabContent
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
  }
}
</script>
