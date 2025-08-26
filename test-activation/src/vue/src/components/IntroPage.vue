<template>
  <div class="">
    <intro-box @profileUpdates="handleProfileUpdate($event)"></intro-box>
  </div>
</template>

<script>
import IntroBox from "./IntroBox";

export default {
  name: 'IntroPage',
  components: { IntroBox },
  props: {},
  data: function () {
    return {}
  },
  computed: {},
  methods: {
    handleProfileUpdate: function ($event) {
      // emit user info, save them and redirect to game
      this.$emit('profileUpdates', $event)
    }
  }
}
</script>

<style scoped lang="scss">
  @import '../styles/variables';
</style>
