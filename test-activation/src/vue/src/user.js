import Vue from 'vue'
let user; 

export function setUserObservable (u) {
  user = Vue.observable(u)
}

export function getUserObservable () {
  return user
}

export function handleQuizRoundEnd () {
  Vue.set(user, 'points', 0)
  Vue.set(user, 'roundsPlayed', user.roundsPlayed + 1)
}

export function prepareUserForNewSeries () {
  Vue.set(user, 'points', 0)
  Vue.set(user, 'bestScore', 0)
  Vue.set(user, 'currentRound', 0)
  Vue.set(user, 'position', null)
}

export function handleUserScoreUpdate ($event) {
  const userScore = $event.userScore || {}
  Vue.set(user, 'position', userScore.position)
  Vue.set(user, 'bestScore', userScore.bestScore)
  Vue.set(user, 'totalParticipants', $event.totalParticipants)
}

export default user
