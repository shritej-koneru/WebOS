const FlappyApp = (() => {
  let gameLoops = {};
  let keyHandlers = {};
  let canvasHandlers = {};

  function open() {
    WindowManager.create({
      title: 'Flappy Bird',
      icon: '\u{1F426}',
      width: 340,
      height: 440,
      content: createGame,
      app: { destroy: (id) => { cleanup(id); } }
    });
  }

  function createGame(body, winId) {
    const W = 320;
    const H = 400;
    const GRAVITY = 0.35;
    const FLAP = -6;
    const PIPE_W = 40;
    const PIPE_GAP = 110;
    const PIPE_SPEED = 2.5;
    const BIRD_SIZE = 16;

    body.innerHTML = `
      <div class="game-app">
        <div class="game-score" id="fscore-${winId}">Score: 0</div>
        <canvas width="${W}" height="${H}"></canvas>
        <div class="game-overlay" id="overlay-${winId}">
          <h2>FLAPPY BIRD</h2>
          <p>Press Space, Up Arrow, or Click to flap.<br>Don't hit the pipes!</p>
          <button id="start-${winId}">START GAME</button>
        </div>
      </div>
    `;

    const canvas = body.querySelector('canvas');
    const ctx = canvas.getContext('2d');

    let bird, pipes, score, alive, started;

    function init() {
      bird = { x: 60, y: H / 2, vy: 0 };
      pipes = [];
      score = 0;
      alive = true;
      started = false;
      updateScore();
    }

    function flap() {
      if (!alive) return;
      if (!started) {
        started = true;
      }
      bird.vy = FLAP;
      if (typeof Sound !== 'undefined') Sound.play('hit');
    }

    function spawnPipe() {
      const gapY = 60 + Math.random() * (H - PIPE_GAP - 120);
      pipes.push({ x: W, gapY, scored: false });
    }

    function update() {
      if (!alive || !started) return;

      bird.vy += GRAVITY;
      bird.y += bird.vy;

      if (bird.y < 0 || bird.y + BIRD_SIZE > H) {
        die();
        return;
      }

      if (pipes.length === 0 || pipes[pipes.length - 1].x < W - 180) {
        spawnPipe();
      }

      pipes.forEach(pipe => {
        pipe.x -= PIPE_SPEED;

        const birdRight = bird.x + BIRD_SIZE;
        const birdBottom = bird.y + BIRD_SIZE;

        if (birdRight > pipe.x && bird.x < pipe.x + PIPE_W) {
          if (bird.y < pipe.gapY || birdBottom > pipe.gapY + PIPE_GAP) {
            die();
            return;
          }
        }

        if (!pipe.scored && pipe.x + PIPE_W < bird.x) {
          pipe.scored = true;
          score++;
          updateScore();
          if (typeof Sound !== 'undefined') Sound.play('score');
        }
      });

      pipes = pipes.filter(p => p.x > -PIPE_W);
      draw();
    }

    function draw() {
      ctx.fillStyle = '#0a0a2a';
      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = 'rgba(51, 255, 51, 0.03)';
        ctx.fillRect(0, i * 50, W, 1);
      }

      pipes.forEach(pipe => {
        ctx.fillStyle = '#33ff33';
        ctx.fillRect(pipe.x, 0, PIPE_W, pipe.gapY);
        ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_W, H - pipe.gapY - PIPE_GAP);

        ctx.fillStyle = '#22aa22';
        ctx.fillRect(pipe.x + 2, pipe.gapY - 10, PIPE_W - 4, 10);
        ctx.fillRect(pipe.x + 2, pipe.gapY + PIPE_GAP, PIPE_W - 4, 10);
      });

      ctx.fillStyle = '#ffff33';
      ctx.shadowColor = '#ffff33';
      ctx.shadowBlur = 6;
      ctx.fillRect(bird.x, bird.y, BIRD_SIZE, BIRD_SIZE);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ff8800';
      ctx.fillRect(bird.x + BIRD_SIZE - 4, bird.y + 4, 6, 4);

      ctx.fillStyle = '#000';
      ctx.fillRect(bird.x + 4, bird.y + 4, 3, 3);

      ctx.font = '8px "Press Start 2P"';
      ctx.fillStyle = 'rgba(51,255,51,0.4)';
      ctx.fillText('SCORE: ' + score, 8, 16);
    }

    function die() {
      alive = false;
      clearInterval(gameLoops[winId]);
      if (typeof Sound !== 'undefined') Sound.play('gameover');
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

    function updateScore() {
      const el = document.getElementById('fscore-' + winId);
      if (el) el.textContent = 'Score: ' + score;
    }

    function startGame() {
      clearInterval(gameLoops[winId]);
      init();
      draw();
      document.getElementById('overlay-' + winId).classList.add('hidden');
      gameLoops[winId] = setInterval(update, 1000 / 60);
    }

    function onKeyDown(e) {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!started && alive) { started = true; }
        flap();
      }
    }

    function onCanvasClick() {
      if (!started && alive) { started = true; }
      flap();
    }

    function onCanvasTouch(e) {
      e.preventDefault();
      if (!started && alive) { started = true; }
      flap();
    }

    document.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('click', onCanvasClick);
    canvas.addEventListener('touchstart', onCanvasTouch);
    keyHandlers[winId] = onKeyDown;
    canvasHandlers[winId] = { canvas, click: onCanvasClick, touch: onCanvasTouch };

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
    if (canvasHandlers[id]) {
      const ch = canvasHandlers[id];
      ch.canvas.removeEventListener('click', ch.click);
      ch.canvas.removeEventListener('touchstart', ch.touch);
      delete canvasHandlers[id];
    }
  }

  return { open };
})();
