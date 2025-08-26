<template>
  <div class="countdown" dir="ltr">
    <div v-for="(value, index) in timeString" v-bind:key="index" :class="{'time-box': value !== ':', 'divider': value === ':'}">
      {{value}}
    </div>
  </div>
</template>

<script>

export default {
  name: 'Countdown',
  components: { },
  data: function () {
    return {
      interval: -1,
      timeString: '00:00:00',
      over: null,
      endTimestamp: this.endtime
    }
  },
  props: {
    options: {
      type: Object,
      required: false,
      default () {
        return {
          autoStart: true
        }
      }
    },
    endtime: {
      type: Number,
      required: false,
      default () {
        return -1
      }
    }
  },
  mounted () {
    if (this.options.autoStart) {
      this.start()
    }
  },
  beforeDestroy () {
    window.clearInterval(this.interval)
  },
  watch: {
    endtime: function (val) {
      if (!val) { return }
      clearInterval(this.interval)
      this.over = false
      this.endTimestamp = val
      const now = new Date().getTime()
      if (now <= val && this.options.autoStart) {
        this.start()
      } else {
        this.timeString = '00:00:00'
      }
    }
  },
  methods: {
    start (endtime) {
      if (endtime) { this.endTimestamp = endtime }
      this.over = false
      this.interval = setInterval(() => {
        this.checkTime()
      }, 1000)
    },
    stop () {
      clearInterval(this.interval)
      this.timeString = '00:00:00'
      this.$emit('countdownStop', true)
    },
    checkTime () {
      if (this.endTimestamp <= 0) {
        clearInterval(this.interval)
        this.timeString = '00:00:00'
        this.over = true
        return
      }

      const now = new Date().getTime()
      const timeRemaining = this.endTimestamp - now

      // Time calculations for days, hours, minutes and seconds
      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
      const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

      // Stop update time if countdown is finished.
      if (timeRemaining < 0) {
        this.timeString = '00:00:00'
        this.over = true
        this.$emit('countdownEnd', true)
        clearInterval(this.interval)
      } else {
        // Result is written to element with id "timer"
        this.timeString = this.timeFormat(hours + 24 * days) + ':' + this.timeFormat(minutes) + ':' + this.timeFormat(seconds)
      }
    },

    /* Helper: Aadds a '0' before the number if it's below 10, for a consistent format. */
    timeFormat (value) {
      return value < 10 ? '0' + String(value) : value
    }
  }
}
</script>

<style scoped lang="scss">
  @import '../styles/variables';

  .countdown {
    text-align: center;

    .time-box, .divider {
      height: 100%;
      display: inline-block;
      text-align: center;
      font-weight: $font-weight-bold;
      font-size: 30px;
      line-height: 40px;
    }

    .time-box {
      background: rgba(255,255,255,0.1);
      width: 27px;
      box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.15);
      border-radius: 10%;
      margin: 2px;
    }

    .divider {
      margin: 0;
      padding: 0 5px;
    }
  }
</style>
