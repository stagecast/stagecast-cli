/**
 * Checks whether an array is itarable
 */
export function isIterableArray (array) {
  return Array.isArray(array) && !!array.length
}

export function coerceStringProperty (element) {
  if (isIterableArray(element)) {
    return element[0]
  } else if (typeof element === 'string' && element.length > 0) {
    return element
  } else {
    return null
  }
}

/**
 * Easy way to access a deep object property, witout having to check for null or undefined
 */
export function getObjectProp (obj, path = '') {
  if (typeof path === 'string') {
    path = path.split('.')
  }
  return path.reduce((accumulator, currentValue, i, array) => {
    if (typeof accumulator === 'object') {
      return accumulator[currentValue] ? accumulator[currentValue] : undefined
    }
    array.splice(1)
    return undefined
  }, obj)
}

/**
 * Make first letter of a String capital
 */
export function capitalFirstChar (str) {
  return String(str).charAt(0).toUpperCase() + String(str).slice(1) || ''
}


export function isSeriesActive (quest) {
  // infinite series OR series left and series is not over yet 
  return (quest.maxSeries === 0 || quest.maxSeries >= quest.seriesCount) && quest.seriesEndTime > new Date().getTime()
}
/**
 * Checks when the current series will end based on the the quest duration and the Moment start time
 */
export function getQuestSeriesEnd (quest) {
  const seriesCount = getCurrentActiveSeries(quest)
  return quest.startTime + (quest.seriesDuration * seriesCount)
}

/**
 * Check what series is currently being played based on the quest series duration and the Moment start time
 */
export function getCurrentActiveSeries (quest) {
  const now = new Date().getTime()
  const currentActiveSeries = Math.ceil((now - quest.startTime) / quest.seriesDuration)
  return quest.maxSeries === 0 ? currentActiveSeries : Math.min(quest.maxSeries, currentActiveSeries)
}

/**
 * Add an attribute to the document element (HTML tag)
 */
export function setPageAttributes (attrs) {
  Object.keys(attrs).forEach(key => {
    document.documentElement.setAttribute(key, attrs[key])
  })
}

/**
 * Retries a Promise "attempts" times.
 */
export function retry (promise, attempts) {
  let counter = 0
  return promise.catch(err => {
    counter++
    if (counter < attempts) {
      console.warn('retry call...') //eslint-disable-line
      return retry(promise, attempts - counter)
    }
    return Promise.reject(err)
  })
}

/**
 * Generate a 4-digit code to tell users with the same name apart
 */
export function generateCode (len = 4) {
  return padLeft(Math.round(Math.random() * (10 ** parseInt(len) - 1)), len, '0')
}

/**
 * Add a character to the left of a string until the maxLen is reached
 */
export function padLeft (value, maxLen, s) {
  const diff = parseInt(maxLen) - String(value).length
  let res = String(value)
  for (let i = 0; i < diff; i++) {
    res = String(s) + res
  }
  return res
}

/**
 * Custom debounce implementation, to collect subsequent user inputs and retun only the last event.
 */
export function debounce (fn, delay) {
  var timeoutId = null
  return function () {
    clearTimeout(timeoutId)
    var args = arguments
    var self = this
    timeoutId = setTimeout(function () {
      fn.apply(self, args)
    }, delay)
  }
}

export function isInAppBrowser () {
  return !!(window.navigator.userAgent.match(/FBAV/i) || window.navigator.userAgent.match(/FBAN/i) || window.navigator.userAgent.match(/LinkedInApp/i))
}

export function shortenLongNumber (num) {
  const SI_SYMBOL = ['', 'k', 'M', 'G', 'T', 'P', 'E']
  // what tier? (determines SI symbol)
  const tier = Math.log10(num) / 3 | 0
  // if zero, we don't need a suffix
  if (tier === 0) return num
  // get suffix and determine scale
  const suffix = SI_SYMBOL[tier]
  const scale = Math.pow(10, tier * 3)
  // scale the num
  const scaled = num / scale
  // format num and add suffix
  return scaled.toFixed(1) + suffix
}

export function shuffle (a) {
  let j, x, i
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    x = a[i]
    a[i] = a[j]
    a[j] = x
  }
  return a
}

export function setAppLanguage (lang) {
  window.vm.$i18n.locale = lang || 'en'
  setPageAttributes({ lang: window.vm.$i18n.locale })
}

export class SharedFunctions {
  static initSponsors (sponsor = {}, showSponsor = false) {
    let sponsors = {}
    if (showSponsor && isIterableArray(sponsor.logos)) {
      sponsors = { ...sponsor, hasSponsors: true }
    }
    return sponsors
  }

  static initCta (cta, showCta = false) {
    let outCta = {}
    let ctaEnabled = false

    if (showCta && cta) {
      outCta = Object.assign({}, cta)
      outCta.createdTimestamp = window.vm.$SDK.activation.activeChangeTs
      outCta.headerImg = coerceStringProperty(cta.headerImg)
      ctaEnabled = true
    }
    return [outCta, ctaEnabled]
  }

  static initBranding (branding) {
    const outBranding = Object.assign({}, branding)

    outBranding.backgroundImage = coerceStringProperty(branding.backgroundImage)
    outBranding.onboardingHeaderImage = coerceStringProperty(branding.onboardingHeaderImage)
    outBranding.backgroundColor = coerceStringProperty(branding.backgroundColor)

    if (branding.theme) {
      setPageAttributes({ theme: branding.theme })
    }

    return outBranding
  }

  static injectStagecastBadge (theme, status) {
    const script = document.createElement('script')
    script.src = 'https://console.staging.stagecast.io/api/assets/badge.js'
    // script.src = '/api/assets/badge.js'
    script.id = 'sc-badge'
    script.setAttribute('data-theme', theme)
    script.setAttribute('data-enabled', status)
    document.body.appendChild(script)
  }
}