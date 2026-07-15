const Sound = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctx;
  }

  function beep(freq, duration, type, volume) {
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type || 'square';
      osc.frequency.value = freq || 800;
      gain.gain.value = volume || 0.08;
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + (duration || 0.1));
      osc.stop(c.currentTime + (duration || 0.1));
    } catch (e) {}
  }

  function play(sound) {
    switch (sound) {
      case 'open':
        beep(600, 0.05, 'square', 0.06);
        setTimeout(() => beep(900, 0.08, 'square', 0.06), 50);
        break;
      case 'close':
        beep(900, 0.05, 'square', 0.06);
        setTimeout(() => beep(500, 0.08, 'square', 0.06), 50);
        break;
      case 'click':
        beep(1000, 0.03, 'square', 0.04);
        break;
      case 'error':
        beep(200, 0.15, 'square', 0.08);
        break;
      case 'score':
        beep(800, 0.06, 'square', 0.06);
        setTimeout(() => beep(1000, 0.06, 'square', 0.06), 60);
        setTimeout(() => beep(1200, 0.1, 'square', 0.06), 120);
        break;
      case 'gameover':
        beep(400, 0.15, 'square', 0.08);
        setTimeout(() => beep(300, 0.15, 'square', 0.08), 150);
        setTimeout(() => beep(200, 0.3, 'square', 0.08), 300);
        break;
      case 'type':
        beep(800 + Math.random() * 200, 0.02, 'square', 0.03);
        break;
      case 'move':
        beep(300, 0.02, 'square', 0.04);
        break;
      case 'rotate':
        beep(500, 0.04, 'square', 0.04);
        break;
      case 'line':
        beep(600, 0.06, 'square', 0.06);
        setTimeout(() => beep(800, 0.06, 'square', 0.06), 60);
        setTimeout(() => beep(1000, 0.06, 'square', 0.06), 120);
        setTimeout(() => beep(1200, 0.1, 'square', 0.06), 180);
        break;
      case 'hit':
        beep(200, 0.06, 'triangle', 0.08);
        break;
    }
  }

  return { play, beep };
})();
