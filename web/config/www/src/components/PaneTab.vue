<template>
  <li v-on:click="tabClickListener">
    <a v-bind:class="[active ? 'bg-gray-400 -mb-px text-blue-700' : 'bg-white text-blue-500 hover:text-blue-800', 'inline-block py-2 px-4 mr-1 hover:cursor-pointer font-semibold']">
    {{ tabTitle }}
    </a>
  </li>
</template>

<script>
export default {
  methods: {
    tabClickListener: function (e) {
      this.$emit('click', this.tabTitle)
    }
  },
  props: ['tabTitle', 'active']
}
</script>
