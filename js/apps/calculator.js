const CalculatorApp = (() => {
  function open() {
    WindowManager.create({
      title: 'Calculator',
      icon: '\u{1F5A9}',
      width: 280,
      height: 360,
      content: createCalculator,
      app: { destroy: () => {} }
    });
  }

  function createCalculator(body) {
    let display = '0';
    let prev = null;
    let op = null;
    let fresh = true;

    body.innerHTML = `
      <div class="calc-app">
        <div class="calc-display">0</div>
        <div class="calc-buttons">
          <button class="calc-btn func" data-action="clear">C</button>
          <button class="calc-btn func" data-action="negate">+/-</button>
          <button class="calc-btn func" data-action="percent">%</button>
          <button class="calc-btn op" data-action="op" data-op="/">/</button>
          <button class="calc-btn num" data-action="num" data-val="7">7</button>
          <button class="calc-btn num" data-action="num" data-val="8">8</button>
          <button class="calc-btn num" data-action="num" data-val="9">9</button>
          <button class="calc-btn op" data-action="op" data-op="*">x</button>
          <button class="calc-btn num" data-action="num" data-val="4">4</button>
          <button class="calc-btn num" data-action="num" data-val="5">5</button>
          <button class="calc-btn num" data-action="num" data-val="6">6</button>
          <button class="calc-btn op" data-action="op" data-op="-">-</button>
          <button class="calc-btn num" data-action="num" data-val="1">1</button>
          <button class="calc-btn num" data-action="num" data-val="2">2</button>
          <button class="calc-btn num" data-action="num" data-val="3">3</button>
          <button class="calc-btn op" data-action="op" data-op="+">+</button>
          <button class="calc-btn num zero" data-action="num" data-val="0">0</button>
          <button class="calc-btn num" data-action="decimal">.</button>
          <button class="calc-btn op equals" data-action="equals">=</button>
        </div>
      </div>
    `;

    const displayEl = body.querySelector('.calc-display');

    function updateDisplay(val) {
      display = val;
      displayEl.textContent = val;
    }

    function calculate(a, b, operator) {
      a = parseFloat(a);
      b = parseFloat(b);
      switch (operator) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b !== 0 ? a / b : 'Error';
        default: return b;
      }
    }

    body.querySelectorAll('.calc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof Sound !== 'undefined') Sound.play('click');
        const action = btn.dataset.action;

        if (action === 'num') {
          if (fresh) {
            updateDisplay(btn.dataset.val);
            fresh = false;
          } else {
            updateDisplay(display === '0' ? btn.dataset.val : display + btn.dataset.val);
          }
        } else if (action === 'decimal') {
          if (!display.includes('.')) {
            updateDisplay(display + '.');
            fresh = false;
          }
        } else if (action === 'op') {
          if (prev !== null && !fresh) {
            const result = calculate(prev, display, op);
            updateDisplay(String(result));
            prev = result;
          } else {
            prev = parseFloat(display);
          }
          op = btn.dataset.op;
          fresh = true;
        } else if (action === 'equals') {
          if (prev !== null && op) {
            const result = calculate(prev, display, op);
            updateDisplay(String(result));
            prev = null;
            op = null;
            fresh = true;
          }
        } else if (action === 'clear') {
          updateDisplay('0');
          prev = null;
          op = null;
          fresh = true;
        } else if (action === 'negate') {
          updateDisplay(String(parseFloat(display) * -1));
        } else if (action === 'percent') {
          updateDisplay(String(parseFloat(display) / 100));
        }
      });
    });
  }

  return { open };
})();
