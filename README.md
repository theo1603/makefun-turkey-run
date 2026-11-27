# makefun-turkey-run

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/theo1603/makefun-turkey-run/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/theo1603/makefun-turkey-run/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

Gobble Getaway: a turkey outruns Farmer Bram across the farmyard, the barn and the kitchen — jumping fences, dodging carving knives and the oven, hiding in haystacks — to reach the Freedom Forest 1500m away.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — or open `game/index.html` from any static server. No build step, no network: the game is plain files under `game/`, played with keyboard and mouse in desktop Chrome.

## How it plays

- **SPACE / ↑ / CLICK** — jump, and flap once more in the air
- **↓** — duck into a haystack to hide while the farmer runs past
- **SHIFT** — sprint (watch the stamina bar)
- **P** pause · **M** mute · **R** run again after an ending

The farmer chases the whole way: stumble and he surges, sprint and he falls behind. Three lives — a fence, a knife or the oven costs one, and so does getting caught. Eat corn for points, cross each stage for a bonus, and reach the forest gate at 1500m to escape. Canvas-drawn art and WebAudio synth sound throughout.

---

<sub>Entered on [make.fun](https://make.fun/?ref=theo1603&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
