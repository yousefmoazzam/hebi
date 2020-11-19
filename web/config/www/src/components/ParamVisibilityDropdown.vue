<template>
  <select class="mx-2" :value="chosenParamVisibility" v-on:change="valueChangeListener">
    <option v-for="option in visibilityOptions">{{ option }}</option>
  </select>
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
