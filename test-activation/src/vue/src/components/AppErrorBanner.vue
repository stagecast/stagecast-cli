<template>
  <div class="app-error" :class="{warn: type === 'warn'}" v-if="error">
    {{ message ? message : 'Something went wrong. Check your internet connection and reload the page.' }}
  </div>
</template>

<script>
export default {
  name: 'AppErrorBanner',
  props: {
    error: {
      type: Error,
      required: false,
      default () {
        return null
      }
    },
    message: String,
    type: String
  }
}
</script>

<style scoped lang="scss">
  @import '../styles/variables';
  .app-error {
    text-align: center;
    width: calc(100% + 32px);
    margin: 0 -16px;
    padding: 16px;
    color: white;
    background: $color-red;
    font-size: 14px;
  }
  .warn {
    background: $color-yellow!important;
  }

  @media screen and (max-width: 320px) {
    .app-error {
      width: calc(100% + 16px);
      margin: 0 -8px;
    }
  }
</style>
