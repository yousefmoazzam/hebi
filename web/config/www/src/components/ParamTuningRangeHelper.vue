<template>
  <div class="p-2">
    <p class="text-lg">
      Set a range of values
    </p>
    <div class="flex items-end">
      <p class="whitespace-pre">Number of values in this range: </p>
      <p>
        {{ range.length }}
      </p>
      <button :class="setRangeButtonStyling"
        :disabled="doTypeErrorsExist"
        v-on:click="setRangeValue">
        Set range
      </button>
    </div>
    <div class="grid grid-cols-3 gap-2">
      <param-tuning-range-input-field v-for="(data, idx) in inputFields"
        :key="data.label + 'RangeInputField'"
        :value="data.value"
        :isCorrectType="data.isCorrectType"
        :label="data.label"
        :labelColour="data.labelColour"
        v-on:change-range-input-value="changeRangeInputValue(idx, $event)" />
      <p v-for="(data, idx) in inputFields"
        class="text-center text-sm text-red-500">
        {{ data['isCorrectType'] ? '' : data['errorMessage'] }}
      </p>
    </div>
  </div>
</template>

<script>
import ParamTuningRangeInputField from './ParamTuningRangeInputField.vue'

export default {
  components: {
    'param-tuning-range-input-field': ParamTuningRangeInputField
  },

  props: {
    pluginIndex: String,
    param: Object
  },

  data: function () {
    return {
      inputFields: [
        {
          'label': 'Start',
          'value': '',
          'labelColour': 'bg-yellow-300',
          'isCorrectType': true,
          'errorMessage': "ERROR: 'start' must be a number"
        },
        {
          'label': 'Stop',
          'value': '',
          'labelColour': 'bg-orange-300',
          'isCorrectType': true,
          'errorMessage': "ERROR: 'stop' must be a number"
        },
        {
          'label': 'Step',
          'value': '',
          'labelColour': 'bg-red-300',
          'isCorrectType': true,
          'errorMessage': "ERROR: 'step' must be a number"
        },
      ]
    }
  },

  computed: {
    start: function () {
      if (this.inputFields[0]['value'] === '') {
        return 0
      } else {
        return parseFloat(this.inputFields[0]['value'])
      }
    },

    stop: function () {
      if (this.inputFields[1]['value'] === '') {
        return 0
      } else {
        return parseFloat(this.inputFields[1]['value'])
      }
    },

    step: function () {
      if (this.inputFields[2]['value'] === '') {
        return 1
      } else {
        var castValue = parseFloat(this.inputFields[2]['value'])
        if (castValue === 0) {
          return 1
        } else {
          return parseFloat(this.inputFields[2]['value'])
        }
      }

    },

    range: function () {
      var startNoOfDecimalPlaces = this.getNumberOfDecimalPlaces(this.start)
      var stopNoOfDecimalPlaces = this.getNumberOfDecimalPlaces(this.stop)
      var stepNoOfDecimalPlaces = this.getNumberOfDecimalPlaces(this.step)
      var startNoOfMagnitudes = this.getNumberOfMagnitudes(this.start)
      var stopNoOfMagnitudes = this.getNumberOfMagnitudes(this.stop)
      var stepNoOfMagnitudes = this.getNumberOfMagnitudes(this.step)
      var maxOfDecimalPlaces = Math.max(startNoOfDecimalPlaces,
        stopNoOfDecimalPlaces, stepNoOfDecimalPlaces)
      var maxOfMagnitudes = Math.max(startNoOfMagnitudes, stopNoOfMagnitudes,
        stepNoOfMagnitudes)
      var precision = maxOfDecimalPlaces + maxOfMagnitudes

      if (precision === 0) {
        precision = 1
      }
      return Array.from({ length: (this.stop - this.start) / this.step + 1},
        (_, i) => parseFloat((this.start + (i * this.step)).toPrecision(precision)))
    },

    doTypeErrorsExist: function () {
      var errorArray = this.inputFields.map(input => input['isCorrectType'])
      return !errorArray.every(Boolean)
    },

    setRangeButtonStyling: function () {
      var baseStyle = 'rounded mx-1 p-1'
      if (this.doTypeErrorsExist) {
        return baseStyle + ' bg-gray-200 text-gray-500 cursor-not-allowed'
      } else {
        return baseStyle + ' bg-green-300 hover:bg-green-500 cursor-pointer'
      }
    }
  },

  methods: {
    changeRangeInputValue(inputIdx, value) {
      this.inputFields[inputIdx]['value'] = value
      this.inputFields[inputIdx]['isCorrectType'] =
        this.rangeInputNumberTypeCheck(value)
    },

    rangeInputNumberTypeCheck: function (val) {
      return !isNaN(val)
    },

    setRangeValue: function () {
      var paramValueString = this.range.join(';')
      this.$store.dispatch('loadPlPluginElements', {
        'pluginIndex': this.pluginIndex,
        'paramName': this.param.name,
        'paramValue': paramValueString
      })
    },

    getNumberOfDecimalPlaces: function (num) {
      var stringVal = num.toString()
      var decimalPlaceIndex = stringVal.indexOf('.')
      if (decimalPlaceIndex === -1) {
        var noOfDecimalPlaces = 0
      } else {
        var noOfMagnitudes = this.getNumberOfMagnitudes(num)
        if (noOfMagnitudes === 0) {
          var noOfDecimalPlaces = stringVal.length - decimalPlaceIndex - 1
        } else {
          var noOfDecimalPlaces = stringVal.length -
            this.getNumberOfMagnitudes(num) - 1
        }
      }
      return noOfDecimalPlaces
    },

    getNumberOfMagnitudes: function (num) {
      var stringVal = num.toString()
      var decimalPlaceIndex = stringVal.indexOf('.')
      if (decimalPlaceIndex === -1) {
        var noOfMagnitudes = stringVal.length
      } else {
        var noOfMagnitudes = decimalPlaceIndex - 1
      }

      if (stringVal[0] === '-') {
        noOfMagnitudes -= 1
      }

      return noOfMagnitudes
    }
  }
}
</script>
