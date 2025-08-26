function iframeLoaded() {
    document.getElementById("frame").contentWindow.postMessage({
        "messageSource": "STAGECAST_SDK",
        "config": momentData
    }, '*');
}

window.onload = onResize;
window.onresize = onResize;

function onResize() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}