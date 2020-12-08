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
        v-on:input="filepathInputFieldListener($event)"
        :value="filepathInputFieldText">
      </input>
      <button type="button"
        class="rounded bg-blue-200 hover:bg-blue-300 mt-1 mb-1 p-1"
        v-on:click="saveButtonClickListener">
        Save
      </button>
      <button type="button"
        class="rounded bg-blue-500 hover:bg-blue-700 ml-1 mt-1 mb-1 p-1"
        v-on:click="saveAsButtonClickListener">
        Save As
      </button>
    </div>
    <notification-modal-box
      :isVisible="showSavingFileNotification"
      notificationText="Saving file..."
      v-on:change-notification-state="changeSavingFileNotificationVisibility"/>
    <prompt-modal-box v-for="(modal, index) in promptModalBoxes"
      :promptText="modal.promptText" :key="index"
      v-on:prompt-yes-response="modal.yesResponseListener"
      v-on:prompt-no-response="modal.noResponseListener" />
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
import NotificationModalBox from './NotificationModalBox.vue'
import PromptModalBox from './PromptModalBox.vue'

import { checkPlExists } from '../api_savu.js'

export default {
  created: function () {
    // add listener for Ctrl+s key combination
    document.addEventListener('keydown', this.saveProcessListKeyComboListener)
  },
  destroyed: function () {
    // remove listener for Ctrl+s key combination
    document.removeEventListener('keydown', this.saveProcessListKeyComboListener)
  },
  mounted: function () {
    this.$store.dispatch('loadFileBrowserDirContents', '/')
  },
  components: {
    'file-browser-root-dirs': FileBrowserRootDirs,
    'file-browser-main-window': FileBrowserMainWindow,
    'notification-modal-box': NotificationModalBox,
    'prompt-modal-box': PromptModalBox
  },
  data: function () {
    return {
      inputFieldText: '/',
      selectedEntry: '',
      openingFile: false,
      savingFile: false,
      filenameSaveInputFieldText: '',
      showSavingFileNotification: false,
      promptModalBoxes: []
    }
  },
  computed: {
    ...mapGetters([
      'currentDirPath',
      'isCurrentProcessListModified',
      'filepathInputFieldText'
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
            // define the prompt modal box for asking if the file should be
            // overwritten
            var promptText = 'Are you sure you want to overwrite the file: ' + filepath + '?'
            this.promptModalBoxes.push({
              promptText: promptText,
              yesResponseListener: () => {
                this.saveFileYesResponse(filepath)
              },
              noResponseListener: () => {
                this.saveFileNoResponse(filepath)
              }
            })
          } else {
            comp.$store.dispatch('saveNewPl', filepath)
            // show "Saving file..." notification
            this.changeSavingFileNotificationVisibility(true)
          }
        },
        () => {
          console.log('Unable to check if filepath ' + filepath + ' exists')
        }
      )
    },

    saveFileYesResponse: function (filepath) {
      console.log('Overwriting file ' + filepath)
      this.$store.dispatch('savePl', filepath)
      // show "Saving file..." notification
      this.changeSavingFileNotificationVisibility(true)
      // remove prompt
      this.promptModalBoxes.pop()
    },

    saveFileNoResponse: function (filepath) {
      console.log('Not overwriting file ' + filepath)
      // remove prompt
      this.promptModalBoxes.pop()
    },

    openButtonClickListener: function () {
      if (this.isCurrentProcessListModified) {
        // ask the user if they want to navigate away from the current process
        // list editor state
        var promptText = 'The current process list has unsaved changes which ' +
        'will be lost if another file is opened, are you sure you want to ' +
        'open another file?'

        this.promptModalBoxes.push({
          promptText: promptText,
          yesResponseListener: () => {
            this.promptModalBoxes.pop()
            this.openButtonClickDiscardAnyChanges()
          },
          noResponseListener: () => {
            this.promptModalBoxes.pop()
          }
        })
      } else {
        // no unsaved changes are present, so continue file-opening
        // functionality as normal
        this.openButtonClickDiscardAnyChanges()
      }
    },

    openButtonClickDiscardAnyChanges: function () {
      if (this.filepathInputFieldText === '') {
        // open file browser
        this.openingFile = !this.openingFile
      } else {
        // assuming the given filepath is a process list file, attempt to open
        // it in the process list editor
        this.$store.dispatch('loadPl', this.filepathInputFieldText)
      }
    },

    saveButtonClickListener: function () {
      if (this.filepathInputFieldText === '') {
        // open file browser
        this.savingFile = !this.savingFile
      } else {
        // assuming the given filepath is a process list file, attempt to save
        // it
        this.saveFile(this.filepathInputFieldText)
      }
    },

    saveAsButtonClickListener: function () {
      // always open the file browser
      this.savingFile = true
      if (this.filepathInputFieldText !== '') {
        // get filename from filepath and populate the filename input field in
        // the file browser with it
        var splitFilepath = this.filepathInputFieldText.split('/')
        var filename = splitFilepath.pop()
        this.filenameSaveInputFieldText = filename
        // navigate to the dir that the filepath in the input field refers to
        var dirpath = splitFilepath.join('/') + '/'
        this.$store.dispatch('changeCurrentDir', dirpath)
        // update the address bar accordingly
        this.inputFieldText = dirpath
        // select the given file
        this.selectedEntry = this.filepathInputFieldText
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

    filepathInputFieldListener: function (e) {
      this.$store.dispatch('changeFilepathInputFieldText', e.target.value)
    },

    changeSavingFileNotificationVisibility: function (isVisible) {
      this.showSavingFileNotification = isVisible
    },

    saveProcessListKeyComboListener: function (e) {
      if (e.key === 's' && e.ctrlKey) {
        e.preventDefault()
        this.saveButtonClickListener()
      }
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
