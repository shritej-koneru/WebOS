const Shortcuts = (() => {
  const bindings = [
    { keys: ['Control', 't'], action: () => TerminalApp.open(), desc: 'Open Terminal' },
    { keys: ['Control', 'n'], action: () => NotepadApp.open(), desc: 'Open Notepad' },
    { keys: ['Control', 'p'], action: () => PaintApp.open(), desc: 'Open Paint' },
    { keys: ['Control', 'c'], action: () => CalculatorApp.open(), desc: 'Open Calculator' },
    { keys: ['Control', ','], action: () => SettingsApp.open(), desc: 'Open Settings' },
    { keys: ['Control', 'm'], action: () => Music.toggle(), desc: 'Toggle Music' },
    { keys: ['Alt', '1'], action: () => MultiDesktop.switchTo(0), desc: 'Desktop 1' },
    { keys: ['Alt', '2'], action: () => MultiDesktop.switchTo(1), desc: 'Desktop 2' },
    { keys: ['Alt', '3'], action: () => MultiDesktop.switchTo(2), desc: 'Desktop 3' },
    { keys: ['Alt', '4'], action: () => MultiDesktop.switchTo(3), desc: 'Desktop 4' },
  ];

  function init() {
    document.addEventListener('keydown', (e) => {
      for (const binding of bindings) {
        const allPressed = binding.keys.every(k => {
          if (k === 'Control') return e.ctrlKey;
          if (k === 'Alt') return e.altKey;
          if (k === 'Shift') return e.shiftKey;
          if (k === 'Meta') return e.metaKey;
          return e.key.toLowerCase() === k.toLowerCase();
        });
        if (allPressed) {
          e.preventDefault();
          binding.action();
          return;
        }
      }
    });
  }

  return { init, bindings };
})();
