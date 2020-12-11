<template>
  <div>
    <table class="w-full select-none">
      <tbody>
        <tr v-for="dir in rootDirs"
          v-on:click="dirClickListener(dir)"
          class="hover:bg-gray-200">
          <td class="p-1">
            <span>
              <i class="fa fa-folder" aria-hidden="true"></i>
            </span>
          </td>
          <td class="p-1">
            {{ dir.name }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'rootDirs'
    ])
  },
  created: function () {
    this.$store.dispatch('loadRootDirs')
  },
  methods: {
    dirClickListener: function (dir) {
      // change the current directory
      this.$store.dispatch('changeCurrentDir', dir.path)
      // update the address bar text
      this.$emit('update-address-text', dir.path)
      // deslect selected file (if any) in the main window
      this.$emit('change-selected-entry', '')
      // clear tab completions in main window
      this.$emit('clear-tab-completion-suggestions')
    }
  }
}
</script>
