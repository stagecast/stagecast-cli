if (window.Stagecast) {

  /* Create and initialize */
  var SDK = new Stagecast();
  var i18n;
  var interval;
  var questInit = false;
  var quest = null;
  var created = 0;
  var countdownEnd = 0;
  var currentTimeString = '';
  var currentTime = 0;
  var activationConfig;

  var leaderboardData = {}

  SDK.onInit(handleOnConfigReceived);

  /* Handle the received configuration */
  function handleOnConfigReceived() {
    var activationConfig = SDK.activation.getConfig()
    created = SDK.activation.activeChangeTs;
    translatePageContent(activationConfig.language || 'en');
    handleCustomData(activationConfig);
    handleQuest(created);
    handleLeaderboardState();

    // window.setInterval(getQuestRuntimeInfo, 15000);
    window.setInterval(handleLeaderboardState, 5000);
  }

  /* Handle the global state */
  function getQuestRuntimeInfo() {
    SDK.quest.getRuntimeInfo()
      .then((data) => {
        var total = data.totalRoundsStarted || 0;
        qs('#questCount').textContent = total.toLocaleString('de-DE');
      })
      .catch((err) => {
        console.error(err);
      })
  }

  function handleQuest(createdTs) {
    questInit = true
    SDK.quest.getQuest()
      .then(function (q) {
        quest = q;
        console.log(q);
        setQuestCountdown(createdTs, q.seriesDuration, q.maxSeries);
      })
      .catch(function (err) {
        console.error(err);
      })
  }

  /* Handle the custom data */
  function handleCustomData(data) {
    activationConfig = Object.assign({}, data);

    if (activationConfig.branding.theme) {
      document.documentElement.setAttribute('theme', activationConfig.branding.theme);
    }
  }

  function generateParticipantDomElement(container, participant, index) {
    let temp = qs("template#participant");
    let clone = temp.content.cloneNode(true);
    if (participant) {
      clone.id = participant.name;
      clone.querySelector('.participant-position').textContent = participant.position + '.';
      clone.querySelector('.participant-name').textContent = participant.name.split('#')[0];
      clone.querySelector('.participant-code').textContent = '#' + participant.name.split('#')[1];
      clone.querySelector('.participant-score').textContent = sanitize(participant.bestScore.toLocaleString('de-DE') + " p");
    } else {
      clone.querySelector('.participant-position').textContent = (index + 1) + '.';
      clone.querySelector('.participant-name').innerHTML = '&mdash;';
      clone.querySelector('.participant-score').innerHTML = '&mdash;';
    }
    if ((index + 1) % 2 === 1) {
      clone.querySelector('.leaderboard-entry').classList.add('odd');
    }
    container.appendChild(clone);
  } 

  function handleLeaderboardState() {
    if (!questInit) {
      return;
    }
    SDK.quest.getTopScores({ query: { offset: 0, limit: 21 } })
      .then(function (leaders) {
        leaderboardData = leaders;
        return leaders;
      })
      .then(renderLeaderboard)
      .catch(function (error) {
        console.warn('Error', error.message || error);
      })
  }

  // UTILS
  function onResize() { renderLeaderboard(leaderboardData);}
  window.onresize = onResize;

  function renderLeaderboard (leaders) {
    const topParticipants = leaders.leaderboard;
    const leaderboard = qs('.box-body .leaderboard');
    leaderboard.innerHTML = '';

    conditionallyGeneratePariticpantCounterElement(leaders.allParticipants ? leaders.allParticipants : leaders.totalParticipants);
    
    const breakpoints = getBreakpoints();

    for (let i = 0; i < breakpoints.cols; i++) {
      const column = document.createElement('div');
      column.classList.add('col');

      for (var j = 0; j < breakpoints.rows; j++) {
        index = i * breakpoints.rows + j
        const participant = topParticipants[index];
        if (participant) {
          generateParticipantDomElement(column, topParticipants[index], index);
        } else {
          generateParticipantDomElement(column, null, index);
        }
      }
      leaderboard.appendChild(column);
      setLeaderboardTitle(breakpoints.total);
    }
  }

  function setLeaderboardTitle (total) {
    const title = i18n.getTranslatedContent('leaderboard', null);
    const detail = i18n.getTranslatedContent('counter', total);
    qs('#resultText').textContent = title + detail;
  }

  function getBreakpoints () {
    const breakpoints = {
      small: {
        cols: 1,
        rows: 10,
        total: 10,
      },
      medium: {
        cols: 2, 
        rows: 10,
        total: 20,
        minWidth: 800,
      },
      large: {
        cols: 4,
        rows: 5, 
        total: 20,
        minWidth: 1600,
      }
    }
    const width = window.innerWidth;

    if (width > breakpoints['large']['minWidth']) return breakpoints['large']
    if (width > breakpoints['medium']['minWidth']) return breakpoints['medium']
    return breakpoints['small']
  }

  function conditionallyGeneratePariticpantCounterElement (totalParticipants) {
    if (!activationConfig.custom.enableTotalParticipantsCounter) return;
    
    const headerEl = qs('.box-header');
    
    const newCounterWrapperEl = document.createElement('div');
    newCounterWrapperEl.classList.add('total-participants');
    
    const counterEl = document.createElement('div');
    counterEl.classList.add('user-box');
    counterEl.textContent = totalParticipants.toLocaleString('de-DE');
    
    newCounterWrapperEl.appendChild(counterEl);

    const oldCounterWrapperEl = headerEl.querySelector('.total-participants');
    if (oldCounterWrapperEl) oldCounterWrapperEl.remove();
    headerEl.prepend(newCounterWrapperEl);
  }

  function getQuestSeriesEnd (start, duration, maxSeries) {
    console.log(start, duration, maxSeries);
    const seriesCount = getQuestSeriesNumber(start, duration, maxSeries)
    return start + (duration * seriesCount)
  }
  
  /**
   * Check what series is currently being played based on the quest series duration and the Moment start time
   */
  function getQuestSeriesNumber (start, duration, maxSeries) {
    const now = new Date().getTime()
    const numberOfSeries = Math.ceil((now - start) / duration)
    return maxSeries === 0 ? numberOfSeries : Math.min(maxSeries, numberOfSeries)
  }

  function setQuestCountdown(start, duration, maxSeries) {
    var now = new Date().getTime();
    countdownEnd = getQuestSeriesEnd(start, duration, maxSeries);
    console.log(countdownEnd);
    // start the countdown if not over 
    if (now < countdownEnd) {
      interval = setInterval(countdown, 500);
      // check the new endTime once the series is over
      setTimeout(function () {
        setQuestCountdown(start, duration, maxSeries)
      }, countdownEnd - now + 2000);
    }
  }
  function countdown() {
    var now = new Date().getTime();
    var distance = countdownEnd - now;
    var timeString = '00:00:00'

    if (distance < 0) {
      clearInterval(interval);
      showCountdownTime(timeString);
      return;
    }

    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    timeString = padLeft(days * 24 + hours) + ':' + padLeft(minutes) + ':' + padLeft(seconds);
    // show new time only if smaller than the currren time
    if (timeString !== currentTimeString && now > currentTime) {
      currentTimeString = timeString;
      currentTime = now;
      showCountdownTime(timeString);
    }
  }

  function padLeft(value) {
    return value < 10 ? '0' + String(value) : value
  }
  function showCountdownTime(timeString) {
    var count = document.createElement('div');
    count.classList.add('countdown');
    for(var c = 0; c < timeString.length; c++) {
      let div = document.createElement('div');
      div.classList.add(timeString.charAt(c) === ':' ? 'divider' : 'time-box');
      div.textContent = timeString.charAt(c);
      count.appendChild(div);
    }
    qs('.countdown').replaceWith(count)
  }
  function translatePageContent(lang) {
    i18n = new Translator(lang);
    i18n.tContent(document.documentElement);
  }

  function qs(selector, element) {
    return (element || document).querySelector(selector);
  }
  function sanitize(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      "/": '&#x2F;',
      "`": '&grave;',
      "(": '&#40;',
      ")": '&#41;',
      "{": "&#123;"
    };
    const reg = /[&<>"'/]/ig;
    return String(text).replace(reg, (match) => (map[match]));
  }
}