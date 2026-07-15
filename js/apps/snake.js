const SnakeApp = (() => {
  let gameLoops = {};
  let keyHandlers = {};

  function open() {
    WindowManager.create({
      title: 'Snake',
      icon: '\u{1F40D}',
      width: 420,
      height: 420,
      content: createGame,
      app: { destroy: (id) => { cleanup(id); } }
    });
  }

  function createGame(body, winId) {
    const GRID = 20;
    const COLS = 19;
    const ROWS = 17;
    const W = COLS * GRID;
    const H = ROWS * GRID;

    body.innerHTML = `
      <div class="game-app">
        <div class="game-score" id="score-${winId}">Score: 0</div>
        <canvas width="${W}" height="${H}"></canvas>
        <div class="game-overlay" id="overlay-${winId}">
          <h2>SNAKE</h2>
          <p>Use Arrow Keys or WASD to move.<br>Eat food to grow. Don't hit walls!</p>
          <button id="start-${winId}">START GAME</button>
        </div>
      </div>
    `;

    const canvas = body.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let snake, food, dir, nextDir, score, alive, speed;

    function init() {
      snake = [{ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }];
      dir = { x: 1, y: 0 };
      nextDir = { x: 1, y: 0 };
      score = 0;
      alive = true;
      speed = 120;
      placeFood();
      updateScore();
    }

    function placeFood() {
      do {
        food = {
          x: Math.floor(Math.random() * COLS),
          y: Math.floor(Math.random() * ROWS)
        };
      } while (snake.some(s => s.x === food.x && s.y === food.y));
    }

    function updateScore() {
      const el = document.getElementById('score-' + winId);
      if (el) el.textContent = 'Score: ' + score;
    }

    function update() {
      if (!alive) return;
      dir = { ...nextDir };
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        die();
        return;
      }
      if (snake.some(s => s.x === head.x && s.y === head.y)) {
        die();
        return;
      }

      snake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        placeFood();
        if (speed > 60) speed -= 2;
        if (typeof Sound !== 'undefined') Sound.play('score');
      } else {
        snake.pop();
      }

      draw();
    }

    function draw() {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(51, 255, 51, 0.05)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= W; x += GRID) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y <= H; y += GRID) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? '#66ff66' : '#33ff33';
        ctx.fillRect(seg.x * GRID + 1, seg.y * GRID + 1, GRID - 2, GRID - 2);
        if (i === 0) {
          ctx.fillStyle = '#0a0a0a';
          ctx.fillRect(seg.x * GRID + 5, seg.y * GRID + 5, 4, 4);
          ctx.fillRect(seg.x * GRID + 11, seg.y * GRID + 5, 4, 4);
        }
      });

      ctx.fillStyle = '#ff3333';
      ctx.fillRect(food.x * GRID + 2, food.y * GRID + 2, GRID - 4, GRID - 4);
      ctx.fillStyle = '#ff6666';
      ctx.fillRect(food.x * GRID + 5, food.y * GRID + 3, 4, 4);
    }

    function die() {
      alive = false;
      if (typeof Sound !== 'undefined') Sound.play('gameover');
      clearInterval(gameLoops[winId]);
      const overlay = document.getElementById('overlay-' + winId);
      overlay.innerHTML = `
        <h2>GAME OVER</h2>
        <p>Score: ${score}</p>
        <button id="restart-${winId}">PLAY AGAIN</button>
      `;
      overlay.classList.remove('hidden');
      document.getElementById('restart-' + winId).addEventListener('click', () => {
        startGame();
      });
    }

    function startGame() {
      init();
      draw();
      const overlay = document.getElementById('overlay-' + winId);
      overlay.classList.add('hidden');
      clearInterval(gameLoops[winId]);
      gameLoops[winId] = setInterval(update, speed);
    }

    function keyHandler(e) {
      if (!alive) return;
      const key = e.key.toLowerCase();
      if ((key === 'arrowup' || key === 'w') && dir.y !== 1) nextDir = { x: 0, y: -1 };
      else if ((key === 'arrowdown' || key === 's') && dir.y !== -1) nextDir = { x: 0, y: 1 };
      else if ((key === 'arrowleft' || key === 'a') && dir.x !== 1) nextDir = { x: -1, y: 0 };
      else if ((key === 'arrowright' || key === 'd') && dir.x !== -1) nextDir = { x: 1, y: 0 };
      else return;
      e.preventDefault();
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
