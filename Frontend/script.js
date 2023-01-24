let pianoContainer = document.querySelector('.piano-container');

// create synth

const synth = new Tone.PolySynth(Tone.Synth).toDestination();

// create notes
const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// decl start octave
let startOctave = 4;

// CHANGE OCTAVE FUNCTIONS

// every time octave is changed
const octaveChange = () => {
  pianoContainer.innerHTML = '';
  createPiano();
  updateDOM();
};

// octave down function
const octaveDown = () => {
  if (startOctave > 1) {
    startOctave--;
  }
};
// octave down event listeners
document.querySelector('#octave-down').addEventListener('click', () => {
  octaveDown();
  octaveChange();
});
document.addEventListener('keydown', (e) => {
  if (e.key === '[') {
    octaveDown();
    octaveChange();
  }
});

// octave up function
const octaveUp = () => {
  if (startOctave < 6) {
    startOctave++;
  }
};
// octave up event listeners
document.querySelector('#octave-up').addEventListener('click', () => {
  octaveUp();
  octaveChange();
});
document.addEventListener('keydown', (e) => {
  if (e.key === ']') {
    octaveUp();
    octaveChange();
  }
});

// CREATING PIANO
const createPiano = () => {
  // number of octaves
  for (let k = 0; k < 2; k++) {
    for (let i = 0; i < notes.length; i++) {
      // defining if key has sharp
      let hasSharp = true;
      if (notes[i] === 'E' || notes[i] === 'B') {
        hasSharp = false;
      }
      // white keys
      let key = document.createElement('div');
      key.setAttribute('data-note', notes[i] + (k + startOctave));
      key.classList.add('white', 'key');
      pianoContainer.appendChild(key);
      // black keys
      if (hasSharp) {
        let key = document.createElement('div');
        key.setAttribute('data-note', notes[i] + '#' + (k + startOctave));
        key.classList.add('black', 'key');
        pianoContainer.appendChild(key);
      }
    }
  }
};
createPiano();

// decl DOM elements
let keydowns = {};
let keys;

// updating DOM
const updateDOM = () => {
  keys = document.querySelectorAll('.key');
  // defining keys pressed on keyboard interact
  keydowns = {
    z: 'C' + startOctave,
    s: 'C#' + startOctave,
    x: 'D' + startOctave,
    d: 'D#' + startOctave,
    c: 'E' + startOctave,
    v: 'F' + startOctave,
    g: 'F#' + startOctave,
    b: 'G' + startOctave,
    h: 'G#' + startOctave,
    n: 'A' + startOctave,
    j: 'A#' + startOctave,
    m: 'B' + startOctave,
    ',': 'C' + (startOctave + 1),
    q: 'C' + (startOctave + 1),
    l: 'C#' + (startOctave + 1),
    2: 'C#' + (startOctave + 1),
    '.': 'D' + (startOctave + 1),
    w: 'D' + (startOctave + 1),
    ';': 'D#' + (startOctave + 1),
    3: 'D#' + (startOctave + 1),
    '/': 'E' + (startOctave + 1),
    e: 'E' + (startOctave + 1),
    r: 'F' + (startOctave + 1),
    5: 'F#' + (startOctave + 1),
    t: 'G' + (startOctave + 1),
    6: 'G#' + (startOctave + 1),
    y: 'A' + (startOctave + 1),
    7: 'A#' + (startOctave + 1),
    u: 'B' + (startOctave + 1),
  };
  // mouse click event listener
  keys.forEach((key) => {
    key.addEventListener('click', () => {
      let note = key.dataset.note;
      synth.triggerAttackRelease(note, '16n');
      changeColor(note, 'rgb(54, 54, 54)', 'rgb(220, 220, 220)');
      setTimeout(() => changeColor(note, 'Black', 'White'), 200);
    });
  });
};
updateDOM();

// RECORDING
let recording = false;
let pressedKeys = new Set();
let keyPressTime = {};
let noteAndHeld = {};
let noteArr = [];
let startTime;
let timerId;
let time = 0;
let isPlaying = false;

// start recording - change button icon
document.querySelector('#record-btn').addEventListener('click', () => {
  if (!isPlaying) {
    recording = !recording;
    document.querySelector('#record-btn').innerHTML = recording
      ? '<svg xmlns="http://www.w3.org/2000/svg" fill="red" viewBox="0 0 24 24" class="w-6 h-6 stop"><path d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"/>'
      : '<svg height="50" width="35"><circle cx="25" cy="25" r="15" fill="white"/></svg>';
    startTimer();
  }
});

// NOTE PRESS FUNCTIONS

// key color change
const changeColor = (note, blackKeys, whiteKeys) => {
  let keyElement = document.querySelector(`[data-note="${note}"]`);
  for (let key in keydowns) {
    if (note === keydowns[key]) {
      keyElement.style.backgroundColor =
        note.length > 2 ? blackKeys : whiteKeys;
    }
  }
};

// playing with keyboard
// decl all keys pressed

// keydown event listener

document.addEventListener('keydown', (e) => {
  let note = keydowns[e.key];
  if (pressedKeys.has(note)) return;
  pressedKeys.add(note);
  keyPressTime[note] = Date.now();
  changeColor(note, '#363636', '#dcdcdc');
  synth.triggerAttack(note);
});

const startTimer = () => {
  if (!startTime) {
    noteArr = [];
    startTime = Date.now();
    timerId = setInterval(() => {
      time += 10;
    }, 10);
  } else {
    clearInterval(timerId);
    startTime = null;
    time = 0;
    console.log(noteArr);
  }
};

// keyup event listener
document.addEventListener('keyup', (e) => {
  let note = keydowns[e.key];
  pressedKeys.delete(note);
  let timeHeld = Date.now() - keyPressTime[note];
  for (let key in keydowns) {
    if (recording) {
      if (note === keydowns[key]) {
        noteAndHeld['note'] = note;
        noteAndHeld['held'] = timeHeld;
        noteAndHeld['time'] = time - timeHeld;
        noteArr.push(noteAndHeld);
        noteAndHeld = {};
      }
    }
  }
  changeColor(note, 'Black', 'White');
  synth.triggerRelease(note);
  keyPressTime[note] = Date.now() - keyPressTime[note];
});

const playSong = (song) => {
  let { time, note, held } = song;
  setTimeout(() => {
    synth.triggerAttack(note);
    changeColor(note, '#363636', '#dcdcdc');
    setTimeout(() => {
      synth.triggerRelease(note);
      changeColor(note, 'Black', 'White');
    }, held);
  }, time);
};

const playSvg = (btn, bool) => {
  btn.innerHTML = bool
    ? '<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" class="w-6 h-6 stop"><path d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"/>'
    : '<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" class="w-6 h-6"><path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"/></svg>';
};

let playBtn = document.querySelector('#play-btn');
playBtn.addEventListener('click', () => {
  isPlaying = !isPlaying;
  playSvg(playBtn, isPlaying);
  for (let i = 0; i < noteArr.length; i++) {
    if (isPlaying) playSong(noteArr[i]);
  }
});

// BACKEND COMS
let localHost = 'http://localhost:4000';
let signupLoginForm = document.querySelector('#login-signup-form');
let alerts = document.querySelector('#alerts');

signupLoginForm.addEventListener('submit', (e) => signupLogin(e));

let signupLogin = (e) => {
  e.preventDefault();
  let usernameValue = e.target[0].value;
  let passwordValue = e.target[1].value;
  let input = { username: usernameValue, password: passwordValue };
  // no input
  alerts.innerHTML =
    usernameValue === ''
      ? 'please enter a username'
      : passwordValue === ''
      ? 'please enter a password'
      : '';
  if (usernameValue === '' || passwordValue === '') return;
  // signup
  if (e.submitter.id === 'signup-btn') {
    axios.post(`${localHost}/signup`, input).then((res) => {
      alerts.innerHTML = res.data;
    });
  } else {
    // login
    axios.post(`${localHost}/login`, input).then((res) => {
      alerts.innerHTML = res.data;
    });
  }
};

let songSelect = document.querySelector('#song-selection');
let songList = {};

document.querySelector('#save-song-form').addEventListener('submit', (e) => {
  e.preventDefault();
  let songName = e.target[0].value;
  if (noteArr.length > 0) {
    songList[songName] = noteArr;
    let song = document.createElement('option');
    song.setAttribute('value', songName);
    song.classList.add('song');
    song.textContent = songName;
    songSelect.appendChild(song);
    updateDOM();
  } else {
    alerts.innerHTML = 'you must record a song!';
  }
});

let playSavedSongForm = document.querySelector('#play-saved-song');
let savedSongPlaying = false;
playSavedSongForm.addEventListener('submit', (e) => {
  e.preventDefault();
  song = songList[e.target[0].value];
  savedSongPlaying = !savedSongPlaying;
  playSvg(document.querySelector('#saved-play'), savedSongPlaying);
  for (let i = 0; i < song.length; i++) {
    if (savedSongPlaying) playSong(song[i]);
  }
});
