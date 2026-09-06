// Layout data for each level: positions of props, flowers, NPCs, obstacles.
// Kept separate from scene code so level tuning doesn't require touching gameplay logic.

export const MALABAR_LAYOUT = {
  flowers: [
    { id: 'f1', x: 220, y: 250, color: 'pink' },
    { id: 'f2', x: 980, y: 210, color: 'orange' },
    { id: 'f3', x: 300, y: 620, color: 'white' },
    { id: 'f4', x: 860, y: 700, color: 'yellow' },
    { id: 'f5', x: 620, y: 430, color: 'purple' }
  ],
  npcs: [
    { id: 'villager1', x: 420, y: 300 },
    { id: 'villager2', x: 760, y: 520 },
    { id: 'villager3', x: 260, y: 760 }
  ],
  houses: [
    { x: 200, y: 160 },
    { x: 1080, y: 150 },
    { x: 1100, y: 640 }
  ],
  trees: [
    { x: 80, y: 120 }, { x: 1200, y: 100 }, { x: 60, y: 480 },
    { x: 1220, y: 460 }, { x: 140, y: 820 }, { x: 1180, y: 800 },
    { x: 520, y: 100 }, { x: 700, y: 820 }, { x: 950, y: 400 },
    { x: 380, y: 500 }
  ],
  pond: { x: 640, y: 650, radiusX: 160, radiusY: 90 },
  pookalamCenter: { x: 640, y: 200 }
};

export const KOCHI_OBSTACLES = [
  { type: 'log', x: 500, y: 300, w: 120, h: 30 },
  { type: 'rock', x: 380, y: 500, r: 26 },
  { type: 'rock', x: 650, y: 620, r: 22 },
  { type: 'log', x: 420, y: 820, w: 140, h: 28 },
  { type: 'plant', x: 600, y: 980, r: 24 },
  { type: 'rock', x: 350, y: 1150, r: 24 },
  { type: 'log', x: 620, y: 1320, w: 130, h: 28 },
  { type: 'plant', x: 420, y: 1480, r: 22 },
  { type: 'rock', x: 600, y: 1650, r: 26 },
  { type: 'log', x: 400, y: 1850, w: 120, h: 28 },
  { type: 'plant', x: 620, y: 2020, r: 24 },
  { type: 'rock', x: 450, y: 2150, r: 22 }
];

export const TRAVANCORE_LAYOUT = {
  clueSpots: [
    { key: 'equality', x: 260, y: 300 },
    { key: 'prosperity', x: 640, y: 220 },
    { key: 'happiness', x: 1000, y: 300 }
  ],
  pedestals: [
    { slot: 0, x: 520, y: 560 },
    { slot: 1, x: 640, y: 560 },
    { slot: 2, x: 760, y: 560 }
  ],
  guard: { x: 640, y: 420 },
  finalDoor: { x: 640, y: 130 }
};
