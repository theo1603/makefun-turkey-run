// Gobble Getaway — the entry point: the game loop, the state machine
// (title → playing → paused → caught / escaped) and the wiring between
// input, the turkey, the farmer, the world and the screens.

import { VIEW_W, VIEW_H, GROUND_Y, ESCAPE_DISTANCE } from './config.js';
import { Input } from './input.js';
import { SoundBank } from './audio.js';
import { Turkey } from './turkey.js';
import { Farmer } from './farmer.js';
import { World } from './world.js';
import { drawBackground, drawHud } from './render.js';
import { drawTitleScreen, drawPauseScreen, drawCaughtScreen, drawEscapedScreen } from './screens.js';
import { applyShot } from './shots.js';

const BEST_KEY = 'gobble-getaway-best';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new Input(canvas);
    this.sounds = new SoundBank();
    this.turkey = new Turkey();
    this.farmer = new Farmer();
    this.world = new World();
    this.state = 'title'; // title | playing | paused | caught | escaped
    this.time = 0;
    this.banner = null; // { text, until } — stage-change announcement
    this.best = this.loadBest();
    this.lastFrame = performance.now();
    this.shotMode = false;

    const params = new URLSearchParams(window.location.search);
    const shot = params.get('shot');
    if (shot) {
      const seed = Number(params.get('seed') || '7');
      this.shotMode = true;
      applyShot(this, shot, seed);
      this.render();
      return; // screenshot mode renders one frozen frame and stops
    }

    requestAnimationFrame((now) => this.frame(now));
  }

  loadBest() {
    try {
      const value = Number(window.localStorage.getItem(BEST_KEY));
      return Number.isFinite(value) ? value : null;
    } catch {
      return null;
    }
  }

  saveBest() {
    if (this.best === null || this.world.score > this.best) {
      this.best = this.world.score;
      try {
        window.localStorage.setItem(BEST_KEY, String(this.best));
      } catch {
        // Private browsing or no storage: the run still counts.
      }
    }
  }

  startRun() {
    this.world.reset();
    this.turkey.reset();
    this.farmer.reset();
    this.state = 'playing';
    this.banner = null;
    this.sounds.ensureContext();
    this.sounds.startMusic();
    this.sounds.gobble();
  }

  endRunCaught() {
    this.state = 'caught';
    this.saveBest();
    this.sounds.stopMusic();
    this.sounds.caughtSting();
  }

  endRunEscaped() {
    this.state = 'escaped';
    this.saveBest();
    this.sounds.stopMusic();
    this.sounds.escapeFanfare();
  }

  frame(now) {
    const dt = Math.min(0.05, (now - this.lastFrame) / 1000);
    this.lastFrame = now;
    this.time += dt;
    this.update(dt);
    this.render();
    this.input.endFrame();
    requestAnimationFrame((next) => this.frame(next));
  }

  update(dt) {
    if (this.input.muteJustPressed) {
      this.sounds.ensureContext();
      this.sounds.toggleMute();
    }

    if (this.state === 'title') {
      if (this.input.confirmJustPressed) {
        this.startRun();
      }
      return;
    }

    if (this.state === 'playing') {
      if (this.input.pauseJustPressed) {
        this.state = 'paused';
        return;
      }
      if (this.input.jumpJustPressed) {
        this.turkey.jump(this.sounds);
      }
      const haystack = this.world.nearestHaystack(300);
      if (this.input.hideHeld && haystack) {
        this.turkey.tryHide(haystack, this.sounds);
      }

      this.turkey.update(dt, this.input, this.sounds);
      this.farmer.update(dt, this.turkey, this.sounds);
      this.world.update(dt, this.turkey, this.farmer, this.sounds);
      this.sounds.setUrgency(this.farmer.close);

      for (const event of this.world.events) {
        if (event.kind === 'stage') {
          this.banner = { text: event.name, until: this.time + 2.2 };
        }
      }
      this.world.events.length = 0;

      if (this.world.gameOver) {
        this.endRunCaught();
      } else if (this.world.distance >= ESCAPE_DISTANCE + 6) {
        this.endRunEscaped();
      }
      return;
    }

    if (this.state === 'paused') {
      if (this.input.pauseJustPressed || this.input.confirmJustPressed) {
        this.state = 'playing';
      }
      return;
    }

    if (this.state === 'caught' || this.state === 'escaped') {
      if (this.input.restartJustPressed) {
        this.startRun();
      }
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.save();
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);

    if (this.state === 'title') {
      drawTitleScreen(ctx, this.time);
      ctx.restore();
      return;
    }

    if (this.state === 'caught') {
      drawCaughtScreen(ctx, this.world, this.turkey, this.farmer, this.best);
      ctx.restore();
      return;
    }

    if (this.state === 'escaped') {
      drawEscapedScreen(ctx, this.world, this.turkey, this.farmer, this.best);
      ctx.restore();
      return;
    }

    // Playing or paused: the world, the actors, the HUD.
    drawBackground(ctx, this.world.stage, this.world.distance, this.time);
    for (const obstacle of this.world.obstacles) {
      obstacle.draw(ctx);
    }
    this.farmer.draw(ctx);
    this.turkey.draw(ctx);
    drawHud(ctx, this.world, this.turkey, this.farmer, this.time);

    if (this.banner && this.time < this.banner.until) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, (this.banner.until - this.time) / 0.5);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 40px Georgia, serif';
      ctx.fillText(this.banner.text, VIEW_W / 2, 190);
      ctx.restore();
    }

    if (this.state === 'paused') {
      drawPauseScreen(ctx);
    }
    ctx.restore();
  }
}

const canvas = document.getElementById('game');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const status = document.getElementById('status');
const game = new Game(canvas);
window.__gobble = game; // play-test handle: lets a test driver read the run state

function announce() {
  const lines = {
    title: 'Gobble Getaway. Press Enter to run from the farmer.',
    playing: `Running. Score ${game.world.score}, ${Math.floor(game.world.distance)} metres, ${game.world.lives} lives.`,
    paused: 'Paused.',
    caught: `Caught! Score ${game.world.score}. Press R to run again.`,
    escaped: `Escaped! Score ${game.world.score}. Press R to run again.`,
  };
  status.textContent = lines[game.state] ?? '';
}
setInterval(announce, 1000);
