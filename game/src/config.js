// Gobble Getaway — tuning constants and stage definitions.
// One place for every number the game balances on, so tuning never
// means hunting through the update code.

export const VIEW_W = 1280;
export const VIEW_H = 720;
export const GROUND_Y = 620; // top of the ground strip, in view pixels
export const GRAVITY = 2600; // px / s^2
export const ESCAPE_DISTANCE = 1500; // metres to the Freedom Forest gate

// The turkey's running speed, in metres per second of world travel.
export const TURKEY_BASE_SPEED = 7.2;
export const TURKEY_SPRINT_SPEED = 11.5;
export const TURKEY_JUMP_VELOCITY = -980;
export const TURKEY_DOUBLE_FLAP_VELOCITY = -820;
export const STAMINA_MAX = 100;
export const STAMINA_DRAIN_PER_S = 34;
export const STAMINA_REGEN_PER_S = 22;

// The farmer never stops: he gains whenever the turkey stumbles and
// loses ground while the turkey sprints. All speeds are in metres per
// second of world travel, like the turkey's: the gap between them on
// screen changes by the difference of the two speeds.
export const FARMER_CATCH_DISTANCE = 46;
export const FARMER_BASE_SPEED = 6.4; // m/s, just under the turkey's run
export const FARMER_SURGE_SPEED = 7.6; // m/s while the turkey is slow
export const FARMER_FALLBEHIND_SPEED = 6.4; // m/s while the turkey sprints
export const FARMER_HIDDEN_SPEED = 8.0; // m/s while the turkey hides: he runs past
export const FARMER_MAX_GAP = 380; // px: further back than this, he keeps pace

export const START_LIVES = 3;
export const CORN_SCORE = 50;
export const STAGE_BONUS = 250;

// The run crosses three places on the way out: the farmyard, the barn,
// then the kitchen. Each stage changes the scenery and what can hurt you.
export const STAGES = [
  {
    id: 'farmyard',
    name: 'The Farmyard',
    from: 0,
    skyTop: '#f7b733',
    skyBottom: '#fc4a1a',
    ground: '#7a4a21',
    grass: '#5d8a3c',
    hazards: ['fence', 'knife', 'haystack'],
    spawnGapMin: 340,
    spawnGapMax: 560,
  },
  {
    id: 'barn',
    name: 'The Barn',
    from: 500,
    skyTop: '#8e2f1c',
    skyBottom: '#d97b29',
    ground: '#5e3a1c',
    grass: '#7a6a2f',
    hazards: ['fence', 'knife', 'haystack', 'crate'],
    spawnGapMin: 300,
    spawnGapMax: 500,
  },
  {
    id: 'kitchen',
    name: 'The Kitchen',
    from: 1000,
    skyTop: '#3d2b4f',
    skyBottom: '#b03a2e',
    ground: '#4a2c2a',
    grass: '#8a5a2b',
    hazards: ['oven', 'knife', 'fence', 'haystack'],
    spawnGapMin: 260,
    spawnGapMax: 460,
  },
];

export function stageForDistance(distanceMetres) {
  let stage = STAGES[0];
  for (const candidate of STAGES) {
    if (distanceMetres >= candidate.from) stage = candidate;
  }
  return stage;
}
