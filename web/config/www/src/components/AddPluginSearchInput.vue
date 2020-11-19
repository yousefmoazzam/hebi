<template>
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
</template>

<script>
import { searchAvailablePlugins } from '../api_savu.js'

export default {
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
  }
}
</script>
