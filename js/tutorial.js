const Tutorial = (() => {
  const STORAGE_KEY = 'retroos_tutorials_seen';

  function getSeen() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
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
    overlay.innerHTML = `
      <h2>HOW TO PLAY</h2>
      <div class="tutorial-controls">${controlHTML}</div>
      <button id="tutorial-ok-${winId}">GOT IT!</button>
    `;
    overlay.classList.remove('hidden');

    document.getElementById('tutorial-ok-' + winId).addEventListener('click', () => {
      markSeen(gameId);
      onDismiss();
    });
  }

  return { showIfNew, hasSeen, reset, resetAll, markSeen };
})();
