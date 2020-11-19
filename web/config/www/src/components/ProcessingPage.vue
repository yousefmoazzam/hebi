<template>
  <div id="root">
    <page-title text="Processing" />
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
