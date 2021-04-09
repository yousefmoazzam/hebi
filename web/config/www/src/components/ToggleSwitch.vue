<template>
    <div class="cursor-pointer grid grid-cols-2 rounded-full w-12 h-6 mr-1"
      :class="[active ? 'bg-blue-500' : 'bg-gray-400']"
      v-on:click="clickListener">
      <div class="table">
        <!-- this div and its styling is for vertically aligning the inner text -->
        <div class="table-cell align-middle">
          <!-- the flex and justify-center styling is for horizontally aligning the text in the space between the inner circle and the edge of the toggle button -->
          <p class="flex justify-center transition transform duration-100 ease-linear text-xs select-none"
            :class="[active ? 'translate-x-0 pl-1' : 'translate-x-full text-gray-600 pr-1']">
            {{ toggleButtonText }}
          </p>
        </div>
      </div>
      <div class="absolute bg-white border-2 w-6 h-6 rounded-full transition transform duration-100 ease-linear cursor-pointer"
          :class="[active ? 'translate-x-full border-blue-500' : 'translate-x-0 border-gray-400']">
      </div>
    </div>
</template>

<script>
export default {
  props: {
    pluginIndex: String,
    active: Boolean
  },
  computed: {
    toggleButtonText: function () {
      if (this.active) {
        return 'On'
      } else {
        return 'Off'
      }
    }
  },
  methods: {
    clickListener: function () {
      this.$store.dispatch('togglePluginActiveState', this.pluginIndex)
    }
  }
}
</script>
