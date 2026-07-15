const Desktop = (() => {
  const apps = [
    { id: 'terminal', name: 'Terminal', icon: '>_', open: () => TerminalApp.open() },
    { id: 'notepad', name: 'Notepad', icon: '\u{1F4DD}', open: () => NotepadApp.open() },
    { id: 'paint', name: 'Paint', icon: '\u{1F3A8}', open: () => PaintApp.open() },
    { id: 'calculator', name: 'Calculator', icon: '\u{1F5A9}', open: () => CalculatorApp.open() },
    { id: 'settings', name: 'Settings', icon: '\u{2699}', open: () => SettingsApp.open() },
    { id: 'snake', name: 'Snake', icon: '\u{1F40D}', open: () => SnakeApp.open() },
    { id: 'tetris', name: 'Tetris', icon: '\u{1F9E9}', open: () => TetrisApp.open() },
    { id: 'pong', name: 'Pong', icon: '\u{1F3D3}', open: () => PongApp.open() },
    { id: 'breakout', name: 'Breakout', icon: '\u{1F3AF}', open: () => BreakoutApp.open() },
    { id: 'minesweeper', name: 'Minesweeper', icon: '\u{1F4A3}', open: () => MinesweeperApp.open() },
    { id: 'game2048', name: '2048', icon: '\u{1F522}', open: () => Game2048App.open() },
    { id: 'flappy', name: 'Flappy', icon: '\u{1F426}', open: () => FlappyApp.open() },
  ];

  function init() {
    createDesktopIcons();
    createStartMenu();
    startClock();
    setupContextMenu();
    setupDesktopClick();
    if (typeof Shortcuts !== 'undefined') Shortcuts.init();
    if (typeof MultiDesktop !== 'undefined') MultiDesktop.init();
    if (typeof SettingsApp !== 'undefined') SettingsApp.load();
    if (typeof ClockWidget !== 'undefined') ClockWidget.create();
    Storage.load();
  }

  function createDesktopIcons() {
    const container = document.getElementById('desktop-icons');
    container.innerHTML = '';
    apps.forEach(app => {
      const icon = document.createElement('div');
      icon.className = 'desktop-icon';
      icon.innerHTML = `
        <div class="icon">${app.icon}</div>
        <div class="label">${app.name}</div>
      `;
      icon.addEventListener('dblclick', () => app.open());
      container.appendChild(icon);
    });
  }

  function createStartMenu() {
    const menuApps = document.getElementById('start-menu-apps');
    menuApps.innerHTML = '';
    apps.forEach(app => {
      const item = document.createElement('div');
      item.className = 'start-menu-item';
      item.innerHTML = `
        <span class="menu-icon">${app.icon}</span>
        <span>${app.name}</span>
      `;
      item.addEventListener('click', () => {
        app.open();
        toggleStartMenu(false);
      });
      menuApps.appendChild(item);
    });

    document.getElementById('start-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleStartMenu();
    });

    document.getElementById('shutdown-btn').addEventListener('click', () => {
      toggleStartMenu(false);
      shutdown();
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#start-menu') && !e.target.closest('#start-btn')) {
        toggleStartMenu(false);
      }
    });
  }

  function toggleStartMenu(force) {
    const menu = document.getElementById('start-menu');
    if (force === undefined) {
      menu.classList.toggle('hidden');
    } else if (force) {
      menu.classList.remove('hidden');
    } else {
      menu.classList.add('hidden');
    }
  }

  function startClock() {
    const clockEl = document.getElementById('taskbar-clock');
    function update() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      clockEl.textContent = h + ':' + m;
    }
    update();
    setInterval(update, 1000);
  }

  function setupContextMenu() {
    const menu = document.getElementById('context-menu');
    const desktop = document.getElementById('desktop');

    desktop.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      menu.innerHTML = '';
      const items = [
        { label: 'Refresh', action: () => {} },
        { type: 'divider' },
        { label: 'Open Terminal', action: () => TerminalApp.open() },
        { label: 'Open Notepad', action: () => NotepadApp.open() },
        { label: 'Open Paint', action: () => PaintApp.open() },
        { label: 'Open Calculator', action: () => CalculatorApp.open() },
        { type: 'divider' },
        { label: 'Toggle Clock Widget', action: () => ClockWidget.create() },
        { label: 'Toggle Music', action: () => Music.toggle() },
        { type: 'divider' },
        { label: 'Settings', action: () => SettingsApp.open() },
        { label: 'About RetroOS', action: () => showAbout() },
      ];

      items.forEach(item => {
        if (item.type === 'divider') {
          const div = document.createElement('div');
          div.className = 'context-divider';
          menu.appendChild(div);
        } else {
          const el = document.createElement('div');
          el.className = 'context-item';
          el.textContent = item.label;
          el.addEventListener('click', () => {
            item.action();
            menu.classList.add('hidden');
          });
          menu.appendChild(el);
        }
      });

      menu.style.left = e.clientX + 'px';
      menu.style.top = e.clientY + 'px';
      menu.classList.remove('hidden');
    });

    document.addEventListener('click', () => {
      menu.classList.add('hidden');
    });
  }

  function setupDesktopClick() {
    document.getElementById('desktop').addEventListener('click', (e) => {
      if (e.target.id === 'desktop' || e.target.closest('#desktop-icons') === document.getElementById('desktop-icons') && e.target === document.getElementById('desktop-icons')) {
        document.querySelectorAll('.desktop-icon.selected').forEach(el => el.classList.remove('selected'));
      }
    });

    document.querySelectorAll('.desktop-icon').forEach(icon => {
      icon.addEventListener('click', (e) => {
        document.querySelectorAll('.desktop-icon.selected').forEach(el => el.classList.remove('selected'));
        icon.classList.add('selected');
        e.stopPropagation();
      });
    });
  }

  function showAbout() {
    WindowManager.create({
      title: 'About RetroOS',
      icon: '\u{2139}',
      width: 380,
      height: 220,
      content: (body) => {
        body.style.padding = '20px';
        body.style.textAlign = 'center';
        body.style.display = 'flex';
        body.style.flexDirection = 'column';
        body.style.alignItems = 'center';
        body.style.justifyContent = 'center';
        body.style.gap = '12px';
        body.innerHTML = `
          <div style="font-size:20px; color:#33ff33; text-shadow:0 0 8px #33ff33;">RetroOS</div>
          <div style="font-size:8px; color:#33ff33;">Version 2.0</div>
          <div style="font-size:7px; color:rgba(51,255,51,0.7); line-height:2;">
            A retro-themed operating system<br>
            running entirely in your browser.<br><br>
            Built with vanilla HTML, CSS & JS.<br><br>
            <span style="color:#33ff33;">Keyboard Shortcuts:</span><br>
            Ctrl+T Terminal | Ctrl+N Notepad<br>
            Ctrl+P Paint | Ctrl+C Calculator<br>
            Ctrl+, Settings | Ctrl+M Music<br>
            Alt+1-4 Switch Desktops<br>
            Window drag to edge to snap!
          </div>
        `;
      }
    });
  }

  function shutdown() {
    const os = document.getElementById('os');
    const shutdownScreen = document.getElementById('shutdown-screen');
    os.classList.add('hidden');
    shutdownScreen.classList.remove('hidden');

    setTimeout(() => {
      shutdownScreen.classList.add('hidden');
      const bootScreen = document.getElementById('boot-screen');
      bootScreen.classList.remove('hidden');
      Boot.start();
    }, 2000);
  }

  return { init, apps, toggleStartMenu };
})();
