<template>
  <div class="select-none cursor-pointer p-1 hover:bg-gray-200"
    v-on:click.stop="clickListener">
    <div class="flex">
      <p class="pr-2">
        {{ entry }}
      </p>
      <span v-on:mouseenter="infoIconMouseEnter">
        <v-popover offset="5"
          trigger="hover"
          placement="auto"
          boundariesElement="document.body" >
          <i class="fas fa-info-circle cursor-pointer tooltip-target b3"
            v-on:click.stop="infoIconClickListener">
          </i>
          <template slot="popover">
            <transition name="fade" mode="out-in">
              <div v-if="isInfoLoaded">
                <p>{{ pluginInfo.synopsis }}</p>
                <br>
                <p>Click for more information</p>
              </div>
              <p v-else>Loading...</p>
            </transition>
          </template>
        </v-popover>
      </span>
    </div>
  </div>
</template>

<script>
import { getPluginBrowserInfo } from '../api_savu.js'

export default {
  data: function () {
    return {
      isInfoLoaded: false,
      pluginInfo: {}
    }
  },

  props: {
    entry: String
  },

  methods: {
    clickListener() {
      this.$store.dispatch('changePluginBrowserSearchInputFieldText', this.entry)
      this.$store.dispatch('changePluginBrowserDropdownVisibility', false)
    },

    loadPluginInfo: function () {
      getPluginBrowserInfo(
        this.entry,
        (pluginInfo) => {
          this.pluginInfo = pluginInfo
          this.isInfoLoaded = true
        },
        () => {
          console.log('Failed to fetch plugin browser info for: ' + this.entry)
        }
      )
    },

    infoIconClickListener: function () {
      if (this.isInfoLoaded) {
        window.open(this.pluginInfo.doc_link)
      } else {
        console.log('Loading readthedocs link...')
      }
    },

    infoIconMouseEnter: function () {
      if (!this.isInfoLoaded) {
        this.loadPluginInfo()
      }
    }
  }
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity .5s
}

.fade-enter,
.fade-leave-active {
  opacity: 0
}
</style>
