<template>
  <div id="leaderboard-box" class="box">
    <Paginator :len="currentSeriesNumber" @goBack="handleHistoryNavigation($event)" @goForward="handleHistoryNavigation($event)">
      <template v-slot:title>
        <div class="box-title">
          <h1 class="box-title">{{ $t('end.leaderboard.title') }} <span v-if="quest.maxSeries !== 1">- {{ $t('end.round') }} {{ activeSeries }}</span></h1>
          <div class="live-indicator">
            <i class="blink"></i>{{ $t('end.leaderboard.updating') }}
          </div>
        </div>
      </template>
      <template v-slot:body>
        <LeaderboardRenderer :latest="currentSeriesNumber" :selected="activeSeries" :leaderboard="getLeaderboard" :username="username"></LeaderboardRenderer>
      </template>
    </Paginator>
  </div>
</template>

<script>
import LeaderboardRenderer from './LeaderboardRenderer'
import Paginator from './Paginator'
import { setAppError, generalConfig } from '../global'
import { debounce } from '../utils'

export default {
  name: 'GlobalLeaderboard',
  components: { LeaderboardRenderer, Paginator },
  props: {
    currentSeriesNumber: Number,
    username: {
      type: String,
      required: true,
      default () {
        return ''
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
      liveLeaderboard: undefined,
      leaderboardHistory: [],
      activeSeries: -1,
      offset: 0,
      limit: 50
    }
  },
  created () {
    window.setTimeout(this.fetchUpdates.bind(this), generalConfig.leaderboardDelay)
  },
  mounted () {
    this.activeSeries = this.currentSeriesNumber
    // if quest has multiple series OR only one but still in progress.
    if ((this.quest.maxSeries === 0 || this.quest.maxSeries >= this.currentSeriesNumber) || this.currentSeriesNumber === 1) {
      this.startRefresh()
    }
  },
  beforeDestroy () {
    window.clearTimeout(this.pauseTimeout)
    window.clearInterval(this.leaderboardInterval)
  },
  computed: {
    getLeaderboard () {
      if (this.activeSeries === this.currentSeriesNumber) {
        return this.liveLeaderboard
      } else {
        // the seriesId start from 1, while the history starts from index 0
        return this.leaderboardHistory[this.activeSeries - 1]
      }
    }
  },
  methods: {
    handleHistoryNavigation: debounce(function (index) {
      // the historical series start from 1, pagination starts from 0
      this.activeSeries = index + 1
      if (this.activeSeries === this.currentSeriesNumber) {
        this.fetchUpdates()
        this.startRefresh()
      } else {
        this.stopRefresh()
        this.fetchHistory(this.activeSeries)
      }
    }, 300),
    /**
     * Start leaderboard update interval. It fetches the latest leaderboard from the CDN
     */
    startRefresh (timeout = generalConfig.leaderboardRefreshRate) {
      if (this.leaderboardInterval) {
        window.clearInterval(this.leaderboardInterval)
      }
      this.leaderboardInterval = window.setInterval(this.fetchUpdates.bind(this), timeout)
    },
    /**
     * Load last state and stop updating the top score
     */
    stopRefresh () {
      window.clearTimeout(this.pauseTimeout)
      window.clearInterval(this.leaderboardInterval)
    },
    /**
     * Allows to stop the refresh interval for a specified amount of time.
     * (Used to preserve the local state)
     */
    pauseRefresh (timeout = 10000) {
      window.clearInterval(this.leaderboardInterval)
      this.pauseTimeout = window.setTimeout(this.startRefresh.bind(this), timeout)
    },
    /**
     * Clean the leaderboard and unset the user info.
     * Used when a new Quiz Series starts.
     */
    clean () {
      this.liveLeaderboard = null
    },
    /**
     * Fetch the updated top scores and the user score.
     * The leaderboard is cached while the user score is not. This might lead to
     * some inconsistencies. Make sure to check if the user own position matches the one in
     * the leaderboard.
     */
    fetchUpdates () {
      if (!this.$SDK) {
        this.liveLeaderboard = []
        return
      }

      Promise
        .all([
          this.$SDK.quest.getTopScores({ query: { offset: this.offset, limit: this.limit } }),
          this.$SDK.quest.getUserScores()
        ])
        .then(res => {
          const topScores = res[0]
          const userScore = res[1]

          this.liveLeaderboard = topScores.leaderboard || []

          this.$emit('userScore', { userScore, totalParticipants: topScores.totalParticipants })
          const userPosition = userScore.position

          if (userPosition === 51) {
            this.liveLeaderboard.push(userScore)
          }
          if (userPosition > 51) {
            return this.$SDK.quest.getTopScores({ query: { offset: userPosition - 2, limit: 3 } })
          }
        })
        .then(moreScores => {
          if (!moreScores) {
            return
          }
          const addition = [
            { name: '...' },
            ...moreScores.leaderboard,
            { name: '...' }
          ]
          this.liveLeaderboard.push(...addition)
        })
        .catch(err => {
          console.error(err) //eslint-disable-line
        })
    },
    /**
     * Fetch top 10 users for the specified Series
     * history index starts from 0
     * leaderboard series starts from 1
     */
    fetchHistory (seriesId) {
      if (!this.$SDK) {
        this.$set(this.leaderboardHistory, seriesId - 1, [])
        return
      }

      this.$SDK.quest.getTopScores({ query: { offset: 0, limit: 10, series: seriesId } })
        .then(res => {
          // the seriesId start from 1, while the history starts from index 0
          this.$set(this.leaderboardHistory, seriesId - 1, res.leaderboard)
        })
        .catch(err => {
          setAppError(err)
        })
    }
  }
}
</script>

<style scoped lang="scss">
  @import '../styles/variables';

  #leaderboard-box {
    overflow: hidden;
    min-height: 200px;

    .box-title {
      padding: 0;
      flex-grow: 1;
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

</style>
