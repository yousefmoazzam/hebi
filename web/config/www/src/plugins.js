import Vue from 'vue'

import { store } from './store.js'
import PluginsPage from './components/PluginsPage.vue'

import './assets/styles/index.css' // tailwind

new Vue({
  mounted: function () {
    // use the action for running a plugin search to return all the available
    // plugins when the page first loads
    this.$store.dispatch('loadPluginSearchResults', '')
  },
  store,
  el: '#vapp',
  render: h => h(PluginsPage)
})
