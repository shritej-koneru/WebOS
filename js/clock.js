const ClockWidget = (() => {
  let widgetEl = null;
  let intervalId = null;

  function create() {
    if (widgetEl) { widgetEl.remove(); }

    widgetEl = document.createElement('div');
    widgetEl.className = 'clock-widget';
    widgetEl.innerHTML = `
      <div class="clock-widget-time"></div>
      <div class="clock-widget-date"></div>
    `;

    const desktop = document.getElementById('desktop');
    desktop.appendChild(widgetEl);

    const screenW = desktop.offsetWidth;
    widgetEl.style.right = '16px';
    widgetEl.style.top = '16px';
    widgetEl.style.left = 'auto';

    makeDraggable(widgetEl);
    update();
    intervalId = setInterval(update, 1000);

    widgetEl.addEventListener('dblclick', () => {
      widgetEl.remove();
      widgetEl = null;
      clearInterval(intervalId);
    });
  }

  function update() {
    if (!widgetEl) return;
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    widgetEl.querySelector('.clock-widget-time').textContent = h + ':' + m + ':' + s;

    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    widgetEl.querySelector('.clock-widget-date').textContent =
      days[now.getDay()] + ' ' + now.getDate() + ' ' + months[now.getMonth()];
  }

  function makeDraggable(el) {
    let isDragging = false;
    let startX, startY, origLeft, origTop;

    el.addEventListener('mousedown', (e) => {
      if (e.target.closest('.clock-widget-time') || e.target.closest('.clock-widget-date') || e.target === el) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        origLeft = el.offsetLeft;
        origTop = el.offsetTop;
        el.style.right = 'auto';
        e.preventDefault();
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      el.style.left = (origLeft + e.clientX - startX) + 'px';
      el.style.top = (origTop + e.clientY - startY) + 'px';
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  return { create };
})();
