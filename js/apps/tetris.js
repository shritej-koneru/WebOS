const TetrisApp = (() => {
  let gameLoops = {};
  let keyHandlers = {};

  const PIECES = [
    { shape: [[1,1,1,1]], color: '#33ffff' },
    { shape: [[1,0],[1,0],[1,1]], color: '#3333ff' },
    { shape: [[0,1],[0,1],[1,1]], color: '#ff8800' },
    { shape: [[1,1],[1,1]], color: '#ffff33' },
    { shape: [[0,1,1],[1,1,0]], color: '#33ff33' },
    { shape: [[1,1,0],[0,1,1]], color: '#ff3333' },
    { shape: [[0,1,0],[1,1,1]], color: '#aa33ff' },
  ];

  const COLS = 10;
  const ROWS = 20;
  const BLOCK = 20;

  function open() {
    WindowManager.create({
      title: 'Tetris',
      icon: '\u{1F9E9}',
      width: 320,
      height: 480,
      content: createGame,
      app: { destroy: (id) => { cleanup(id); } }
    });
  }

  function createGame(body, winId) {
    const W = COLS * BLOCK + 100;
    const H = ROWS * BLOCK;

    body.innerHTML = `
      <div class="game-app" style="justify-content:center;">
        <div class="game-score" id="tscore-${winId}">Score: 0</div>
        <canvas width="${W}" height="${H}"></canvas>
        <div class="game-overlay" id="overlay-${winId}">
          <h2>TETRIS</h2>
          <p>Left/Right Arrow to move.<br>Up Arrow to rotate. Down Arrow to drop.</p>
          <button id="start-${winId}">START GAME</button>
        </div>
      </div>
    `;

    const canvas = body.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let board, current, next, score, level, lines, alive, currentSpeed;

    function init() {
      board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
      score = 0;
      level = 1;
      lines = 0;
      alive = true;
      currentSpeed = 500;
      spawnPiece();
      next = randomPiece();
      updateScore();
    }

    function randomPiece() {
      const p = PIECES[Math.floor(Math.random() * PIECES.length)];
      return {
        shape: p.shape.map(r => [...r]),
        color: p.color,
        x: Math.floor(COLS / 2) - Math.ceil(p.shape[0].length / 2),
        y: 0
      };
    }

    function spawnPiece() {
      current = next || randomPiece();
      next = randomPiece();
      current.x = Math.floor(COLS / 2) - Math.ceil(current.shape[0].length / 2);
      current.y = 0;
      if (!isValid(current.shape, current.x, current.y)) {
        alive = false;
        gameOver();
      }
    }

    function isValid(shape, px, py) {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (!shape[r][c]) continue;
          const nx = px + c;
          const ny = py + r;
          if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
          if (ny >= 0 && board[ny][nx]) return false;
        }
      }
      return true;
    }

    function rotate() {
      const shape = current.shape;
      const rows = shape.length;
      const cols = shape[0].length;
      const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          rotated[c][rows - 1 - r] = shape[r][c];
        }
      }
      if (isValid(rotated, current.x, current.y)) {
        current.shape = rotated;
        if (typeof Sound !== 'undefined') Sound.play('rotate');
      } else {
        if (isValid(rotated, current.x - 1, current.y)) {
          current.shape = rotated;
          current.x -= 1;
        } else if (isValid(rotated, current.x + 1, current.y)) {
          current.shape = rotated;
          current.x += 1;
        }
      }
    }

    function lock() {
      for (let r = 0; r < current.shape.length; r++) {
        for (let c = 0; c < current.shape[r].length; c++) {
          if (!current.shape[r][c]) continue;
          const ny = current.y + r;
          if (ny < 0) { alive = false; gameOver(); return; }
          board[ny][current.x + c] = current.color;
        }
      }
      clearLines();
      spawnPiece();
    }

    function clearLines() {
      let cleared = 0;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell !== null)) {
          board.splice(r, 1);
          board.unshift(Array(COLS).fill(null));
          cleared++;
          r++;
        }
      }
      if (cleared > 0) {
        const pts = [0, 100, 300, 500, 800];
        score += (pts[cleared] || 800) * level;
        lines += cleared;
        level = Math.floor(lines / 10) + 1;
        updateScore();
        if (typeof Sound !== 'undefined') Sound.play('line');
        adjustSpeed();
      }
    }

    function getSpeed() {
      return Math.max(50, 500 - (level - 1) * 40);
    }

    function adjustSpeed() {
      const newSpeed = getSpeed();
      if (newSpeed !== currentSpeed) {
        currentSpeed = newSpeed;
        clearInterval(gameLoops[winId]);
        gameLoops[winId] = setInterval(tick, currentSpeed);
      }
    }

    function drop() {
      if (!alive) return;
      if (isValid(current.shape, current.x, current.y + 1)) {
        current.y++;
      } else {
        lock();
      }
    }

    function hardDrop() {
      while (isValid(current.shape, current.x, current.y + 1)) {
        current.y++;
        score += 2;
      }
      lock();
      updateScore();
    }

    function updateScore() {
      const el = document.getElementById('tscore-' + winId);
      if (el) el.textContent = `Score: ${score}  Lv: ${level}`;
    }

    function draw() {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(51, 255, 51, 0.05)';
      for (let x = 0; x <= COLS * BLOCK; x += BLOCK) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ROWS * BLOCK); ctx.stroke();
      }
      for (let y = 0; y <= ROWS * BLOCK; y += BLOCK) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(COLS * BLOCK, y); ctx.stroke();
      }

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (board[r][c]) {
            ctx.fillStyle = board[r][c];
            ctx.fillRect(c * BLOCK + 1, r * BLOCK + 1, BLOCK - 2, BLOCK - 2);
          }
        }
      }

      if (current && alive) {
        for (let r = 0; r < current.shape.length; r++) {
          for (let c = 0; c < current.shape[r].length; c++) {
            if (!current.shape[r][c]) continue;
            const px = (current.x + c) * BLOCK;
            const py = (current.y + r) * BLOCK;
            ctx.fillStyle = current.color;
            ctx.fillRect(px + 1, py + 1, BLOCK - 2, BLOCK - 2);
          }
        }

        let ghostY = current.y;
        while (isValid(current.shape, current.x, ghostY + 1)) ghostY++;
        if (ghostY !== current.y) {
          ctx.globalAlpha = 0.2;
          ctx.fillStyle = current.color;
          for (let r = 0; r < current.shape.length; r++) {
            for (let c = 0; c < current.shape[r].length; c++) {
              if (!current.shape[r][c]) continue;
              ctx.fillRect((current.x + c) * BLOCK + 1, (ghostY + r) * BLOCK + 1, BLOCK - 2, BLOCK - 2);
            }
          }
          ctx.globalAlpha = 1;
        }
      }

      const sideX = COLS * BLOCK + 10;
      ctx.fillStyle = '#33ff33';
      ctx.font = '8px "Press Start 2P"';
      ctx.fillText('NEXT', sideX, 20);
      if (next) {
        for (let r = 0; r < next.shape.length; r++) {
          for (let c = 0; c < next.shape[r].length; c++) {
            if (!next.shape[r][c]) continue;
            ctx.fillStyle = next.color;
            ctx.fillRect(sideX + c * BLOCK, 30 + r * BLOCK, BLOCK - 2, BLOCK - 2);
          }
        }
      }
    }

    function tick() {
      if (!alive) return;
      drop();
      draw();
    }

    function keyHandler(e) {
      if (!alive) return;
      const key = e.key;
      if (key === 'ArrowLeft') {
        if (isValid(current.shape, current.x - 1, current.y)) current.x--;
        if (typeof Sound !== 'undefined') Sound.play('move');
      } else if (key === 'ArrowRight') {
        if (isValid(current.shape, current.x + 1, current.y)) current.x++;
        if (typeof Sound !== 'undefined') Sound.play('move');
      } else if (key === 'ArrowDown') {
        drop();
        score += 1;
        updateScore();
      } else if (key === 'ArrowUp') {
        rotate();
      } else if (key === ' ') {
        hardDrop();
      } else {
        return;
      }
      e.preventDefault();
      draw();
    }

    function gameOver() {
      clearInterval(gameLoops[winId]);
      if (typeof Sound !== 'undefined') Sound.play('gameover');
      const overlay = document.getElementById('overlay-' + winId);
      overlay.innerHTML = `
        <h2>GAME OVER</h2>
        <p>Score: ${score}<br>Level: ${level}<br>Lines: ${lines}</p>
        <button id="restart-${winId}">PLAY AGAIN</button>
      `;
      overlay.classList.remove('hidden');
      document.getElementById('restart-' + winId).addEventListener('click', () => {
        startGame();
      });
    }

    function startGame() {
      clearInterval(gameLoops[winId]);
      init();
      draw();
      document.getElementById('overlay-' + winId).classList.add('hidden');
      currentSpeed = getSpeed();
      gameLoops[winId] = setInterval(tick, currentSpeed);
    }

    document.addEventListener('keydown', keyHandler);
    keyHandlers[winId] = keyHandler;
    document.getElementById('start-' + winId).addEventListener('click', startGame);
    init();
    draw();
  }

  function cleanup(id) {
    if (gameLoops[id]) {
      clearInterval(gameLoops[id]);
      delete gameLoops[id];
    }
    if (keyHandlers[id]) {
      document.removeEventListener('keydown', keyHandlers[id]);
      delete keyHandlers[id];
    }
  }

  return { open };
})();
