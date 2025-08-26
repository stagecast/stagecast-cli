# Speed Challenge - Whack-a-mole

## The moment
In this moment users gets to compete against other users in the game of Whack-a-mole. The user gets to first enter their name after which the game starts. Moles appear in the circles and the users objective is to try and click on as many moles as possible. For each mole the user clicks on the user gets a point. The moles appear more rapidly as time goes on and their duration is lowered as well. After the timer runs out, players are presented with a leaderboard, their current highscore and their rank as well as a button to play the game again.

## How the moment is implemented
- This moment is implemented with vue.js and is mostly made up of two components; GameWrapper and Game. 
- The GameWrapper basically handles everything except for the game. It handles the communication with the MDK, sets up the timer for the moment, gets the user's inputed name, shows the leaderboard when the game is over, etc.
- As the name suggest, the game component handles the game. It handles the timer during the game, spawning of moles, when moles disappear and the abillity to click on the moles. 
- The moles are generated and spawned randomly, so each round is different from the other and from everybody else's.

## What is customizable?
- The image that represents the mole (currently all moles have the same image).
- The image that shows the price.
- The duration of the Moment (in milliseconds).
- The duration of a game (in milliseconds).
- the result page main text. (not displayed)
- The Moment theme (light or dark)
- The Moment backgorund color 

### The custom object can look as follows
```
"custom": {
  "customImage": [],
  "prizeImage" : [],
  "timerDuration": 300000,
  "gameDuration": 35000,
  "backgroundColor": "#503AF2",
  "theme": "light",
  "resultText": "Play the Speed Challenge!"
}
```
**Note:**
For the resultscreen the customImage is used for the image that shows the prize.


Elements to be added
- Multi round leaderboard
- background image/color
- add prize and quest
- add prize to howto section 
- update howto section 
- unify CSS
- add prize options
- claim prize
