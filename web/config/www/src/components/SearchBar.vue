<template>
    <input class="w-full shadow rounded px-2 py-2"
      v-on:change="updatePluginListSearch"
      v-on:keypress="updatePluginListSearch"
      v-on:paste="updatePluginListSearch"
      v-on:input="updatePluginListSearch"
      :value="this.text"
      id="search_field"
      type="text"
      placeholder="Search" />
</template>

<script>
export default {
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
  }
}
</script>
