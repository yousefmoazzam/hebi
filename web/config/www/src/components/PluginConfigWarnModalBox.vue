<template>
  <div class="h-full w-full pb-2" v-show="displayModal">
    <div>
      <div class="justify-between p-3 bg-gray-900 rounded-t flex">
        <h5 class="text-white uppercase">Important Plugin Notice</h5>
        <span class="cursor-pointer" v-on:click="timesIconListener">
          <i class="fas fa-times text-gray-100 hover:text-gray-500"></i>
        </span>
      </div>
      <div class="p-3 w-full h-full overflow-y-auto border border-gray-300">
        <p>{{ warningText }}</p>
      </div>
    </div>
</div>
</template>

<script>
export default {
  methods: {
    timesIconListener: function (e) {
      this.$emit('hide-modal', false)
    }
  },
  props: {
    warningText: String,
    displayModal: Boolean
  }
}
</script>
