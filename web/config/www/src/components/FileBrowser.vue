<template>
  <div>
    <div class="flex">
      <button type="button"
        class="rounded bg-green-200 hover:bg-green-300 mt-1 mb-1 p-1"
        v-on:click="openButtonClickListener">
        Open
      </button>
      <input type="text" placeholder="'filepath'"
        class="flex-1 rounded border shadow p-1 m-1"
        v-on:input="buttonInputFieldInputListener($event)"
        :value="buttonInputFieldText">
      </input>
      <button type="button"
        class="rounded bg-blue-200 hover:bg-blue-300 mt-1 mb-1 p-1"
        v-on:click="saveButtonClickListener">
        Save
      </button>
    </div>
    <div v-show="openingFile || savingFile"
      @click.self="closeModal"
      class="modal-bg flex fixed inset-0 z-20 items-center justify-center">
      <div class="flex bg-white w-5/6">
        <div class="w-1/4 border-collapse border border-gray-300">
          <file-browser-root-dirs
            v-on:update-address-text="addressBarInputChange"
            v-on:change-selected-entry="changeSelectedEntry"/>
        </div>
        <div class="w-3/4 border-collapse border border-gray-300">
          <file-browser-main-window
            :openingFile="openingFile"
            :savingFile="savingFile"
            :inputFieldText="inputFieldText"
            :filenameSaveInputFieldText="filenameSaveInputFieldText"
            :selectedEntry="selectedEntry"
            v-on:input-text-change="addressBarInputChange"
            v-on:change-selected-entry="changeSelectedEntry"
            v-on:filename-input-text-change="changeFilenameSaveInputFieldText"
            v-on:save-file="saveFile"
            v-on:open-file="openFile"
            v-on:open-save-button-click="closeModal" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import FileBrowserRootDirs from './FileBrowserRootDirs.vue'
import FileBrowserMainWindow from './FileBrowserMainWindow.vue'

import { checkPlExists } from '../api_savu.js'

export default {
  mounted: function () {
    this.$store.dispatch('loadFileBrowserDirContents', '/')
  },
  components: {
    'file-browser-root-dirs': FileBrowserRootDirs,
    'file-browser-main-window': FileBrowserMainWindow
  },
  data: function () {
    return {
      inputFieldText: '/',
      selectedEntry: '',
      openingFile: false,
      savingFile: false,
      filenameSaveInputFieldText: '',
      buttonInputFieldText: ''
    }
  },
  computed: {
    ...mapGetters([
      'currentDirPath'
    ])
  },
  methods: {
    addressBarInputChange: function (path) {
      this.inputFieldText = path
    },

    changeSelectedEntry: function (path) {
      this.selectedEntry = path
    },

    changeFilenameSaveInputFieldText: function (filename) {
      this.filenameSaveInputFieldText = filename
    },

    saveFile: function (filepath) {
      // check if file exists or not
      var comp = this
      checkPlExists(
        filepath,
        (response) => {
          if (response.doesFileExist) {
            var overwriteFile = confirm('Are you sure you want to overwrite the file ' + filepath + '?')
            if (overwriteFile) {
              console.log('Overwriting file ' + filepath)
              comp.$store.dispatch('savePl', filepath)
            } else {
              console.log('Not overwriting file ' + filepath)
            }
          } else {
            comp.$store.dispatch('saveNewPl', filepath)
          }
        },
        () => {
          console.log('Unable to check if filepath ' + filepath + ' exists')
        }
      )
    },

    openButtonClickListener: function () {
      if (this.buttonInputFieldText === '') {
        // open file browser
        this.openingFile = !this.openingFile
      } else {
        // assuming the given filepath is a process list file, attempt to open
        // it in the process list editor
        this.$store.dispatch('loadPl', this.buttonInputFieldText)
      }
    },

    saveButtonClickListener: function () {
      if (this.buttonInputFieldText === '') {
        // open file browser
        this.savingFile = !this.savingFile
      } else {
        // assuming the given filepath is a process list file, attempt to save
        // it
        this.saveFile(this.buttonInputFieldText)
      }
    },

    closeModal: function () {
      // deselect selected file (if any)
      this.selectedEntry = ''
      this.openingFile = false
      this.savingFile = false
      // reset the input in the file browser for entering filenames
      this.filenameSaveInputFieldText = ''
    },

    buttonInputFieldInputListener: function (e) {
      this.buttonInputFieldText = e.target.value
    },

    openFile: function (filepath) {
      this.buttonInputFieldText = filepath
    }
  }
}
</script>

<style>
.modal-bg {
  // same as tailwind's bg-gray-800, but with a custom opacity
  background: rgba(31, 41, 55, 0.8);
}
</style>
