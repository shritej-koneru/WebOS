const SettingsApp = (() => {
  let settings = {
    crtColor: '#33ff33',
    scanlines: true,
    flicker: true,
    curvature: true,
    glow: true,
  };

  function load() {
    try {
      const saved = localStorage.getItem('retroos-settings');
      if (saved) Object.assign(settings, JSON.parse(saved));
    } catch (e) {}
    apply();
  }

  function save() {
    try {
      localStorage.setItem('retroos-settings', JSON.stringify(settings));
    } catch (e) {}
  }

  function apply() {
    const root = document.documentElement;
    root.style.setProperty('--crt-color', settings.crtColor);

    const overlay = document.getElementById('crt-overlay');
    if (overlay) {
      overlay.classList.toggle('no-scanlines', !settings.scanlines);
      overlay.classList.toggle('no-flicker', !settings.flicker);
    }

    const screen = document.getElementById('crt-screen');
    if (screen) {
      screen.style.borderRadius = settings.curvature ? '18px' : '0';
      screen.style.overflow = settings.curvature ? 'hidden' : '';
    }

    applyThemeColor(settings.crtColor);
    save();
  }

  function applyThemeColor(color) {
    document.querySelectorAll('.terminal-prompt, .window-title, #start-btn, .taskbar-item, .desktop-icon .label').forEach(el => {
      el.style.color = color;
    });
    document.querySelectorAll('.retro-window').forEach(el => {
      el.style.borderColor = color;
    });
    document.querySelectorAll('.window-titlebar').forEach(el => {
      el.style.borderBottomColor = color;
    });
    document.getElementById('taskbar').style.borderTopColor = color;
    document.getElementById('boot-progress-bar').style.background = color;
    document.getElementById('boot-progress').style.borderColor = color;
  }

  function open() {
    WindowManager.create({
      title: 'Settings',
      icon: '\u{2699}',
      width: 380,
      height: 380,
      content: createSettings,
      app: { destroy: () => {} }
    });
  }

  function createSettings(body) {
    const colors = [
      { name: 'Green', value: '#33ff33' },
      { name: 'Amber', value: '#ffaa00' },
      { name: 'Blue', value: '#33aaff' },
      { name: 'Cyan', value: '#33ffff' },
      { name: 'Red', value: '#ff3333' },
      { name: 'White', value: '#ffffff' },
    ];

    body.innerHTML = `
      <div class="settings-app">
        <div class="settings-section">
          <div class="settings-label">CRT Color</div>
          <div class="settings-colors"></div>
        </div>
        <div class="settings-section">
          <div class="settings-label">Scanlines</div>
          <label class="settings-toggle">
            <input type="checkbox" id="set-scanlines" ${settings.scanlines ? 'checked' : ''}>
            <span class="settings-toggle-slider"></span>
          </label>
        </div>
        <div class="settings-section">
          <div class="settings-label">Screen Flicker</div>
          <label class="settings-toggle">
            <input type="checkbox" id="set-flicker" ${settings.flicker ? 'checked' : ''}>
            <span class="settings-toggle-slider"></span>
          </label>
        </div>
        <div class="settings-section">
          <div class="settings-label">Screen Curvature</div>
          <label class="settings-toggle">
            <input type="checkbox" id="set-curvature" ${settings.curvature ? 'checked' : ''}>
            <span class="settings-toggle-slider"></span>
          </label>
        </div>
        <div class="settings-section">
          <div class="settings-label">Text Glow</div>
          <label class="settings-toggle">
            <input type="checkbox" id="set-glow" ${settings.glow ? 'checked' : ''}>
            <span class="settings-toggle-slider"></span>
          </label>
        </div>
        <div class="settings-section">
          <div class="settings-label">Background Music</div>
          <div style="display:flex;align-items:center;gap:8px;">
            <label class="settings-toggle">
              <input type="checkbox" id="set-music" ${typeof Music !== 'undefined' && Music.isPlaying() ? 'checked' : ''}>
              <span class="settings-toggle-slider"></span>
            </label>
            <button id="set-next-track" style="background:#0a1a0a;border:1px solid rgba(51,255,51,0.3);color:#33ff33;font-family:'Press Start 2P',monospace;font-size:6px;padding:4px 6px;cursor:pointer;">NEXT</button>
          </div>
        </div>
        <div class="settings-section">
          <div class="settings-label">Now Playing</div>
          <div id="track-name" style="font-size:7px;color:rgba(51,255,51,0.7);">${typeof Music !== 'undefined' ? Music.getCurrentTrack().name : 'N/A'}</div>
        </div>
      </div>
    `;

    const colorsDiv = body.querySelector('.settings-colors');
    colors.forEach(c => {
      const swatch = document.createElement('div');
      swatch.className = 'settings-color-swatch' + (settings.crtColor === c.value ? ' active' : '');
      swatch.style.background = c.value;
      swatch.title = c.name;
      swatch.addEventListener('click', () => {
        settings.crtColor = c.value;
        colorsDiv.querySelectorAll('.settings-color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        apply();
        if (typeof Sound !== 'undefined') Sound.play('click');
      });
      colorsDiv.appendChild(swatch);
    });

    body.querySelector('#set-scanlines').addEventListener('change', (e) => {
      settings.scanlines = e.target.checked;
      apply();
    });
    body.querySelector('#set-flicker').addEventListener('change', (e) => {
      settings.flicker = e.target.checked;
      const overlay = document.getElementById('crt-overlay');
      if (overlay && overlay.querySelector('::after')) {
        overlay.style.setProperty('--flicker-state', e.target.checked ? 'running' : 'paused');
      }
      apply();
    });
    body.querySelector('#set-curvature').addEventListener('change', (e) => {
      settings.curvature = e.target.checked;
      apply();
    });
    body.querySelector('#set-glow').addEventListener('change', (e) => {
      settings.glow = e.target.checked;
      apply();
    });
    body.querySelector('#set-music').addEventListener('change', (e) => {
      if (typeof Music !== 'undefined') {
        if (e.target.checked) Music.start(); else Music.stop();
      }
    });

    body.querySelector('#set-next-track').addEventListener('click', () => {
      if (typeof Music !== 'undefined') {
        Music.next();
        const trackEl = body.querySelector('#track-name');
        if (trackEl) trackEl.textContent = Music.getCurrentTrack().name;
        if (!Music.isPlaying()) {
          Music.start();
          const toggle = body.querySelector('#set-music');
          if (toggle) toggle.checked = true;
        }
        if (typeof Sound !== 'undefined') Sound.play('click');
      }
    });
  }

  return { open, load, settings };
})();
