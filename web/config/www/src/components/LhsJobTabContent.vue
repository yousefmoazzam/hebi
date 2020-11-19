<template>
  <div class="flex flex-wrap" >
    <labelled-input
      label="Data"
      placeholder="data.nxs"
      :inputFieldText="jobTabDataText"
      v-on:changed-input-field-text="dataInputListener($event)" />
    <labelled-input
      label="Process List"
      placeholder="process_list.nxs"
      :inputFieldText="jobTabPlText"
      v-on:changed-input-field-text="plInputListener($event)" />
    <labelled-input
      label="Ouput"
      placeholder="/path/to/output"
      :inputFieldText="jobTabOutputText"
      v-on:changed-input-field-text="outputInputListener($event)" />
    <div class="w-full flex mb-2">
      <button class="w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mr-1"
        v-on:click="previewJobButtonListener">
        Preview
      </button>
      <button class="w-1/2 bg-orange-400 hover:bg-orange-600 text-black font-bold py-2 px-4"
        v-on:click="fullJobButtonListener">
        Full
      </button>
    </div>
    <job-status-display :statusText="jobStatusText" />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import LabelledInput from './LabelledInput.vue'
import JobTabStatusDisplay from './JobTabStatusDisplay.vue'

export default {
  computed: mapState({
    jobTabDataText: state => state.jobTabDataText,
    jobTabPlText: state => state.jobTabPlText,
    jobTabOutputText: state => state.jobTabOutputText,
    jobStatusText: state => state.jobStatusText
  }),
  components: {
    'labelled-input': LabelledInput,
    'job-status-display': JobTabStatusDisplay
  },
  methods: {
    dataInputListener: function (e) {
    },
    plInputListener: function (e) {
    },
    outputInputListener: function (e) {
    },
    previewJobButtonListener: function (e) {
    },
    fullJobButtonListener: function (e) {
    }
  }
}
</script>
