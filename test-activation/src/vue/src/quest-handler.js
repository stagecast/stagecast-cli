
export const WIN_CRITERIA = {
  ENOUGH_POINTS: 'prizeOnEnoughPoints',
  TOP_RANKING: 'prizeOnTopRanking'
}
export default class QuestHandler {
  timeout = null
  quest = null
  startTime = null
  currentSeriesEndTs = null
  currentSeriesNumber = null
  currentSeriesActive = false
  randomizeAnswers = false
  seriesOverHandler = () => {}

  constructor (quest, startTime, options) {
    this.quest = quest
    this.startTime = startTime
    this._initSeries()

    if (options) {
      this.randomizeAnswers = !!options.randomizeAnswers
      if (options.seriesOverHandler) {
        this.seriesOverHandler = options.seriesOverHandler
      }
    }
  }

  prepareNewSeries () {
    return this.getSeriesLeft() > 0 ? this._initSeries() : false
  }

  isCurrentSeriesActive () {
    return this.currentSeriesEndTs > new Date().getTime()
  }

  /**
   * Get remaining series based on the current one.
   */
  getSeriesLeft () {
    if (this.quest.maxSeries === 0) return Infinity
    return this.quest.maxSeries - this.currentSeriesNumber
  }

  /**
   * Get the current series time left in ms
   */
  getSeriesTimeLeft () {
    return this.currentSeriesEndTs - new Date().getTime()
  }

  /**
   * Check if either the series is active or there are other series left
   */
  canStillPlay () {
    return (this.getSeriesLeft() >= 0 && this.isCurrentSeriesActive())
  }

  /**
   * Check if user has played too much
   */
  canUserReplay (profile, timeLimit) {
    if (this.quest.maxRoundsPerSeries !== 0 && profile.currentRound >= this.quest.maxRoundsPerSeries) {
      return false
    }
    return this.getSeriesTimeLeft() > timeLimit
  }

  getChallengeIndexes () {
    return QuestFunctions.getChallengeIndexes(this.quest.challengesCount, this.quest.challengesPerRound)
  }

  /**
   * Set the new series number and the new series end. Start the seriesEnd timeout.
   *
   * @returns if the new series is active. If false, the quest is over for good.
   */
  _initSeries () {
    // if there are series left go to the next one
    this.currentSeriesEndTs = this._getSeriesEndTs()
    this.currentSeriesNumber = this._getSeriesNumber()
    this.currentSeriesActive = this.isCurrentSeriesActive()

    const seriesTimeLeft = this.currentSeriesEndTs - new Date().getTime()
    if (seriesTimeLeft > 0) {
      // set a timout to notify that the series has ended.
      this.timeout = window.setTimeout(() => {
        this.currentSeriesActive = false
        if (this.seriesOverHandler) this.seriesOverHandler(this)
      }, seriesTimeLeft)
      return true
    } else {
      return false
    }
  }

  _getSeriesEndTs () {
    return QuestFunctions.getQuestSeriesEnd(this.quest, this.startTime)
  }

  _getSeriesNumber () {
    return QuestFunctions.getQuestSeriesNumber(this.quest, this.startTime)
  }

  addSeriesOverHandler (handler) {
    this.seriesOverHandler = handler
  }

  removeSeriesOverHandler () {
    this.seriesOverHandler = () => {}
  }
}

export class PrizeHandler {
  constructor (quest, prize) {
    this.quest = quest
    this.prize = prize
  }

  get hasPrize () {
    return !!this.prize
  }

  getCountdownDescription () {
    if (!this.prize) return window.vm.$t('end.countdown.noprize')

    if (this.prize.type === WIN_CRITERIA.ENOUGH_POINTS) {
      const thresholdScore = this.prize.enoughPoints || this.prize.enoughPointsPercentage
      return window.vm.$tc('end.countdown.prizeEnoughPoints', thresholdScore, { num: thresholdScore })
    } else if (this.prize.type === WIN_CRITERIA.TOP_RANKING) {
      const winnersPerRound = this.prize.prizeAvailabilityLimit
      return window.vm.$tc('end.countdown.prizeTopRanking', winnersPerRound, { num: winnersPerRound })
    } else {
      return window.vm.$t('end.countdown.noprize')
    }
  }

  checkWinner (userProfile) {
    return (this.prize && userProfile.prizes && userProfile.prizes.length > 0)
  }
}

class QuestFunctions {
  /**
   * Before starting the quest, get the list of challenge ids that are going to
   * be presented to the participant.
   */
  static getChallengeIndexes (count, limit) {
    return (count > limit)
      ? QuestFunctions.getRandomChallenges(count, limit)
      : QuestFunctions.getAllChallenges(count)
  }

  /* Strategy 1: get all quest Challenges in order */
  static getAllChallenges (count) {
    if (count > 0) {
      const indexes = [...Array(count).keys()]
      indexes.splice(0, 1)
      indexes.push(count)
      return indexes
    } else {
      return []
    }
  }

  /* Strategy 2: get N Challenge indexes without repetitions. These N Challenges will form the quest round. */
  static getRandomChallenges (count, limit) {
    const arr = [...Array(count).keys()]
    arr.splice(0, 1)
    arr.push(count)
    const indexes = []
    for (let i = 0; i < limit; i++) {
      const arrIndex = Math.floor(Math.random() * (count - i))
      indexes.push(arr[arrIndex])
      arr.splice(arrIndex, 1)
    }
    return indexes
  }

  /**
   * Checks when the current series will end based on the the quest duration and the Moment start time
   */
  static getQuestSeriesEnd (quest, startTime) {
    const seriesCount = QuestFunctions.getQuestSeriesNumber(quest, startTime)
    return startTime + (quest.seriesDuration * seriesCount)
  }

  /**
   * Check what series is currently being played based on the quest series duration and the activation start time.
   * If the last series has already passed, returns the last series number.
   */
  static getQuestSeriesNumber (quest, startTime) {
    const now = new Date().getTime()
    const numberOfSeries = Math.ceil((now - startTime) / quest.seriesDuration) || 1
    return quest.maxSeries === 0 ? numberOfSeries : Math.min(quest.maxSeries, numberOfSeries)
  }
}
