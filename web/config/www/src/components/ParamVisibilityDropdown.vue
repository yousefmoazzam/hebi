<template>
  <div class="flex mb-2">
    <span class="text-sm rounded px-2 py-1 mr-2 bg-gray-300">
      Parameter visibility
    </span>
    <select :value="chosenParamVisibility" v-on:change="valueChangeListener">
      <option v-for="option in visibilityOptions">{{ option }}</option>
    </select>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      visibilityOptions: [
        'basic',
        'intermediate',
        'advanced',
        'datasets'
      ]
    }
  },
  props: {
    chosenParamVisibility: String
  },
  methods: {
    valueChangeListener: function (e) {
      this.$emit('change-param-visibility', e)
    }
  }
}
</script>
