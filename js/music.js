const Music = (() => {
  let audio = null;
  let playing = false;
  let currentTrack = 0;

  const tracks = [
    { name: 'Forgotten Path', file: 'assets/music/forgotten_path.ogg', author: 'johndekale', license: 'CC0' },
    { name: 'On The Offensive', file: 'assets/music/8bit-OnTheOffensive.ogg', author: 'Wolfgang_', license: 'CC0' },
    { name: 'Raspberry Jam', file: 'assets/music/raspberry_jam.ogg', author: 'congusbongus', license: 'CC0' },
  ];

  function createAudio() {
    if (audio) { audio.pause(); audio = null; }
    audio = new Audio();
    audio.loop = true;
    audio.volume = 0.3;
    audio.src = tracks[currentTrack].file;
    audio.addEventListener('ended', () => {
      currentTrack = (currentTrack + 1) % tracks.length;
      audio.src = tracks[currentTrack].file;
      if (playing) audio.play().catch(() => {});
    });
    audio.addEventListener('error', () => {
      console.warn('Music failed to load:', tracks[currentTrack].name);
      currentTrack = (currentTrack + 1) % tracks.length;
      if (playing) {
        audio.src = tracks[currentTrack].file;
        audio.play().catch(() => {});
      }
    });
  }

  function start() {
    if (playing) return;
    playing = true;
    if (!audio) createAudio();
    audio.play().catch(() => {});
  }

  function stop() {
    playing = false;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  function next() {
    currentTrack = (currentTrack + 1) % tracks.length;
    if (audio) {
      audio.src = tracks[currentTrack].file;
      if (playing) audio.play().catch(() => {});
    }
  }

  function isPlaying() {
    return playing;
  }

  function getCurrentTrack() {
    return tracks[currentTrack];
  }

  function toggle() {
    if (playing) stop(); else start();
  }

  return { start, stop, isPlaying, toggle, next, getCurrentTrack, tracks };
})();
