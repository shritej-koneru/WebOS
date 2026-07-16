const PongApp = (() => {
  let gameLoops = {};
  let keyHandlers = {};

  function open() {
    WindowManager.create({
      title: 'Pong',
      icon: '\u{1F3D3}',
      width: 500,
      height: 400,
      content: createGame,
      app: { destroy: (id) => { cleanup(id); } }
    });
  }

  function createGame(body, winId) {
    const W = 480;
    const H = 360;
    const PADDLE_W = 10;
    const PADDLE_H = 60;
    const BALL_SIZE = 8;
    const WIN_SCORE = 7;

    body.innerHTML = `
      <div class="game-app" tabindex="0" style="outline:none;">
        <div class="game-score" id="pscore-${winId}">0 - 0</div>
        <canvas width="${W}" height="${H}" tabindex="-1"></canvas>
        <div class="game-overlay" id="overlay-${winId}">
          <h2>PONG</h2>
          <p>Player 1 (Left): W / S keys<br>Player 2 (Right): Up / Down arrows<br>or play vs AI</p>
          <button id="start-pvp-${winId}">2 PLAYER</button>
          <button id="start-ai-${winId}">VS AI</button>
        </div>
      </div>
    `;

    const canvas = body.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const gameEl = body.querySelector('.game-app');

    let paddle1, paddle2, ball, score1, score2, alive, vsAI;
    let keys = {};

    function init() {
      paddle1 = { x: 16, y: H / 2 - PADDLE_H / 2 };
      paddle2 = { x: W - 16 - PADDLE_W, y: H / 2 - PADDLE_H / 2 };
      ball = { x: W / 2, y: H / 2, dx: 4 * (Math.random() > 0.5 ? 1 : -1), dy: 2 * (Math.random() > 0.5 ? 1 : -1) };
      score1 = 0;
      score2 = 0;
      alive = true;
      keys = {};
      updateScore();
    }

    function resetBall() {
      ball.x = W / 2;
      ball.y = H / 2;
      ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
      ball.dy = 2 * (Math.random() > 0.5 ? 1 : -1);
    }

    function updateScore() {
      const el = document.getElementById('pscore-' + winId);
      if (el) el.textContent = score1 + ' - ' + score2;
    }

    function update() {
      if (!alive) return;

      if (keys['w'] || keys['W']) paddle1.y -= 5;
      if (keys['s'] || keys['S']) paddle1.y += 5;
      paddle1.y = Math.max(0, Math.min(H - PADDLE_H, paddle1.y));

      if (vsAI) {
        const target = ball.y - PADDLE_H / 2;
        const diff = target - paddle2.y;
        paddle2.y += diff * 0.06;
      } else {
        if (keys['ArrowUp']) paddle2.y -= 5;
        if (keys['ArrowDown']) paddle2.y += 5;
      }
      paddle2.y = Math.max(0, Math.min(H - PADDLE_H, paddle2.y));

      ball.x += ball.dx;
      ball.y += ball.dy;

      if (ball.y <= 0 || ball.y >= H - BALL_SIZE) {
        ball.dy *= -1;
        if (typeof Sound !== 'undefined') Sound.play('hit');
      }

      if (ball.x <= paddle1.x + PADDLE_W &&
          ball.y + BALL_SIZE >= paddle1.y &&
          ball.y <= paddle1.y + PADDLE_H &&
          ball.dx < 0) {
        ball.dx *= -1.05;
        const hitPos = (ball.y - paddle1.y) / PADDLE_H;
        ball.dy = (hitPos - 0.5) * 8;
        if (typeof Sound !== 'undefined') Sound.play('hit');
      }

      if (ball.x + BALL_SIZE >= paddle2.x &&
          ball.y + BALL_SIZE >= paddle2.y &&
          ball.y <= paddle2.y + PADDLE_H &&
          ball.dx > 0) {
        ball.dx *= -1.05;
        const hitPos = (ball.y - paddle2.y) / PADDLE_H;
        ball.dy = (hitPos - 0.5) * 8;
        if (typeof Sound !== 'undefined') Sound.play('hit');
      }

      if (ball.x < 0) {
        score2++;
        updateScore();
        if (score2 >= WIN_SCORE) { endGame('Player 2'); return; }
        resetBall();
        if (typeof Sound !== 'undefined') Sound.play('score');
      }
      if (ball.x > W) {
        score1++;
        updateScore();
        if (score1 >= WIN_SCORE) { endGame(vsAI ? 'You' : 'Player 1'); return; }
        resetBall();
        if (typeof Sound !== 'undefined') Sound.play('score');
      }

      draw();
    }

    function draw() {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, W, H);

      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = 'rgba(51, 255, 51, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#33ff33';
      ctx.fillRect(paddle1.x, paddle1.y, PADDLE_W, PADDLE_H);
      ctx.fillRect(paddle2.x, paddle2.y, PADDLE_W, PADDLE_H);

      ctx.shadowColor = '#33ff33';
      ctx.shadowBlur = 8;
      ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
      ctx.shadowBlur = 0;

      ctx.font = '10px "Press Start 2P"';
      ctx.fillStyle = 'rgba(51, 255, 51, 0.3)';
      ctx.textAlign = 'center';
      ctx.fillText(score1, W / 4, 40);
      ctx.fillText(score2, W * 3 / 4, 40);
      ctx.textAlign = 'start';
    }

    function endGame(winner) {
      alive = false;
      clearInterval(gameLoops[winId]);
      if (typeof Sound !== 'undefined') Sound.play('gameover');
      const overlay = document.getElementById('overlay-' + winId);
      overlay.innerHTML = `
        <h2>${winner} WINS!</h2>
        <p>Score: ${score1} - ${score2}</p>
        <button id="restart-pvp-${winId}">2 PLAYER</button>
        <button id="restart-ai-${winId}">VS AI</button>
      `;
      overlay.classList.remove('hidden');
      document.getElementById('restart-pvp-' + winId).addEventListener('click', () => startGame(false));
      document.getElementById('restart-ai-' + winId).addEventListener('click', () => startGame(true));
    }

    function startGame(ai) {
      vsAI = ai;
      clearInterval(gameLoops[winId]);
      init();
      draw();
      document.getElementById('overlay-' + winId).classList.add('hidden');
      gameEl.focus();
      gameLoops[winId] = setInterval(update, 1000 / 60);
    }

    function onKeyDown(e) {
      const gameKeys = ['w','W','s','S','ArrowUp','ArrowDown',' '];
      if (gameKeys.includes(e.key)) {
        keys[e.key] = true;
        e.preventDefault();
      }
    }

    function onKeyUp(e) {
      const gameKeys = ['w','W','s','S','ArrowUp','ArrowDown',' '];
      if (gameKeys.includes(e.key)) {
        keys[e.key] = false;
      }
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    keyHandlers[winId] = { keydown: onKeyDown, keyup: onKeyUp };

    gameEl.addEventListener('click', () => gameEl.focus());

    document.getElementById('start-pvp-' + winId).addEventListener('click', () => startGame(false));
    document.getElementById('start-ai-' + winId).addEventListener('click', () => startGame(true));
    init();
    draw();
  }

  function cleanup(id) {
    if (gameLoops[id]) {
      clearInterval(gameLoops[id]);
      delete gameLoops[id];
    }
    if (keyHandlers[id]) {
      document.removeEventListener('keydown', keyHandlers[id].keydown);
      document.removeEventListener('keyup', keyHandlers[id].keyup);
      delete keyHandlers[id];
    }
  }

  return { open };
})();
