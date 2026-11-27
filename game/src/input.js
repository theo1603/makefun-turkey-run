// Gobble Getaway — keyboard and mouse input.
// One object owns every key the game listens to, so the update code
// asks questions ("is jump held?") instead of reading events itself.

const JUMP_KEYS = new Set(['Space', 'ArrowUp', 'KeyW']);
const HIDE_KEYS = new Set(['ArrowDown', 'KeyS']);
const SPRINT_KEYS = new Set(['ShiftLeft', 'ShiftRight']);

export class Input {
  constructor(canvas) {
    this.pressed = new Set();
    this.justPressed = new Set();
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseClicked = false;
    this.anyKeyPressed = false;

    window.addEventListener('keydown', (event) => {
      if (JUMP_KEYS.has(event.code) || event.code === 'ArrowDown') {
        event.preventDefault();
      }
      if (!event.repeat) {
        this.pressed.add(event.code);
        this.justPressed.add(event.code);
      }
      this.anyKeyPressed = true;
    });
    window.addEventListener('keyup', (event) => {
      this.pressed.delete(event.code);
    });
    window.addEventListener('blur', () => {
      this.pressed.clear();
    });
    canvas.addEventListener('pointerdown', (event) => {
      const rect = canvas.getBoundingClientRect();
      this.mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
      this.mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);
      this.mouseClicked = true;
      this.anyKeyPressed = true;
    });
  }

  get jumpHeld() {
    return [...JUMP_KEYS].some((code) => this.pressed.has(code));
  }

  get hideHeld() {
    return [...HIDE_KEYS].some((code) => this.pressed.has(code));
  }

  get sprintHeld() {
    return [...SPRINT_KEYS].some((code) => this.pressed.has(code));
  }

  get jumpJustPressed() {
    return [...JUMP_KEYS].some((code) => this.justPressed.has(code)) || this.mouseClicked;
  }

  get confirmJustPressed() {
    return this.justPressed.has('Enter') || this.justPressed.has('Space') || this.mouseClicked;
  }

  get restartJustPressed() {
    return this.justPressed.has('KeyR') || this.justPressed.has('Enter') || this.mouseClicked;
  }

  get pauseJustPressed() {
    return this.justPressed.has('KeyP') || this.justPressed.has('Escape');
  }

  get muteJustPressed() {
    return this.justPressed.has('KeyM');
  }

  // Call once at the end of each frame: a "just pressed" key is only
  // true for the single frame in which it went down.
  endFrame() {
    this.justPressed.clear();
    this.mouseClicked = false;
    this.anyKeyPressed = false;
  }
}
