import Vue from 'vue'
import VTooltip from 'v-tooltip'
import { BootstrapVue } from 'bootstrap-vue'

import { store } from './store.js'
import ProcessingPage from './components/ProcessingPage.vue'
import vuetify from './plugins/vuetify'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './assets/styles/index.css' // tailwind

Vue.use(VTooltip)
Vue.use(BootstrapVue)

new Vue({
  vuetify,
  store,
  el: '#vapp',
  render: h => h(ProcessingPage)
})
