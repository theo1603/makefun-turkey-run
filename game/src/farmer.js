// Gobble Getaway — the farmer: the chase, the search, and his drawing.
// The farmer runs in from the left, speeds up when the turkey stumbles
// and slows when it sprints. If the turkey hides in a haystack he runs
// past, stops, scratches his head and turns back to look.

import {
  GROUND_Y,
  FARMER_CATCH_DISTANCE,
  FARMER_BASE_SPEED,
  FARMER_SURGE_SPEED,
  FARMER_FALLBEHIND_SPEED,
  FARMER_HIDDEN_SPEED,
  FARMER_MAX_GAP,
} from './config.js';
import { TURKEY_X } from './turkey.js';

export class Farmer {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = TURKEY_X - 260; // starts a little behind the turkey
    this.y = GROUND_Y;
    this.runCycle = 0;
    this.state = 'chasing'; // chasing | searching | returning
    this.searchTimer = 0;
    this.angry = false;
  }

  get gapToTurkey() {
    return TURKEY_X - this.x;
  }

  get close() {
    return this.gapToTurkey < 150;
  }

  update(dt, turkey, sounds) {
    this.runCycle += dt * 13;

    if (this.state === 'searching') {
      // The turkey is hidden: the farmer stops at the haystack, looks
      // around, then gives up and jogs back to the chase.
      this.searchTimer -= dt;
      if (this.searchTimer <= 0) {
        this.state = 'returning';
      }
      return;
    }
    if (this.state === 'returning') {
      this.x -= 60 * dt;
      if (this.x <= TURKEY_X - 320) this.state = 'chasing';
      return;
    }

    // Chasing: his speed answers the turkey's. A stumble lets him surge;
    // a sprint leaves him behind; a hidden turkey makes him run past.
    // The gap on screen changes by the difference of the two speeds:
    // both run the same world, so only the difference shows.
    let speed = FARMER_BASE_SPEED;
    if (turkey.stumbleTimer > 0) speed = FARMER_SURGE_SPEED;
    if (turkey.sprinting) speed = FARMER_FALLBEHIND_SPEED;
    if (turkey.hidden) speed = FARMER_HIDDEN_SPEED;

    this.x += (speed - turkey.speedMetresPerSecond) * 46 * dt;
    if (this.x < TURKEY_X - FARMER_MAX_GAP) this.x = TURKEY_X - FARMER_MAX_GAP;
    this.angry = this.gapToTurkey < 120;

    if (turkey.hidden && this.x >= TURKEY_X + 40) {
      this.state = 'searching';
      this.searchTimer = 1.4;
      sounds.spottedAlarm();
    }
  }

  catches(turkey) {
    return this.state === 'chasing' && !turkey.hidden && this.gapToTurkey <= FARMER_CATCH_DISTANCE;
  }

  // After a catch the farmer is sent back behind the turkey with a
  // head start for the turkey, so a catch is a setback, not a loop.
  resetAfterCatch() {
    this.x = TURKEY_X - 300;
    this.state = 'chasing';
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    const swing = Math.sin(this.runCycle) * 9;
    const searching = this.state === 'searching';

    // Legs: blue overalls, mid-stride.
    ctx.strokeStyle = '#2e4a7a';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-4, -34);
    ctx.lineTo(-4 + swing, 0);
    ctx.moveTo(6, -34);
    ctx.lineTo(6 - swing, 0);
    ctx.stroke();

    // Body: red plaid shirt under denim overalls.
    ctx.fillStyle = '#a93226';
    ctx.fillRect(-14, -66, 30, 34);
    ctx.strokeStyle = '#7b241c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-14, -55);
    ctx.lineTo(16, -55);
    ctx.moveTo(-14, -44);
    ctx.lineTo(16, -44);
    ctx.stroke();
    ctx.fillStyle = '#2e4a7a';
    ctx.fillRect(-12, -52, 26, 22);

    // Arms pump as he runs; one hand scratches his head while searching.
    ctx.strokeStyle = '#a93226';
    ctx.lineWidth = 6;
    ctx.beginPath();
    if (searching) {
      ctx.moveTo(12, -58);
      ctx.lineTo(26, -84);
    } else {
      ctx.moveTo(12, -58);
      ctx.lineTo(24, -44 - swing);
    }
    ctx.moveTo(-12, -58);
    ctx.lineTo(-24, -44 + swing);
    ctx.stroke();

    // Head with a straw hat and a moustache.
    ctx.fillStyle = '#e8b48a';
    ctx.beginPath();
    ctx.arc(2, -76, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.ellipse(6, -70, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2c94c';
    ctx.beginPath();
    ctx.ellipse(2, -86, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.arc(2, -88, 11, Math.PI, 0);
    ctx.fill();
    // Eyes: angry dots when close, puzzled circles while searching.
    ctx.fillStyle = '#1a1a1a';
    if (searching) {
      ctx.beginPath();
      ctx.arc(0, -78, 2.5, 0, Math.PI * 2);
      ctx.arc(9, -78, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(5, -66, 4, Math.PI, 0);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, -78, 2, 0, Math.PI * 2);
      ctx.arc(9, -78, 2, 0, Math.PI * 2);
      ctx.fill();
      if (this.angry) {
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-3, -83);
        ctx.lineTo(3, -80);
        ctx.moveTo(12, -80);
        ctx.lineTo(6, -83);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}
