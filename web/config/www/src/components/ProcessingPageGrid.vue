<template>
  <div class="flex justify-center">
    <div class="w-full px-2 py-4" >
      <right-pane />
    </div>
  </div>
</template>

<script>
import LeftPane from './LeftPane.vue'
import RightPane from './RightPane.vue'

export default {
  components: {
    'left-pane': LeftPane,
    'right-pane': RightPane
  }
}
</script>
