<template>
  <div class="whack-a-mole">
    <div class="timer-box">
        <div class="timer-digit">{{timeLeft[0]}}</div>
        <div class="timer-digit">{{timeLeft[1]}}</div>
        <div class="timer-colon">:</div>
        <div class="timer-digit">{{timeLeft[2]}}</div>
        <div class="timer-digit">{{timeLeft[3]}}</div>
    </div>
    <div id="whack-a-mole-box">
      <div class="instruction-text text-bold">
        {{ instructions[status] }}
      </div>
      <div class="mole-container" :class="{ hidden: !showMolesBoard }" ref="moleContainer">
        <template v-for="(mole, index) in moles">
          <button ref="moleButton" :key="index" class="mole" :class="{ shown: mole.active, golden: mole.golden }">
            <div class="mole-content">
              <img draggable="false" class="mole-img" alt="mole" v-bind:src="options.gameButtonImage" v-if="mole.active">
              <transition name="appear">
                <div v-show="showPoints[index]" class="fading-points">+{{ scoreUpdate }}p</div>
              </transition>
            </div>
          </button>
      </template>
      </div>
    </div>
  </div>
</template>

<script>
const timeouts = [].fill(-1, 0, 8)

export default {
  name: 'Game',
  props: {},
  data: function (){
    return {
      showMolesBoard: false,
      gameIsOver: false,
      duration: 0,
      endTime: undefined,
      options: {},
      scoreUpdate: 0,
      scoreBoost: 1,
      roundScore: 0,
      status: 'click',
      instructions: {
        click: this.$t('game.click'),
      },
      moles: [
        { active: false, golden: false },
        { active: false, golden: false },
        { active: false, golden: false },
        { active: false, golden: false },
        { active: false, golden: false },
        { active: false, golden: false },
        { active: false, golden: false },
        { active: false, golden: false },
        { active: false, golden: false },
      ],
      showPoints: [],
      totalClicks: 0,
      interval: undefined,
      timePassed : 0,
      moleGeneration: undefined,
      goldenMoleGeneration: undefined,
    }
  },
  computed: {
    /**
    * Calculates how much time is left. When there is no time left. Emits signal gameOver and stops moles from generating.
    * TODO: refactor this bit of code 
    */
    timeLeft () {
      // timeRemaining is in seconds.
      let timeRemaining = this.duration / 1000 - this.timePassed;
      // Get current time
      let now = Date.now();
      // If either the timer for the game is finished or the timer for the moment is finished, the game ends.
      if (timeRemaining <= 0 || this.endTime - now < 0) {
        // Stop timer and moleGeneration.
        clearInterval(this.interval);
        clearTimeout(this.moleGeneration);
        clearInterval(this.goldenMoleGeneration);
        // we need to check whether endTime is undefined because timeLeft is a computed property
        if (typeof this.endTime !== 'undefined') {
          this.gameOver()
        }
      }
      let minutes = Math.floor(timeRemaining / 60);
      let seconds = timeRemaining % 60;
      if (seconds < 10){
        seconds = '0' + String(seconds);
      }
      if (minutes < 10){
        minutes = '0' + String(minutes);
      }
      return String(minutes) + String(seconds);
    },
    /**
    * Defines the time between generation of moles. (In milliseconds)
    */
    moleGenTime () {
      //let timePercent = this.timeLeft / 20;
      let timePercent = this.timeLeft / (this.duration / 1000);
      if(timePercent >= 0.95)
        return 1000;
      if(timePercent >= 0.85)
        return 900;
      else if(timePercent >= 0.75)
        return 800;
      else if(timePercent >= 0.65)
        return 700;
      else if(timePercent >= 0.55)
        return 600;
      else if(timePercent >= 0.45)
        return 500;
      else
        return 400;
    },
    /**
    * Defines the time afterwhich a mole disappear. (In milliseconds)
    */
    moleTimeout () {
      let timePercent = (parseInt(this.timeLeft) * 1000) / (this.duration);
      if (timePercent >= 0.85)
        return 1200;
      else if (timePercent >= 0.75)
        return 1100;
      else if (timePercent >= 0.65)
        return 1000;
      else
        return 900;
    }
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.setMoleBoardHeight);
  },
  methods: {
    /**
    * At start of game, start generation of moles and start the timer.
    */
    startGame (duration, options) {
      this.duration = duration  
      this.endTime = new Date().getTime() + duration
      this.options = options
      this.checkBoardWidth();
      this.addMoleListeners();
      this.generateMoles();
      this.startGameTimer();
      this.startGeneratingGoldenMoles();
    },
    gameOver () {
      this.resetMoles()
      this.gameIsOver = true
      // Signal that the game is over
      this.$emit('gameOver', this.totalClicks);
    },
    addMoleListeners() {
      this.$refs.moleButton.forEach((el, index) => {
        el.addEventListener('mousedown', () => {
          this.updateScore(index)
        })
      })
    },
    checkBoardWidth() {
      const moleContainer = this.$refs.moleContainer;
      let width = moleContainer.clientWidth;
      moleContainer.style.height = width + 'px';
      this.showMolesBoard = true
      window.addEventListener('resize', this.setMoleBoardHeight);
    },
    setMoleBoardHeight () {
      const moleContainer = this.$refs.moleContainer;
      let width = moleContainer.clientWidth;
      moleContainer.style.height = width + 'px';
    },
    resetMoles () {
      this.$set(this.moles, [
        { active: false, golden: false },
        { active: false, golden: false },
        { active: false, golden: false },
        { active: false, golden: false },
        { active: false, golden: false },
        { active: false, golden: false },
        { active: false, golden: false },
        { active: false, golden: false },
        { active: false, golden: false }
      ])
    },
    /**
    * When mole has been clicked, Updates the current score.
    */
    updateScore (moleId) {
      if (this.gameIsOver) return;
      this.totalClicks++;
      if (this.moles[moleId].active === true) {
        const base = this.moles[moleId].golden ? 3 : 1;
        this.scoreUpdate = base * this.scoreBoost;
        // If mole is not golden scoreBoost is increased and mole disappears.
        if (!this.moles[moleId].golden) {
          clearTimeout(timeouts[moleId])
          this.removeMole(moleId)
          this.showPoints[moleId] = true;
          setTimeout(() => { this.showPoints[moleId] = false }, 300);
          this.scoreBoost++;
        } 
        if (!this.gameIsOver) {
          this.$emit("updateScore", {update: this.scoreUpdate, type: this.moles[moleId].golden ? 'gold': 'normal' });
        }
      } else {
        this.scoreBoost = 1
      }
    },
    /**
    * Generates the moles.
    */
    generateMoles() {
      // Sets a random mole to active.
      const moleId = Math.floor(Math.random() * 9);
      // If that mole is not active, activate it, make it disappear after a while and generate a new mole after some time.
      if (!this.moles[moleId].active && !this.showPoints[moleId]) {
        this.$set(this.moles, moleId, { active: true, golden: false })

        // Sets the time after which the mole disappear.
        timeouts[moleId] = setTimeout(() => {
          this.removeMole(moleId);
        }, this.moleTimeout);
        // Generates a new mole after a certain time.
        this.moleGeneration = setTimeout(this.generateMoles, this.moleGenTime);
        // If mole is already active then immidiatly try and generate a new mole.
      } else {
        this.generateMoles()
      }
    },
    /**
    * Hides mole.
    */
    removeMole(id) {
      this.$set(this.moles, id, { active: false, golden: false })
    },
    /**
     * Start the game timer.
     */
    startGameTimer() {
      this.interval = setInterval(() => {
        this.timePassed += 1;
      }, 1000);
    },
    /**
     * Starts generation of golden moles. Every five second a golden mole spawns.
     */
    startGeneratingGoldenMoles(){
      this.goldenMoleGeneration = setInterval(() => {
        this.generateGoldenMoles();
      }, 5000);
    },
    /**
     * Generates a golden mole. It disappear after 3 seconds.
     */
    generateGoldenMoles() {
      // Sets a random mole to active.
      const moleId = Math.floor(Math.random() * 9);
      if (!this.moles[moleId].active && !this.showPoints[moleId]) {
        this.$set(this.moles, moleId, { active: true, golden: true })
        
        // After 3 seconds the mole is removed.
        timeouts[moleId] = setTimeout(() => {
          this.removeGoldenMole(moleId);
        }, 3000);
        // If mole is already active then immidiatly try and generate a new mole.
      } else {
        this.generateGoldenMoles();
      }
    },
    /**
     * Hides golden mole.
     */
    removeGoldenMole(id) {
      this.$set(this.moles, id, { active: false, golden: false })
    }
  }
}
</script>

<style lang="scss">
  @import "../styles/variables";
  .whack-a-mole {
    position: relative;
    padding-bottom: 16px;
    color: #fff;
    
    .fading-points {
      color: #FFFFFF;
      background: #34BE7E;
      height: 42px;
      width: 42px;
      position: absolute;
      line-height: 25px;
      font-size: 18px;
      padding: 8px 0;
      text-align: center;
      border-radius: 50%;
      font-weight: bold;
      opacity: 0;
      pointer-events: none;

      &.gold {
        background: linear-gradient(90deg, #eec868 0%, #e49358 100%);
      }
    }
    .timer-box {
      width: 100%;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-color-5);

      .timer-digit {
        padding: 4px;
        margin: 2px;
        font-family: Source Sans Pro;
        font-style: normal;
        font-weight: 600;
        font-size: 24px;
        line-height: 16px;
        color: var(--text-color-1);
        background: rgba(255,255,255,0.1);
        box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.15);
        border-radius: 2px;
      }
      .timer-colon {
        font-family: Source Sans Pro;
        font-style: normal;
        font-weight: 600;
        font-size: 24px;
        line-height: 20px;
        color: var(--text-color-1);
        margin:1px;
      }
    }
    .instruction-text {
      text-align: center;
      padding-top: 16px;
      line-height: 17px;
      font-size: 20px;
      margin-bottom: 15px;
      font-weight: $font-weight-normal;
      color: var(--text-color-1);
    }
    .mole-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-content: space-around;
      width: calc(100% - 16px);
      margin: 0 auto;
      min-height: 300px;
    }
    .mole {
      width: 30.8%;
      height: 30.8%;
      max-width: 113px;
      max-height: 113px;
      margin: 3px;
      padding: 0;
      border-radius: 50%;
      background-color: var(--bg-color-2);
      border: 3px solid var(--input-color-2);
      overflow: hidden;
      outline: none;
      user-select: none;
      text-align: center;
      text-decoration: none;
      -moz-appearance: none;
      -webkit-appearance: none;

      &:active {
        border: 3px solid var(--bg-color-2-inverted);
        filter: brightness(90%);

        .mole-content {
          transform: scale(0.5);
        }
      }

      &.golden {
        // background: #FFD70020;
        border: 3px solid transparent;
        animation: reduceBorderWidth 2.8s linear;

        &:active {
          border: 3px solid transparent;

          .mole-content {
            border: 3px solid transparent;
            transform: scale(0.85);
          }
        }
      }
      
      .mole-content {
        transition: all 0.3s ease-out;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        border: 3px solid var(--bg-color-2);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        user-select: none;
        pointer-events: none;

        &.hidden {
          visibility: hidden;
        }
      }
    }
  }
  .mole-img {
    max-height: 100%;
    max-width: 100%;
    object-fit: cover;
  }
  .opacity {
    opacity: 0.75;
  }
  .appear-enter-active {
    animation: bounceAndFade .5s;
  }
  .appear-leave-active {
    opacity: 0;
  }
  @keyframes bounceAndFade {
    0% {
      transform: scale(0.5);
    }
    4% {
      transform: scale(1.15);
    }
    8% {
      transform: scale(1);
    }
    25% {
      opacity: 1;
      transform: translateY(0%)
    }
    100% {
      opacity: 0;
      transform: translateY(-25%)
    }
  }
  @keyframes reduceBorderWidth {
    0%{
      box-shadow: 0px 0px 0px 9px #FFD700;
    }
    100%{
      box-shadow: 0px 0px 0px 0px #FFD700;
    }
  }
</style>
