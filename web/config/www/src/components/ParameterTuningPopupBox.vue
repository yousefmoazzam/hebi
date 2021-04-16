<template>
  <div v-show="isVisible"
    @click.self="closePopup"
    class="popup-bg flex fixed inset-0 z-20 items-center justify-center">
    <div class="parameter-tuning-container z-20 bg-gray-300 w-1/2 lg:w-1/3 px-2 py-2 rounded-sm overflow-y-auto">
      <span class="float-right cursor-pointer" v-on:click="closePopup">
        <i class="fas fa-times hover:text-gray-400"></i>
      </span>
      <div>
        <div class="flex items-center justify-center">
          <h1 class="text-center text-xl">
            Parameter Tuning
          </h1>
          <span class="">
            <i class="fas fa-info-circle p-1 hover:text-gray-500 cursor-pointer"
              v-tooltip="paramTuningDescriptionTooltip"></i>
          </span>
        </div>
        <p class="text-red-600 font-bold text-center">
          Warning: increases data size and processing compute time
        </p>
      </div>
      <h1 class="text-center text-xl">
        Values
      </h1>
      <div class="flex justify-center items-end mb-1">
        <p class="whitespace-pre">Value count: </p>
        <p>
          {{ paramTunedValsLength }}
        </p>
        <button class="rounded mx-1 p-1 bg-purple-300 hover:bg-purple-500 cursor-pointer"
          v-on:click="clearButtonClickListener">
          Clear
        </button>
      </div>
      <div v-if="param.typeError.hasError" class="flex">
        <span>
          <i class="fas fa-exclamation-triangle text-red-600"></i>
        </span>
        <p class="text-center">
          {{ "ERROR: " + param.typeError.errorString }}
        </p>
      </div>
      <param-tuning-draggable-values
        :pluginIndex="pluginIndex"
        :param="param" />
      <param-tuning-value-helper
        :pluginIndex="pluginIndex"
        :param="param" />
      <param-tuning-range-helper
        :pluginIndex="pluginIndex"
        :param="param" />
    </div>
  </div>
</template>

<script>
import ParamTuningDraggableValues from './ParamTuningDraggableValues.vue'
import ParamTuningValueHelper from './ParamTuningValueHelper.vue'
import ParamTuningRangeHelper from './ParamTuningRangeHelper.vue'

export default {

  components: {
    'param-tuning-draggable-values': ParamTuningDraggableValues,
    'param-tuning-value-helper': ParamTuningValueHelper,
    'param-tuning-range-helper': ParamTuningRangeHelper
  },

  props: {
    isVisible: Boolean,
    pluginIndex: String,
    param: Object
  },

  data: function () {
    return {
      paramTuningDescriptionTooltip: {
        content: 'A description of parameter tuning in Savu',
        trigger: 'hover',
        placement: 'top-center',
        boundariesElement: 'document.body',
        delay: {
          show: 100,
          hide: 0
        }
      }
    }
  },

  computed: {
    paramTunedValsLength: function () {
      var splitVals = this.param.value.split(';')
      if (splitVals.length === 1 && splitVals[0] === '') {
        return [].length
      } else {
        return splitVals.length
      }
    }
  },

  methods: {
    closePopup: function () {
      this.$emit('change-parameter-tuning-popup-visibility', false)
    },

    clearButtonClickListener: function () {
      // reset parameter value to be blank
      this.$store.dispatch('loadPlPluginElements', {
        'pluginIndex': this.pluginIndex,
        'paramName': this.param.name,
        'paramValue': ''
      })
    }
  }
}
</script>


<style>
.popup-bg {
  // same as tailwind's bg-gray-800, but with a custom opacity
  background: rgba(31, 41, 55, 0.8);
}

.parameter-tuning-container {
  height: 75%;
}
</style>
