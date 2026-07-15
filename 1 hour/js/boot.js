const Boot = (() => {
  const bootScreen = document.getElementById('boot-screen');
  const bootText = document.getElementById('boot-text');
  const bootProgress = document.getElementById('boot-progress');
  const bootProgressBar = document.getElementById('boot-progress-bar');
  const os = document.getElementById('os');

  const lines = [
    'RETRO BIOS v1.0 (c) 2026 RetroOS',
    '',
    'Memory Test: 640K OK',
    'Detecting Hardware...',
    '  CPU: RetroChip 8-bit @ 4.77 MHz',
    '  GPU: PixelVGA 256 Colors',
    '  RAM: 640K Conventional',
    '  SND: PC-Speaker Compatible',
    '',
    'Loading RetroOS Kernel...',
    '  Mounting virtual filesystem... OK',
    '  Loading window manager... OK',
    '  Loading input drivers... OK',
    '  Initializing display... OK',
    '',
    'Starting RetroOS...',
  ];

  let lineIndex = 0;
  let charIndex = 0;
  let currentText = '';

  function typeLine() {
    if (lineIndex >= lines.length) {
      startProgress();
      return;
    }

    const line = lines[lineIndex];
    if (charIndex < line.length) {
      currentText += line[charIndex];
      bootText.textContent = currentText;
      charIndex++;
      setTimeout(typeLine, 8 + Math.random() * 12);
    } else {
      currentText += '\n';
      bootText.textContent = currentText;
      lineIndex++;
      charIndex = 0;
      setTimeout(typeLine, 40 + Math.random() * 60);
    }
  }

  function startProgress() {
    bootProgress.style.display = 'block';
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 8 + 2;
      if (progress >= 100) {
        progress = 100;
        bootProgressBar.style.width = '100%';
        clearInterval(interval);
        setTimeout(finishBoot, 400);
      } else {
        bootProgressBar.style.width = progress + '%';
      }
    }, 80);
  }

  function finishBoot() {
    bootScreen.classList.add('hidden');
    os.classList.remove('hidden');
    if (typeof Desktop !== 'undefined') {
      Desktop.init();
    }
  }

  function start() {
    window._retroBootTime = Date.now();
    bootText.textContent = '';
    currentText = '';
    lineIndex = 0;
    charIndex = 0;
    setTimeout(typeLine, 500);
  }

  return { start };
})();

document.addEventListener('DOMContentLoaded', () => {
  Boot.start();
});
