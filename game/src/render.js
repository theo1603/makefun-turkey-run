// Gobble Getaway — the look of the world: the sky, the farm, the barn,
// the kitchen, and the HUD that tells the player how the run is going.
// Everything is drawn with canvas paths; there are no image assets.

import { VIEW_W, VIEW_H, GROUND_Y, ESCAPE_DISTANCE, STAMINA_MAX } from './config.js';

function skyGradient(ctx, stage) {
  const gradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  gradient.addColorStop(0, stage.skyTop);
  gradient.addColorStop(1, stage.skyBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, VIEW_W, GROUND_Y);
}

function drawSun(ctx, time) {
  const x = 1080 + Math.sin(time * 0.05) * 12;
  const y = 110;
  ctx.fillStyle = '#fff3b0';
  ctx.beginPath();
  ctx.arc(x, y, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 243, 176, 0.35)';
  ctx.beginPath();
  ctx.arc(x, y, 62, 0, Math.PI * 2);
  ctx.fill();
}

function drawCloud(ctx, x, y, scale) {
  ctx.fillStyle = 'rgba(255, 250, 235, 0.9)';
  ctx.beginPath();
  ctx.ellipse(x, y, 52 * scale, 20 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 34 * scale, y + 6 * scale, 34 * scale, 15 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 36 * scale, y + 6 * scale, 36 * scale, 15 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBarn(ctx, x) {
  ctx.save();
  ctx.translate(x, GROUND_Y);
  ctx.fillStyle = '#a93226';
  ctx.beginPath();
  ctx.moveTo(-90, 0);
  ctx.lineTo(-90, -110);
  ctx.lineTo(0, -160);
  ctx.lineTo(90, -110);
  ctx.lineTo(90, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#7b241c';
  ctx.fillRect(-90, -112, 180, 8);
  ctx.fillStyle = '#f2f2f2';
  ctx.fillRect(-24, -72, 48, 72);
  ctx.strokeStyle = '#7b241c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-24, -72);
  ctx.lineTo(24, 0);
  ctx.moveTo(24, -72);
  ctx.lineTo(-24, 0);
  ctx.stroke();
  ctx.fillStyle = '#f2c94c';
  ctx.beginPath();
  ctx.arc(0, -126, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFenceLine(ctx, stage, scrollPx) {
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 4;
  const offset = -(scrollPx % 120);
  for (let x = offset; x < VIEW_W + 120; x += 120) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y - 26);
    ctx.lineTo(x, GROUND_Y - 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y - 22);
  ctx.lineTo(VIEW_W, GROUND_Y - 22);
  ctx.moveTo(0, GROUND_Y - 10);
  ctx.lineTo(VIEW_W, GROUND_Y - 10);
  ctx.stroke();
}

function drawKitchenWall(ctx, scrollPx) {
  // The kitchen stage swaps the open fields for a tiled wall and a
  // window showing the farm the turkey is running from.
  ctx.fillStyle = '#e8dcc8';
  ctx.fillRect(0, 0, VIEW_W, GROUND_Y - 160);
  ctx.strokeStyle = '#cbb89a';
  ctx.lineWidth = 2;
  for (let y = 40; y < GROUND_Y - 160; y += 56) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW_W, y);
    ctx.stroke();
  }
  for (let x = (scrollPx % 56) - 56; x < VIEW_W; x += 56) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, GROUND_Y - 160);
    ctx.stroke();
  }
  ctx.fillStyle = '#7fb3d5';
  ctx.fillRect(120, 90, 220, 170);
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 8;
  ctx.strokeRect(120, 90, 220, 170);
  ctx.beginPath();
  ctx.moveTo(230, 90);
  ctx.lineTo(230, 260);
  ctx.moveTo(120, 175);
  ctx.lineTo(340, 175);
  ctx.stroke();
  ctx.fillStyle = '#f7b733';
  ctx.beginPath();
  ctx.arc(290, 130, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5d8a3c';
  ctx.beginPath();
  ctx.ellipse(230, 240, 110, 18, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawBackground(ctx, stage, distanceMetres, time) {
  const scrollPx = distanceMetres * 46;
  if (stage.id === 'kitchen') {
    skyGradient(ctx, stage);
    drawKitchenWall(ctx, scrollPx);
  } else {
    skyGradient(ctx, stage);
    drawSun(ctx, time);
    drawCloud(ctx, 220 - ((scrollPx * 0.15) % 1400), 120, 1);
    drawCloud(ctx, 760 - ((scrollPx * 0.2) % 1400), 80, 0.8);
    drawCloud(ctx, 1150 - ((scrollPx * 0.1) % 1400), 170, 1.2);
    if (stage.id === 'farmyard') {
      drawBarn(ctx, 1060 - ((scrollPx * 0.4) % 1600));
      drawBarn(ctx, 300 - ((scrollPx * 0.4) % 1600));
    }
  }

  // Ground: packed dirt with a grass lip, scrolling with the run.
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
  ctx.fillStyle = stage.grass;
  ctx.fillRect(0, GROUND_Y, VIEW_W, 14);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  const dashOffset = -(scrollPx % 90);
  for (let x = dashOffset; x < VIEW_W; x += 90) {
    ctx.beginPath();
    ctx.ellipse(x, GROUND_Y + 46, 26, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (stage.id !== 'kitchen') drawFenceLine(ctx, stage, scrollPx);
}

export function drawProgressBar(ctx, distanceMetres) {
  const x = 430;
  const y = 26;
  const w = 420;
  const h = 14;
  const progress = Math.min(1, distanceMetres / ESCAPE_DISTANCE);
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.roundRect(x - 6, y - 6, w + 12, h + 12, 8);
  ctx.fill();
  ctx.fillStyle = '#3d2b1a';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 7);
  ctx.fill();
  ctx.fillStyle = '#7ed957';
  ctx.beginPath();
  ctx.roundRect(x, y, Math.max(8, w * progress), h, 7);
  ctx.fill();
  // Farmhouse at the start, pine at the finish, drawn as small marks.
  ctx.font = 'bold 13px Georgia, serif';
  ctx.fillStyle = '#ffd166';
  ctx.textAlign = 'right';
  ctx.fillText('FARM', x - 12, y + 14);
  ctx.textAlign = 'left';
  ctx.fillText('FOREST', x + w + 12, y + 14);
  ctx.restore();
}

function drawHeart(ctx, x, y, size, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 16, size / 16);
  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.bezierCurveTo(-9, -3, -6, -10, 0, -5);
  ctx.bezierCurveTo(6, -10, 9, -3, 0, 5);
  ctx.closePath();
  ctx.fillStyle = filled ? '#ff5a5a' : 'rgba(255, 255, 255, 0.25)';
  ctx.fill();
  ctx.strokeStyle = '#7a1f1f';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

export function drawHud(ctx, world, turkey, farmer, time) {
  ctx.save();
  // Top bar.
  ctx.fillStyle = 'rgba(20, 12, 6, 0.55)';
  ctx.beginPath();
  ctx.roundRect(12, 12, 1256, 56, 12);
  ctx.fill();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText(`SCORE ${world.score}`, 28, 40);
  ctx.font = '20px Georgia, serif';
  ctx.fillText(`CORN ${world.corn}`, 250, 40);

  drawProgressBar(ctx, world.distance);
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.floor(world.distance)}m / ${ESCAPE_DISTANCE}m`, 640, 66);

  // Lives as hearts, drawn — never emoji, so they render anywhere.
  for (let i = 0; i < 3; i += 1) {
    drawHeart(ctx, 1170 + i * 34, 40, 26, i < world.lives);
  }

  // Stage name.
  ctx.textAlign = 'right';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillStyle = '#ffd166';
  ctx.fillText(world.stage.name.toUpperCase(), 1240, 62);

  // Stamina bar, bottom-left above the ground, clear of the sky.
  const barX = 28;
  const barY = 556;
  const barW = 150;
  ctx.fillStyle = 'rgba(20, 12, 6, 0.55)';
  ctx.beginPath();
  ctx.roundRect(barX - 6, barY - 6, barW + 12, 20, 8);
  ctx.fill();
  ctx.fillStyle = '#3d2b1a';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, 8, 4);
  ctx.fill();
  ctx.fillStyle = turkey.sprinting ? '#ff9f1c' : '#7ed957';
  ctx.beginPath();
  ctx.roundRect(barX, barY, Math.max(4, barW * (turkey.stamina / STAMINA_MAX)), 8, 4);
  ctx.fill();
  ctx.fillStyle = '#fff3d6';
  ctx.font = '13px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('SPRINT (Shift)', barX, barY + 24);

  // Farmer proximity warning.
  if (farmer.close && !turkey.hidden) {
    const pulse = 0.6 + Math.sin(time * 10) * 0.4;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#ff3b30';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('! THE FARMER IS RIGHT BEHIND YOU !', VIEW_W / 2, 118);
    ctx.globalAlpha = 1;
  }
  if (turkey.hidden) {
    ctx.fillStyle = '#7ed957';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('HIDDEN IN THE HAY — HOLD STILL…', VIEW_W / 2, 118);
  }
  ctx.restore();
}
