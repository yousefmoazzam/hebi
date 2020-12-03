<template>
  <div class="notification-wrapper fixed top-0 mt-1">
    <transition name="fade">
      <div v-show="isVisible" class="notification-body relative z-20 bg-blue-200 p-1 rounded-sm">
        <p>
          {{ notificationText }}
        </p>
      </div>
    </transition>
  </div>
</template>

<script>

export default {
  props: {
    isVisible: Boolean,
    notificationText: String
  },
  watch: {
    isVisible: function (newVal, oldVal) {
      // if the value of isVisible has changed to true, then set a timeout to
      // change to false again after 2 seconds
      if (newVal) {
        setTimeout(() => {
          this.$emit('change-notification-state', false)
        }, 2000)
      }
    }
  }
}
</script>

<style>
.notification-wrapper {
  left: 50%;
}
.notification-body {
  left: -50%;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
