const WindowManager = (() => {
  let windows = {};
  let windowOrder = [];
  let nextId = 1;
  let highestZ = 10;

  function create({ title, icon, width, height, content, app, statusText }) {
    const id = 'win-' + nextId++;
    const container = document.getElementById('windows-container');

    const win = document.createElement('div');
    win.className = 'retro-window';
    win.id = id;
    win.style.width = (width || 500) + 'px';
    win.style.height = (height || 400) + 'px';

    const screenW = window.innerWidth;
    const screenH = window.innerHeight - 40;
    const w = width || 500;
    const h = height || 400;
    const offsetX = (nextId * 30) % Math.max(1, screenW - w - 40);
    const offsetY = (nextId * 30) % Math.max(1, screenH - h - 40);
    win.style.left = (40 + offsetX) + 'px';
    win.style.top = (20 + offsetY) + 'px';

    win.innerHTML = `
      <div class="window-titlebar">
        <span class="window-title">${icon || ''} ${title}</span>
        <div class="window-controls">
          <button class="window-btn minimize" title="Minimize">_</button>
          <button class="window-btn maximize" title="Maximize">[]</button>
          <button class="window-btn close" title="Close">X</button>
        </div>
      </div>
      <div class="window-body"></div>
      <div class="window-resize"></div>
      ${statusText !== undefined ? `<div class="window-statusbar"><span>${statusText}</span></div>` : ''}
    `;

    container.appendChild(win);

    const body = win.querySelector('.window-body');
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      body.appendChild(content);
    } else if (typeof content === 'function') {
      content(body, id);
    }

    windows[id] = { el: win, title, icon, app, minimized: false, maximized: false };
    windowOrder.push(id);
    focus(id);
    setupDrag(win, id);
    setupResize(win, id);
    setupControls(win, id);
    updateTaskbar();
    if (typeof MultiDesktop !== 'undefined') MultiDesktop.addToCurrentDesktop(id);

    if (typeof Sound !== 'undefined') Sound.play('open');

    return id;
  }

  function focus(id) {
    if (!windows[id]) return;
    highestZ++;
    windows[id].el.style.zIndex = highestZ;
    windowOrder = windowOrder.filter(w => w !== id);
    windowOrder.push(id);
    updateTaskbar();
  }

  function close(id) {
    if (!windows[id]) return;
    windows[id].el.remove();
    if (windows[id].app && typeof windows[id].app.destroy === 'function') {
      windows[id].app.destroy(id);
    }
    delete windows[id];
    windowOrder = windowOrder.filter(w => w !== id);
    if (typeof MultiDesktop !== 'undefined') MultiDesktop.removeFromAll(id);
    updateTaskbar();
    if (typeof Sound !== 'undefined') Sound.play('close');
  }

  function minimize(id) {
    if (!windows[id]) return;
    windows[id].minimized = true;
    windows[id].el.style.display = 'none';
    updateTaskbar();
  }

  function restore(id) {
    if (!windows[id]) return;
    windows[id].minimized = false;
    windows[id].el.style.display = 'flex';
    focus(id);
    updateTaskbar();
  }

  function maximize(id) {
    if (!windows[id]) return;
    const win = windows[id];
    if (win.maximized) {
      win.el.classList.remove('maximized');
      win.maximized = false;
    } else {
      win.el.classList.add('maximized');
      win.maximized = true;
    }
  }

  function setupDrag(win, id) {
    const titlebar = win.querySelector('.window-titlebar');
    let isDragging = false;
    let startX, startY, origLeft, origTop;
    let snapPreview = null;

    function createSnapPreview(x, y, w, h) {
      removeSnapPreview();
      snapPreview = document.createElement('div');
      snapPreview.className = 'snap-preview';
      snapPreview.style.left = x + 'px';
      snapPreview.style.top = y + 'px';
      snapPreview.style.width = w + 'px';
      snapPreview.style.height = h + 'px';
      document.getElementById('desktop').appendChild(snapPreview);
    }

    function removeSnapPreview() {
      if (snapPreview) { snapPreview.remove(); snapPreview = null; }
    }

    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.window-controls')) return;
      if (windows[id].maximized) {
        windows[id].el.classList.remove('maximized');
        windows[id].maximized = false;
        origLeft = e.clientX - win.offsetWidth / 2;
        origTop = e.clientY - 15;
        win.style.left = origLeft + 'px';
        win.style.top = origTop + 'px';
      }
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      origLeft = win.offsetLeft;
      origTop = win.offsetTop;
      focus(id);
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let newLeft = origLeft + dx;
      let newTop = origTop + dy;
      newTop = Math.max(0, newTop);

      const screenW = window.innerWidth;
      const screenH = window.innerHeight - 40;
      const winW = win.offsetWidth;
      const snapThreshold = 20;

      removeSnapPreview();

      if (e.clientX <= snapThreshold) {
        createSnapPreview(0, 0, screenW / 2, screenH);
      } else if (e.clientX >= screenW - snapThreshold) {
        createSnapPreview(screenW / 2, 0, screenW / 2, screenH);
      } else if (e.clientY <= snapThreshold) {
        createSnapPreview(0, 0, screenW, screenH);
      }

      win.style.left = newLeft + 'px';
      win.style.top = newTop + 'px';
    });

    document.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      removeSnapPreview();

      const screenW = window.innerWidth;
      const screenH = window.innerHeight - 40;
      const snapThreshold = 20;

      if (e.clientX <= snapThreshold) {
        win.style.left = '0px';
        win.style.top = '0px';
        win.style.width = (screenW / 2) + 'px';
        win.style.height = screenH + 'px';
      } else if (e.clientX >= screenW - snapThreshold) {
        win.style.left = (screenW / 2) + 'px';
        win.style.top = '0px';
        win.style.width = (screenW / 2) + 'px';
        win.style.height = screenH + 'px';
      } else if (e.clientY <= snapThreshold) {
        win.classList.add('maximized');
        windows[id].maximized = true;
      }
    });

    titlebar.addEventListener('mousedown', () => {
      focus(id);
    });
  }

  function setupResize(win, id) {
    const handle = win.querySelector('.window-resize');
    let isResizing = false;
    let startX, startY, startW, startH;

    handle.addEventListener('mousedown', (e) => {
      if (windows[id].maximized) return;
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startW = win.offsetWidth;
      startH = win.offsetHeight;
      e.preventDefault();
      e.stopPropagation();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const newW = Math.max(200, startW + (e.clientX - startX));
      const newH = Math.max(150, startH + (e.clientY - startY));
      win.style.width = newW + 'px';
      win.style.height = newH + 'px';
    });

    document.addEventListener('mouseup', () => {
      isResizing = false;
    });
  }

  function setupControls(win, id) {
    win.querySelector('.window-btn.close').addEventListener('click', (e) => {
      e.stopPropagation();
      close(id);
    });

    win.querySelector('.window-btn.minimize').addEventListener('click', (e) => {
      e.stopPropagation();
      minimize(id);
    });

    win.querySelector('.window-btn.maximize').addEventListener('click', (e) => {
      e.stopPropagation();
      maximize(id);
    });

    win.addEventListener('mousedown', () => {
      focus(id);
    });
  }

  function updateTaskbar() {
    const container = document.getElementById('taskbar-windows');
    container.innerHTML = '';

    windowOrder.forEach(id => {
      if (!windows[id]) return;
      const item = document.createElement('div');
      item.className = 'taskbar-item' + (windows[id].minimized ? '' : ' active');
      item.textContent = (windows[id].icon || '') + ' ' + windows[id].title;
      item.addEventListener('click', () => {
        if (windows[id].minimized) {
          restore(id);
        } else {
          const topWin = windowOrder[windowOrder.length - 1];
          if (topWin === id) {
            minimize(id);
          } else {
            focus(id);
          }
        }
      });
      container.appendChild(item);
    });
  }

  function getAll() {
    return windows;
  }

  function getTopWindow() {
    if (windowOrder.length === 0) return null;
    return windowOrder[windowOrder.length - 1];
  }

  return { create, close, minimize, restore, maximize, focus, getAll, getTopWindow, updateTaskbar };
})();
