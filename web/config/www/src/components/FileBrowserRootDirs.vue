<template>
  <div class="flex flex-col">
    <table class="w-full select-none border-b-2 table-fixed">
      <tbody>
        <tr v-for="dir in rootDirs"
          v-on:click="dirClickListener(dir.path)"
          class="hover:bg-gray-200">
          <td class="p-1 w-1/6">
            <span>
              <i class="fa fa-folder" aria-hidden="true"></i>
            </span>
          </td>
          <td class="p-1 w-5/6">
            {{ dir.name }}
          </td>
        </tr>
      </tbody>
    </table>
    <div class="overflow-y-auto">
      <table class="w-full select-none table-fixed">
        <tbody>
          <tr v-for="path in favouritedDirs"
            v-on:click="dirClickListener(path)"
            v-on:mouseenter="favouritedDirMouseEnterListener(path)"
            v-on:mouseleave="hoveredFavouritedDir = ''"
            class="hover:bg-gray-200">
            <td class="p-1 w-1/6">
              <span>
                <i class="fa fa-folder" aria-hidden="true"></i>
              </span>
            </td>
            <td class="p-1 w-4/6">
              <div class="truncate">
                {{ path.split('/').slice(-2)[0] }}
              </div>
            </td>
            <td class="p-1 w-1/6">
              <span v-show="path === hoveredFavouritedDir"
                class="fas fa-times cursor-pointer hover:text-gray-400"
                v-on:click.stop="removeDirFromFavourites(path)">
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data: function () {
    return {
      hoveredFavouritedDir: ''
    }
  },
  computed: {
    ...mapGetters([
      'rootDirs',
      'favouritedDirs'
    ])
  },
  created: function () {
    this.$store.dispatch('loadRootDirs')
  },
  methods: {
    dirClickListener: function (dirPath) {
      // change the current directory
      this.$store.dispatch('changeCurrentDir', dirPath)
      // update the address bar text
      this.$emit('update-address-text', dirPath)
      // deslect selected file (if any) in the main window
      this.$emit('change-selected-entry', '')
      // clear tab completions in main window
      this.$emit('clear-tab-completion-suggestions')
    },

    removeDirFromFavourites: function (dirPath) {
      this.$store.dispatch('removeFavouriteDir', dirPath)
    },

    favouritedDirMouseEnterListener: function (dirPath) {
      this.hoveredFavouritedDir = dirPath
    }
  }
}
</script>
