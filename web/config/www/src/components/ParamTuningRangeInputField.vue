<template>
  <div class="flex py-2">
    <div :class="labelColour + ' w-1/3 p-1 rounded-l'">{{ label }}</div>
    <input type="text"
      :class="inputClass"
      :value="value"
      v-on:input="inputFieldInputListener" />
  </div>
</template>

<script>
export default {
  props: {
    value: String,
    label: String,
    labelColour: String,
    isCorrectType: Boolean
  },

  computed: {
    inputClass: function () {
      var style = 'w-2/3 p-1 rounded-r'
      if (!this.isCorrectType) {
        style += ' border-2 border-red-500'
      }
      return style
    }
  },

  methods: {
    inputFieldInputListener: function (e) {
      this.$emit('change-range-input-value', e.target.value)
    }
  }
}
</script>
