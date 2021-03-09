<template>
  <div v-show="isVisible"
    @click.self="closePopup"
    class="popup-bg flex fixed inset-0 z-20 items-center justify-center">
    <div class="citations-container z-20 bg-gray-300 w-1/2 lg:w-1/3 px-2 py-4 rounded-sm overflow-y-auto">
      <div class="">
        <div class="">
          <h1 class="text-center text-xl">
            Cite
          </h1>
        </div>
        <div class="text-center">
          <a class="text-blue-500 hover:underline cursor-pointer"
            v-on:click="citationHyperlinkClickListener('bibtex')">
            BibTeX
          </a>
          <a class="text-blue-500 hover:underline cursor-pointer"
            v-on:click="citationHyperlinkClickListener('endnote')">
            Endnote
          </a>
        </div>
        <div v-for="(citation, index) in citations"
          :class="[index < citations.length - 1 ? 'border-b-4 border-gray-700' : '',  'p-2']">
          <h2 class="text-lg">Paper</h2>
          <p class="">
            {{ citation.citation }}
          </p>
          <br>
          <h2 class="text-lg">Description</h2>
          <p class="">
            {{ citation.description }}
          </p>
          <br>
          <h2 class="text-lg">DOI</h2>
          <p class="">
            {{ citation.doi }}
          </p>
          <br>
          <div class="flex">
            <h2 class="text-lg">BibTeX</h2>
            <span class="pr-2">
              <i class="fas fa-paste m-1 hover:text-gray-500 cursor-pointer"
                v-on:click="copyText(citation.bibtex)">
              </i>
            </span>
          </div>
          <div class="overflow-x-auto">
            <p class="whitespace-pre">{{ citation.bibtex }}</p>
          </div>
          <br>
          <div class="flex">
            <h2 class="text-lg">Endnote</h2>
            <span class="pr-2">
              <i class="fas fa-paste m-1 hover:text-gray-500 cursor-pointer"
                v-on:click="copyText(citation.endnote)">
              </i>
            </span>
          </div>
          <div class="overflow-x-auto">
            <p class="whitespace-pre">{{ citation.endnote }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { mapGetters } from 'vuex'

import { downloadPluginCitation } from '../api_savu.js'

export default {
  props: {
    isVisible: Boolean,
    citations: Array,
    pluginNames: Array
  },

  computed: {
    ...mapGetters([
      'filepathInputFieldText'
    ])
  },

  methods: {
    closePopup: function () {
      this.$emit('change-citations-popup-visibility', false)
    },

    citationHyperlinkClickListener: function (citation_type) {
      if (this.pluginNames.length === 1) {
        downloadPluginCitation({
          'plugins': this.pluginNames,
          'filename': this.pluginNames[0]
        }, citation_type)
      } else if (this.pluginNames.length > 1) {

        if (this.filepathInputFieldText !== '') {
          var split_path = this.filepathInputFieldText.split('/')
          var filename = split_path[split_path.length - 1]
          var name = filename.split('.')[0]
        } else {
          var name  = 'process_list'
        }

        downloadPluginCitation({
          'plugins': this.pluginNames,
          'filename': name
        }, citation_type)
      }

    },

    copyText: function (text) {
      var el = document.createElement('textarea')
      el.setAttribute('readonly', '')
      el.style = {visibility: 'hidden'}
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
  }
}
</script>

<style>
.popup-bg {
  // same as tailwind's bg-gray-800, but with a custom opacity
  background: rgba(31, 41, 55, 0.8);
}

.citations-container {
  height: 75%;
}
</style>
