<template>
  <div>
    <div class="relative rounded-full w-12 h-6 transition duration-200 ease-linear"
         :class="[active ? 'bg-blue-500' : 'bg-gray-400']">
      <label :for="pluginIndex"
        class="absolute left-0 bg-white border-2 mb-2 w-6 h-6 rounded-full transition transform duration-100 ease-linear cursor-pointer"
        :class="[active ? 'translate-x-full border-blue-500' : 'translate-x-0 border-gray-400']" />
      <input type="checkbox" :id="pluginIndex"
        class="appearance-none w-full h-full active:outline-none focus:outline-none cursor-pointer"
        v-on:click="clickListener"/>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    pluginIndex: Number,
    active: Boolean
  },
  methods: {
    clickListener: function () {
      this.$store.dispatch('togglePluginActiveState', this.pluginIndex)
    }
  }
}
</script>
