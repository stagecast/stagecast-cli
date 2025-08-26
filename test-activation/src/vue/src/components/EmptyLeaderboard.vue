<template>
  <div id="empty-leaderboard-box"></div>
</template>

<script>
import { generalConfig } from '../global'

export default {
  name: 'EmptyLeaderboard',
  components: { },
  props: {},
  data: function () {
    return {
      liveLeaderboard: undefined,
      offset: 0,
      limit: 1 // no limit, fetch the entire leaderboard
    }
  },
  created () {
    window.setTimeout(this.fetchUpdates.bind(this), generalConfig.leaderboardDelay)
  },
  mounted () {
    this.startRefresh()
  },
  beforeDestroy () {
    window.clearTimeout(this.pauseTimeout)
    window.clearInterval(this.leaderboardInterval)
  },
  computed: {},
  methods: {
    /**
     * Start leaderboard update interval. It fetches the latest leaderboard from the CDN
     */
    startRefresh (timeout = generalConfig.leaderboardRefreshRate + 5000) {
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
     * Fetch the updated top scores and the user score.
     * The leaderboard is cached while the user score is not. This might lead to
     * some inconsistencies. Make sure to check if the user own position matches the one in
     * the leaderboard.
     */
    fetchUpdates () {
      if (!this.$SDK) return

      Promise
        .all([
          this.$SDK.quest.getTopScores({ query: { offset: this.offset, limit: this.limit } }),
          this.$SDK.quest.getUserScores()
        ])
        .then(res => {
          const topScores = res[0]
          const userScore = res[1]
          this.$emit('userScore', { userScore, totalParticipants: topScores.totalParticipants })
        })
        .catch(err => {
          console.error(err) //eslint-disable-line
        })
    }
  }
}
</script>

<style scoped lang="scss">
  @import '../styles/variables';
</style>
