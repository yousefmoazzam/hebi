<template>
  <div :class="draggablesContainerStyling">
    <div v-if="paramTunedVals.length > 0" class="inline-block">
      <draggable v-model="paramTunedVals" @start="dragging = true"
        @end="dragging = false">
        <transition-group name="flip-list">
          <div v-for="(val, idx) in paramTunedVals"
            class="float-left bg-gray-400 p-1 m-1 rounded cursor-move"
            :key="val">
            <span v-on:click="paramTunedValDeleteIconListener(idx)">
              <i class="fas fa-times text-xs hover:text-gray-500 cursor-pointer"></i>
            </span>
            {{ val }}
          </div>
        </transition-group>
      </draggable>
    </div>
    <p v-else class="text-center italic">
      The parameter value is currently empty
    </p>
  </div>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  components: {
    'draggable': draggable
  },

  props: {
    pluginIndex: String,
    param: Object
  },

  computed: {
    paramTunedVals: {
      get () {
        var splitVals = this.param.value.split(';')
        if (splitVals.length === 1 && splitVals[0] === '') {
          return []
        } else {
          return splitVals
        }
      },
      set (arr) {
        var newParamValString = arr.join(';')
        this.$store.dispatch('loadPlPluginElements', {
          'pluginIndex': this.pluginIndex,
          'paramName': this.param.name,
          'paramValue': newParamValString
        })

      }
    },

    draggablesContainerStyling: function () {
      var style = 'p-2 overflow-y-auto draggables-container'

      if (this.param.typeError.hasError) {
        style += ' border-2 border-red-500'
      }

      return style
    }
  },

  methods: {
    paramTunedValDeleteIconListener: function (idx) {
      var splitString = this.param.value.split(';')
      splitString.splice(idx, 1)
      var newParamString = splitString.join(';')

      this.$store.dispatch('loadPlPluginElements', {
        'pluginIndex': this.pluginIndex,
        'paramName': this.param.name,
        'paramValue': newParamString
      })
    }
  }
}
</script>

<style>
.flip-list-move {
  transition: transform 0.1s;
}

.draggables-container {
  max-height: 50%
}
</style>
