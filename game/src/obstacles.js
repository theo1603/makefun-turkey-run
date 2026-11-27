// Gobble Getaway — everything the turkey must dodge, hide in or grab:
// fences and crates to jump, carving knives that fall and stick in the
// ground, ovens that roast in the kitchen, haystacks to hide in, corn
// to eat, and the Freedom Forest gate at the end of the run.

import { GROUND_Y } from './config.js';
import { TURKEY_X } from './turkey.js';

const WORLD_SPEED_PX_PER_METRE = 46; // world scrolls 46px per metre run

export function metresToPixels(metres) {
  return metres * WORLD_SPEED_PX_PER_METRE;
}

// Each obstacle lives in world space (metres from the start) and is
// drawn at its screen position once the camera passes it.
export class Obstacle {
  constructor(type, distanceMetres, options = {}) {
    this.type = type;
    this.distance = distanceMetres;
    this.x = 0; // screen x, set every frame from the camera
    this.hit = false; // already cost the turkey a life
    this.collected = false;
    this.fallY = options.fallY ?? -80; // falling knives start above the sky
    this.fallSpeed = options.fallSpeed ?? 520;
    this.landed = false;
    this.wobble = options.wobble ?? 0;
  }

  update(dt, cameraDistanceMetres) {
    this.x = TURKEY_X + metresToPixels(this.distance - cameraDistanceMetres);
    if (this.type === 'knife-falling' && !this.landed) {
      this.fallY += this.fallSpeed * dt;
      if (this.fallY >= GROUND_Y - 96) {
        this.fallY = GROUND_Y - 96;
        this.landed = true;
      }
    }
    if (this.type === 'corn') {
      this.wobble += dt * 4;
    }
  }

  get offScreen() {
    return this.x < -160;
  }

  // The turkey's collision box: a small rectangle at its feet.
  collidesWith(turkeyTop, turkeyBottom, turkeyLeft, turkeyRight) {
    if (this.hit || this.collected) return false;
    const box = this.collisionBox();
    if (!box) return false;
    return (
      turkeyRight > box.left &&
      turkeyLeft < box.right &&
      turkeyBottom > box.top &&
      turkeyTop < box.bottom
    );
  }

  collisionBox() {
    switch (this.type) {
      case 'fence':
        return { left: this.x - 22, right: this.x + 22, top: GROUND_Y - 74, bottom: GROUND_Y };
      case 'crate':
        return { left: this.x - 26, right: this.x + 26, top: GROUND_Y - 58, bottom: GROUND_Y };
      case 'knife':
      case 'knife-falling':
        if (this.type === 'knife-falling' && !this.landed) return null;
        return { left: this.x - 8, right: this.x + 8, top: GROUND_Y - 92, bottom: GROUND_Y };
      case 'oven':
        return { left: this.x - 44, right: this.x + 44, top: GROUND_Y - 96, bottom: GROUND_Y };
      case 'corn':
        return { left: this.x - 20, right: this.x + 20, top: GROUND_Y - 78, bottom: GROUND_Y - 28 };
      default:
        return null; // haystacks and the gate never hurt the turkey
    }
  }

  draw(ctx) {
    switch (this.type) {
      case 'fence':
        this.drawFence(ctx);
        break;
      case 'crate':
        this.drawCrate(ctx);
        break;
      case 'knife':
      case 'knife-falling':
        this.drawKnife(ctx);
        break;
      case 'oven':
        this.drawOven(ctx);
        break;
      case 'haystack':
        this.drawHaystack(ctx);
        break;
      case 'corn':
        this.drawCorn(ctx);
        break;
      case 'gate':
        this.drawGate(ctx);
        break;
      default:
        break;
    }
  }

  drawFence(ctx) {
    ctx.save();
    ctx.translate(this.x, GROUND_Y);
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(-24, -70, 8, 70);
    ctx.fillRect(16, -70, 8, 70);
    ctx.fillStyle = '#a06a35';
    ctx.fillRect(-28, -66, 56, 9);
    ctx.fillRect(-28, -40, 56, 9);
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(-28, -66, 56, 3);
    ctx.restore();
  }

  drawCrate(ctx) {
    ctx.save();
    ctx.translate(this.x, GROUND_Y);
    ctx.fillStyle = '#b07a3f';
    ctx.fillRect(-26, -58, 52, 58);
    ctx.strokeStyle = '#7a4a21';
    ctx.lineWidth = 3;
    ctx.strokeRect(-26, -58, 52, 58);
    ctx.beginPath();
    ctx.moveTo(-26, -58);
    ctx.lineTo(26, 0);
    ctx.moveTo(26, -58);
    ctx.lineTo(-26, 0);
    ctx.stroke();
    ctx.fillStyle = '#e8c07a';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('CORN', 0, -24);
    ctx.restore();
  }

  drawKnife(ctx) {
    // A carving knife stuck point-first in the dirt, wobbling slightly.
    const y = this.type === 'knife-falling' ? this.fallY : GROUND_Y - 96;
    ctx.save();
    ctx.translate(this.x, y);
    ctx.rotate(this.type === 'knife-falling' && !this.landed ? 0.12 : 0.06);
    ctx.fillStyle = '#dfe6ea';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-7, 52);
    ctx.lineTo(0, 66);
    ctx.lineTo(7, 52);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#9aa5ab';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(0, 58);
    ctx.stroke();
    ctx.fillStyle = '#5d3a17';
    ctx.fillRect(-5, -26, 10, 28);
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-5, -26, 10, 5);
    ctx.restore();
  }

  drawOven(ctx) {
    // The kitchen oven: a black box with a glowing door and a chimney
    // puffing smoke. Its heat shimmers above it.
    ctx.save();
    ctx.translate(this.x, GROUND_Y);
    ctx.fillStyle = '#2b2b2e';
    ctx.fillRect(-46, -96, 92, 96);
    ctx.fillStyle = '#3d3d42';
    ctx.fillRect(-40, -90, 80, 12);
    // Glowing oven door with a turkey-shaped roast silhouette.
    ctx.fillStyle = '#ff7b24';
    ctx.fillRect(-30, -66, 60, 44);
    ctx.fillStyle = '#ffb347';
    ctx.beginPath();
    ctx.ellipse(0, -44, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a2e0e';
    ctx.beginPath();
    ctx.arc(-14, -50, 3, 0, Math.PI * 2);
    ctx.arc(14, -50, 3, 0, Math.PI * 2);
    ctx.fill();
    // Heat shimmer lines.
    ctx.strokeStyle = 'rgba(255, 180, 80, 0.7)';
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * 22, -100);
      ctx.quadraticCurveTo(i * 22 + 6, -112, i * 22, -122);
      ctx.stroke();
    }
    // Chimney and smoke puffs.
    ctx.fillStyle = '#1f1f22';
    ctx.fillRect(26, -128, 16, 34);
    ctx.fillStyle = 'rgba(220, 220, 220, 0.55)';
    ctx.beginPath();
    ctx.arc(30, -138, 8, 0, Math.PI * 2);
    ctx.arc(40, -150, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawHaystack(ctx) {
    ctx.save();
    ctx.translate(this.x, GROUND_Y);
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.moveTo(-52, 0);
    ctx.quadraticCurveTo(-48, -78, 0, -84);
    ctx.quadraticCurveTo(48, -78, 52, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#a67c2e';
    ctx.lineWidth = 2;
    for (let i = -3; i <= 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * 13, -78 + Math.abs(i) * 8);
      ctx.lineTo(i * 15, -6);
      ctx.stroke();
    }
    ctx.fillStyle = '#8a5a2b';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('HIDE ↓', 0, -92);
    ctx.restore();
  }

  drawCorn(ctx) {
    const bob = Math.sin(this.wobble) * 4;
    ctx.save();
    ctx.translate(this.x, GROUND_Y - 52 + bob);
    ctx.rotate(-0.5);
    ctx.fillStyle = '#f2c94c';
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d9a441';
    for (let row = -2; row <= 2; row += 1) {
      ctx.beginPath();
      ctx.ellipse(0, row * 7, 9, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#5d8a3c';
    ctx.beginPath();
    ctx.ellipse(-9, 12, 5, 12, 0.5, 0, Math.PI * 2);
    ctx.ellipse(9, 12, 5, 12, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawGate(ctx) {
    // The Freedom Forest gate: two pines and a hand-painted sign.
    ctx.save();
    ctx.translate(this.x, GROUND_Y);
    for (const side of [-1, 1]) {
      ctx.fillStyle = '#2e6b34';
      ctx.beginPath();
      ctx.moveTo(side * 70, -160);
      ctx.lineTo(side * 46, -100);
      ctx.lineTo(side * 94, -100);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(side * 70, -120);
      ctx.lineTo(side * 50, -70);
      ctx.lineTo(side * 90, -70);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#6b4423';
      ctx.fillRect(side * 66, -40, 8, 40);
      ctx.fillStyle = '#2e6b34';
    }
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(-58, -150, 116, 30);
    ctx.strokeStyle = '#5d3a17';
    ctx.lineWidth = 3;
    ctx.strokeRect(-58, -150, 116, 30);
    ctx.fillStyle = '#fff3d6';
    ctx.font = 'bold 17px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('FREEDOM FOREST', 0, -129);
    ctx.restore();
  }
}
