
const activationConfig = {"hasModeration":false,"hasLiveControls":false,"hasControls":false,"sponsor":{},"icons":["https://d1r0op4ur44djw.cloudfront.net/bundles/com.stagecast.whack-a-mole/3.1.3/assets/whack-a-mole.250x150.jpg","https://d1r0op4ur44djw.cloudfront.net/bundles/com.stagecast.whack-a-mole/3.1.3/assets/whack-a-mole.500x300.jpg","https://d1r0op4ur44djw.cloudfront.net/bundles/com.stagecast.whack-a-mole/3.1.3/assets/whack-a-mole.1000x600.jpg"],"bundleId":"com.stagecast.whack-a-mole","screens":{"stage":"optional","mobile":"mandatory"},"showSponsor":false,"shareUrl":"https://join.staging.stagecast.io?code=6042","sharingEnabled":true,"custom":{"enableTotalParticipantsCounter": true, "enableLeaderboard":true,"gameButtonImage":[],"resultText":"Play the Speed Challenge!"},"language":"en","branding":{"theme":"dark","backgroundColor":["#7a85ff"]},"showCta":false,"plugins":["sponsor","cta","quest","prize"],"showPrize":false,"quest":{"title":"Whack a Mole","type":"simple","seriesDuration":3600000,"challengeDuration":30000,"challengesPerRound":1,"maxRoundsPerSeries":0,"maxSeries":1,"moderated":false,"challengesCount":1}}
const roomConfig = {"presentation":{"activationMessage":"Scan the QR code or join at www.stagecast.io #6042.","showMessage":true,"showQRCode":true,"logos":[]},"join":{"background":"https://d1r0op4ur44djw.cloudfront.net/api/assets/placeholder_background.jpg","header":"https://d1r0op4ur44djw.cloudfront.net/api/assets/placeholder_header.jpg","title":"Welcome to “2024 Delayed Signups”!","description":"Stay tuned for upcoming activities. As soon as the host starts an activity you will be able to participate here.","theme":"light","signUpEnabled":false}}
const environment = 'k8staging'
const host = 'console.staging.stagecast.io'
const cdnHost = 'd1r0op4ur44djw.cloudfront.net'
const webSocketHost = 'console.staging.stagecast.io'
const analyticsHost = 'analytics.staging.stagecast.io'
const roomCode = '6042';
const shouldLog = true
const shouldPoll = true
const hosts = {host, cdnHost, analyticsHost, webSocketHost}

window.onload = onResize;
window.onresize = onResize;

function onResize() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', vh + 'px');
}

function documentReady(callbackFunction) {
   if(document.readyState != 'loading')
     callbackFunction(event)
   else
     document.addEventListener("DOMContentLoaded", callbackFunction)
 }

function iframeLoaded(){
  document.getElementById('frame').contentWindow.postMessage({
    messageSource: 'STAGECAST_SDK',
    config: {
      environment: environment,
      userId: 'p_A567E1E_1738614375090',
      token: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOlsiY29uc29sZSJdLCJjcmVhdCI6ImZpbGlwcG8uYm9pYW5pMkBnbWFpbC5jb20iLCJleHAiOjE3NDEyMDYzNzUsImlzcyI6InN0Z2NzdCIsInN1YiI6InBfQTU2N0UxRV8xNzM4NjE0Mzc1MDkwIiwidXQiOiJwcmVzZW50YXRpb24ifQ.1vQlWi-vQu_UArX9NHhrIZCAi5OFzvLssmiHBoWSS8A',
      activationId: 'AF8AD7A3-9F7D-427B-BBF6-C1B271B72DD6',
      activationConfig: activationConfig,
      roomConfig: roomConfig,
      roomId: 'A567E1E2-48A0-4DED-AE56-F2B730CB9B45',
      code: '6042',
      activeChangeTime: '1738614496311',
      hosts: hosts,
      disableLogs: !shouldLog,
      isConsole: false,
    }
  }, '*');
}
