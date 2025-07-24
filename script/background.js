  let zIndexCounter = 1000;
  const dayMode = 'assets/daymode.json';
  const nightMode = 'assets/nightmode.json';

  let currentMode = localStorage.getItem('theme') || 'day';

  function toggleMode() {
    const icon = document.getElementById('mode-icon');
    const lottieContainer = document.getElementById('lottie-bg');
      currentMode = currentMode === 'day' ? 'night' : 'day';
      localStorage.setItem('theme', currentMode);
      playSound(
      currentMode === 'day'
    ? 'audio/nightmodetoggle.mp3'
    : 'audio/daymodetoggle.mp3'
    
);


    icon.classList.add('rotate');
    lottieContainer.classList.remove('fade-in');
    lottieContainer.classList.add('fade-out');

    setTimeout(() => {
      applyMode(currentMode);
      icon.classList.remove('rotate');
    }, 400);
  }

  function applyMode(mode) {
    const icon = document.getElementById('mode-icon');
    const lottieContainer = document.getElementById('lottie-bg');
    const lottiePath = mode === 'night' ? nightMode : dayMode;

    document.body.classList.toggle('dark', mode === 'night');
    icon.className = mode === 'night' ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill';
    icon.style.color = mode === 'night' ? '#fff' : '#000';

    lottieContainer.innerHTML = '';
    lottie.loadAnimation({
      container: lottieContainer,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: lottiePath,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
      }
    });

    lottieContainer.classList.remove('fade-out');
    lottieContainer.classList.add('fade-in');
    
  }

  applyMode(currentMode);

  function playClickSound() {
  playSound('audio/click.mp3');
  backgroundAudio.play();
}

let isAudioEnabled = true;
let backgroundAudio = null; // keep track of background music

function toggleAudioSetting() {
  isAudioEnabled = !isAudioEnabled;
  const icon = document.getElementById('audio-toggle-icon');
  icon.className = isAudioEnabled ? 'bi bi-volume-up-fill' : 'bi bi-volume-mute-fill';

  if (!isAudioEnabled && backgroundAudio) {
    backgroundAudio.pause();
    backgroundAudio.currentTime = 0;
  }

  if (isAudioEnabled && backgroundAudio) {
    backgroundAudio.play();
  }
}

function playSound(filePath, loop = false, isBackground = false) {
  if (isAudioEnabled) {
    const audio = new Audio(filePath);
    audio.loop = loop;
    audio.play();

    if (isBackground) {
      backgroundAudio = audio;
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  playSound('audio/nightmode.mp3', true, true); 
});

 document.getElementById("close-warning").addEventListener("click", () => {
  backgroundAudio.play();
  document.getElementById("mobile-warning").style.display = "none";
});


