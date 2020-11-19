<template>
  <div class="flex mb-4">
    <span class="text-sm border border-2 rounded-l px-4 py-2 bg-gray-300 whitespace-no-wrap">
      {{ label }}
    </span>
    <input class="border border-2 px-4 py-2 w-full" type="text"
      v-bind:placeholder="placeholder"
      v-on:input="inputFieldListener($event)"
      :value="inputFieldText" />
    <button v-for="button in buttons"
      :class="button.bgColour + ' hover:' + button.bgHoverColour + ' text-white font-bold py-2 px-4'"
      v-on:click="button.listener">
      {{ button.text }}
    </button>
  </div>
</template>

<script>
export default {
  props: {
    'label': String,
    'placeholder': String,
    'inputFieldText': String,
    'buttons': Array
  },
  methods: {
    inputFieldListener (e) {
      this.$emit('changed-input-field-text', e)
    }
  }
}
</script>
