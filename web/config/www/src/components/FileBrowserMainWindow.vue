<template>
  <div class="grid gap-2">
    <div class="flex">
      <input type="text"
        class="flex-1 rounded border shadow p-1 m-1"
        :value="inputFieldText"
        v-on:input="inputFieldInputListener($event)"
        v-on:keyup.enter="inputFieldSubmitListener($event)"/>
      <span :class="[currentDirPath === '/' || currentDirPath === '' ? 'bg-gray-200 cursor-not-allowed' : 'bg-purple-200 hover:bg-purple-300 cursor-pointer', 'flex mt-1 mb-1 mr-1 rounded']"
        v-on:click="dirUpIconClickListener">
        <i class="fas fa-level-up-alt fa-lg p-1 flex justify-center items-center"
          aria-hidden="true"></i>
      </span>
    </div>
    <div class="content-window overflow-y-auto">
      <table class="w-full">
        <tbody>
          <tr v-for="child in dirContents"
            v-on:click="childClickListener(child)"
            :class="[child.path === selectedEntry ? 'bg-gray-200 hover:bg-gray-300': 'hover:bg-gray-200']">
            <td class="p-1">
              <span>
                <i v-if="child.type === 'dir'" class="fa fa-folder" aria-hidden="true"></i>
                <i v-else-if="child.type === 'file'" class="fas fa-file" aria-hidden="true"></i>
              </span>
            </td>
            <td class="p-1">
              {{ child.basename }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="border-t-4 border-gray-200">
      <button v-if="openingFile" type="button" :disabled="selectedEntry === ''"
        :class="[selectedEntry === '' ? 'rounded bg-gray-200 cursor-not-allowed text-gray-500 ml-1 mt-1 mb-1 p-1' : 'rounded bg-green-200 hover:bg-green-300 ml-1 mt-1 mb-1 p-1']"
        v-on:click="fileOpenButtonListener">
        Open
      </button>
      <div v-if="savingFile" class="flex">
        <button type="button" :disabled="filenameSaveInputFieldText === ''"
          :class="[filenameSaveInputFieldText === '' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-200 hover:bg-blue-300', 'rounded ml-1 mt-1 mb-1 p-1']"
          v-on:click="fileSaveButtonListener">
          Save
        </button>
        <input type="text" placeholder="filename"
          class="flex-1 rounded border shadow p-1 m-1"
          v-on:input="filenameInputOnInputListener"
          :value="filenameSaveInputFieldText">
        </input>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    inputFieldText: String,
    selectedEntry: String,
    openingFile: Boolean,
    savingFile: Boolean,
    filenameSaveInputFieldText: String
  },
  computed: {
    ...mapGetters([
      'dirContents',
      'currentDirPath'
    ])
  },
  methods: {
    childClickListener: function (child) {
      // open dirs on one click, select/deselect files on one click
      if (child.type === 'dir'){
        // deselect file if one has been selected
        this.$emit('change-selected-entry', '')
        // open the clicked dir
        this.$store.dispatch('changeCurrentDir', child.path)
        // update address bar text
        this.$emit('input-text-change', child.path)
      } else if (child.type === 'file') {
        // select/deselect the file
        if (this.selectedEntry === '') {
          this.$emit('change-selected-entry', child.path)
          // if a file is being saved, populate the filename input field with
          // the selected file's name
          if (this.savingFile) {
            this.$emit('filename-input-text-change', child.basename)
          }
        } else {
          // either select a different entry, or deselect the current entry
          if (this.selectedEntry === child.path) {
            this.$emit('change-selected-entry', '')
            this.$emit('filename-input-text-change', '')
          } else {
            this.$emit('change-selected-entry', child.path)
            this.$emit('filename-input-text-change', child.basename)
          }
        }
      }
    },

    inputFieldInputListener: function (e) {
      this.$emit('input-text-change', e.target.value)
    },

    inputFieldSubmitListener: function (e) {
      // submit path to navigate to
      this.$store.dispatch('changeCurrentDir', e.target.value)
      // deselect any selected file
      this.$emit('change-selected-entry', '')
    },

    fileOpenButtonListener: function () {
      // open the selected process list
      this.$store.dispatch('loadPl', this.selectedEntry)
      // deselect file upon opening it
      this.$emit('change-selected-entry', '')
      // close file browser modal box
      this.$emit('open-save-button-click')
      // change the text of the input field outside the file browser to display
      // the opened process list filepath
      var filepath = this.selectedEntry
      this.$emit('open-file', filepath)
    },

    filenameInputOnInputListener: function (e) {
      this.$emit('filename-input-text-change', e.target.value)
    },
    fileSaveButtonListener: function () {
      var filepath = this.currentDirPath + this.filenameSaveInputFieldText
      this.$emit('save-file', filepath)
      // close file browser modal box
      this.$emit('open-save-button-click')
    },

    dirUpIconClickListener: function () {
      if (this.currentDirPath !== '/' && this.currentDirPath !== '') {
        var dirPath = ''

        if (this.currentDirPath[this.currentDirPath.length - 1] === '/') {
          dirPath = this.currentDirPath.slice(0, -1)
        } else {
          dirPath = this.currentDirPath
        }

        var splitCurrentDirPath = dirPath.split('/')
        splitCurrentDirPath.pop()
        var parentDirPath = splitCurrentDirPath.join('/') + '/'

        // deselect file (if any)
        this.$emit('change-selected-entry', '')
        // clear filename input text if the file browser is in a file-saving
        // state
        if (this.savingFile) {
          this.$emit('filename-input-text-change', '')
        }
        // navigate to the parent dir
        this.$store.dispatch('changeCurrentDir', parentDirPath)
        // update address bar text
        this.$emit('input-text-change', parentDirPath)
      }
    }
  }
}
</script>

<style>
.content-window {
  max-height: 200px;
}
</style>
