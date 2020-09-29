import { store } from './store.js'


var pageTitle = {
  props: ['text'],
  template: `
    <h1 class="mb-2">{{ text }}</h1>
  `
}

var searchBar = {
  data: function () {
    return {
      text: ''
    }
  },
  methods: {
    updatePluginListSearch: function (e) {
      this.data = e.target.value;
      this.$store.dispatch('loadPluginSearchResults', this.data)
    }
  },
  template: `
    <input v-on:change="updatePluginListSearch"
    v-on:keypress="updatePluginListSearch"
    v-on:paste="updatePluginListSearch"
    v-on:input="updatePluginListSearch"
    :value="this.text"
    id="search_field"
    type="text"
    placeholder="Search"
    class="w-full shadow rounded px-2 py-2">
  `
}

var pluginTableRow = {
  props: ['pluginName'],
  methods: {
    selectPlugin: function () {
      this.$store.dispatch('loadPluginDetails', this.pluginName)
    }
  },
  template: `
    <tr v-on:click="selectPlugin">
      <td class="px-2 py-2">
        {{ pluginName }}
      </td>
    </tr>
  `
}

var pluginTable = {
  computed: Vuex.mapState({
    pluginSearchResults: state => state.pluginSearchResults
  }),
  components: {
    'plugin-table-row': pluginTableRow
  },
  template: `
    <div class="scroll">
      <table class="w-full border-collapse">
        <tbody>
        <plugin-table-row
          v-for="value in pluginSearchResults"
          :key="value"
          :pluginName="value" />
        </tbody>
      </table>
    </div>
  `
}

var pluginCitationsTable = {
  computed: Vuex.mapState({
    pluginInfo: state => state.displayedPluginInfo
  }),
  template: `
    <table class="w-full border-collapse">
      <thead>
        <tr class="text-left">
          <th class="px-2 py-2">Description</th>
          <th class="px-2 py-2">DOI</th>
          <th class="px-2 py-2">BibTeX</th>
          <th class="px-2 py-2">Endnote</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="citation in pluginInfo.citation">
          <td class="px-2 py-2">{{ citation.description }}</td>
          <td class="px-2 py-2">{{ citation.doi }}</td>
          <td class="px-2 py-2">{{ citation.bibtex }}</td>
          <td class="px-2 py-2">{{ citation.endnote }}</td>
        </tr>
      </tbody>
    </table>
  `
}

var pluginParamInfoTable = {
  computed: Vuex.mapState({
    pluginInfo: state => state.displayedPluginInfo
  }),
  template: `
    <table class="w-full border-collapse border border-gray-300">
      <thead class="bg-gray-100 border-2 border border-gray-300">
        <tr class="text-left">
          <th class="px-2 py-2">Parameter</th>
          <th class="px-2 py-2">Description</th>
          <th class="px-2 py-2">Type</th>
          <th class="px-2 py-2">Default</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="param in pluginInfo.parameters">
          <td class="px-2 py-2">{{ param.name }}</td>
          <td class="px-2 py-2">{{ param.description }}</td>
          <td class="px-2 py-2">{{ param.type }}</td>
          <td class="px-2 py-2">{{ param.value }}</td>
        </tr>
      </tbody>
    </table>
  `
}

var pluginInfoDisplay = {
  computed: Vuex.mapState({
    pluginInfo: state => state.displayedPluginInfo
  }),
  components: {
    'plugin-param-info-table': pluginParamInfoTable,
    'plugin-citations-table': pluginCitationsTable
  },
  template: `
    <div>
      <h2>{{ pluginInfo.name }}</h2>
      <p>{{ pluginInfo.synopsis }}</p>
      <div class="scroll">
        <h3>Information</h3>
        <p>{{ pluginInfo.info }}</p>
        <h3>Parameters</h3>
        <plugin-param-info-table />
        <div v-bind:class="{ hidden: pluginInfo.citation.length === 0 }">
          <h3>Citations</h3>
          <plugin-citations-table/>
        </div>
      </div>
    </div>
  `
}

var pluginPageGrid = {
  components: {
    'search-bar': searchBar,
    'plugin-table': pluginTable,
    'plugin-info-display': pluginInfoDisplay
  },
  template: `
    <div class="flex flex-wrap">
      <div class="w-1/3" >
        <search-bar />
        <plugin-table />
      </div>
      <div class="w-2/3" >
        <plugin-info-display />
      </div>
    </div>
  `
}

var pluginPage = {
  components: {
    'page-title': pageTitle,
    'plugin-page-grid': pluginPageGrid
  },
  template: `
    <div id="root">
      <page-title text="Plugins" />
      <plugin-page-grid />
    </div>
  `
}

var vueApp = new Vue({
  mounted: function () {
    // use the action for running a plugin search to return all the available
    // plugins when the page first loads
    this.$store.dispatch('loadPluginSearchResults', '')
  },
  components: {
    'plugin-page': pluginPage
  },
  el: '#vapp',
  store
})
