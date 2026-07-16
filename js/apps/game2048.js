const Game2048App = (() => {
  let keyHandlers = {};

  function open() {
    WindowManager.create({
      title: '2048',
      icon: '\u{1F522}',
      width: 340,
      height: 400,
      content: createGame,
      app: { destroy: (id) => { cleanup(id); } }
    });
  }

  function createGame(body, winId) {
    const SIZE = 4;
    const CELL = 64;
    const PAD = 6;
    const W = SIZE * (CELL + PAD) + PAD;
    const H = W;

    body.innerHTML = `
      <div class="game-app">
        <div class="game-score" id="g2score-${winId}">Score: 0</div>
        <canvas width="${W}" height="${H}"></canvas>
        <div class="game-overlay" id="overlay-${winId}">
          <h2>2048</h2>
          <p>Use arrow keys to slide tiles.<br>Merge matching numbers!</p>
          <button id="start-${winId}">START GAME</button>
        </div>
      </div>
    `;

    const canvas = body.querySelector('canvas');
    const ctx = canvas.getContext('2d');

    let grid, score, won, alive;

    const TILE_COLORS = {
      0: '#1a1a2e',
      2: '#2a2a4e',
      4: '#3a3a5e',
      8: '#ff8800',
      16: '#ff6600',
      32: '#ff4400',
      64: '#ff2200',
      128: '#ffff33',
      256: '#ffaa00',
      512: '#ff8800',
      1024: '#ff5500',
      2048: '#ff3300',
    };

    function init() {
      grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
      score = 0;
      won = false;
      alive = true;
      addTile();
      addTile();
      updateScore();
    }

    function addTile() {
      const empty = [];
      for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++)
          if (grid[r][c] === 0) empty.push({ r, c });
      if (empty.length === 0) return;
      const { r, c } = empty[Math.floor(Math.random() * empty.length)];
      grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }

    function updateScore() {
      const el = document.getElementById('g2score-' + winId);
      if (el) el.textContent = `Score: ${score}`;
    }

    function slide(row) {
      let arr = row.filter(v => v !== 0);
      let merged = false;
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
          arr[i] *= 2;
          score += arr[i];
          if (arr[i] === 2048 && !won) won = true;
          arr.splice(i + 1, 1);
          merged = true;
        }
      }
      while (arr.length < SIZE) arr.push(0);
      return { row: arr, moved: arr.some((v, i) => v !== row[i]) };
    }

    function move(dir) {
      let moved = false;

      if (dir === 'left') {
        for (let r = 0; r < SIZE; r++) {
          const result = slide(grid[r]);
          grid[r] = result.row;
          moved = moved || result.moved;
        }
      } else if (dir === 'right') {
        for (let r = 0; r < SIZE; r++) {
          const result = slide([...grid[r]].reverse());
          grid[r] = result.row.reverse();
          moved = moved || result.moved;
        }
      } else if (dir === 'up') {
        for (let c = 0; c < SIZE; c++) {
          const col = grid.map(r => r[c]);
          const result = slide(col);
          for (let r = 0; r < SIZE; r++) grid[r][c] = result.row[r];
          moved = moved || result.moved;
        }
      } else if (dir === 'down') {
        for (let c = 0; c < SIZE; c++) {
          const col = grid.map(r => r[c]).reverse();
          const result = slide(col);
          const reversed = result.row.reverse();
          for (let r = 0; r < SIZE; r++) grid[r][c] = reversed[r];
          moved = moved || result.moved;
        }
      }

      if (moved) {
        addTile();
        updateScore();
        if (typeof Sound !== 'undefined') Sound.play('move');
        if (won) {
          won = false;
          const overlay = document.getElementById('overlay-' + winId);
          overlay.innerHTML = `
            <h2>YOU WIN!</h2>
            <p>Score: ${score}</p>
            <button id="restart-${winId}">PLAY AGAIN</button>
          `;
          overlay.classList.remove('hidden');
          document.getElementById('restart-' + winId).addEventListener('click', () => {
            init();
            draw();
            overlay.classList.add('hidden');
          });
        }
        if (!canMove()) {
          alive = false;
          if (typeof Sound !== 'undefined') Sound.play('gameover');
          const overlay = document.getElementById('overlay-' + winId);
          overlay.innerHTML = `
            <h2>GAME OVER</h2>
            <p>Score: ${score}</p>
            <button id="restart-${winId}">PLAY AGAIN</button>
          `;
          overlay.classList.remove('hidden');
          document.getElementById('restart-' + winId).addEventListener('click', () => {
            init();
            draw();
            overlay.classList.add('hidden');
          });
        }
      }
    }

    function canMove() {
      for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++) {
          if (grid[r][c] === 0) return true;
          if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return true;
          if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return true;
        }
      return false;
    }

    function draw() {
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, W, H);

      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          const x = c * (CELL + PAD) + PAD;
          const y = r * (CELL + PAD) + PAD;
          const val = grid[r][c];

          ctx.fillStyle = TILE_COLORS[val] || '#ff0000';
          ctx.fillRect(x, y, CELL, CELL);

          if (val > 0) {
            ctx.fillStyle = val <= 4 ? '#33ff33' : '#ffffff';
            ctx.font = val >= 1024 ? '14px "Press Start 2P"' : val >= 128 ? '16px "Press Start 2P"' : '20px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(val, x + CELL / 2, y + CELL / 2);
            ctx.textAlign = 'start';
            ctx.textBaseline = 'alphabetic';
          }
        }
      }
    }

    function keyHandler(e) {
      if (!alive) return;
      const keyMap = {
        'ArrowLeft': 'left', 'ArrowRight': 'right',
        'ArrowUp': 'up', 'ArrowDown': 'down',
        'a': 'left', 'd': 'right', 'w': 'up', 's': 'down',
      };
      if (keyMap[e.key]) {
        e.preventDefault();
        move(keyMap[e.key]);
        draw();
      }
    }

    document.addEventListener('keydown', keyHandler);
    keyHandlers[winId] = keyHandler;

    Tutorial.showIfNew(winId, '2048', [
      'Arrow keys to slide tiles',
      'Matching numbers merge',
      'Get the 2048 tile to win!'
    ], () => {
      document.getElementById('start-' + winId).addEventListener('click', () => {
        init();
        draw();
        document.getElementById('overlay-' + winId).classList.add('hidden');
      });
      init();
      draw();
    });
  }

  function cleanup(id) {
    if (keyHandlers[id]) {
      document.removeEventListener('keydown', keyHandlers[id]);
      delete keyHandlers[id];
    }
  }

  return { open };
})();
