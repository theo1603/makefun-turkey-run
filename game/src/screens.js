// Gobble Getaway — the screens around the run: the title, the pause
// card, and the two endings (caught for dinner, or escaped to the
// forest). Each one is drawn on the canvas so a screenshot can show it.

import { VIEW_W, VIEW_H, GROUND_Y, ESCAPE_DISTANCE } from './config.js';
import { drawBackground } from './render.js';

function panel(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = 'rgba(20, 12, 6, 0.78)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = '#f2c94c';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function drawBigTurkey(ctx, x, y, scale, time) {
  // A large hero turkey for the title screen, bobbing gently.
  ctx.save();
  ctx.translate(x, y + Math.sin(time * 2) * 5);
  ctx.scale(scale, scale);
  for (let i = 0; i < 7; i += 1) {
    const angle = -1.2 + i * 0.4;
    ctx.save();
    ctx.rotate(angle);
    ctx.fillStyle = i % 2 === 0 ? '#8a5a2b' : '#b0713a';
    ctx.beginPath();
    ctx.ellipse(-14, -34, 12, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8dcc8';
    ctx.beginPath();
    ctx.ellipse(-14, -62, 6, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#6b4423';
  ctx.beginPath();
  ctx.ellipse(0, 0, 62, 56, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a06a35';
  ctx.beginPath();
  ctx.ellipse(10, 12, 42, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4e2f16';
  ctx.beginPath();
  ctx.ellipse(-30, -6, 34, 18, -0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // A thick neck so the head sits on the body, not above it.
  ctx.fillStyle = '#d97b4f';
  ctx.fillRect(34, -72, 26, 34);
  ctx.fillStyle = '#e8a87c';
  ctx.beginPath();
  ctx.arc(48, -58, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2b705';
  ctx.beginPath();
  ctx.moveTo(68, -64);
  ctx.lineTo(102, -52);
  ctx.lineTo(68, -42);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.ellipse(74, -34, 9, 18, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(54, -66, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(57, -66, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f2b705';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-16, 52);
  ctx.lineTo(-16, 74);
  ctx.moveTo(16, 52);
  ctx.lineTo(16, 74);
  ctx.stroke();
  ctx.restore();
}

export function drawTitleScreen(ctx, time) {
  drawBackground(ctx, { id: 'farmyard', skyTop: '#f7b733', skyBottom: '#fc4a1a', ground: '#7a4a21', grass: '#5d8a3c' }, 0, time);
  drawBigTurkey(ctx, 1050, 400, 1.15, time);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff3d6';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;
  ctx.font = 'bold 92px Georgia, serif';
  ctx.fillText('GOBBLE', 560, 180);
  ctx.fillText('GETAWAY', 560, 268);
  ctx.shadowBlur = 0;
  ctx.font = 'italic 28px Georgia, serif';
  ctx.fillStyle = '#ffd166';
  ctx.fillText('One turkey. One farmer. One very hot oven.', 560, 318);

  panel(ctx, 230, 350, 660, 200);
  ctx.fillStyle = '#fff3d6';
  ctx.font = '22px Georgia, serif';
  ctx.fillText('Thanksgiving is coming — and you are the main course.', 560, 392);
  ctx.fillText('Outrun Farmer Bram, jump the fences, dodge the', 560, 424);
  ctx.fillText('carving knives, hide in the hay — and reach the', 560, 456);
  ctx.fillText('Freedom Forest 1500m away. Do not get roasted.', 560, 488);
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillStyle = '#7ed957';
  ctx.fillText('SPACE / ↑ / CLICK — jump (twice to flap)      ↓ — hide in hay', 560, 524);

  const blink = Math.sin(time * 4) > -0.2;
  if (blink) {
    ctx.font = 'bold 30px Georgia, serif';
    ctx.fillStyle = '#ff9f1c';
    ctx.fillText('▶  PRESS ENTER OR CLICK TO RUN  ◀', 560, 620);
  }
  ctx.font = '16px Georgia, serif';
  ctx.fillStyle = '#fff3d6';
  ctx.fillText('SHIFT sprint  •  P pause  •  M mute  •  Best escape wins the feast', 560, 662);
  ctx.restore();
}

export function drawPauseScreen(ctx) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  panel(ctx, 440, 260, 400, 180);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 44px Georgia, serif';
  ctx.fillText('PAUSED', 640, 330);
  ctx.font = '20px Georgia, serif';
  ctx.fillText('The farmer waits. The oven stays hot.', 640, 372);
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText('P or ESC to keep running', 640, 408);
  ctx.restore();
}

function drawEndPanel(ctx, title, titleColor, lines, world, best) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // The card sits high so the ground scene — turkey, farmer, oven,
  // gate — stays visible below it.
  panel(ctx, 340, 80, 600, 330);
  ctx.textAlign = 'center';
  ctx.fillStyle = titleColor;
  ctx.font = 'bold 58px Georgia, serif';
  ctx.fillText(title, 640, 152);
  ctx.fillStyle = '#fff3d6';
  ctx.font = '22px Georgia, serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, 640, 198 + i * 30);
  });
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillStyle = '#ffd166';
  ctx.fillText(`SCORE ${world.score}   •   ${Math.floor(world.distance)}m run   •   ${world.corn} corn eaten`, 640, 316);
  if (best !== null && best !== undefined) {
    ctx.font = '17px Georgia, serif';
    ctx.fillStyle = '#fff3d6';
    ctx.fillText(`Best escape so far: ${best} points`, 640, 346);
  }
  const blink = Math.sin(Date.now() / 300) > -0.2;
  if (blink) {
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillStyle = '#7ed957';
    ctx.fillText('PRESS R OR ENTER TO RUN AGAIN', 640, 388);
  }
  ctx.restore();
}

export function drawCaughtScreen(ctx, world, turkey, farmer, best) {
  drawScene(ctx, world, turkey, farmer, { id: 'farmyard', skyTop: '#5d2b1a', skyBottom: '#8e2f1c', ground: '#4a2c1a', grass: '#6b4a2f' });
  drawEndPanel(
    ctx,
    'CAUGHT!',
    '#ff6b5e',
    [
      'Farmer Bram got you — and the oven was already warm.',
      'Thanksgiving dinner is served. You are the dinner.',
      'Three strikes and the feast wins. Run again, faster.',
    ],
    world,
    best,
  );
}

export function drawEscapedScreen(ctx, world, turkey, farmer, best) {
  drawScene(ctx, world, turkey, farmer, { id: 'forest', skyTop: '#7ed957', skyBottom: '#f7b733', ground: '#5d8a3c', grass: '#3d6b2f' });
  drawEndPanel(
    ctx,
    'ESCAPED!',
    '#7ed957',
    [
      'You burst through the Freedom Forest gate,',
      'feathers flying, as Farmer Bram trips over his own boots.',
      'No stuffing. No gravy. Just a free turkey.',
    ],
    world,
    best,
  );
}

// The world behind an ending: the ground, the obstacles, the farmer
// and the turkey, so the ending is a scene, not just a card.
function drawScene(ctx, world, turkey, farmer, stage) {
  drawBackground(ctx, stage, world.distance, 0);
  for (const obstacle of world.obstacles) {
    obstacle.draw(ctx);
  }
  farmer.draw(ctx);
  turkey.draw(ctx);
}

export { GROUND_Y, ESCAPE_DISTANCE };
