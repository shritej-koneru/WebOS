const NotepadApp = (() => {
  function open() {
    WindowManager.create({
      title: 'Notepad',
      icon: '\u{1F4DD}',
      width: 480,
      height: 380,
      content: createNotepad,
      statusText: 'Ready',
      app: { destroy: () => {} }
    });
  }

  function createNotepad(body) {
    body.innerHTML = `
      <div class="notepad-app">
        <div class="notepad-toolbar">
          <button class="notepad-new">NEW</button>
          <button class="notepad-wordwrap">WORD WRAP</button>
          <button class="notepad-clear">CLEAR</button>
        </div>
        <textarea class="notepad-textarea" placeholder="Start typing..." spellcheck="false"></textarea>
        <div class="notepad-statusbar">
          <span class="notepad-chars">0 chars</span>
          <span class="notepad-lines">1 line</span>
        </div>
      </div>
    `;

    const textarea = body.querySelector('.notepad-textarea');
    const charsEl = body.querySelector('.notepad-chars');
    const linesEl = body.querySelector('.notepad-lines');
    let wordWrap = false;

    textarea.addEventListener('input', () => {
      charsEl.textContent = textarea.value.length + ' chars';
      const lineCount = textarea.value.split('\n').length;
      linesEl.textContent = lineCount + ' line' + (lineCount !== 1 ? 's' : '');
    });

    textarea.addEventListener('keydown', (e) => {
      if (typeof Sound !== 'undefined' && e.key.length === 1) {
        Sound.play('type');
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }
    });

    body.querySelector('.notepad-new').addEventListener('click', () => {
      textarea.value = '';
      textarea.dispatchEvent(new Event('input'));
    });

    body.querySelector('.notepad-wordwrap').addEventListener('click', () => {
      wordWrap = !wordWrap;
      textarea.style.whiteSpace = wordWrap ? 'pre-wrap' : 'pre';
      textarea.style.overflowX = wordWrap ? 'hidden' : 'auto';
    });

    body.querySelector('.notepad-clear').addEventListener('click', () => {
      textarea.value = '';
      textarea.dispatchEvent(new Event('input'));
    });

    textarea.focus();
  }

  return { open };
})();
