<template>
  <div class="select-none cursor-pointer p-1 hover:bg-gray-200"
    v-on:click="clickListener">
    <p>
      {{ entry }}
    </p>
  </div>
</template>

<script>

export default {
  props: {
    entry: String
  },

  methods: {
    clickListener() {
      this.$store.dispatch('changePluginBrowserSearchInputFieldText', this.entry)
    }
  }
}
</script>
