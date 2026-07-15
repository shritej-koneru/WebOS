const BreakoutApp = (() => {
  let gameLoops = {};

  function open() {
    WindowManager.create({
      title: 'Breakout',
      icon: '\u{1F3AF}',
      width: 580,
      height: 440,
      content: createGame,
      app: { destroy: (id) => { cleanup(id); } }
    });
  }

  function createGame(body, winId) {
    const W = 400;
    const H = 380;
    const PANEL_W = 160;
    const BRICK_ROWS = 6;
    const BRICK_COLS = 8;
    const BRICK_W = 46;
    const BRICK_H = 16;
    const BRICK_PAD = 2;
    const BRICK_TOP = 40;
    const PADDLE_W = 64;
    const PADDLE_H = 10;
    const BALL_R = 5;

    body.innerHTML = `
      <div class="breakout-wrapper">
        <div class="breakout-game-area">
          <canvas width="${W}" height="${H}"></canvas>
          <div class="game-overlay" id="overlay-${winId}">
            <h2>BREAKOUT</h2>
            <p>Break all the bricks!<br>You have 3 lives.</p>
            <button id="start-${winId}">START GAME</button>
          </div>
        </div>
        <div class="breakout-panel">
          <div class="panel-title">HOW TO PLAY</div>
          <div class="panel-section">
            <div class="panel-label">MOUSE</div>
            <div class="panel-text">Move left/right</div>
          </div>
          <div class="panel-section">
            <div class="panel-label">ARROWS</div>
            <div class="panel-text">&larr; &rarr; keys</div>
          </div>
          <div class="panel-divider"></div>
          <div class="panel-section">
            <div class="panel-label">GOAL</div>
            <div class="panel-text">Break all bricks<br>to win!</div>
          </div>
          <div class="panel-divider"></div>
          <div class="panel-section">
            <div class="panel-label">SCORING</div>
            <div class="panel-text">+10 per brick</div>
          </div>
          <div class="panel-divider"></div>
          <div class="panel-section">
            <div class="panel-label">LIVES</div>
            <div class="panel-lives" id="lives-${winId}">
              <span class="life-heart">&hearts;</span>
              <span class="life-heart">&hearts;</span>
              <span class="life-heart">&hearts;</span>
            </div>
          </div>
          <div class="panel-divider"></div>
          <div class="panel-section">
            <div class="panel-label">SCORE</div>
            <div class="panel-score" id="pscore-${winId}">0</div>
          </div>
        </div>
      </div>
    `;

    const canvas = body.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let paddle, ball, bricks, score, lives, alive, ballLaunched, loopId;

    const BRICK_COLORS = ['#ff3333', '#ff8800', '#ffff33', '#33ff33', '#33aaff', '#aa33ff'];

    function init() {
      paddle = { x: W / 2 - PADDLE_W / 2, y: H - 30 };
      ball = { x: W / 2, y: H - 30 - BALL_R - 2, dx: 0, dy: 0 };
      score = 0;
      lives = 3;
      alive = true;
      ballLaunched = false;
      bricks = [];
      for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
          bricks.push({
            x: c * (BRICK_W + BRICK_PAD) + BRICK_PAD + (W - BRICK_COLS * (BRICK_W + BRICK_PAD)) / 2,
            y: r * (BRICK_H + BRICK_PAD) + BRICK_TOP,
            w: BRICK_W,
            h: BRICK_H,
            color: BRICK_COLORS[r],
            alive: true,
          });
        }
      }
      updateUI();
    }

    function launchBall() {
      if (ballLaunched) return;
      ballLaunched = true;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
      const speed = 4;
      ball.dx = Math.cos(angle) * speed;
      ball.dy = Math.sin(angle) * speed;
    }

    function resetBall() {
      ballLaunched = false;
      ball.x = paddle.x + PADDLE_W / 2;
      ball.y = paddle.y - BALL_R - 2;
      ball.dx = 0;
      ball.dy = 0;
    }

    function updateUI() {
      const scoreEl = document.getElementById('pscore-' + winId);
      if (scoreEl) scoreEl.textContent = score;

      const livesEl = document.getElementById('lives-' + winId);
      if (livesEl) {
        livesEl.innerHTML = '';
        for (let i = 0; i < 3; i++) {
          const heart = document.createElement('span');
          heart.className = 'life-heart' + (i < lives ? ' active' : ' lost');
          heart.innerHTML = '&hearts;';
          livesEl.appendChild(heart);
        }
      }
    }

    function update() {
      if (!alive) return;

      if (!ballLaunched) {
        ball.x = paddle.x + PADDLE_W / 2;
        ball.y = paddle.y - BALL_R - 2;
        draw();
        return;
      }

      ball.x += ball.dx;
      ball.y += ball.dy;

      if (ball.x - BALL_R <= 0) {
        ball.x = BALL_R;
        ball.dx = Math.abs(ball.dx);
        if (typeof Sound !== 'undefined') Sound.play('hit');
      }
      if (ball.x + BALL_R >= W) {
        ball.x = W - BALL_R;
        ball.dx = -Math.abs(ball.dx);
        if (typeof Sound !== 'undefined') Sound.play('hit');
      }
      if (ball.y - BALL_R <= 0) {
        ball.y = BALL_R;
        ball.dy = Math.abs(ball.dy);
        if (typeof Sound !== 'undefined') Sound.play('hit');
      }

      if (ball.dy > 0 &&
          ball.y + BALL_R >= paddle.y &&
          ball.y + BALL_R <= paddle.y + PADDLE_H + 4 &&
          ball.x >= paddle.x - 4 &&
          ball.x <= paddle.x + PADDLE_W + 4) {
        ball.dy = -Math.abs(ball.dy);
        const hitPos = (ball.x - paddle.x) / PADDLE_W;
        ball.dx = (hitPos - 0.5) * 7;
        ball.y = paddle.y - BALL_R - 1;
        if (typeof Sound !== 'undefined') Sound.play('hit');
      }

      if (ball.y > H + 10) {
        lives--;
        updateUI();
        if (lives <= 0) {
          die();
          return;
        }
        resetBall();
        if (typeof Sound !== 'undefined') Sound.play('error');
      }

      let hitBrick = false;
      bricks.forEach(brick => {
        if (!brick.alive || hitBrick) return;
        if (ball.x + BALL_R > brick.x &&
            ball.x - BALL_R < brick.x + brick.w &&
            ball.y + BALL_R > brick.y &&
            ball.y - BALL_R < brick.y + brick.h) {
          brick.alive = false;
          hitBrick = true;

          const overlapLeft = (ball.x + BALL_R) - brick.x;
          const overlapRight = (brick.x + brick.w) - (ball.x - BALL_R);
          const overlapTop = (ball.y + BALL_R) - brick.y;
          const overlapBottom = (brick.y + brick.h) - (ball.y - BALL_R);
          const minOverlapX = Math.min(overlapLeft, overlapRight);
          const minOverlapY = Math.min(overlapTop, overlapBottom);

          if (minOverlapX < minOverlapY) {
            ball.dx *= -1;
          } else {
            ball.dy *= -1;
          }

          score += 10;
          updateUI();
          if (typeof Sound !== 'undefined') Sound.play('score');
        }
      });

      if (bricks.every(b => !b.alive)) {
        alive = false;
        clearInterval(gameLoops[winId]);
        if (typeof Sound !== 'undefined') Sound.play('line');
        const overlay = document.getElementById('overlay-' + winId);
        overlay.innerHTML = `
          <h2 style="color:#33ff33;">YOU WIN!</h2>
          <p>Final Score: ${score}</p>
          <button id="restart-${winId}">PLAY AGAIN</button>
        `;
        overlay.classList.remove('hidden');
        document.getElementById('restart-' + winId).addEventListener('click', () => {
          init();
          draw();
          overlay.classList.add('hidden');
          gameLoops[winId] = setInterval(update, 1000 / 60);
        });
      }

      draw();
    }

    function draw() {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(51, 255, 51, 0.04)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= W; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y <= H; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      bricks.forEach(brick => {
        if (!brick.alive) return;
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fillRect(brick.x, brick.y, brick.w, 3);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(brick.x, brick.y + brick.h - 2, brick.w, 2);
      });

      ctx.fillStyle = '#33ff33';
      ctx.shadowColor = '#33ff33';
      ctx.shadowBlur = 6;
      ctx.fillRect(paddle.x, paddle.y, PADDLE_W, PADDLE_H);
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (!ballLaunched && alive) {
        ctx.font = '8px "Press Start 2P"';
        ctx.fillStyle = 'rgba(51, 255, 51, 0.5)';
        ctx.textAlign = 'center';
        ctx.fillText('Click or press SPACE to launch', W / 2, H / 2);
        ctx.textAlign = 'start';
      }
    }

    function die() {
      alive = false;
      clearInterval(gameLoops[winId]);
      if (typeof Sound !== 'undefined') Sound.play('gameover');
      const overlay = document.getElementById('overlay-' + winId);
      overlay.innerHTML = `
        <h2 style="color:#ff3333;">GAME OVER</h2>
        <p>Final Score: ${score}</p>
        <button id="restart-${winId}">RETRY</button>
      `;
      overlay.classList.remove('hidden');
      document.getElementById('restart-' + winId).addEventListener('click', () => {
        init();
        draw();
        overlay.classList.add('hidden');
        gameLoops[winId] = setInterval(update, 1000 / 60);
      });
    }

    canvas.addEventListener('click', () => {
      if (alive && !ballLaunched) launchBall();
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      paddle.x = (e.clientX - rect.left) * scaleX - PADDLE_W / 2;
      paddle.x = Math.max(0, Math.min(W - PADDLE_W, paddle.x));
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      paddle.x = (touch.clientX - rect.left) * scaleX - PADDLE_W / 2;
      paddle.x = Math.max(0, Math.min(W - PADDLE_W, paddle.x));
    });

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (alive && !ballLaunched) launchBall();
    });

    document.addEventListener('keydown', (e) => {
      if (!alive) return;
      if (e.key === 'ArrowLeft') {
        paddle.x = Math.max(0, paddle.x - 20);
      } else if (e.key === 'ArrowRight') {
        paddle.x = Math.min(W - PADDLE_W, paddle.x + 20);
      } else if (e.key === ' ') {
        e.preventDefault();
        launchBall();
      }
    });

    document.getElementById('start-' + winId).addEventListener('click', () => {
      init();
      draw();
      document.getElementById('overlay-' + winId).classList.add('hidden');
      gameLoops[winId] = setInterval(update, 1000 / 60);
    });

    init();
    draw();
  }

  function cleanup(id) {
    if (gameLoops[id]) {
      clearInterval(gameLoops[id]);
      delete gameLoops[id];
    }
  }

  return { open };
})();
