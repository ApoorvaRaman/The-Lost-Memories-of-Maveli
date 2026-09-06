// Central place for tunable, data-driven values.
// Keeping these here means gameplay can be re-balanced without hunting through scene code.

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const COLORS = {
  forestDeep: 0x0e3b23,
  forestDark: 0x0a2417,
  leafGreen: 0x2f7a3d,
  leafLight: 0x4fa35a,
  waterTeal: 0x1c6e78,
  waterBlue: 0x2986a8,
  waterHighlight: 0x6fd6d0,
  terracotta: 0xb5603a,
  brownDark: 0x5a3826,
  cream: 0xf3e2b3,
  gold: 0xd9a441,
  goldBright: 0xf1c86b,
  panelGreen: 0x123822,
  panelGreenDark: 0x0a2116,
  parchment: 0xf1e4bf,
  parchmentDark: 0xd9c793,
  ink: 0x2b1d10,
  red: 0x9c2b2b,
  flowerPink: 0xe98cb0,
  flowerOrange: 0xe4753a,
  flowerWhite: 0xfaf6ea,
  flowerYellow: 0xf1c531,
  flowerPurple: 0x9163c9,
  skyWarm: 0x8fd0e6,
  skyEvening: 0xf3b56b
};

export const PLAYER = {
  speed: 190,
  interactionRadius: 68
};

export const BOAT = {
  speed: 210,
  turnSpeed: 2.6,
  collisionSlow: 0.45,
  collisionShakeMs: 220
};

export const LEVEL1 = {
  flowersRequired: 5,
  worldWidth: 1280,
  worldHeight: 900
};

export const LEVEL2 = {
  raceDurationTarget: 45, // seconds, guidance only
  worldWidth: 1000,
  worldHeight: 2400
};

export const LEVEL3 = {
  worldWidth: 1280,
  worldHeight: 900,
  solution: ['equality', 'prosperity', 'happiness']
};

export const TRANSITION_DURATION = 550;

export const DEPTHS = {
  background: 0,
  ground: 1,
  shadow: 2,
  props: 3,
  entities: 5,
  foreground: 8,
  particles: 9,
  hud: 100,
  dialogue: 150,
  transition: 200
};
