# The Lost Memories of Maveli

A short, browser-playable Onam-inspired adventure (~5–7 minutes) built with **Phaser 3** and **Vite**. Travel through Malabar, Kochi and Travancore to recover three lost memories of King Maveli, then meet him at the journey's end.

All artwork, sound, and UI are generated procedurally at runtime (Phaser Graphics + Web Audio) — the project has **no external image or audio files** and is fully self-contained.

## Story & Gameplay

1. **Main Menu → How To Play / Credits / Start Game**
2. **Intro** — a short interactive story introduction.
3. **Level 1 — Malabar (The Land of the People):** explore the village, talk to 3 villagers, and collect 5 flowers to complete a pookalam → unlocks **Memory 1 — Prosperity**.
4. **Level 2 — Kochi (The Vallam Race):** steer a boat down the backwaters, dodge logs/rocks/plants, reach the finish line → unlocks **Memory 2 — Equality**.
5. **Level 3 — Travancore (The Final Memory):** explore the palace, find 3 clues, and arrange 3 symbols in the correct order (**Equality → Prosperity → Happiness**) to open the final room.
6. **Ending:** Maveli appears, the final memory is revealed, and the completed pookalam is shown.
7. **Game Complete:** Play Again (resets state, no refresh needed) or return to Main Menu.

## Controls

| Action | Keys |
|---|---|
| Move | `WASD` or Arrow Keys |
| Interact | `E` or `Space` |
| Boat (Level 2) | `WASD` or Arrow Keys |
| Puzzle (Level 3) | Mouse / tap |

## Project Structure

```
the-lost-memories-of-maveli/
├── package.json
├── vite.config.js
├── index.html
├── README.md
├── .gitignore
├── src/
│   ├── main.js
│   ├── styles/main.css
│   └── game/
│       ├── config.js            # Phaser game config
│       ├── GameState.js         # centralized state singleton
│       ├── constants.js         # tunable, data-driven values
│       ├── scenes/
│       │   ├── BootScene.js
│       │   ├── PreloadScene.js  # generates all textures
│       │   ├── MainMenuScene.js
│       │   ├── HowToPlayScene.js
│       │   ├── CreditsScene.js
│       │   ├── IntroScene.js
│       │   ├── MalabarScene.js
│       │   ├── MemoryScene.js   # reusable memory reveal (used 3x)
│       │   ├── KochiScene.js
│       │   ├── TravancoreScene.js
│       │   ├── EndingScene.js
│       │   └── CompleteScene.js
│       ├── entities/
│       │   ├── Player.js
│       │   ├── NPC.js
│       │   └── Boat.js
│       ├── systems/
│       │   ├── DialogueSystem.js
│       │   ├── AudioSystem.js       # procedural Web Audio, no files
│       │   ├── TransitionSystem.js
│       │   ├── InputSystem.js       # proximity interaction manager
│       │   ├── TextureFactory.js    # generates all original sprites
│       │   └── UIHelpers.js
│       └── data/
│           ├── dialogue.js
│           ├── levels.js
│           └── memories.js
└── public/assets/   (empty — no external assets needed)
```

## Setup

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the local URL Vite prints (typically **http://localhost:5173**).

## Build

```bash
npm run build
```

Output goes to `dist/`. To preview the production build locally:

```bash
npm run preview
```

(Preview serves at **http://localhost:4173** by default.)

## Deployment

The `dist/` folder produced by `npm run build` is a static site — deploy it to GitHub Pages, Netlify, Vercel, or any static host. `vite.config.js` uses a relative `base: './'` so it works from any subpath.

## Notes on Implementation

- **No external assets**: every sprite (player, NPCs, Maveli, flowers, trees, houses, boats, obstacles, puzzle symbols, UI panels) is generated at runtime from Phaser `Graphics` objects baked into textures — see `src/game/systems/TextureFactory.js`.
- **No external audio files**: all sound effects and ambient tones are synthesized with the Web Audio API in `src/game/systems/AudioSystem.js`. Audio initializes only after a user gesture (per browser autoplay policy) and fails gracefully if unavailable.
- **State management**: a single `GameState` singleton (`src/game/GameState.js`) tracks flowers collected, memories unlocked, puzzle/race completion, etc. `Play Again` calls `GameState.reset()` — no page refresh required.
- **Responsive scaling**: the game renders at an internal 1280×720 resolution and uses Phaser's `Scale.FIT` mode to scale/letterbox into any browser window while preserving aspect ratio.

## Verification Performed

- `npm install` completes cleanly.
- `npm run build` completes with no unresolved imports and no errors.
- Automated browser testing (headless Chromium via Playwright) confirmed, with zero console/page errors:
  - Main menu renders and all three buttons (Start, How To Play, Credits) are interactive.
  - Start Game → Intro dialogue correctly advances through all cards on individual key presses (E/Space) and via click, with no double-advance or stuck states.
  - Transition from Intro into the Malabar scene completes correctly.
  - Malabar scene loads with correct HUD, village layout, NPCs, and flowers.
- Manual code review confirms: proximity-based interaction/dialogue, flower pickup with duplicate-prevention, pookalam petal growth, level-completion gating (flowers + pookalam before Kochi unlocks; race completion before Travancore unlocks; puzzle solved before final room unlocks), boat collision slow-down/shake, click-to-swap puzzle logic with the enforced solution order (Equality → Prosperity → Happiness), Maveli ending sequence, and Play Again state reset.

### Known Limitation

Full manual end-to-end play (every flower pickup, the complete vallam race, and the palace puzzle) was verified by code review and partial automated testing rather than a full automated playthrough end-to-end, because the available headless testing sandbox renders via software WebGL at a throttled ~10fps, which made precise automated player-movement timing unreliable for the later levels. The build itself is clean, the core interaction/state logic was exercised without errors, and all gating logic (flower counts, puzzle solution order, race finish detection) is implemented directly against the centralized `GameState` rather than guessed — so it does not depend on frame-timing to be correct. Regular play in any standard GPU-accelerated browser should not be affected by this.
