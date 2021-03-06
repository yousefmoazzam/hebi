<template>
  <table class="w-full border-collapse border border-gray-300 mb-4">
    <tbody>
      <plugin-param-editor-table-row v-for="(param, paramIndex) in visibleParams"
        :key="param.name"
        :param="param"
        :pluginIndex="pluginIndex" />
      <p class="p-1" v-show="visibleParams.length === 0">
        All parameters have been filtered out
      </p>
    </tbody>
  </table>
</template>

<script>
import PluginParamEditorTableRow from './PluginParamEditorTableRow.vue'

export default {
  created: function () {
    const VisibilityOrdering = {
      'BASIC': 0,
      'INTERMEDIATE': 1,
      'ADVANCED': 2
    }
    this.visibilityOrdering = VisibilityOrdering
  },
  props: {
    pluginIndex: String,
    plugin: Object,
    chosenParamVisibility: String
  },
  computed: {
    visibleParams: function () {
      return this.plugin.parameters.filter(this.isVisible)
    }
  },
  methods: {
    isVisible: function (param) {
      if (param.visibility === 'datasets') {
        if (this.chosenParamVisibility === 'datasets' ||
            this.chosenParamVisibility === 'advanced') {
          // if the chosen visibility is "datasets" or "advanced", then show
          // the parameters with a visibility of "datasets"
          return true
        } else {
          // for any other chosen visibility, parameters with a visibility of
          // "datasets" shouldn't be displayed
          return false
        }
      } else {
        if (this.chosenParamVisibility === 'datasets') {
          // the parameter visibility isn't "datasets", so if the chosen
          // visibility is "datasets" then the parameter shouldn't be displayed
          return false
        } else {
          // the parameter visibility nor the chosen visibility is "datasets",
          // so they have a value in "basic", "intermediate", or "advanced",
          // and can be compared using the "enum" called
          // this.visibilityOrdering defined in the created() function of this
          // component to determine whether or not the parameter should be
          // displayed
          var chosenVisibilityUppercase = this.chosenParamVisibility.toUpperCase()
          var paramVisibilityUppercase = param.visibility.toUpperCase()
          var visibilityConditionSatisfied = false

          if (this.visibilityOrdering[chosenVisibilityUppercase] >=
              this.visibilityOrdering[paramVisibilityUppercase]) {
            visibilityConditionSatisfied = true
          } else {
            visibilityConditionSatisfied = false
          }

          return visibilityConditionSatisfied
        }
      }
    }
  },
  components: {
    'plugin-param-editor-table-row': PluginParamEditorTableRow
  }
}
</script>
