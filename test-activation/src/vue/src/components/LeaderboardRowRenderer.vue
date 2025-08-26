<template>
  <div class="leaderboard-row" :class="{'odd': isOddRow, 'empty': !scorer.position}">
    <div v-if="isCurrentUser" class="user-marker"></div>
    <div>
      <div v-if="scorer.position" class="leaderboard-position">{{ scorer.position }}.</div>
      <div class="leaderboard-name">{{ getScorerName }}<span v-if="scorer.position" >#{{ getScorerCode }}</span></div>
    </div>
    <div v-if="scorer.position" class="leaderboard-points">{{ scorer.bestScore.toLocaleString('de-DE') }}&nbsp;p</div>
  </div>
</template>

<script>

export default {
  name: 'LeaderboardRowRenderer',
  components: { },
  data: function () {
    return {
      default: {
        name: 'unknown',
        code: '0000'
      }
    }
  },
  computed: {
    getScorerName () {
      return this.scorer.name.split('#')[0] || this.default.name
    },
    getScorerCode () {
      return this.scorer.name.split('#')[1] || this.default.code
    },
    isOddRow () {
      return (this.index + 1) % 2
    },
    /**
     * Check the user based on the name and not on the marker to avoid incosistencies
     * due to the leaderboard and user own score being out of sync.
     */
    isCurrentUser () {
      return (this.currentUserName === this.scorer.name)
    }
  },
  props: {
    currentUserName: String,
    index: {
      type: Number,
      required: true,
      default () { return -1 }
    },
    scorer: {
      type: Object,
      required: true,
      default () {
        return {}
      }
    }
  },
  created () {},
  methods: {}
}
</script>

<style scoped lang="scss">
  @import '../styles/variables';

  .leaderboard-row {
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 12px 16px;
    line-height: 30px;

    .user-marker {
      position: absolute;
      width: 11px;
      background: var(--bg-color-2-inverted);
      height: 100%;
      left: -1px;
      top: 0;
      z-index: 10;
    }

    &.odd {
      background: var(--bg-color-3);
    }

    &.empty {
      justify-content: center;
    }

    .leaderboard-position {
      font-weight: $font-weight-bold;
      font-size: 20px;
      display: inline-block;
      text-align: right;
      width: 38px;
      margin-right: 12px;
      margin-left: -8px;
    }

    .leaderboard-name {
      font-weight: $font-weight-bold;
      font-size: 16px;
      display: inline-block;

      span {
        font-weight: $font-weight-normal;
        opacity: 0.5;
      }
    }

    .leaderboard-points {
      font-size: 16px;
      text-align: right;
    }
  }

</style>
