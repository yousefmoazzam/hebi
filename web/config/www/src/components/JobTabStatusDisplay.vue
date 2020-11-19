<template>
  <div class="w-full flex flex-wrap">
    <p class="w-full">Status:</p>
    <span class="w-full">{{ statusText }}</span>
  </div>
</template>

<script>
export default {
  props: {
    statusText: String
  }
}
</script>
