// Gobble Getaway — a tiny seeded random number generator.
// The game uses it for obstacle spawns, and the screenshot mode uses
// it so every staged shot renders the same scene every time.

export function mulberry32(seed) {
  let state = seed >>> 0;
  return function nextRandom() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickFrom(random, list) {
  return list[Math.floor(random() * list.length)];
}

export function rangeBetween(random, min, max) {
  return min + random() * (max - min);
}
