<template>
  <tr>
    <td class="px-2 py-2">
      <div>
        <a class="float-left">
          {{ param.name }}
        </a>
        <span>
          <i class="fas fa-question fa-xs float-left" v-tooltip="tooltipOptions">
          </i>
        </span>
      </div>
    </td>
    <plugin-param-dropdown-menu v-if="'options' in param"
      :param="param"
      :key="pluginIndex + '.' + param.name"
      :pluginIndex="pluginIndex" />
    <plugin-param-input-field v-else
      :param="param"
      :key="pluginIndex + '.' + param.name"
      :pluginIndex="pluginIndex" />
  </tr>
</template>

<script>
import PluginParamInputField from './PluginParamInputField.vue'
import PluginParamDropdownMenu from './PluginParamDropdownMenu.vue'

export default {
  components: {
    'plugin-param-input-field': PluginParamInputField,
    'plugin-param-dropdown-menu': PluginParamDropdownMenu
  },
  data: function () {
    return {
      tooltipOptions: {
        content: this.tooltipContent(),
        placement: 'top-center',
        offset: 10,
        trigger: 'hover',
        delay: {
          show: 100,
          hide: 0
        }
      }
    }
  },
  props: {
    pluginIndex: String,
    param: Object
  },
  methods: {
    tooltipContent: function () {
      if ('verbose' in this.param.description) {
        return this.param.description['summary'] +
        '<br><br>' + this.param.description['verbose']
      } else {
        return this.param.description['summary']
      }
    }
  }
}
</script>
