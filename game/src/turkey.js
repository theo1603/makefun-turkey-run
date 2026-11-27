// Gobble Getaway — the turkey: its physics, its hiding, and its drawing.
// The turkey is a plump brown bird with a red wattle, a fanned tail
// and a panicked expression, drawn entirely with canvas paths.

import {
  GROUND_Y,
  GRAVITY,
  TURKEY_BASE_SPEED,
  TURKEY_SPRINT_SPEED,
  TURKEY_JUMP_VELOCITY,
  TURKEY_DOUBLE_FLAP_VELOCITY,
  STAMINA_MAX,
  STAMINA_DRAIN_PER_S,
  STAMINA_REGEN_PER_S,
} from './config.js';

export const TURKEY_X = 300; // fixed screen position; the world scrolls past

export class Turkey {
  constructor() {
    this.reset();
  }

  reset() {
    this.y = GROUND_Y; // feet position
    this.vy = 0;
    this.onGround = true;
    this.flapsLeft = 1; // one extra flap in the air
    this.hidden = false; // tucked inside a haystack
    this.hideTimer = 0;
    this.stamina = STAMINA_MAX;
    this.sprinting = false;
    this.invulnerableTimer = 0; // brief grace after a hit
    this.stumbleTimer = 0; // stumble slows the turkey
    this.runCycle = 0; // leg animation phase
    this.blinkTimer = 0;
  }

  get width() {
    return 64;
  }

  get height() {
    return 58;
  }

  get airborne() {
    return !this.onGround;
  }

  get speedMetresPerSecond() {
    if (this.stumbleTimer > 0) return TURKEY_BASE_SPEED * 0.45;
    return this.sprinting ? TURKEY_SPRINT_SPEED : TURKEY_BASE_SPEED;
  }

  jump(sounds) {
    if (this.hidden) return;
    if (this.onGround) {
      this.vy = TURKEY_JUMP_VELOCITY;
      this.onGround = false;
      this.flapsLeft = 1;
      sounds.flap();
    } else if (this.flapsLeft > 0) {
      this.flapsLeft -= 1;
      this.vy = TURKEY_DOUBLE_FLAP_VELOCITY;
      sounds.flap();
    }
  }

  tryHide(nearHaystack, sounds) {
    if (!this.onGround || this.hidden) return;
    if (nearHaystack) {
      this.hidden = true;
      this.hideTimer = 1.6; // seconds the farmer is fooled for
      sounds.gobble();
    }
  }

  leaveHiding() {
    this.hidden = false;
    this.hideTimer = 0;
  }

  stumble(sounds) {
    if (this.invulnerableTimer > 0) return false;
    this.stumbleTimer = 0.55;
    this.invulnerableTimer = 1.4;
    sounds.stumble();
    return true;
  }

  update(dt, input, sounds) {
    this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt);
    this.stumbleTimer = Math.max(0, this.stumbleTimer - dt);
    this.blinkTimer -= dt;

    if (this.hidden) {
      this.hideTimer -= dt;
      if (this.hideTimer <= 0 || !input.hideHeld) this.leaveHiding();
      return; // a hidden turkey does not run, jump or spend stamina
    }

    this.sprinting = input.sprintHeld && this.stamina > 1 && this.onGround;
    if (this.sprinting) {
      this.stamina = Math.max(0, this.stamina - STAMINA_DRAIN_PER_S * dt);
    } else {
      this.stamina = Math.min(STAMINA_MAX, this.stamina + STAMINA_REGEN_PER_S * dt);
    }

    this.vy += GRAVITY * dt;
    this.y += this.vy * dt;
    if (this.y >= GROUND_Y) {
      this.y = GROUND_Y;
      this.vy = 0;
      this.onGround = true;
      this.flapsLeft = 1;
    }
    this.runCycle += dt * (this.sprinting ? 16 : 11);
  }

  draw(ctx) {
    const blink = this.blinkTimer > 0;
    ctx.save();
    if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer * 12) % 2 === 0) {
      ctx.globalAlpha = 0.45; // flashing while the grace period lasts
    }
    if (this.hidden) {
      ctx.globalAlpha = 0.25; // barely a beak poking out of the hay
    }
    ctx.translate(TURKEY_X, this.y);

    const bob = this.onGround ? Math.sin(this.runCycle) * 2 : 0;
    const lift = this.airborne ? -6 : 0;
    ctx.translate(0, bob + lift);

    if (!this.onGround) {
      this.drawWing(ctx, -0.9); // wings spread wide while flying
    } else {
      this.drawWing(ctx, Math.sin(this.runCycle) * 0.25 - 0.15);
    }
    this.drawTail(ctx);
    this.drawBody(ctx);
    this.drawHead(ctx, blink);
    if (this.onGround) this.drawLegs(ctx);
    ctx.restore();
  }

  drawTail(ctx) {
    // A fanned tail of bronze and copper feathers.
    ctx.save();
    ctx.translate(-26, -34);
    for (let i = 0; i < 5; i += 1) {
      const angle = -0.9 + i * 0.45;
      ctx.save();
      ctx.rotate(angle);
      ctx.fillStyle = i % 2 === 0 ? '#8a5a2b' : '#b0713a';
      ctx.beginPath();
      ctx.ellipse(-8, -14, 7, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5d3a17';
      ctx.beginPath();
      ctx.ellipse(-8, -26, 4, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  drawBody(ctx) {
    ctx.fillStyle = '#6b4423';
    ctx.beginPath();
    ctx.ellipse(0, -28, 26, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    // Belly feathers, lighter and scalloped.
    ctx.fillStyle = '#a06a35';
    ctx.beginPath();
    ctx.ellipse(4, -20, 18, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c98f4e';
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.ellipse(-2 + i * 8, -14 + (i % 2) * 4, 6, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawWing(ctx, angle) {
    ctx.save();
    ctx.translate(-4, -30);
    ctx.rotate(angle);
    ctx.fillStyle = '#4e2f16';
    ctx.beginPath();
    ctx.ellipse(-12, 0, 18, 9, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a4a21';
    ctx.beginPath();
    ctx.ellipse(-14, 2, 12, 6, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawHead(ctx, blink) {
    ctx.save();
    ctx.translate(22, -52);
    // Neck and head.
    ctx.fillStyle = '#d97b4f';
    ctx.fillRect( -4, -2, 10, 16);
    ctx.fillStyle = '#e8a87c';
    ctx.beginPath();
    ctx.arc(2, -8, 11, 0, Math.PI * 2);
    ctx.fill();
    // Beak.
    ctx.fillStyle = '#f2b705';
    ctx.beginPath();
    ctx.moveTo(10, -10);
    ctx.lineTo(24, -6);
    ctx.lineTo(10, -3);
    ctx.closePath();
    ctx.fill();
    // Wattle: the red dangle that says "turkey".
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.ellipse(12, 0, 4, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Snood over the beak.
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.ellipse(14, -9, 3, 6, 0.5, 0, Math.PI * 2);
    ctx.fill();
    // Eye: wide with panic, blinking now and then.
    if (blink) {
      ctx.strokeStyle = '#2b1a0e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -11);
      ctx.lineTo(7, -11);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(4, -11, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(5.5, -11, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawLegs(ctx) {
    const swing = Math.sin(this.runCycle) * 10;
    ctx.strokeStyle = '#f2b705';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-6, -6);
    ctx.lineTo(-6 + swing, 0);
    ctx.moveTo(6, -6);
    ctx.lineTo(6 - swing, 0);
    ctx.stroke();
  }
}
