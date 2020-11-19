<template>
  <tabbed-display v-bind:tabs="tabs" />
</template>

<script>
import TabbedDisplay from './TabbedDisplay.vue'
import LhsProcessListsTabContent from './LhsProcessListsTabContent.vue'
import LhsJobTabContent from './LhsJobTabContent.vue'

export default {
  components: {
    'tabbed-display': TabbedDisplay
  },
  data: function () {
    return {
      tabs: [
        {
          name: 'Data',
          component: {
            template: `<p>Data</p>`
          }
        },
        {
          name: 'Process Lists',
          component: {
            components: {
              'lhs-process-lists-tab-content': LhsProcessListsTabContent
            },
            template: `<lhs-process-lists-tab-content />`
          }
        },
        {
          name: 'Job',
          component: {
            components: {
              'lhs-job-tab-content': LhsJobTabContent
            },
            template: `<lhs-job-tab-content />`
          }
        }
      ]
    }
  }
}
</script>
