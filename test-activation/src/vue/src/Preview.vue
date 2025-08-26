<template>
  <div id="app" class="app-component" :style="background">
    <div class="inner">
      <div class="main-container">
        <div class="main-positioner">
          <GameBox ref="game" v-if="component === 'quest:challenge'" 
            :key="key"
            :profile="{ name: 'Player Name#1234', totalPoints: 0 }" 
            :quest="componentOptions.quest">
          </GameBox>
          <SummaryPage v-if="component === 'quest:leaderboard'"
            :key="key"
            :enableLeaderboard="componentOptions.custom.enableLeaderboard"
            :quiz="componentOptions.quest"
            :profile="{ name: 'Player Name#1234', totalPoints: 0, points: 0 }">
          </SummaryPage>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GameBox from './components/GameBox'
import SummaryPage from './components/SummaryPage'

import appState, { generalConfig as config } from './global'
import { getObjectProp, isIterableArray } from './utils'
import QuestHandler from './quest-handler'

/**
 * Another entry point for the preview. To compile the preview use:
 * - npm run build:preview
 */
export default {
  name: 'Preview',
  components: { GameBox, SummaryPage },
  data: function () {
    return {
      activeIndex: 0,
      key: 0,
      component: 'quest:challenge',
      componentOptions: {
        branding: {},
        language: 'en',
        custom: {},
        quest: {}
      }
    }
  },
  created: function () {},
  mounted: function () {
    this.$i18n.locale = 'en'
    document.documentElement.setAttribute('lang', 'en')
    window.addEventListener('message', this.handleConfigMessage.bind(this), false)
    document.addEventListener('message', this.handleConfigMessage.bind(this), false)
    window.parent.postMessage({
      messageSource: 'STAGECAST_PREVIEW',
      config: {
        loaded: true,
        supportedComponents: ['quest:challenge', 'quest:leaderboard']
      }
    }, '*')
  },
  computed: {
    getChallengeDuration: function () {
      return getObjectProp(this.componentOptions, ['quest', 'challengeDuration']) || 30000
    },
    background: function () {
      const branding = this.componentOptions.branding
      if (!branding) {
        return { backgroundColor: config.backgroundColor }
      }
      if (isIterableArray(branding.backgroundImage)) {
        return { backgroundImage: `url(${branding.backgroundImage[0]})` }
      }
      if (isIterableArray(branding.backgroundColor)) {
        return { backgroundColor: branding.backgroundColor[0] }
      }
      return { backgroundColor: config.backgroundColor }
    }
  },
  methods: {
    /* Check if the popup has already been opened once */
    handleConfigMessage (message) {
      if (message && message.data && message.data.messageSource === 'STAGECAST_PREVIEW') {
        const config = message.data.config || {}
        // set active component
        this.component = config.component || 'quest:challenge'
        this.activeIndex = (config.componentData || {}).index || 0
        this.componentOptions = config.componentOptions || { quest: {}, custom: {} }
        appState.questHandler = new QuestHandler(this.componentOptions.quest, new Date().getTime(), {})
        this.setBasics()
        this.startGame()
        this.customForceUpdate()
      }
    },
    customForceUpdate () {
      this.key++
    },
    startGame() {
      this.$nextTick(() => {
        if (this.$refs.game) {
          const duration = this.componentOptions.quest.challengeDuration
          const custom = this.componentOptions.custom
          custom.gameButtonImage = custom.gameButtonImage[0] || './assets/mole.png'
          this.$refs.game.startGame(duration, custom)
        }
      })
    },
    setBasics () {
      // set language
      this.$i18n.locale = this.componentOptions.language || 'en'
      document.documentElement.setAttribute('lang', this.$i18n.locale)

      // set theme
      try {
        const theme = this.componentOptions.branding.theme
        document.documentElement.setAttribute('theme', theme)
      } catch (err) {} //eslint-disable-line
    }
  }
}
</script>

<style lang="scss">
  @import "styles/variables";
  @import "styles/main.scss";

  * {
    box-sizing: border-box;
  }

  body {
    background: transparent;
  }
  #app {
    font-size: $base-font-size;
    line-height: $base-line-height;
    font-family: $base-font-stack;
    color: $base-color;
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    width: 100vw;
    min-height: 100vh;
    background: transparent;
    background-position: center center;
    background-size: cover;
    background-attachment: fixed;
  }

  .app-component > .inner {
    margin-left: auto;
    margin-right: auto;
    position: relative;
    padding: 0 10px;
    width: 100%;
    box-sizing: border-box;
  }

  .main-container {
    width: 100%;

    .main-positioner {
      max-width: 450px;
      margin-left: auto;
      margin-right: auto;
    }
  }
</style>
