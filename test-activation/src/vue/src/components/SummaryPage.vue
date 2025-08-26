<template>
  <div>
    <div id="profile-box" class="box">
      <div class="bg-grey border-top-radius">
        <h1 class="box-title">{{ getUserName }}<span class="box-title-sub">#{{ getUserCode }}</span></h1>
        <div class="info-row"><span>{{ $t('end.header.last') }}:</span><span class="right-info">{{ getRoundPoints }}&nbsp;p</span></div>
        <div class="info-row"><span>{{ $t('end.header.best') }}:</span><span class="right-info">{{ getBestScore }}&nbsp;p</span></div>
        <div class="info-row"><span>{{ $t('end.header.rank') }}:</span><span class="right-info">{{ getUserPosition }}</span></div>
      </div>
      <div class="button-container" v-if="showQuizControls">
        <button v-if="view.isWinner" @click="$root.$emit('summary:viewPrize')" class="custom-button prize-button">{{ $t('end.header.prizeButton') }}</button>
        <button v-if="view.canReplay" @click="$root.$emit('summary:playAgain')" class="custom-button">{{ $t('end.header.playButton') }}&#8233;</button>
      </div>
    </div>
    <div id="timer-box" class="box" :class="{ blink: view.animateCountdown }">
      <h1 class="box-title">{{ $t('end.countdown.title') }} <span v-if="quest.maxSeries !== 1">- {{ $t('end.round') }} {{ getSeriesNumber }}</span></h1>
      <Countdown ref="countdown" :options="{ autoStart: false }" @countdownEnd="handleCountdownEnd($event)"></Countdown>
      <span class="countdown-desc" v-html="getCountdownDescription"></span>
    </div>
    <GlobalLeaderboard 
      v-if="view.hasLeaderboard"
      ref="leaderboard" 
      :quest="quest" 
      :currentSeriesNumber="getSeriesNumber"
      :username="profile.name" 
      @userScore="handleUserScoreUpdate($event)">
    </GlobalLeaderboard>
    <EmptyLeaderboard v-if="!view.hasLeaderboard" @userScore="handleUserScoreUpdate($event)"></EmptyLeaderboard>
  </div>

</template>

<script>
import Countdown from './Countdown'
import GlobalLeaderboard from './GlobalLeaderboard'
import EmptyLeaderboard from './EmptyLeaderboard'

import { shortenLongNumber } from '../utils'
import appState, { generalConfig, setAppError } from '../global'
import { WIN_CRITERIA } from '../quest-handler'

// used to avoid opening the prize popup every time the user goes to the leaderboard
let shouldShowPrizeWhenComponentMounts = true

export default {
  name: 'SummaryPage',
  components: { Countdown, GlobalLeaderboard, EmptyLeaderboard },
  props: {
    enableLeaderboard: Boolean,
    profile: {
      type: Object,
      required: true,
      default () {
        return {
          name: 'unknown#0000',
          points: 0,
          bestScore: 0
        }
      }
    },
    quest: {
      type: Object,
      required: true,
      default () {
        return {}
      }
    }
  },
  data: function () {
    return {
      view: {
        canReplay: false,
        isWinner: false,
        animateCountdown: false,
        hasLeaderboard: this.enableLeaderboard
      },
      userPosition: -1,
      totalParticipants: 0,
      appState: appState
    }
  },
  computed: {
    getUserName () {
      return this.profile.name.split('#')[0]
    },
    getUserCode () {
      return this.profile.name.split('#')[1]
    },
    getRoundPoints () {
      return (this.profile.points || 0).toLocaleString('de-DE')
    },
    getBestScore () {
      return (this.profile.bestScore || 0).toLocaleString('de-DE')
    },
    getUserPosition () {
      if (this.profile.position > 0 && this.profile.bestScore > 0) {
        return this.profile.position + '/' + shortenLongNumber(this.totalParticipants)
      } else {
        return 'N/A'
      }
    },
    getCountdownDescription () {
      return this.appState.prizeHandler
        ? this.appState.prizeHandler.getCountdownDescription()
        : ''
    },
    getSeriesNumber () {
      return this.appState.questHandler
        ? this.appState.questHandler.currentSeriesNumber
        : -1
    },
    showQuizControls () {
      return this.view.isWinner || this.view.canReplay
    }
  },
  created () {},
  mounted: function () {
    // register listeners and intervals
    this.$root.$on('app:newSeriesStarted', this.newSeriesStarted.bind(this))
    this.replayInterval = window.setInterval(this.updateCanReplay.bind(this), 1000)

    // start countdown if the quest is still on
    if (appState.questHandler.canStillPlay()) {
      this.startCountdown()
    }

        // get the user profile and check if there is a prize to be claimed
    (this.isPrizeOnReachScore() ? this.refreshUserProfile() : Promise.resolve(this.profile))
      .then(userProfile => {
        const isWinner = this.checkWinner(userProfile)
        if (isWinner && shouldShowPrizeWhenComponentMounts) {
          shouldShowPrizeWhenComponentMounts = false
          this.$nextTick(() => this.$root.$emit('summary:viewPrize'))
        }
      })
  },
  beforeDestroy: function () {
    window.clearInterval(this.replayInterval)
    this.$root.$off('app:newSeriesStarted')
  },
  methods: {
    isPrizeOnReachScore () {
      return appState.prizeHandler 
        && appState.prizeHandler.prize
        && appState.prizeHandler.prize.type === WIN_CRITERIA.ENOUGH_POINTS
    },
    /**
     * Handler for when a new series starts. The App component will send this event.
     */
    newSeriesStarted () {
      this.prepareUserForNewSeries()
      if (this.view.hasLeaderboard) {
        this.prepareLeaderboardForNewSeries()
      }
      this.updateCanReplay()
      this.startCountdown()
    },

    /**
     * Handler for the countdown.
     */
    handleCountdownEnd () {
      this.animateCountdownOver()
      this.refreshUserProfile()
        .then(userProfile => {
          const isWinner = this.checkWinner(userProfile)
          if (isWinner) { this.$nextTick(() => this.$root.$emit('summary:viewPrize')) }
        })
        .finally(() => {
          if (this.view.hasLeaderboard) {
            this.$refs.leaderboard.stopRefresh()
          }
          window.setTimeout(() => {
            this.$root.$emit('summary:startNewSeries')
          }, generalConfig.delayNewSeriesStart)
        })
    },

    /**
     * Fetch user profile and check if a prize has been assigned.
     */
    refreshUserProfile () {
      return this.$SDK.quest.getUserProfile()
        .then(userProfile => {
          this.$root.$emit('app:patchProfile', userProfile)
          return userProfile
        })
        .catch(setAppError)
    },

    /**
     * Prepare the user for new series by resetting scores and position.
     */
    prepareUserForNewSeries () {
      this.$root.$emit('app:patchProfile', {
        points: 0,
        bestScore: 0,
        currentRound: 0,
        poition: null
      })
    },

    /**
     * When fetching the leaderboard, the backend returns also the position and bestScore
     * as well as the totalParticipants.
     */
    handleUserScoreUpdate ($event) {
      this.$root.$emit('app:patchProfile', $event.userScore || {})
      this.totalParticipants = $event.totalParticipants
    },

    /**
     * When the series is over, the quest moves to the next one and the current
     * series becomes the second-to-last.
     */
    prepareLeaderboardForNewSeries () {
      // execute logic at next tick to make sure the leaderboard component gets loaded
      this.$nextTick(() => {
        // fetch older history and clean the last round
        this.$refs.leaderboard.fetchHistory(appState.questHandler.currentSeriesNumber - 1)
        this.$refs.leaderboard.clean()
        // pause refreshing for a while as new scores are not coming immediately after a new series has started
        this.$refs.leaderboard.pauseRefresh(generalConfig.pauseRefreshAfterSeries)
      })
    },

    checkWinner (userProfile) {
      if (appState.prizeHandler) {
        this.view.isWinner = appState.prizeHandler.checkWinner(userProfile)
        return this.view.isWinner
      } else {
        return false
      }
    },

    /**
     * Check whether user can play and update replay status
     */
    updateCanReplay () {
      if (appState.questHandler) {
        this.view.canReplay = appState.questHandler.canUserReplay(this.profile, generalConfig.replayTimeLimit)
      }
    },

    /**
     * Start the series countdown.
     */
    startCountdown () {
      const questHandler = appState.questHandler
      if (questHandler && questHandler.canStillPlay()) {
        this.$refs.countdown.start(questHandler.currentSeriesEndTs)
      }
    },

    /**
     * Start coutdown animation.
     */
    animateCountdownOver () {
      this.view.animateCountdown = true
      window.setTimeout(() => {
        this.view.animateCountdown = false
      }, 3000)
    }
  }
}
</script>

<style scoped lang="scss">
  @import '../styles/variables';
  .summary-container {
    width: 100%;

    .summary-positioner {
      max-width: 450px;
      margin-left: auto;
      margin-right: auto;
    }
  }

  .box {
    &.blink {
      animation: prize-blink 1.5s ease-in-out;
      animation-iteration-count: 2;
    }
  }

  .button-container {
    width: 100%;
    padding: 16px;
    text-align: center;
    align-items: center;
    justify-content: center;
    display: flex;

    button {
      &:first-of-type {
        margin-right: 8px;
      }

      &:last-of-type {
        margin-left: 8px;
      }

      width: calc(50% - 8px);
    }
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
      transform: scale(0.97);
      transition: all .3s ease-out;
    }
  }

  .prize-button {
    background: mix(#eec868, #e49358, 50%);
    background: linear-gradient(90deg, #eec868 0%, #e49358 100%);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    animation-name: pulse;
    animation-duration: 2s;
    animation-iteration-count: 5;
    animation-delay: 1s;
    color: var(--btn-text-color-1);

    &:active {
      color: var(--btn-text-color-1) !important;
      box-shadow: none;
      transform: scale(0.97);
      transition: all .3s ease-out;
    }
  }

  .countdown {
    padding-bottom: 8px;
  }

  .countdown-desc {
    width: 100%;
    padding: 8px 16px 20px 16px;
    text-align: center;
    display: block;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  @keyframes prize-blink {
    0%   { background-color: var(--bg-color-2); color: var(--text-color-1);}
    25%  { background-color: mix(#eec868, #e49358, 50%); background-color: linear-gradient(90deg, #eec868 0%, #e49358 100%); color: var(--text-color-1-inverted);}
    50%  { background-color: var(--bg-color-2); color: var(--text-color-1);}
    75%  { background-color: mix(#eec868, #e49358, 50%); background-color: linear-gradient(90deg, #eec868 0%, #e49358 100%); color: var(--text-color-1-inverted);}
    100%  { background-color: var(--bg-color-2); color: var(--text-color-1);}
  }

</style>
