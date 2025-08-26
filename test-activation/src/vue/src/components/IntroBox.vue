<template>
  <div class="intro-box-container">
    <div class="intro-box">
      <h1 class="intro-title">{{ $t('intro.title') }}</h1>
      <p class="intro-subtitle">{{ $t('intro.subtitle') }}</p>
      <div class="input-group">
        <input @input="onInputChange" v-model="name" :maxlength="maxLen" type="text" class="name-input" :placeholder="$t('intro.placeholder')">
        <span class="input-info">{{ charsLeft }} {{ $t('intro.info') }}</span>
      </div>
      <button @click="submitName" :disabled="isDisabled" class="custom-button">{{ $t('intro.button') }}&#8233;</button>
    </div>
  </div>
</template>

<script>
import { generateCode } from '../utils'

export default {
  name: 'IntroBox',
  components: {},
  props: {
    profile: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data: function () {
    return {
      name: '',
      code: '',
      minLen: 3,
      maxLen: 20,
      isDisabled: true
    }
  },
  computed: {
    charsLeft: function () {
      return this.maxLen - this.name.length
    }
  },
  watch: {
    /* Allow to change the username if the user is already defined */
    profile: function (u) {
      if (u && u.name) {
        try {
          const split = u.name.split('#')
          this.name = split[0]
          this.code = split[1]
        } catch (err) {
          this.name = ''
          this.code = ''
        }
      }
    }
  },
  methods: {
    /* Open the prize overlay */
    submitName () {
      this.isDisabled = true
      // generate 4 digit code
      const code = this.code || generateCode(4)
      const name = this.name.trim()
      this.$emit('profileUpdates', { name: `${name}#${code}` })
    },
    /* Enforce the name lenght limit */
    onInputChange () {
      this.isDisabled = this.name.length < this.minLen

      if (this.name.length > this.maxLen) {
        this.name = this.name.slice(0, this.maxLen)
      }
    }
  }
}
</script>

<style scoped lang="scss">
  @import '../styles/variables';
  .intro-box-container {
    width: 100%;

    .intro-box {
      max-width: 450px;
      margin-left: auto;
      margin-right: auto;
    }
  }

  .intro-box {
    background-color: var(--bg-color-2);
    color: var(--text-color-1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    border-radius: 10px;
    padding: 20px 20px 16px 20px;
    border: 1px solid rgba(255,255,255,0.1);
    margin-top: 16px;
    margin-bottom: 16px;
    text-align: center;

    .intro-title {
      font-size: 22px;
      font-weight: $font-weight-bold;
      margin-bottom: 10px;
    }

     .intro-subtitle {
      margin-top: 0;
      margin-bottom: 30px;
    }

    .custom-button {
      background: var(--btn-color-1);
      color: var(--btn-text-color-1);
      font-family: $base-font-stack;
      font-weight: $font-weight-bold;
      margin-top: 30px;
      border: none;
      width: 100%;
      height: 60px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
      border-radius: 7px;
      padding: 7px 15px;
      font-size: 22px;
      line-height: 26px;
      outline: none;

      &:disabled {
        opacity: 0.1;
      }

      &:active, &:focus {
        color: var(--btn-text-color-1) !important;
        transform: scale(0.97);
        transition: all .3s ease-out;
      }

      svg, span {
        vertical-align: middle;
      }

      span {
        display: inline-block;
        margin-left: 30px;
        margin-right: 50px;
      }
    }
  }

  .input-group  {
    padding-bottom: 30px;

    .name-input {
      width: 100%;
      height: 60px;
      background: var(--input-color-1);
      color: var(--input-text-color-1);
      border: 2px solid var(--bg-color-4);
      border-radius: 7px;
      font-size: 18px;
      font-weight: $font-weight-bold;
      padding-left: 18px;
      padding-right: 18px;
      outline: none;
      transition: all .3s ease-in;

      &::-webkit-input-placeholder,
      &:-moz-placeholder,
      &:-moz-placeholder,
      &:-ms-input-placeholder {
        color: rgba(23, 23, 23, 0.2);
      }

      &:focus {
        border-color: var(--input-color-2);
      }
    }

    // Form data is invalid
    &.is-invalid {
      .invalid-feedback {
        display: block;
      }

      .name-input {
        border-color: #ea6969;
        color: #ea6969;
      }
    }

    .input-info {
      opacity: 0.2;
      float: right;
      font-weight: 300;
      font-size: $base-font-size;
      margin-top: 10px;
    }

  }

  a {
    text-decoration: underline;
    color: var(--text-color-1);
    font-weight: bold;
  }
</style>
