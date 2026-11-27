// Gobble Getaway — staged screenshot states.
// `?shot=title|play|caught|escaped&seed=N` freezes the game in a
// hand-posed moment so the screenshots are real renders of the game's
// own code, showing each screen at its best. The seed makes the
// obstacle layout deterministic.

import { Obstacle } from './obstacles.js';

export function applyShot(game, shot, seed) {
  const { world, turkey, farmer } = game;
  world.reset();
  world.seed = seed;
  world.reset();
  turkey.reset();
  farmer.reset();

  if (shot === 'title') {
    game.state = 'title';
    return;
  }

  if (shot === 'play') {
    // Mid-run in the barn stage: a fence and a falling knife ahead, a
    // haystack to hide in behind, corn in the air, farmer closing in.
    game.state = 'playing';
    game.time = 12.4;
    world.distance = 640;
    world.score = 1840;
    world.corn = 7;
    world.lives = 3;
    game.best = 1840;
    world.stage = { id: 'barn', name: 'The Barn', from: 500, skyTop: '#8e2f1c', skyBottom: '#d97b29', ground: '#5e3a1c', grass: '#7a6a2f', hazards: [], spawnGapMin: 300, spawnGapMax: 500 };
    turkey.y = 620;
    turkey.onGround = true;
    turkey.stamina = 62;
    turkey.sprinting = true;
    turkey.runCycle = 2.1;
    farmer.x = 120;
    farmer.state = 'chasing';
    farmer.runCycle = 1.7;
    world.obstacles = [
      new Obstacle('haystack', 638.5),
      new Obstacle('fence', 648),
      new Obstacle('corn', 650.5),
      new Obstacle('corn', 652.1),
      new Obstacle('knife-falling', 655, { fallY: 260, fallSpeed: 520 }),
      new Obstacle('crate', 662),
    ];
    for (const obstacle of world.obstacles) obstacle.update(0, world.distance);
    game.banner = null;
    return;
  }

  if (shot === 'caught') {
    // The end of a run in the kitchen: the oven looms, the farmer has
    // the turkey by the tail, no lives left.
    game.state = 'caught';
    world.distance = 1180;
    world.score = 3120;
    world.corn = 12;
    world.lives = 0;
    game.best = 3120;
    world.stage = { id: 'kitchen', name: 'The Kitchen', from: 1000, skyTop: '#3d2b4f', skyBottom: '#b03a2e', ground: '#4a2c2a', grass: '#8a5a2b', hazards: [], spawnGapMin: 260, spawnGapMax: 460 };
    turkey.y = 620;
    farmer.x = 246;
    farmer.state = 'chasing';
    world.obstacles = [
      new Obstacle('oven', 1196),
      new Obstacle('knife', 1204),
      new Obstacle('haystack', 1188),
    ];
    for (const obstacle of world.obstacles) obstacle.update(0, world.distance);
    return;
  }

  if (shot === 'escaped') {
    // Through the Freedom Forest gate at 1500m, turkey mid-flap.
    game.state = 'escaped';
    world.distance = 1506;
    world.score = 5420;
    world.corn = 18;
    world.lives = 2;
    game.best = 5420;
    world.stage = { id: 'kitchen', name: 'The Kitchen', from: 1000, skyTop: '#3d2b4f', skyBottom: '#b03a2e', ground: '#4a2c2a', grass: '#8a5a2b', hazards: [], spawnGapMin: 260, spawnGapMax: 460 };
    turkey.y = 520;
    turkey.onGround = false;
    turkey.vy = -300;
    farmer.x = 60;
    farmer.state = 'chasing';
    world.obstacles = [new Obstacle('gate', 1510)];
    for (const obstacle of world.obstacles) obstacle.update(0, world.distance);
    return;
  }

  game.state = 'title';
}
