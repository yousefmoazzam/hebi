<template>
  <div>
    <labelled-input-field-button
      label="Search Path"
      placeholder="Path"
      :inputFieldText="plFilepathSearchText"
      :buttons="inputFieldButtons"
      v-on:changed-input-field-text="inputListener($event)" />
    <pl-tab-contents-table />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import LabelledInputFieldAndButton from './LabelledInputFieldAndButton.vue'
import PlTabContentsTable from './PlTabContentsTable.vue'

export default {
  computed: mapState({
    plFilepathSearchText: state => state.plFilepathSearchText
  }),
  data: function () {
    return {
      inputFieldButtons: [
        {
          'text': 'Refresh',
          'bgColour': 'bg-blue-500',
          'bgHoverColour': 'bg-blue-700',
          'listener': () => {
            this.$store.dispatch('loadPlFilepathSearchResults', this.plFilepathSearchText)
          }
        }
      ]
    }
  },
  components: {
    'labelled-input-field-button': LabelledInputFieldAndButton,
    'pl-tab-contents-table': PlTabContentsTable
  },
  methods: {
    inputListener: function (e) {
      this.$store.dispatch('updatePlFilepathSearchText', e.target.value)
    }
  }
}
</script>
