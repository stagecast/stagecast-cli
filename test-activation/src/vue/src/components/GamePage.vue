<template> 
  <GameBox ref="game" :profile="profile" @gameOver="gameOver($event)"></GameBox>
</template>

<script>
import GameBox from "./GameBox";

export default {
  name: 'GamePage',
  components: { GameBox },
  props: {
    custom: {
      type: Object,
      default () {
        return {}
      }
    },
    quest: {
      type: Object,
      default () {
        return {}
      }
    },
    profile: {
      type: Object,
      default () {
        return {
          name: ''
        }
      }
    }
  },
  data: function () {
    return {
      challenge: {}
    }
  },
  computed: {},
  mounted () {
    this.$SDK.quest.getChallenge(1)
      .then(res => {
        this.challenge = res
        const duration = this.quest.challengeDuration
        this.$refs.game.startGame(duration, this.custom)
      })

  },
  methods: {
    // Handle the end of the game
    gameOver(finalScore) {
      // if (finalScore.points > this.hs) {
      //   this.$emit('updateScore', { hs: finalScore.points, clk: finalScore.totalClicks });
      // } else {
      //   this.$emit('updateScore', { clk: finalScore.totalClicks });
      // }

      this.$SDK.quest.respondToChallenge(1, this.challenge.hash, finalScore.points, {})
        .then(() => {
          this.$emit('gameOver', true)
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
}
</script>

<style scoped lang="scss">
  @import '../styles/variables';
</style>
