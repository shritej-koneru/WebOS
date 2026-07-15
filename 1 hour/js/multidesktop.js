const MultiDesktop = (() => {
  let currentDesktop = 0;
  const MAX_DESKTOPS = 4;
  let desktopWindows = {};
  let desktopIndicator = null;

  function init() {
    for (let i = 0; i < MAX_DESKTOPS; i++) {
      desktopWindows[i] = [];
    }
    createIndicator();
    switchTo(0);
  }

  function createIndicator() {
    desktopIndicator = document.createElement('div');
    desktopIndicator.className = 'desktop-indicator';
    for (let i = 0; i < MAX_DESKTOPS; i++) {
      const dot = document.createElement('div');
      dot.className = 'desktop-dot' + (i === 0 ? ' active' : '');
      dot.dataset.desktop = i;
      dot.addEventListener('click', () => switchTo(i));
      dot.title = 'Desktop ' + (i + 1);
      desktopIndicator.appendChild(dot);
    }
    document.getElementById('desktop').appendChild(desktopIndicator);
  }

  function switchTo(index) {
    if (index < 0 || index >= MAX_DESKTOPS) return;

    const container = document.getElementById('windows-container');
    const allWindows = container.querySelectorAll('.retro-window');

    allWindows.forEach(win => {
      if (!desktopWindows[currentDesktop].includes(win.id)) return;
    });

    desktopWindows[currentDesktop] = [];
    allWindows.forEach(win => {
      desktopWindows[currentDesktop].push(win.id);
    });

    allWindows.forEach(win => {
      if (desktopWindows[index] && desktopWindows[index].includes(win.id)) {
        win.style.display = 'flex';
      } else {
        win.style.display = 'none';
      }
    });

    currentDesktop = index;
    updateIndicator();
    WindowManager.updateTaskbar();
  }

  function addToCurrentDesktop(winId) {
    if (!desktopWindows[currentDesktop]) desktopWindows[currentDesktop] = [];
    desktopWindows[currentDesktop].push(winId);
  }

  function removeFromAll(winId) {
    for (let i = 0; i < MAX_DESKTOPS; i++) {
      desktopWindows[i] = (desktopWindows[i] || []).filter(id => id !== winId);
    }
  }

  function updateIndicator() {
    if (!desktopIndicator) return;
    desktopIndicator.querySelectorAll('.desktop-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentDesktop);
    });
  }

  function getCurrent() {
    return currentDesktop;
  }

  return { init, switchTo, addToCurrentDesktop, removeFromAll, getCurrent };
})();
