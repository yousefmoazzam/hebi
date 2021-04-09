<template>
  <div>
    <td class="px-2 py-2">
      <span>
        <i class="fas fa-question" v-tooltip="tooltipOptions">
        </i>
      </span>
    </td>
    <td class="mx-2 my-2 w-full">
      <select :value="param.value" v-on:change="valueChangeListener">
        <option v-for="option in param.options">{{ option[0] }}</option>
      </select>
    </td>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      optionIndex: this.getChosenOptionIndex(this.param.value)
    }
  },
  props: {
    pluginIndex: String,
    param: Object
  },
  computed: {
    tooltipOptions: function () {
      return {
        content: this.param['options'][this.optionIndex][1],
        placement: 'top-center',
        offset: 10,
        trigger: 'hover',
        delay: {
          show: 100,
          hide: 0
        }
      }
    }
  },
  methods: {
    valueChangeListener: function (e) {
      this.$store.dispatch('loadPlPluginElements', {
        'pluginIndex': this.pluginIndex,
        'paramName': this.param.name,
        'paramValue': e.target.value
      })
      this.optionIndex = this.getChosenOptionIndex(e.target.value)
    },

    getChosenOptionIndex: function (optionName) {
      for (var optionIndex in this.param['options']) {
        if (this.param['options'][optionIndex][0] === optionName) {
          return optionIndex
        }
      }
    }
  }
}
</script>
