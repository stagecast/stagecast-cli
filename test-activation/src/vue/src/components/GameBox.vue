<template> 
  <div class="box">
    <!-- Game score box -->
    <div class="bg-grey border-top-radius">
      <h1 class="box-title">{{ getUserName }}<span class="box-title-sub">#{{ getUserCode }}</span></h1>
      <div class="info-row relative" :class="{ gold: goldenPoints, green: !goldenPoints }">
        <span>{{ $t('game.score') }}</span>
        <transition name="update">
          <span class="text-bold right-info" :key="currentScore">{{ (currentScore || 0).toLocaleString('de-DE') }} p</span>
        </transition>
      </div>
    </div>
    <Game ref="game" @updateScore="updateScore($event)" @gameOver="gameOver($event)"></Game>
  </div>
</template>

<script>
import Game from "./Game";

export default {
  name: 'GameBox',
  components: { Game },
  props: {
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
      currentScore: 0,
      goldenPoints: false
    }
  },
  computed: {
    getUserName () {
      return this.profile.name.split('#')[0]
    },
    getUserCode () {
      return this.profile.name.split('#')[1]
    },
  },
  mounted () {},
  methods: {

    // start game
    startGame (duration, options) {
      this.$refs.game.startGame(duration, options)
    },

    // Show user score updates
    updateScore(newScore) {
      this.currentScore += newScore.update;
      this.goldenPoints = newScore.type === 'gold';
      this.$set(this.profile, 'points', this.currentScore)
    },

    // Handle the end of the game
    gameOver(totalClicks) {
      this.$emit('gameOver', { points: this.currentScore, totalClicks })
    }
  }
}
</script>

<style scoped lang="scss">
  @import '../styles/variables';
  
  .relative {
    position: relative;
    padding-bottom: 30px;
  }

  .green {
    --update-color: #34be7e;
  }
  .gold {
    --update-color: linear-gradient(90deg, #eec868 0%, #e49358 100%);
  }
  .update-enter-active {
    color: #ffffff;
    background: var(--update-color);
    height: 30px;
    min-width: 30px;
    padding: 3px 6px;
    line-height: 24px;
    vertical-align: middle;
    text-align: center;
    position: absolute;
    right: 16px;
    top: -6px;
    animation: colorBounceIn 0.3s ease-in;
    border-radius: 15px;
  }

  .update-leave-active {
    opacity: 0;
  }

  @keyframes colorBounceIn {
    0% {
      opacity: 1;
      transform: scale(0.9);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  } 
</style>
