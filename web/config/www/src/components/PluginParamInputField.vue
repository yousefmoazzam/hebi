<template>
<div>
  <td class="px-2 py-2">
  </td>
  <td class="px-2 py-2 w-full">
    <input type="text" :value="latestInputValue" :class="inputFieldClass"
      v-on:change="valueChangeListener"
      v-on:input="valueInputListener">
    <div v-if="param.typeError.hasError" class="flex">
      <span class="pt-2 pr-2">
        <i class="fas fa-exclamation-triangle text-red-600"></i>
      </span>
      <p class="pt-2">
        {{ "ERROR: " + param.typeError.errorString }}
      </p>
    </div>
  </td>
</div>
</template>

<script>
export default {
  data: function () {
    return {
      latestInputValue: this.param.value
    }
  },
  props: {
    pluginIndex: Number,
    param: Object
  },
  computed: {
    hasInputBeenChanged: function () {
      return this.latestInputValue !== String(this.param.value)
    },

    inputFieldClass: function () {
      var classString = 'w-full shadow rounded px-2 py-2 '

      if (this.hasInputBeenChanged) {
        classString += 'italic text-gray-500 '
      }

      if (this.param.typeError.hasError) {
        classString += 'border-2 border-red-500'
      }

      return classString
    }
  },
  methods: {
    valueChangeListener: function (e) {
      this.$store.dispatch('loadPlPluginElements', {
        'pluginIndex': this.pluginIndex,
        'paramName': this.param.name,
        'paramValue': e.target.value
      })
    },
    valueInputListener: function (e) {
      this.latestInputValue = e.target.value
    }
  }
}
</script>
