const Tutorial = (() => {
  const STORAGE_KEY = 'retroos_tutorials_seen';

  function getSeen() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function markSeen(gameId) {
    const seen = getSeen();
    seen[gameId] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
  }

  function hasSeen(gameId) {
    return !!getSeen()[gameId];
  }

  function reset(gameId) {
    const seen = getSeen();
    delete seen[gameId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
  }

  function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function showIfNew(winId, gameId, controls, onDismiss) {
    if (hasSeen(gameId)) {
      onDismiss();
      return;
    }

    const overlay = document.getElementById('overlay-' + winId);
    if (!overlay) {
      onDismiss();
      return;
    }

    const controlHTML = controls.map(c => `<p>${c}</p>`).join('');
    const div = document.createElement('div');
    div.id = 'tutorial-' + winId;
    div.className = 'game-overlay tutorial-layer';
    div.innerHTML = `
      <h2>HOW TO PLAY</h2>
      <div class="tutorial-controls">${controlHTML}</div>
      <button id="tutorial-ok-${winId}">GOT IT!</button>
    `;

    const parent = overlay.parentNode;
    parent.appendChild(div);

    document.getElementById('tutorial-ok-' + winId).addEventListener('click', () => {
      markSeen(gameId);
      div.remove();
      onDismiss();
    });
  }

  return { showIfNew, hasSeen, reset, resetAll, markSeen };
})();
