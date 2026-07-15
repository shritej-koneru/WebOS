const PaintApp = (() => {
  const COLORS = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
    '#ff00ff', '#00ffff', '#ff8800', '#8800ff', '#0088ff', '#ff0088',
    '#888888', '#444444', '#884400', '#00ff88', '#ff4444', '#44ff44',
    '#4444ff', '#ffaa00', '#aa00ff', '#00aaff', '#ff5555', '#55ff55',
  ];

  let activeColor = '#000000';
  let brushSize = 4;
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  function open() {
    WindowManager.create({
      title: 'Paint',
      icon: '\u{1F3A8}',
      width: 520,
      height: 440,
      content: createPaint,
      app: { destroy: () => {} }
    });
  }

  function createPaint(body) {
    body.innerHTML = `
      <div class="paint-app">
        <div class="paint-toolbar">
          <div class="paint-colors"></div>
          <div style="display:flex;gap:4px;align-items:center;">
            <button class="paint-brush active" data-size="4">S</button>
            <button class="paint-brush" data-size="8">M</button>
            <button class="paint-brush" data-size="16">L</button>
          </div>
          <button class="paint-eraser">ERASER</button>
          <button class="paint-fill">FILL</button>
          <button class="paint-clear">CLEAR</button>
          <button class="paint-save">SAVE</button>
        </div>
        <div class="paint-canvas-wrap">
          <canvas class="paint-canvas" width="480" height="360"></canvas>
        </div>
      </div>
    `;

    const canvas = body.querySelector('.paint-canvas');
    const ctx = canvas.getContext('2d');
    const colorsDiv = body.querySelector('.paint-colors');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    COLORS.forEach(color => {
      const swatch = document.createElement('div');
      swatch.className = 'paint-color-swatch' + (color === activeColor ? ' active' : '');
      swatch.style.background = color;
      swatch.addEventListener('click', () => {
        activeColor = color;
        colorsDiv.querySelectorAll('.paint-color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
      });
      colorsDiv.appendChild(swatch);
    });

    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      lastX = (e.clientX - rect.left) * scaleX;
      lastY = (e.clientY - rect.top) * scaleY;
      ctx.fillStyle = activeColor;
      ctx.fillRect(
        Math.floor(lastX / brushSize) * brushSize,
        Math.floor(lastY / brushSize) * brushSize,
        brushSize, brushSize
      );
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      ctx.strokeStyle = activeColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'square';
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();

      lastX = x;
      lastY = y;
    });

    document.addEventListener('mouseup', () => {
      isDrawing = false;
    });

    body.querySelectorAll('.paint-brush').forEach(btn => {
      btn.addEventListener('click', () => {
        brushSize = parseInt(btn.dataset.size);
        body.querySelectorAll('.paint-brush').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    let eraserMode = false;
    body.querySelector('.paint-eraser').addEventListener('click', function() {
      eraserMode = !eraserMode;
      this.classList.toggle('active');
      if (eraserMode) {
        activeColor = '#ffffff';
      }
    });

    body.querySelector('.paint-fill').addEventListener('click', () => {
      ctx.fillStyle = activeColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    body.querySelector('.paint-clear').addEventListener('click', () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    body.querySelector('.paint-save').addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = 'retroos-paint.png';
      link.href = canvas.toDataURL();
      link.click();
    });

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX, clientY: touch.clientY
      });
      canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX, clientY: touch.clientY
      });
      canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener('touchend', () => {
      canvas.dispatchEvent(new MouseEvent('mouseup'));
    });
  }

  return { open };
})();
