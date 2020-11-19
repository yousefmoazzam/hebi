<template>
  <tr v-on:click="selectPlugin">
    <td class="px-2 py-2">
      {{ pluginName }}
    </td>
  </tr>
</template>

<script>
export default {
  props: ['pluginName'],
  methods: {
    selectPlugin: function () {
      this.$store.dispatch('loadPluginDetails', this.pluginName)
    }
  }
}
</script>
