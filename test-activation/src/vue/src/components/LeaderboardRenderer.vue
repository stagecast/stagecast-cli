<template>
  <transition name="round-fade" mode="out-in">
    <div class="leaderboard" v-if="board.length && !view.loading" :key="0">
      <leaderboard-row-renderer
        v-for="(leaderboardUser, index) in board"
        v-bind:key="index"
        :scorer="leaderboardUser"
        :currentUserName="username"
        :index="index">
      </leaderboard-row-renderer>
    </div>
    <div class="loading" v-if="!view.loading && !board.length" :key="1">
      <template v-if="friends">
        <img v-if="view.theme === 'light'" src="../assets/icons/black/empty-friend.svg" alt="empty friends list"/>
        <img v-else src="../assets/icons/white/empty-friend.svg" alt="empty list"/>
        <p class="text-grey" style="max-width: 320px">{{ $t('friends.info') }}</p>
      </template>
      <template v-else>
        <template v-if="latest === selected">
          <img v-if="view.theme === 'light'" src="../assets/icons/black/empty.svg" alt="empty list"/>
          <img v-else src="../assets/icons/white/empty.svg" alt="empty list"/>
          <p class="text-grey" style="max-width: 260px">{{ $t('end.leaderboard.info') }}</p>
        </template>
        <template v-else>
          <img src="../assets/empty.svg" alt="empty list"/>
          <p class="text-grey" style="max-width: 260px">{{ $t('end.leaderboard.empty') }}</p>
        </template>
      </template>
    </div>
    <div class="loading" v-if="view.loading" :key="2">
      <h3>{{ friends ? $t('end.leaderboard.loadingFriends') : $t('end.leaderboard.loading') }}</h3>
      <p>{{ $t('end.leaderboard.wait') }}</p>
      <img v-if="view.theme === 'light'" src="../assets/icons/black/preloader.svg" alt="loading..."/>
      <img v-else src="../assets/icons/black/preloader.svg" alt="loading..."/>
    </div>
  </transition>
</template>

<script>
import LeaderboardRowRenderer from './LeaderboardRowRenderer'

export default {
  name: 'LeaderboardRenderer',
  components: { LeaderboardRowRenderer },
  props: {
    friends: Boolean,
    latest: Number,
    selected: Number,
    username: String,
    leaderboard: {
      type: Array,
      required: false,
      default () {
        return []
      }
    }
  },
  data: function () {
    return {
      board: this.leaderboard,
      view: {
        loading: true,
        theme: 'light'
      }
    }
  },
  created () {
    this.view.theme = document.documentElement.getAttribute('theme')
    this.view.loading = true
  },
  methods: {},
  watch: {
    leaderboard: function (val) {
      this.board = val || []
      this.view.loading = !val
    }
  }
}
</script>

<style scoped lang="scss">
  @import '../styles/variables';

  .leaderboard {
    padding-top: 12px;
  }

  .loading {
    text-align: center;
    width: 100%;
    padding: 20px;
    opacity: 0.8;

    img {
      padding-bottom: 8px;
      height: 48px;
      width: 48px;
      box-sizing: content-box;
    }

    h3 {
      margin: 0;
      text-align: center;
    }
    p {
      margin: 0 auto 10px auto;
      text-align: center;
    }
  }

</style>
