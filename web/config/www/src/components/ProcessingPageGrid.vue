<template>
  <div class="flex flex-wrap">
    <div class="w-full px-2" >
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
