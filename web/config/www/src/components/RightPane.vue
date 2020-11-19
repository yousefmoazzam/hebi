<template>
  <tabbed-display v-bind:tabs="tabs" />
</template>

<script>
import TabbedDisplay from './TabbedDisplay.vue'
import PlEditorTabContent from './PlEditorTabContent.vue'

export default {
  components: {
    'tabbed-display': TabbedDisplay
  },
  data: function () {
    return {
      tabs: [
        {
          name: 'Process List',
          component: {
            components: {
              'pl-editor-tab-content': PlEditorTabContent
            },
            template: `<pl-editor-tab-content />`
          }
        },
        {
          name: 'Preview',
          component: {
            template: `<p>Preview</p>`
          }
        },
      ]
    }
  }
}
</script>
