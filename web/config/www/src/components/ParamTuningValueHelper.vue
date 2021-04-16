<template>
  <div class="p-2">
    <p class="text-lg">
      Add individual values
    </p>
    <input class="rounded p-1"
      type="text"
      :value="inputFieldVal"
      v-on:input="inputFieldInputListener($event)"
      v-on:keyup.enter="inputFieldEnterKeyListener($event)"/>
  </div>
</template>

<script>
export default {
  props: {
    pluginIndex: String,
    param: Object
  },

  data: function () {
    return {
      inputFieldVal: ''
    }
  },

  methods: {
    inputFieldEnterKeyListener: function (e) {
      // form the semicolon separated string that Savu understands to mean a
      // parameter tuned value, from the new value being added and the current
      // value of the parameter
      if (this.param.value === '') {
        var newParamVal = e.target.value
      } else {
        var newParamVal = this.param.value.slice() + ';' + e.target.value
      }

      this.$store.dispatch('loadPlPluginElements', {
        'pluginIndex': this.pluginIndex,
        'paramName': this.param.name,
        'paramValue': newParamVal
      })

      this.inputFieldVal = ''
    },

    inputFieldInputListener: function (e) {
      this.inputFieldVal = e.target.value
    }
  }
}
</script>
