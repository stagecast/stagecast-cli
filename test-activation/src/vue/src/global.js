import Vue from 'vue'

// App State shared among components
const appState = Vue.observable({
  profile: {},
  quest: {},
  prize: null,
  activationConfig: {},
  questHandler: null,
  prizeHandler: null,
  // global error
  error: undefined,
  errorMessage: ''
})

// quick access to configuration data
export const generalConfig = {
  // the default polling duration for the leaderboard
  leaderboardRefreshRate: 7000,
  // the delay of the first leaderboard fetch (give time to the user score to be added)
  leaderboardDelay: 1200,
  // how much time before the countdown end the user is allowed to replay?
  replayTimeLimit: 60000,
  // pause the refresh for a while to let people time to replay the quiz and populate the new leaderboard
  pauseRefreshAfterSeries: 40000,
  delayNewSeriesStart: 5000,
  backgroundImage: undefined,
  ctaDisplayTimeout: 5000,
  backgroundColor: 'transparent'
}

export function setAppError (err, message, type) {
  appState.error = err
  appState.errorMessage = message
  appState.errorType = type
}
export default appState
