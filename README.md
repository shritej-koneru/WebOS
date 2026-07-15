# RetroOS

A retro-themed operating system running entirely in the browser. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no build tools.

## Features

- **BIOS Boot Sequence** — Typewriter text animation with progress bar
- **CRT Display Effects** — Scanlines, phosphor glow, screen curvature, subtle flicker
- **Pixel Art UI** — Press Start 2P font, neon green terminal aesthetic
- **Draggable Windows** — Move, resize, minimize, maximize, close
- **Window Snapping** — Drag windows to screen edges to snap into half/full screen
- **Taskbar** — Start menu, open window list, system clock
- **Context Menu** — Right-click on desktop
- **Multi-Desktop** — 4 virtual desktops, switch with Alt+1-4 or bottom-right dots
- **Clock Widget** — Draggable floating clock on desktop (double-click to remove)
- **Settings** — Change CRT color (green/amber/blue/cyan/red/white), toggle scanlines, flicker, curvature, glow, music
- **Background Music** — Toggleable chiptune ambient loop (Ctrl+M)
- **Keyboard Shortcuts** — Ctrl+T Terminal, Ctrl+N Notepad, Ctrl+P Paint, Ctrl+C Calculator, Ctrl+, Settings
- **Sound Effects** — 8-bit beeps for open/close/click/error/game events

## Built-in Apps (12 total)

| App | Description |
|-----|-------------|
| **Terminal** | Retro command line with `help`, `neofetch`, `calc`, `fortune`, `color`, and more |
| **Notepad** | Text editor with word wrap, tab support, character/line count |
| **Paint** | Pixel art canvas with 24-color palette, 3 brush sizes, eraser, fill, save as PNG |
| **Calculator** | Retro calculator with +, -, x, /, %, +/- |
| **Settings** | CRT color picker, scanlines/flicker/curvature/glow/music toggles |
| **Snake** | Classic snake with arrow keys/WASD, increasing speed |
| **Tetris** | Falling blocks with rotation, ghost piece, next preview, levels |
| **Pong** | 2-player (W/S + Up/Down) or vs AI, first to 7 |
| **Breakout** | Mouse/keyboard paddle, 6 rows of colored bricks, 3 lives |
| **Minesweeper** | 12x12 grid, 20 mines, left-click reveal, right-click flag |
| **2048** | Slide tiles with arrow keys/WASD, merge to reach 2048 |
| **Flappy Bird** | Space/Click to flap, avoid pipes |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+T` | Open Terminal |
| `Ctrl+N` | Open Notepad |
| `Ctrl+P` | Open Paint |
| `Ctrl+C` | Open Calculator |
| `Ctrl+,` | Open Settings |
| `Ctrl+M` | Toggle Background Music |
| `Alt+1-4` | Switch Desktop 1-4 |

## How to Run

Simply open `index.html` in any modern browser. No server required.

## Tech Stack

- HTML5 Canvas (games, paint)
- CSS3 (CRT effects, animations, gradients)
- Vanilla JavaScript (no dependencies)
- Web Audio API (sound effects & music)
- localStorage (settings persistence)
- Google Fonts: Press Start 2P
