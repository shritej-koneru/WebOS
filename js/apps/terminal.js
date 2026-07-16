const TerminalApp = (() => {
  const commands = {
    help: () => ({
      text: `Available commands:
  help     - Show this help
  clear    - Clear terminal
  echo     - Print text
  date     - Show current date/time
  whoami   - Show current user
  ls       - List files
  cat      - Show file contents
  color    - Change text color
  calc     - Simple calculator
  fortune  - Random fortune
  neofetch - System info
  shutdown - Shut down RetroOS`,
      type: 'info'
    }),
    clear: () => ({ action: 'clear' }),
    echo: (args) => ({ text: args.join(' ') || '' }),
    date: () => ({ text: new Date().toString(), type: 'info' }),
    whoami: () => ({ text: 'retro@retroos', type: 'success' }),
    ls: () => ({
      text: `Desktop/   Documents/   Games/   system.log   config.sys
retro.dat   readme.txt   paint/   music/`,
      type: 'info'
    }),
    cat: (args) => {
      const files = {
        'readme.txt': 'Welcome to RetroOS!\nA retro-themed operating system.\nType "help" for available commands.',
        'system.log': '[BOOT] System initialized\n[LOAD] Window manager ready\n[OKAY] All systems operational',
        'config.sys': 'OS=RetroOS\nVERSION=1.0\nTHEME=green\nRESOLUTION=classic',
        'retro.dat': '???? ????? ?????? ??? ???',
      };
      const file = args[0];
      if (!file) return { text: 'Usage: cat <filename>', type: 'error' };
      if (files[file]) return { text: files[file] };
      return { text: `cat: ${file}: No such file or directory`, type: 'error' };
    },
    color: (args) => {
      const colors = {
        green: '#33ff33', red: '#ff3333', blue: '#33aaff',
        yellow: '#ffff33', cyan: '#33ffff', magenta: '#ff33ff',
        white: '#ffffff', orange: '#ffaa33',
      };
      const color = colors[args[0]];
      if (!color) return { text: 'Usage: color <name>\nColors: green, red, blue, yellow, cyan, magenta, white, orange', type: 'info' };
      return { action: 'color', value: color };
    },
    calc: (args) => {
      try {
        const expr = args.join('');
        if (!expr) return { text: 'Usage: calc <expression>\nExample: calc 2 + 2', type: 'info' };
        const sanitized = expr.replace(/[^0-9+\-*/().%\s]/g, '');
        const result = Function('"use strict"; return (' + sanitized + ')')();
        return { text: `= ${result}`, type: 'success' };
      } catch (e) {
        return { text: 'Error: Invalid expression', type: 'error' };
      }
    },
    fortune: () => {
      const fortunes = [
        'The best way to predict the future is to invent it.',
        'A journey of a thousand miles begins with a single step.',
        'Code is poetry written in logic.',
        'In the middle of difficulty lies opportunity.',
        'The only way to do great work is to love what you do.',
        'Stay hungry, stay foolish.',
        'First, solve the problem. Then, write the code.',
        'The best error message is the one that never shows up.',
        'Talk is cheap. Show me the code. - Linus Torvalds',
        'Any sufficiently advanced technology is indistinguishable from magic.',
      ];
      return { text: fortunes[Math.floor(Math.random() * fortunes.length)], type: 'info' };
    },
    neofetch: () => ({
      text: `       _____
      /     \\       retro@retroos
     / Retro \\      OS: RetroOS 1.0
    /  _____  \\     Host: Browser
   /  /     \\  \\    Kernel: JavaScript
  /  / Retro \\  \\   Shell: RetroTerm
 /__/\\_______/\\__\\  Resolution: ${window.innerWidth}x${window.innerHeight}
 \\  \\         /  /  Theme: Green CRT
  \\  \\_______/  /   Font: Press Start 2P
   \\___________/    Uptime: ${Math.floor((Date.now() - window._retroBootTime) / 1000)}s`,
      type: 'success'
    }),
    shutdown: () => ({ action: 'shutdown' }),
  };

  let activeColor = '#33ff33';

  function open() {
    WindowManager.create({
      title: 'Terminal',
      icon: '>_',
      width: 560,
      height: 400,
      content: createTerminal,
      app: { destroy: () => {} }
    });
  }

  function createTerminal(body, winId) {
    body.innerHTML = `
      <div class="app-terminal">
        <div class="terminal-output"></div>
        <div class="terminal-input-line">
          <span class="terminal-prompt">C:\\&gt;</span>
          <input class="terminal-input" type="text" autofocus spellcheck="false" autocomplete="off">
        </div>
      </div>
    `;

    const output = body.querySelector('.terminal-output');
    const input = body.querySelector('.terminal-input');
    let history = [];
    let historyIndex = -1;

    appendLine(output, 'RetroOS Terminal v1.0', 'info');
    appendLine(output, 'Type "help" for available commands.\n');

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        if (cmd) {
          history.push(cmd);
          historyIndex = history.length;
          appendLine(output, `C:\\>${cmd}`);
          processCommand(cmd, output, winId);
        }
        input.value = '';
        if (typeof Sound !== 'undefined') Sound.play('type');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          input.value = history[historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          historyIndex++;
          input.value = history[historyIndex];
        } else {
          historyIndex = history.length;
          input.value = '';
        }
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        output.innerHTML = '';
      }
    });

    body.addEventListener('click', () => input.focus());
  }

  function processCommand(cmd, output, winId) {
    const parts = cmd.split(/\s+/);
    const name = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (commands[name]) {
      const result = commands[name](args);
      if (result.action === 'clear') {
        output.innerHTML = '';
      } else if (result.action === 'color') {
        activeColor = result.value;
        appendLine(output, `Color changed to ${args[0]}`);
      } else if (result.action === 'shutdown') {
        Desktop.toggleStartMenu(false);
        Desktop.toggleStartMenu;
        document.getElementById('start-menu').classList.add('hidden');
        const os = document.getElementById('os');
        const shutdownScreen = document.getElementById('shutdown-screen');
        os.classList.add('hidden');
        shutdownScreen.classList.remove('hidden');
        setTimeout(() => {
          shutdownScreen.classList.add('hidden');
          document.getElementById('boot-screen').classList.remove('hidden');
          Boot.start();
        }, 2000);
      } else if (result.text) {
        appendLine(output, result.text, result.type);
      }
    } else {
      appendLine(output, `'${name}' is not recognized as an internal command.\nType "help" for available commands.`, 'error');
      if (typeof Sound !== 'undefined') Sound.play('error');
    }

    output.scrollTop = output.scrollHeight;
  }

  function appendLine(output, text, type) {
    const line = document.createElement('div');
    line.className = 'terminal-line' + (type ? ' ' + type : '');
    line.textContent = text;
    if (type === 'info') line.style.color = '#33aaff';
    else if (type === 'error') line.style.color = '#ff3333';
    else if (type === 'success') line.style.color = '#33ff33';
    else line.style.color = activeColor;
    output.appendChild(line);
  }

  return { open };
})();
