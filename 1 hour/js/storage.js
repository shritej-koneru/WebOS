const Storage = (() => {
  const KEY = 'retroos-state';

  function save() {
    try {
      const wins = WindowManager.getAll();
      const state = {
        windows: Object.entries(wins).map(([id, w]) => ({
          title: w.title,
          icon: w.icon,
          x: w.el.offsetLeft,
          y: w.el.offsetTop,
          w: w.el.offsetWidth,
          h: w.el.offsetHeight,
          minimized: w.minimized,
          maximized: w.maximized,
        })),
        settings: SettingsApp ? SettingsApp.settings : {},
      };
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
    } catch (e) {}
  }

  function clear() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) {}
  }

  return { save, load, clear };
})();
