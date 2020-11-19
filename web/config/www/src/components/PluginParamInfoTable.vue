<template>
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
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: mapState({
    pluginInfo: state => state.displayedPluginInfo
  })
}
</script>
