const MinesweeperApp = (() => {
  let canvasHandlers = {};

  function open() {
    WindowManager.create({
      title: 'Minesweeper',
      icon: '\u{1F4A3}',
      width: 360,
      height: 420,
      content: createGame,
      app: { destroy: (id) => { cleanup(id); } }
    });
  }

  function createGame(body, winId) {
    const ROWS = 12;
    const COLS = 12;
    const MINES = 20;
    const CELL = 26;

    body.innerHTML = `
      <div class="game-app">
        <div class="game-score" id="mscore-${winId}">Mines: ${MINES}  Flags: 0</div>
        <canvas width="${COLS * CELL}" height="${ROWS * CELL}"></canvas>
        <div class="game-overlay" id="overlay-${winId}">
          <h2>MINESWEEPER</h2>
          <p>Left click to reveal. Right click to flag.<br>Don't hit the mines!</p>
          <button id="start-${winId}">NEW GAME</button>
        </div>
      </div>
    `;

    const canvas = body.querySelector('canvas');
    const ctx = canvas.getContext('2d');

    let grid, revealed, flagged, mineCount, gameOver, firstClick;

    function init() {
      grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
      revealed = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
      flagged = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
      mineCount = MINES;
      gameOver = false;
      firstClick = true;
      updateScore();
    }

    function placeMines(safeR, safeC) {
      let placed = 0;
      while (placed < MINES) {
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);
        if (grid[r][c] === -1) continue;
        if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
        grid[r][c] = -1;
        placed++;
      }
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid[r][c] === -1) continue;
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] === -1) count++;
            }
          }
          grid[r][c] = count;
        }
      }
    }

    function updateScore() {
      const flags = flagged.flat().filter(Boolean).length;
      const el = document.getElementById('mscore-' + winId);
      if (el) el.textContent = `Mines: ${MINES - flags}  Flags: ${flags}`;
    }

    function reveal(r, c) {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
      if (revealed[r][c] || flagged[r][c]) return;
      revealed[r][c] = true;

      if (grid[r][c] === -1) {
        gameOver = true;
        revealAll();
        draw();
        if (typeof Sound !== 'undefined') Sound.play('gameover');
        const overlay = document.getElementById('overlay-' + winId);
        overlay.innerHTML = `
          <h2>BOOM!</h2>
          <p>You hit a mine!</p>
          <button id="restart-${winId}">NEW GAME</button>
        `;
        overlay.classList.remove('hidden');
        document.getElementById('restart-' + winId).addEventListener('click', () => {
          init();
          draw();
          overlay.classList.add('hidden');
        });
        return;
      }

      if (grid[r][c] === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            reveal(r + dr, c + dc);
          }
        }
      }

      checkWin();
    }

    function checkWin() {
      let unrevealed = 0;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (!revealed[r][c]) unrevealed++;
        }
      }
      if (unrevealed === MINES) {
        gameOver = true;
        if (typeof Sound !== 'undefined') Sound.play('score');
        const overlay = document.getElementById('overlay-' + winId);
        overlay.innerHTML = `
          <h2>YOU WIN!</h2>
          <p>All mines found!</p>
          <button id="restart-${winId}">NEW GAME</button>
        `;
        overlay.classList.remove('hidden');
        document.getElementById('restart-' + winId).addEventListener('click', () => {
          init();
          draw();
          overlay.classList.add('hidden');
        });
      }
    }

    function revealAll() {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          revealed[r][c] = true;
        }
      }
    }

    const NUM_COLORS = ['', '#33aaff', '#33ff33', '#ff3333', '#aa33ff', '#ff8800', '#33ffff', '#ffffff', '#888888'];

    function draw() {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const x = c * CELL;
          const y = r * CELL;

          if (revealed[r][c]) {
            if (grid[r][c] === -1) {
              ctx.fillStyle = '#ff3333';
              ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
              ctx.fillStyle = '#000';
              ctx.font = '12px "Press Start 2P"';
              ctx.textAlign = 'center';
              ctx.fillText('*', x + CELL / 2, y + CELL / 2 + 4);
              ctx.textAlign = 'start';
            } else {
              ctx.fillStyle = '#0a0a1a';
              ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
              if (grid[r][c] > 0) {
                ctx.fillStyle = NUM_COLORS[grid[r][c]] || '#fff';
                ctx.font = '10px "Press Start 2P"';
                ctx.textAlign = 'center';
                ctx.fillText(grid[r][c], x + CELL / 2, y + CELL / 2 + 3);
                ctx.textAlign = 'start';
              }
            }
          } else {
            ctx.fillStyle = flagged[r][c] ? '#333300' : '#2a2a3e';
            ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
            ctx.strokeStyle = 'rgba(51,255,51,0.15)';
            ctx.strokeRect(x + 1, y + 1, CELL - 2, CELL - 2);
            if (flagged[r][c]) {
              ctx.fillStyle = '#ff3333';
              ctx.font = '10px "Press Start 2P"';
              ctx.textAlign = 'center';
              ctx.fillText('F', x + CELL / 2, y + CELL / 2 + 3);
              ctx.textAlign = 'start';
            }
          }
        }
      }
    }

    function onCanvasClick(e) {
      if (gameOver) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = COLS * CELL / rect.width;
      const scaleY = ROWS * CELL / rect.height;
      const c = Math.floor((e.clientX - rect.left) * scaleX / CELL);
      const r = Math.floor((e.clientY - rect.top) * scaleY / CELL);
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;

      if (firstClick) {
        placeMines(r, c);
        firstClick = false;
      }

      if (!flagged[r][c]) {
        reveal(r, c);
        draw();
        if (typeof Sound !== 'undefined') Sound.play('click');
      }
    }

    function onContextMenu(e) {
      e.preventDefault();
      if (gameOver) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = COLS * CELL / rect.width;
      const scaleY = ROWS * CELL / rect.height;
      const c = Math.floor((e.clientX - rect.left) * scaleX / CELL);
      const r = Math.floor((e.clientY - rect.top) * scaleY / CELL);
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
      if (revealed[r][c]) return;

      flagged[r][c] = !flagged[r][c];
      updateScore();
      draw();
      if (typeof Sound !== 'undefined') Sound.play('click');
    }

    canvas.addEventListener('click', onCanvasClick);
    canvas.addEventListener('contextmenu', onContextMenu);
    canvasHandlers[winId] = { canvas, click: onCanvasClick, contextmenu: onContextMenu };

    document.getElementById('start-' + winId).addEventListener('click', () => {
      init();
      draw();
      document.getElementById('overlay-' + winId).classList.add('hidden');
    });

    init();
    draw();
  }

  function cleanup(id) {
    if (canvasHandlers[id]) {
      const ch = canvasHandlers[id];
      ch.canvas.removeEventListener('click', ch.click);
      ch.canvas.removeEventListener('contextmenu', ch.contextmenu);
      delete canvasHandlers[id];
    }
  }

  return { open };
})();
