import Vue from 'vue'
import VTooltip from 'v-tooltip'

import { store } from './store.js'
import ProcessingPage from './components/ProcessingPage.vue'

import './assets/styles/index.css' // tailwind

Vue.use(VTooltip)

new Vue({
  store,
  el: '#vapp',
  render: h => h(ProcessingPage)
})
