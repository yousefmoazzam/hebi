<template>
  <div>
    <b-dropdown split right class="ml-2"
      v-on:click="clickSplitButton"
      :text="chosenOption.text">
      <b-dropdown-item v-for="option in options"
        v-on:click="changeOption(option.text)"
        :key="option.text">
        {{ option.text }}
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      chosenOption: this.options[0]
    }
  },
  props: {
    options: Array
  },
  methods: {
    changeOption: function (text) {
      for (var optionIdx in this.options) {
        if (this.options[optionIdx].text === text) {
          this.chosenOption = this.options[optionIdx];
          break;
        }
      }
    },

    clickSplitButton: function () {
      this.chosenOption.listener()
    }
  }
}
</script>
