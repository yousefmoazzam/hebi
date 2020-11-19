<template>
  <tr>
    <td class="px-2 py-2">
      {{ filepath }}
    </td>
    <td class="px-2 py-2">
      <i class="fas fa-folder-open" v-on:click="folderIconListener" />
    </td>
    <td class="px-2 py-2">
      <i class="fas fa-download" v-on:click="downloadIconListener" />
    </td>
    <td class="px-2 py-2">
      <i class="fas fa-trash" v-on:click="trashIconListener" />
    </td>
  </tr>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: mapState({
    plFilepathSearchText: state => state.plFilepathSearchText
  }),
  methods: {
    folderIconListener: function () {
      this.$store.dispatch('loadPl', this.filepath)
    },

    downloadIconListener: function () {
      var url = getProcessListDownloadUrl(this.filepath)
      window.open(url, "_blank")
    },

    trashIconListener: function () {
      var comp = this
      deleteProcessList(
        this.filepath,
        function () {
          console.log('Deleting process list: ' + comp.filepath)
          comp.$store.dispatch('loadPlFilepathSearchResults', comp.plFilepathSearchText)
        },
        function () {
          console.log("Failed to delete process list")
        }
      )
    }
  },
  props: {
    filepath: String
  }
}
</script>
