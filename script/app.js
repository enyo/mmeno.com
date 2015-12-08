var phrases = [], allTimeElements = document.querySelectorAll('span[data-time]');


var events = {
  appear: {
    time: 27, active: false, in: function () {
      document.querySelector('.intro').classList.add('lyrics-visible');
    }, out: function () {
      document.querySelector('.intro').classList.remove('lyrics-visible')
    }
  },
  switchVerse: {
    time: 73.5, active: false, in: function () {
      document.querySelector('.block').classList.add('second-verse');
    }, out: function () {
      document.querySelector('.block').classList.remove('second-verse');
    }
  },
  blackOut: {
    time: 73.28, active: false, in: function () {
      document.querySelector('.intro').classList.add('blackout');
    }, out: function () {
      document.querySelector('.intro').classList.remove('blackout');
    }
  }
};

function handleEvent(time) {
  for (var eventName in events) {
    if (events.hasOwnProperty(eventName)) {
      var event = events[eventName];
      if (time > event.time && !event.active) {
        event.active = true;
        event.in();
      }
      else if (time < event.time && event.active) {
        event.active = false;
        event.out();
      }
    }
  }
}


function parseTimeForElements(elements, timeShift) {
  for (var i = 0, span; span = elements[i]; i++) {
    var time = parseFloat(span.getAttribute('data-time'));
    if (isNaN(time)) break;

    if (timeShift) time += timeShift;

    _parseTimeForElement(time, span);
  }
}
function _parseTimeForElement(time, element) {
  var length = phrases.push({
    start: time,
    end: time + 2,
    element: element,
    heart: element.querySelector('.heart')
  });

  if (length > 1) { // Not the first element, so we want to set the previous end time to this start time
    var prevPhrase = phrases[length - 2];
    if (time != prevPhrase.start && time > prevPhrase.start) { // But only if they don't start at the same time
      prevPhrase.end = Math.min(prevPhrase.end, time);
    }
  }
}

parseTimeForElements(document.querySelectorAll('.block__lyrics span[data-time]'));
parseTimeForElements(document.querySelectorAll('.block__lyrics--second-verse span[data-time]'));
var chorusElements = document.querySelectorAll('.block__lyrics--chorus span[data-time]');
parseTimeForElements(chorusElements, 0);
// Adding the same lyrics for the two other choruses
parseTimeForElements(chorusElements, 71.72);
parseTimeForElements(chorusElements, 89.6);

function highlightPhrase(time) {
  for (var i = 0, span; span = allTimeElements[i]; i++) {
    span.classList.remove('highlighted');
  }

  for (var ii = 0, phrase; phrase = phrases[ii]; ii++) {
    if (phrase.start < time && phrase.end > time) {
      phrase.element.classList.add('highlighted');
      if (phrase.heart && !phrase.heart.classList.contains('beat')) {
        !function(heart) {
          heart.classList.add('beat');
          setTimeout(function() { heart.classList.remove('beat') }, 4000);
        }(phrase.heart);
      }
    }
  }
}

function shakeOnTime(time) {
  for (var i = 0; i < shakeTimes.length; i++) {
    var shakeTime = shakeTimes[i];
    if (time > shakeTime && time < shakeTime + 0.5) {
      shake();
    }
  }
}

var shakeTimes = [10.52, 127.04], lastShake = 0;
var introElement = document.querySelector('.intro');
function shake() {
  if (new Date().getTime() < lastShake + 1000) return;

  lastShake = new Date().getTime();
  var _shake = function (strength, reset) {
    var x, y, opacity;
    if (reset) {
      x = 0;
      y = 0;
      opacity = 1;
    }
    else {
      var xVariance = strength * 4, yVariance = strength * 25;
      x = xVariance / 2 - Math.random() * xVariance;
      y = yVariance / 2 - Math.random() * yVariance;
      opacity = Math.random() * 0.5 + 0.5;
    }
    introElement.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    introElement.style.opacity = opacity;
  };
  var delay = 30, steps = 15;
  for (var i = 0; i < steps; i++) {
    (function (i) {
      setTimeout(function () {
        _shake((steps - i) / steps)
      }, i * delay);
    })(i);
  }
  setTimeout(function () {
    _shake(0, true);
  }, i * delay);
}

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '720',
    width: '1280',
    videoId: 'ph1C-dtR8aM',
    playerVars: {
      modestbranding: 1,
      showinfo: 0,
      controls: 1,
      rel: 0
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING) {
    startFollowingTime();
  }
  else if (event.data == YT.PlayerState.PAUSED || event.data == YT.PlayerState.ENDED) {
    stopFollowingTime();
  }
}

var intervalId, intervalDelay = 25;


function startFollowingTime() {
  if (!intervalId) {
    document.querySelector('.player').style.opacity = 1;
    intervalId = setInterval(_updateTime, intervalDelay);
  }
}

var lastCurrentTime = -1, exactTime;
function _updateTime() {
  var currentTime = player.getCurrentTime();
  if (currentTime != lastCurrentTime) {
    lastCurrentTime = exactTime = currentTime;
  }
  else {
    exactTime += intervalDelay / 1000;
  }
  highlightPhrase(exactTime);
  shakeOnTime(exactTime);
  handleEvent(exactTime);
}

function stopFollowingTime() {
  clearInterval(intervalId);
  intervalId = null;
}

function stopVideo() {
  player.stopVideo();
}

