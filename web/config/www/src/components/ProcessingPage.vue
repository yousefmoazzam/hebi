<template>
  <div id="root">
    <processing-page-grid />
  </div>
</template>

<script>
import PageTitle from './PageTitle.vue'
import ProcessingPageGrid from './ProcessingPageGrid.vue'

export default {
  components: {
    'page-title': PageTitle,
    'processing-page-grid': ProcessingPageGrid
  }
}
</script>
