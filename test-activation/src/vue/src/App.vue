<template>
  <div id="app" class="app-component" v-bind:style="background" ontouchstart>
    <div class="inner" v-if="!view.loading">
      <div class="help-section" v-show="!playing">
        <ScOnboardingPopup ref="onboardingPopup" :prize="appState.prize" :howto="$t('help.howto')" :share="shareUrl" :options="getHelpOptions"></ScOnboardingPopup>
        <ScPrizeClaimPopup v-if="appState.prize" ref="prizePopup" :prize="appState.prize" :profile="appState.profile" :options="getPrizeOptions" @claimPrize="handlePrizeClaim($event)"></ScPrizeClaimPopup>
        <ScCtaPopup v-if="ctaEnabled" ref="ctaPopup" :cta="cta" :storekey="cta.createdTimestamp"></ScCtaPopup>
        <ScProfileButton style="float: right; margin-left: 8px;"></ScProfileButton>
        <div id="sc-badge-injector" style="float: right"></div>
      </div>
      <div class="main-container">
        <div class="main-positioner">
          <IntroPage v-if="isPageVisible('introbox')" @profileUpdates="handleProfileCreate($event)"></IntroPage>
          <GamePage v-if="isPageVisible('game')" :custom="custom" :profile="appState.profile" :quest="appState.quest" @gameOver="handleGameOver($event)"></GamePage>
          <SummaryPage v-if="isPageVisible('summary')" :profile="appState.profile" :quest="appState.quest" :enableLeaderboard="custom.enableLeaderboard"></SummaryPage>
        </div>
      </div>
    </div>
    <ScSponsorBanner v-if="showSponsors" :sponsor="sponsors"></ScSponsorBanner>
    <ScFooter v-if="!view.loading"></ScFooter>
  </div>
</template>

<script>
import IntroPage from './components/IntroPage'
import GamePage from './components/GamePage'
import SummaryPage from './components/SummaryPage'

import { SharedFunctions, setAppLanguage, retry, isIterableArray } from './utils'
import appState, { setAppError, generalConfig } from './global'
import QuestHandler, { PrizeHandler } from './quest-handler'

// let userState = {
//   hs: 0, // high score
//   clk: 0, // total clicks
//   name: "", // username
//   id: Math.floor(Math.random() * 9999 + 1) // random id
// }

export default {
  name: "App",
  components: { IntroPage, GamePage, SummaryPage },
  created() {
    this.$SDK.onInit(this.initialize);
    this.$SDK.onExternalCtaTrigger(this.conditionallyShowCtaPopup.bind(this, true));
  },
  mounted () {
    this.$root.$on('summary:playAgain', this.playNewRound.bind(this))
    this.$root.$on('summary:viewPrize', this.viewPrize.bind(this))
    this.$root.$on('summary:startNewSeries', this.startNewSeries.bind(this))
    this.$root.$on('app:patchProfile', this.patchProfileProps.bind(this))

  },
  // clean all intervals and event listeners
  beforeDestroy () {
    this.$root.$off('summary:playAgain')
    this.$root.$off('summary:viewPrize')
    this.$root.$off('summary:startNewSeries')
    this.$root.$off('app:patchProfile')
  },
  computed: {
    /* Page background */
    background: function () {
      if (!this.branding) {
        return { backgroundColor: generalConfig.backgroundColor }
      }
      if (this.branding.backgroundImage) {
        return { backgroundImage: `url(${this.branding.backgroundImage})` }
      }
      if (this.branding.backgroundColor) {
        return { backgroundColor: this.branding.backgroundColor }
      }
      return { backgroundColor: generalConfig.backgroundColor }
    },
    /* Logo banner display rules */
    showSponsors: function () {
      return !this.view.loading && this.sponsors.hasSponsors
    },
    /* Help popup data options */
    getHelpOptions: function () {
      return {
        title: this.$SDK.getActivationName() || 'Whack a Mole',
        headerImg: this.branding.onboardingHeaderImage,
        openOnLoad: !this.$SDK.isConsoleUser()
      }
    },
    /* Prize popup data options */
    getPrizeOptions: function () {
      return {
        manualTrigger: false
      }
    }
  },
  data: function() {
    return {
      appState: appState,
      defaultData: {
        gameButtonImage: "./assets/mole.png"
      },
      cta: {},
      ctaEnabled: false,
      custom: {},
      branding: {},
      sponsors: {},
      playing: false,
      won: false,
      shareUrl: undefined,
      view: {
        loading: true,
        pageName: ''
      }
    };
  },
  methods: {
    /* Initialize the Stagecast Moments SDK */
    initialize() {
      const activationConfig = this.$SDK.activation.getConfig()
      this.$set(this.appState, 'activationConfig', activationConfig)
      this.shareUrl = activationConfig.sharingEnabled ? activationConfig.shareUrl : null
      setAppLanguage(activationConfig.language)
      this.initBranding(activationConfig.branding)
      this.initSponsors(activationConfig.sponsor, activationConfig.showSponsor)
      this.initCustomData(activationConfig.custom)
      this.initCta(activationConfig.cta, activationConfig.showCta)
      this.initQuest(this.$SDK.activation.activeChangeTs)
        .then(quest => {
          this.initPrize(quest, activationConfig.prize)
          return this.initUserState(activationConfig.custom)
        })
        .finally(() => {
          this.view.loading = false
          SharedFunctions.injectStagecastBadge(activationConfig.branding.theme, this.$SDK.badgeStatus())
        })
    },

     /* Initialize the Sponsor Banner */
    initSponsors (sponsor = {}, showSponsor = false) {
      this.sponsors = SharedFunctions.initSponsors(sponsor, showSponsor)
    },

    /* Initialize Call to Action */
    initCta (cta, showCta = false) {
      [this.cta, this.ctaEnabled] = SharedFunctions.initCta(cta, showCta)
    },

    /* Set branding styles */
    initBranding (branding) {
      this.branding = SharedFunctions.initBranding(branding)
    },

    /* Initialize the data specific to this Activation and add defaults */
    initCustomData (customData) {
      const custom = Object.assign({}, customData)

      isIterableArray(custom.helpHeaderImg)
        ? custom.helpHeaderImg = custom.helpHeaderImg[0]
        : custom.helpHeaderImg = null

      isIterableArray(custom.winHeaderImg)
        ? custom.winHeaderImg = custom.winHeaderImg[0]
        : custom.winHeaderImg = null

      isIterableArray(custom.gameButtonImage) 
        ? custom.gameButtonImage = custom.gameButtonImage[0]
        : custom.gameButtonImage = this.defaultData.gameButtonImage 

      this.custom = custom
    },

    /* Fetch the user state and sync the data. */
    initUserState() {
      return this.$SDK.quest.getUserProfile()
        .then((profile) => {
          this.appState.profile = profile
          this.showPage(profile ? 'summary' : 'introbox')
        })
        .catch((err) => { //eslint-disable-line
          this.showPage('introbox')
        })
    },

    /* Get the quest related to this Moment from the backend */
    initQuest (startTime) {
      return this.$SDK.quest.getQuest()
        .then((quest) => {
          const options = {
            seriesOverHandler: this.seriesOverHandler.bind(this)
          }
          this.appState.quest = quest
          this.appState.questHandler = new QuestHandler(quest, startTime, options)
        })
        .catch((err) => { //eslint-disable-line
          this.showError(err)
        })
        .finally(() => {
          if (!this.appState.quest) this.appState.quest = {}
        })
    },
    
    // TODO: check the 'disabled' state and the getAllocatedPrizes function
    // check also the prize winning criteria
    initPrize (quest, prize) {
      if (!prize || !this.$SDK.prize.enabled) {
        this.appState.prize = null
      } else {
        this.$set(this.appState, 'prize', prize)
      }
      this.appState.prizeHandler = new PrizeHandler(quest, prize)
    },

    patchProfileProps (props) {
      const newProfile = Object.assign({}, this.appState.profile)
      Object.keys(props).map(key => {
        newProfile[key] = props[key]
      })
      this.appState.profile = newProfile
    },

    /**
     * Create profile and start new round
     */
    handleProfileCreate ($event) {
      retry(this.$SDK.quest.setUserProfile($event), 3)
        .then(res => {
          this.appState.profile = res
          this.appState.questHandler.canStillPlay()
            ? this.playNewRound()
            : this.showPage('summary')
        })
        .catch(err => {
          console.error(err) //eslint-disable-line
          this.appState.profile = {}
          this.showError(err, this.$t('intro.playerLimitError'), 'warn')
        })
    },

    handleGameOver () {
      this.showPage('summary')
      this.trackActivationFlowEnd()
      this.conditionallyShowCtaPopup()
    },

    viewPrize () {
      if (this.appState.prize) {
        this.$refs.prizePopup.show()
      }
    },

    startNewSeries () {
      const res = this.appState.questHandler.prepareNewSeries()
      if (res) {
        this.$root.$emit('app:newSeriesStarted')
      }
    },

    conditionallyShowCtaPopup (canSkipSdkCheck) {
      if (!this.ctaEnabled) return
      if (!canSkipSdkCheck && !this.$SDK.activation.canShowCta()) return
      
      this.$nextTick().then(() => this.$refs.ctaPopup.show({ delay: generalConfig.ctaDisplayTimeout }))
    },

    hideCtaPopup () {
      if (!this.ctaEnabled) { return }
      this.$refs.ctaPopup.hide()
    },

    seriesOverHandler () {
      if (this.isPageVisible('quiz')) {
        this.$root.$emit('app:questRoundInterrupt')
      }
    },

        
    trackActivationFlowEnd () {
      this.$SDK.wrapper.postMessage({ type: 'activation:flow:end', traits: { shouldTriggerCta: this.ctaEnabled && !this.$SDK.activation.canShowCta() } })
      return 
    },

    /**
     * Will handle the request to play a new round
     * If roundsPlayed = 0, simply replay the game without resetting the score
     * (no score will be there if you played 0 rounds)
     */
    playNewRound () {
      this.hideCtaPopup()
      this.$SDK.quest.playNewRound({ token: 'broken_token' })
        .then(user => {
          this.appState.profile = user
          this.showPage('game')
        })
        .catch(setAppError)
    },

    // check if the component is visibile
    isPageVisible (name) {
      return this.view.pageName === name
    },

    // show/hide pages
    showPage (name) {
      this.view.pageName = name
    },

    // show generic app errors
    showError (err, message, type) {
      setAppError(err, message, type)
    }
  }
};
</script>


<style lang="scss">
  @import "styles/variables";
  @import "styles/main.scss";
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html,
  body {
    // iOS Safari 12 scroll fix
    overflow-y: auto;
    height: 100%;
  }
  .help-section {
    max-width: 450px;
    margin: 10px auto 0 auto;
  }
  .app-component {
    font-size: $base-font-size;
    line-height: $base-line-height;
    font-family: $base-font-stack;
    color: $base-color;
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    width: 100vw;
    // iOS Safari 12 scroll fix
    overflow-y: auto;
    height: 100%;
    min-height: 100vh;
    background: transparent;
    background-position: center center;
    background-size: cover;
    background-attachment: fixed;
  }

  // Clearfix
  .app-component::before,
  .app-component::after {
    content: " ";
    display: table;
    clear: both;
  }

  .app-component > .inner {
    margin-left: auto;
    margin-right: auto;
    position: relative;
    padding: 0 20px;
    width: 100%;
    max-width: 700px;
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
