// Gobble Getaway — the run itself: distance, spawning, collisions,
// score, lives and the stage changes as the turkey crosses the farm.

import {
  GROUND_Y,
  ESCAPE_DISTANCE,
  START_LIVES,
  CORN_SCORE,
  STAGE_BONUS,
  stageForDistance,
} from './config.js';
import { Obstacle } from './obstacles.js';
import { mulberry32, pickFrom, rangeBetween } from './random.js';

export class World {
  constructor(seed = 20261127) {
    this.seed = seed;
    this.reset();
  }

  reset() {
    this.random = mulberry32(this.seed);
    this.distance = 0; // metres run so far
    this.score = 0;
    this.corn = 0;
    this.lives = START_LIVES;
    this.obstacles = [];
    this.nextSpawnAt = 26; // first obstacle, in metres
    this.stage = stageForDistance(0);
    this.stageAnnounced = false;
    this.escaped = false;
    this.events = []; // one-frame notices for the main loop (sounds, banners)
  }

  get speedMetresPerSecond() {
    return this.turkeySpeed;
  }

  // Spawn the next obstacle or treat ahead of the turkey. The gap
  // shrinks as the stages get harder, and the kitchen adds ovens.
  spawnAhead() {
    const stage = stageForDistance(this.distance);
    const gap = rangeBetween(this.random, stage.spawnGapMin, stage.spawnGapMax) / 46;
    const at = this.distance + gap + 26;
    this.nextSpawnAt = at + rangeBetween(this.random, 8, 18);

    const roll = this.random();
    if (roll < 0.22) {
      // A snack line: three corn cobs to jump for.
      for (let i = 0; i < 3; i += 1) {
        this.obstacles.push(new Obstacle('corn', at + i * 1.6));
      }
      return;
    }
    const type = pickFrom(this.random, stage.hazards);
    if (type === 'knife') {
      // Half the knives fall from the sky, half stand in the dirt.
      if (this.random() < 0.5) {
        this.obstacles.push(
          new Obstacle('knife-falling', at, { fallSpeed: 480 + this.random() * 260 }),
        );
      } else {
        this.obstacles.push(new Obstacle('knife', at));
      }
    } else if (type === 'haystack') {
      this.obstacles.push(new Obstacle('haystack', at));
    } else {
      this.obstacles.push(new Obstacle(type, at));
    }
    // A fence pair sometimes guards a corn cob.
    if (type === 'fence' && this.random() < 0.4) {
      this.obstacles.push(new Obstacle('corn', at + 2.2));
    }
  }

  nearestHaystack(turkeyX) {
    for (const obstacle of this.obstacles) {
      if (obstacle.type !== 'haystack') continue;
      if (Math.abs(obstacle.x - turkeyX) < 70) return obstacle;
    }
    return null;
  }

  update(dt, turkey, farmer, sounds) {
    // A turkey tucked in the hay is not running: hiding costs ground.
    this.turkeySpeed = turkey.hidden ? 0 : turkey.speedMetresPerSecond;
    const before = this.distance;
    this.distance += this.turkeySpeed * dt;
    this.score += Math.floor((this.distance - before) * 10);

    const stage = stageForDistance(this.distance);
    if (stage.id !== this.stage.id) {
      this.stage = stage;
      this.score += STAGE_BONUS;
      this.events.push({ kind: 'stage', name: stage.name });
      sounds.stageClear();
    }

    if (this.distance >= ESCAPE_DISTANCE && !this.escaped) {
      this.escaped = true;
      this.obstacles.push(new Obstacle('gate', ESCAPE_DISTANCE + 4));
    }

    while (this.nextSpawnAt < this.distance + 30) this.spawnAhead();

    const turkeyLeft = 300 - 26;
    const turkeyRight = 300 + 26;
    const turkeyTop = turkey.y - turkey.height;
    const turkeyBottom = turkey.y;

    for (const obstacle of this.obstacles) {
      obstacle.update(dt, this.distance);
      if (obstacle.type === 'corn' && !obstacle.collected) {
        if (obstacle.collidesWith(turkeyTop, turkeyBottom, turkeyLeft, turkeyRight)) {
          obstacle.collected = true;
          this.corn += 1;
          this.score += CORN_SCORE;
          sounds.cornPickup();
        }
        continue;
      }
      if (obstacle.type === 'haystack' || obstacle.type === 'gate') continue;
      if (obstacle.collidesWith(turkeyTop, turkeyBottom, turkeyLeft, turkeyRight)) {
        obstacle.hit = true;
        if (turkey.stumble(sounds)) {
          this.lives -= 1;
          this.events.push({ kind: 'hit' });
        }
      }
    }
    this.obstacles = this.obstacles.filter((o) => !o.offScreen && !o.collected);

    if (farmer.catches(turkey)) {
      farmer.resetAfterCatch();
      if (turkey.stumble(sounds)) {
        this.lives -= 1;
        this.events.push({ kind: 'caught' });
      }
    }

    if (this.escaped && this.distance >= ESCAPE_DISTANCE + 6) {
      this.events.push({ kind: 'escaped' });
    }
  }

  get gameOver() {
    return this.lives <= 0;
  }
}

export { GROUND_Y };
