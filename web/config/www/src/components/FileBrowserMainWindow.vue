<template>
  <div class="flex flex-col h-full">
    <div class="flex-rows">
      <div v-show="showTabCompletionMatches" class="relative"
        :style="addressBarTopStyle + ';' + addressBarLeftStyle">
        <div class="tab-completion-matches absolute overflow-y-auto"
          ref="suggestionContainer">
          <table class="ml-1 border border-blue-200" ref="suggestionTable">
            <tbody>
              <tr v-for="match in tabCompletionMatches"
                :class="[match === tabCompletionMatches[tabCompletionMatchHighlightedIndex] ? 'bg-blue-200' : 'bg-gray-200', 'cursor-pointer']"
                v-on:click="tabCompletionSuggestionClickListener(match)"
                v-on:mouseenter="tabCompletionSuggestionMouseOverListener(match)">
                <td class="p-1">
                  {{ match }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="flex">
        <input type="text" ref="addressBar"
          class="flex-1 rounded border shadow p-1 m-1"
          :value="inputFieldText"
          v-on:input="inputFieldInputListener($event)"
          v-on:keyup.enter="inputFieldSubmitListener($event)"
          v-on:keydown.tab="filepathInputFieldTabKeyListener($event)"
          v-on:keydown.up="addressBarUpKeyListener($event)"
          v-on:keydown.down="addressBarDownKeyListener($event)"
          v-on:keydown.esc="addressBarEscKeyListener($event)" />
        <span :class="[currentDirPath === '/' || currentDirPath === '' ? 'bg-gray-200 cursor-not-allowed' : 'bg-purple-200 hover:bg-purple-300 cursor-pointer', 'flex mt-1 mb-1 mr-1 rounded']"
          v-on:click="dirUpIconClickListener">
          <i class="fas fa-level-up-alt fa-lg p-1 flex justify-center items-center"
            aria-hidden="true"></i>
        </span>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto">
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
        :class="[selectedEntry === '' ? 'bg-gray-200 cursor-not-allowed text-gray-500' : 'bg-green-200 hover:bg-green-300', 'float-right rounded mr-1 mt-1 mb-1 p-1']"
        v-on:click="fileOpenButtonListener">
        Open
      </button>
      <div v-if="savingFile" class="flex">
        <input type="text" placeholder="filename"
          class="flex-1 rounded border shadow p-1 m-1"
          v-on:input="filenameInputOnInputListener"
          :value="filenameSaveInputFieldText">
        </input>
        <button type="button" :disabled="filenameSaveInputFieldText === ''"
          :class="[filenameSaveInputFieldText === '' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-200 hover:bg-blue-300', 'rounded mr-1 mt-1 mb-1 p-1']"
          v-on:click="fileSaveButtonListener">
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  mounted: function () {
    // if the dummy input is in this FileBrowserMainWindow component, the width
    // of it is not updated unless the file browser modal is also displayed, so
    // to get the correct initial width when the app is first loaded the dummy
    // input is instead in the FileBrowser component as it is always shown when
    // the app first loads
    //
    // furthermore, when the FileBrowser component is mounted, the dummy input
    // isn't guaranteed to have been drawn in the DOM yet even if
    // inputFieldText has been given a default value in FileBrowser
    //
    // trigger change of address bar text to the desired default value via
    // FileBrowserMainWindow.mounted() instead of setting it in
    // FileBrowser.data() so then the initial width of the dummy input is
    // guaranteed to be up to date in the DOM before setting the cursor
    // horizontal position for tab completion (via the watcher of
    // inputFieldText in FileBrowser)
    this.$emit('input-text-change', '/')
  },
  data: function () {
    return {
      tabCompletionFilteringString: ''
    }
  },
  props: {
    inputFieldText: String,
    selectedEntry: String,
    openingFile: Boolean,
    savingFile: Boolean,
    filenameSaveInputFieldText: String,
    addressBarCursorHorizontalPosition: Number,
    showTabCompletionMatches: Boolean,
    tabCompletionMatchHighlightedIndex: Number,
    tabKeyPressDir: String,
    addressBarHeight: Number
  },
  computed: {
    ...mapGetters([
      'dirContents',
      'currentDirPath',
      'tabCompletionDirContents'
    ]),
    tabCompletionMatches: function () {
      return this.tabCompletionDirContents.filter(child => {
        return child.startsWith(this.tabCompletionFilteringString)
      })
    },
    addressBarTopStyle: function () {
      return 'top: ' + this.addressBarHeight + 'px'
    },
    addressBarLeftStyle: function () {
      return 'left: ' + (this.addressBarCursorHorizontalPosition) + 'px'
    }
  },
  watch: {
    showTabCompletionMatches: function (newVal, oldVal) {
      if (!newVal) {
        // if the tab completion list changes to be hidden, then scroll back to
        // the top of the list for the next time the tab completion list is
        // opened
        this.$refs.suggestionContainer.scrollTop = 0
      }
    }
  },
  methods: {
    childClickListener: function (child) {
      if (this.showTabCompletionMatches) {
        this.$emit('clear-tab-completion-suggestions')
      }

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
      if (this.showTabCompletionMatches) {
        var splitAddressBarText = e.target.value.split('/')
        var partialAddressBarString = splitAddressBarText.pop()
        var parentDir = splitAddressBarText.join('/') + '/'

        if (parentDir !== this.tabKeyPressDir) {
          // if a '/' character is typed or deleted, then the current tab
          // completion list is no longer valid because a different dir is now
          // being navigated into, so clear the current tab completions
          this.$emit('clear-tab-completion-suggestions')
        } else {
          // still in the same dir as when the tab completion was triggered, so
          // continue as normal with filtering the tab completion suggestions
          this.tabCompletionFilteringString = partialAddressBarString
          if (this.tabCompletionMatches.length === 0) {
            this.$emit('change-tab-completion-highlighted-index', 0)
          } else if (this.tabCompletionMatchHighlightedIndex >=
            this.tabCompletionMatches.length) {
            this.$emit('change-tab-completion-highlighted-index', this.tabCompletionMatches.length - 1)
          }
        }
      }
      this.$emit('input-text-change', e.target.value)
    },

    inputFieldSubmitListener: function (e) {
      // check if tab completion suggestions are available or not, the enter
      // key can be used for either selecting a tab completion suggestion or
      // navigating to an inputted path
      if (this.showTabCompletionMatches) {
        this.selectTabCompletionSuggestion()
      } else {
        // submit path to navigate to
        this.$store.dispatch('changeCurrentDir', e.target.value)
        // deselect any selected file
        this.$emit('change-selected-entry', '')
      }
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
      this.$store.dispatch('changeFilepathInputFieldText', filepath)
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
    },

    async filepathInputFieldTabKeyListener(e) {
      e.preventDefault()
      var partialAddressBarString = ''
      var splitAddressBarText = this.inputFieldText.split('/')
      var partialAddressBarString = splitAddressBarText.pop()
      this.tabCompletionFilteringString = partialAddressBarString
      this.$emit('change-tab-key-press-dir', splitAddressBarText.join('/') + '/')

      // wait until the dir contents of the parent dir that is in the address
      // bar has been fetched and saved to the store
      await this.$store.dispatch('loadTabCompletionDirContents', splitAddressBarText.join('/'))

      var stringToAdd = ''
      if (this.tabCompletionMatches.length === 0) {
        // no matches have been found, so leave the address bar text as it is
        return
      } else if (this.tabCompletionMatches.length === 1) {
        // use the only match
        stringToAdd = this.tabCompletionMatches[0] + '/'
        // reset the tab completion suggestions to an empty array so then the
        // single match isn't shown as a tab-completion-suggestion
        this.$emit('clear-tab-completion-suggestions')
      } else {
        // tab complete up to the shared starting substring of all the matches
        this.$emit('change-show-tab-completions', true)
        this.$emit('update-address-bar-height', this.$refs.addressBar.clientHeight)
        // scroll to the top of the tab completion suggestions list
        this.$refs.suggestionContainer.scrollTop = 0
        stringToAdd = this.sharedStartingSubtring(this.tabCompletionMatches)
        this.$emit('change-tab-completion-highlighted-index', 0)
      }

      var tabCompletedPath = splitAddressBarText.join('/') + '/' + stringToAdd

      // update address bar text with the best completion string
      this.$emit('input-text-change', tabCompletedPath)
    },

    // copied from: https://stackoverflow.com/a/1917041
    sharedStartingSubtring: function (matchedStrings){
      var A = matchedStrings.concat().sort()
      var a1 = A[0]
      var a2 = A[A.length-1]
      var L = a1.length
      var i = 0
      while(i<L && a1.charAt(i)=== a2.charAt(i)) i++;
      return a1.substring(0, i)
    },

    tabCompletionSuggestionMouseOverListener: function (suggestion) {
      var suggestionIndex = this.tabCompletionMatches.indexOf(suggestion)
      this.$emit('change-tab-completion-highlighted-index', suggestionIndex)
    },

    tabCompletionSuggestionClickListener: function (suggestion) {
      // perhaps unnecessary since the mouseover event might always trigger
      // before a click can, so this.tabCompletionSuggestionMouseOverListener()
      // might always run before this?
      var suggestionIndex = this.tabCompletionMatches.indexOf(suggestion)
      this.$emit('change-tab-completion-highlighted-index', suggestionIndex)
      this.selectTabCompletionSuggestion()
    },

    addressBarUpKeyListener: function (e) {
      e.preventDefault()
      if (this.showTabCompletionMatches &&
      this.tabCompletionMatchHighlightedIndex - 1 >= 0) {
        this.$emit('change-tab-completion-highlighted-index',
          this.tabCompletionMatchHighlightedIndex - 1)
        // scroll the tab suggestions container if necessary
        var rowHeight = this.$refs.suggestionTable.rows[0].offsetHeight
        this.$refs.suggestionContainer.scrollTop = rowHeight *
          this.tabCompletionMatchHighlightedIndex
      }
    },

    addressBarDownKeyListener: function (e) {
      e.preventDefault()
      if (this.showTabCompletionMatches &&
        this.tabCompletionMatchHighlightedIndex + 1 < this.tabCompletionMatches.length) {
        this.$emit('change-tab-completion-highlighted-index',
          this.tabCompletionMatchHighlightedIndex + 1)
        // scroll the tab suggestions container if necessary
        var rowHeight = this.$refs.suggestionTable.rows[0].offsetHeight
        this.$refs.suggestionContainer.scrollTop = rowHeight *
          this.tabCompletionMatchHighlightedIndex
      }
    },

    addressBarEscKeyListener: function (e) {
      e.preventDefault()
      this.$emit('clear-tab-completion-suggestions')
    },

    selectTabCompletionSuggestion: function () {
      var splitAddressBarText = this.inputFieldText.split('/')
      splitAddressBarText.pop()
      var tabCompletedPath = splitAddressBarText.join('/') + '/' +
        this.tabCompletionMatches[this.tabCompletionMatchHighlightedIndex] + '/'
      this.$emit('input-text-change', tabCompletedPath)

      // focus the address bar input again
      this.$refs.addressBar.focus()

      this.$emit('clear-tab-completion-suggestions')
    }
  }
}
</script>

<style>
.tab-completion-matches {
  max-height: 100px;
}
</style>
