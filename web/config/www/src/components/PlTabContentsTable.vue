<template>
  <div class="scroll">
    <table class="w-full border-collapse border border-gray-300">
      <thead class="bg-gray-100 border-2 border border-gray-300">
        <tr class="text-left">
          <th class="px-2 py-2">Filename</th>
          <th></th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
      <pl-table-row
        v-for="filepath in plFilepathSearchResults.files"
        :key="filepath"
        :filepath="filepath" />
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import PlTabContentsTableRow from './PlTabContentsTableRow.vue'

export default {
  computed: mapState({
    plFilepathSearchResults: state => state.plFilepathSearchResults
  }),
  components: {
    'pl-table-row': PlTabContentsTableRow
  }
}
</script>
