<template>
  <table class="w-full border-collapse border border-gray-300 mb-4">
    <tbody>
      <plugin-param-editor-table-row v-for="(param, paramIndex) in plugin.parameters"
        v-if="isVisible(param)"
        :key="param.name"
        :param="param"
        :pluginIndex="pluginIndex" />
    </tbody>
  </table>
</template>

<script>
import PluginParamEditorTableRow from './PluginParamEditorTableRow.vue'

export default {
  created: function () {
    const VisibilityOrdering = {
      'HIDDEN': 0,
      'BASIC': 1,
      'INTERMEDIATE': 2,
      'ADVANCED': 3
    }
    this.visibilityOrdering = VisibilityOrdering
  },
  props: {
    pluginIndex: Number,
    plugin: Object,
    chosenParamVisibility: String
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
          // so they have a value in "hidden", "basic", "intermediate", or
          // "advanced", and can be compared using the "enum" called
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
