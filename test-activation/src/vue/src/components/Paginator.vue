<template>
  <div class="paginator">
    <div class="paginator-header">
      <div class="custom-button arrow-button" :class="{ hidden: !canGoBack }" @click="goBack($event)">
        <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.6 1.4L1 7L6.6 12.6" stroke="var(--bg-color-2)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <slot name="title"></slot>
      <div class="custom-button arrow-button" :class="{ hidden: !canGoForward, dnone: !canGoForward && slotPassed }"  @click="goForward($event)">
        <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.4 12.6L7 7L1.4 1.4" stroke="var(--bg-color-2)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div :class="{ dnone: canGoForward }">
        <slot name="menuoption"></slot>
      </div>
    </div>
    <div class="paginator-body">
      <slot name="body"></slot>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Paginator',
  components: { },
  data: function () {
    return {
      currentIndex: -1
    }
  },
  computed: {
    canGoBack () {
      return this.currentIndex > 0
    },
    canGoForward () {
      return this.currentIndex < this.len - 1
    },
    slotPassed () {
      return !!this.$slots.menuoption
    }
  },
  props: {
    len: {
      type: Number,
      required: true,
      default () {
        return -1
      }
    }
  },
  created () {},
  mounted () {
    this.currentIndex = this.len - 1
  },
  methods: {
    goBack () {
      if (this.currentIndex - 1 > -1) {
        this.currentIndex--
        this.$emit('goBack', this.currentIndex)
      }
    },
    goForward () {
      if (this.currentIndex + 1 < this.len) {
        this.currentIndex++
        this.$emit('goForward', this.currentIndex)
      }
    }
  }
}
</script>

<style scoped lang="scss">
  @import '../styles/variables';

  .paginator-header {
    padding: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
  }

  .custom-button {
    border: none;
    background: var(--btn-color-1);
    color: var(--btn-text-color-1);
    border-radius: 7px;
    padding: 7px 2px;
    font-family: $base-font-stack;
    font-size: $base-font-size;
    font-weight: $font-weight-bold;
    line-height: 26px;
    outline: none;
    transition: all 0.3 ease-out;

    &:active, &:focus {
      box-shadow: none;
      transform: scale(0.94);
      transition: all .3s ease-out;
    }
  }

  .arrow-button {
    display: inline-block;
    width: 38px;
    height: 38px;
    text-align: center;
    margin: auto;

    &.hidden {
      visibility: hidden;
    }
  }
  .dnone {
    display: none;
  }

</style>
