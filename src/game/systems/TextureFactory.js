// Generates original, lightweight pixel-art-style textures using Phaser Graphics.
// This keeps the whole game self-contained: no external image files are required.
// Every texture is drawn at a small pixel grid then scaled, giving a chunky pixel-art look.

import { COLORS } from '../constants.js';

function px(g, x, y, size, color, alpha = 1) {
  g.fillStyle(color, alpha);
  g.fillRect(x * size, y * size, size, size);
}

function generateTexture(scene, key, gridW, gridH, pixelSize, drawFn) {
  const g = scene.add.graphics();
  drawFn((x, y, color, alpha) => px(g, x, y, pixelSize, color, alpha));
  g.generateTexture(key, gridW * pixelSize, gridH * pixelSize);
  g.destroy();
}

export function buildAllTextures(scene) {
  const P = 4; // base pixel size for character-scale sprites

  // ---------- PLAYER (4 directions, 2-frame walk cycle baked as separate textures) ----------
  const skin = 0xc98a5b;
  const shirt = 0x2f7a3d;
  const shirtDark = 0x1f5c2b;
  const pants = 0x4a3222;
  const hair = 0x241a12;

  function drawPlayer(dir, frame) {
    return (put) => {
      // legs (offset for walk frame)
      const legOffset = frame === 1 ? 1 : 0;
      put(3, 12, pants); put(3, 13, pants);
      put(6, 12, pants); put(6, 13, pants);
      if (frame === 1) { put(2, 13, pants); put(7, 13, pants); }
      // torso
      for (let y = 7; y < 12; y++) { for (let x = 3; x < 7; x++) put(x, y, shirt); }
      put(3, 11, shirtDark); put(6, 11, shirtDark);
      // arms
      put(2, 8, skin); put(2, 9, skin);
      put(7, 8, skin); put(7, 9, skin);
      // head
      for (let y = 2; y < 7; y++) { for (let x = 2; x < 8; x++) put(x, y, skin); }
      // hair
      for (let x = 2; x < 8; x++) put(x, 2, hair);
      put(2, 3, hair); put(7, 3, hair);
      if (dir === 'down') { put(3, 4, 0x1c1c1c); put(6, 4, 0x1c1c1c); }
      if (dir === 'up') { for (let x = 2; x < 8; x++) put(x, 3, hair); }
      if (dir === 'left') { put(2, 4, 0x1c1c1c); for (let x = 2; x < 5; x++) put(x, 3, hair); }
      if (dir === 'right') { put(7, 4, 0x1c1c1c); for (let x = 5; x < 8; x++) put(x, 3, hair); }
    };
  }

  ['down', 'up', 'left', 'right'].forEach((dir) => {
    generateTexture(scene, `player_${dir}_0`, 10, 15, P, drawPlayer(dir, 0));
    generateTexture(scene, `player_${dir}_1`, 10, 15, P, drawPlayer(dir, 1));
  });

  // ---------- NPCs (three distinct villager palettes) ----------
  const npcPalettes = {
    villager1: { shirt: 0x9c5b2b, shirtDark: 0x7a4420, wrap: 0xf1e4bf },
    villager2: { shirt: 0xb5603a, shirtDark: 0x8c4527, wrap: 0xf1c531 },
    villager3: { shirt: 0x5a7a8c, shirtDark: 0x3f5a68, wrap: 0xf3e2b3 },
    guard1: { shirt: 0x6b1f1f, shirtDark: 0x4c1414, wrap: 0xd9a441 }
  };

  Object.entries(npcPalettes).forEach(([id, pal]) => {
    generateTexture(scene, `npc_${id}`, 10, 15, P, (put) => {
      put(3, 12, pants); put(3, 13, pants);
      put(6, 12, pants); put(6, 13, pants);
      for (let y = 9; y < 12; y++) { for (let x = 2; x < 8; x++) put(x, y, pal.wrap); }
      for (let y = 7; y < 9; y++) { for (let x = 3; x < 7; x++) put(x, y, pal.shirt); }
      put(3, 11, pal.shirtDark); put(6, 11, pal.shirtDark);
      put(2, 8, skin); put(2, 9, skin);
      put(7, 8, skin); put(7, 9, skin);
      for (let y = 2; y < 7; y++) { for (let x = 2; x < 8; x++) put(x, y, skin); }
      for (let x = 2; x < 8; x++) put(x, 2, hair);
      put(2, 3, hair); put(7, 3, hair);
      put(3, 4, 0x1c1c1c); put(6, 4, 0x1c1c1c);
    });
  });

  // ---------- MAVELI ----------
  generateTexture(scene, 'maveli', 16, 22, P, (put) => {
    const robe = COLORS.gold;
    const robeDark = 0xb5822c;
    const trim = COLORS.red;
    const crownColor = 0xf1c86b;
    // legs / robe base
    for (let y = 14; y < 20; y++) { for (let x = 4; x < 12; x++) put(x, y, robe); }
    for (let x = 4; x < 12; x++) put(x, 19, robeDark);
    // torso robe
    for (let y = 8; y < 14; y++) { for (let x = 3; x < 13; x++) put(x, y, robe); }
    for (let x = 3; x < 13; x++) put(x, 8, trim);
    put(3, 9, trim); put(12, 9, trim);
    // sash
    for (let x = 5; x < 11; x++) put(x, 12, trim);
    // arms
    for (let y = 9; y < 13; y++) { put(2, y, skin); put(13, y, skin); }
    // head
    for (let y = 3; y < 8; y++) { for (let x = 4; x < 12; x++) put(x, y, skin); }
    put(5, 6, 0x1c1c1c); put(10, 6, 0x1c1c1c);
    // moustache
    for (let x = 5; x < 11; x++) put(x, 7, 0x241a12);
    // crown
    for (let x = 3; x < 13; x++) put(x, 1, crownColor);
    for (let x = 3; x < 13; x++) put(x, 2, crownColor);
    put(4, 0, crownColor); put(7, 0, trim); put(11, 0, crownColor);
    // umbrella-like shoulder ornament (distinctive silhouette)
    for (let x = -2; x < 16; x++) put(x, 3, robeDark, 0.0); // reserved space (kept simple)
  });

  // ---------- FLOWERS (5 distinct pookalam colors) ----------
  const flowerColors = {
    pink: COLORS.flowerPink,
    orange: COLORS.flowerOrange,
    white: COLORS.flowerWhite,
    yellow: COLORS.flowerYellow,
    purple: COLORS.flowerPurple
  };
  Object.entries(flowerColors).forEach(([name, color]) => {
    generateTexture(scene, `flower_${name}`, 8, 8, 5, (put) => {
      put(3, 0, color); put(4, 0, color);
      put(1, 2, color); put(6, 2, color);
      put(0, 4, color); put(7, 4, color);
      put(1, 6, color); put(6, 6, color);
      put(3, 7, color); put(4, 7, color);
      put(3, 3, 0xfff2c6); put(4, 3, 0xfff2c6);
      put(3, 4, 0xfff2c6); put(4, 4, 0xfff2c6);
      put(2, 3, color); put(5, 3, color); put(2, 4, color); put(5, 4, color);
      put(3, 2, 0x2f7a3d, 0); // no-op keep grid symmetric
    });
  });

  // ---------- TREES ----------
  generateTexture(scene, 'coconut_tree', 12, 22, P, (put) => {
    const trunk = 0x7a5230;
    const trunkDark = 0x5a3a20;
    for (let y = 10; y < 22; y++) { put(5, y, trunk); put(6, y, trunkDark); }
    // canopy fronds
    const leaf = COLORS.leafGreen;
    const leafLight = COLORS.leafLight;
    const frondPixels = [
      [2,7],[3,6],[4,5],[5,5],[6,6],[7,7],[8,8],[1,8],[0,9],[9,9],[2,9],[3,8],[7,8],[8,9],
      [4,7],[5,7],[6,7],[3,9],[6,9]
    ];
    frondPixels.forEach(([x, y], i) => put(x, y, i % 3 === 0 ? leafLight : leaf));
  });

  generateTexture(scene, 'banana_plant', 8, 12, P, (put) => {
    const leaf = COLORS.leafLight;
    const stem = 0x3f6b2c;
    for (let y = 6; y < 12; y++) put(4, y, stem);
    put(1, 3, leaf); put(2, 2, leaf); put(3, 2, leaf); put(4, 1, leaf);
    put(5, 2, leaf); put(6, 3, leaf); put(2, 4, leaf); put(5, 4, leaf);
    put(3, 3, leaf); put(4, 2, 0x2f7a3d);
  });

  // ---------- ROCKS / LOGS / PLANTS (obstacles) ----------
  generateTexture(scene, 'rock', 10, 8, P, (put) => {
    const rock = 0x6b6b63;
    const rockDark = 0x4d4d47;
    const shape = [
      [2,1],[3,0],[4,0],[5,0],[6,1],[7,2],[7,3],[6,4],[5,5],[4,5],[3,5],[2,4],[1,3],[1,2]
    ];
    shape.forEach(([x, y]) => put(x, y, rock));
    put(2, 4, rockDark); put(5, 5, rockDark); put(6, 3, rockDark);
    for (let x = 2; x < 7; x++) for (let y = 2; y < 4; y++) put(x, y, rock);
  });

  generateTexture(scene, 'log', 20, 8, P, (put) => {
    const wood = 0x7a5230;
    const woodDark = 0x5a3a20;
    for (let x = 1; x < 19; x++) { for (let y = 2; y < 6; y++) put(x, y, wood); }
    for (let x = 1; x < 19; x++) put(x, 5, woodDark);
    put(0, 3, 0xc9a86b); put(0, 4, 0xc9a86b);
    put(19, 3, 0xc9a86b); put(19, 4, 0xc9a86b);
  });

  generateTexture(scene, 'water_plant', 8, 6, P, (put) => {
    const leaf = 0x3f8a4a;
    put(3, 0, leaf); put(4, 0, leaf); put(2, 1, leaf); put(5, 1, leaf);
    put(1, 2, leaf); put(6, 2, leaf); put(3, 2, leaf); put(4, 2, leaf);
    for (let x = 2; x < 6; x++) put(x, 3, 0x2f6b3a);
  });

  // ---------- HOUSE ----------
  generateTexture(scene, 'house_malabar', 26, 22, P, (put) => {
    const wall = COLORS.cream;
    const wallShadow = 0xdccb9c;
    const roof = COLORS.terracotta;
    const roofDark = 0x8c4527;
    const door = 0x5a3826;
    for (let y = 10; y < 20; y++) { for (let x = 2; x < 24; x++) put(x, y, wall); }
    for (let y = 10; y < 20; y++) { put(2, y, wallShadow); put(23, y, wallShadow); }
    for (let x = 0; x < 26; x++) { put(x, 9, roofDark); }
    for (let y = 3; y < 9; y++) {
      const inset = 9 - y;
      for (let x = inset; x < 26 - inset; x++) put(x, y, roof);
    }
    for (let y = 14; y < 20; y++) { put(11, y, door); put(12, y, door); put(13, y, door); put(14, y, door); }
    for (let x = 5; x < 8; x++) { for (let y = 12; y < 15; y++) put(x, y, 0x6fb0c9); }
    for (let x = 18; x < 21; x++) { for (let y = 12; y < 15; y++) put(x, y, 0x6fb0c9); }
  });

  generateTexture(scene, 'house_palace_wall', 30, 20, P, (put) => {
    const wall = 0xe6d3a3;
    const trim = COLORS.gold;
    for (let y = 2; y < 20; y++) { for (let x = 0; x < 30; x++) put(x, y, wall); }
    for (let x = 0; x < 30; x += 4) { for (let y = 2; y < 20; y++) put(x, y, 0xd4bd85); }
    for (let x = 0; x < 30; x++) put(x, 1, trim);
    for (let x = 0; x < 30; x++) put(x, 0, 0xb5822c);
  });

  // ---------- BOAT ----------
  generateTexture(scene, 'vallam', 40, 14, P, (put) => {
    const hull = 0x5a3826;
    const hullDark = 0x3d2417;
    const trim = COLORS.gold;
    for (let x = 2; x < 38; x++) { for (let y = 4; y < 9; y++) put(x, y, hull); }
    for (let x = 2; x < 38; x++) put(x, 8, hullDark);
    for (let x = 0; x < 6; x++) put(x, 6 - Math.floor(x / 2), hull);
    for (let x = 34; x < 40; x++) put(x, 6 - Math.floor((39 - x) / 2), hull);
    for (let x = 4; x < 36; x++) put(x, 3, trim);
    // rider silhouette
    for (let y = 0; y < 3; y++) for (let x = 17; x < 23; x++) put(x, y, skin);
  });

  // ---------- SYMBOLS / PEDESTALS ----------
  const symbolColors = { equality: COLORS.gold, prosperity: COLORS.leafLight, happiness: COLORS.flowerOrange };
  Object.entries(symbolColors).forEach(([key, color]) => {
    generateTexture(scene, `symbol_${key}`, 12, 12, P, (put) => {
      for (let y = 1; y < 11; y++) for (let x = 1; x < 11; x++) put(x, y, 0x2b1d10, 0);
      // diamond emblem
      const pts = [
        [5,0],[6,0],[3,2],[8,2],[1,5],[10,5],[3,8],[8,8],[5,10],[6,10]
      ];
      for (let y = 0; y < 12; y++) {
        for (let x = 0; x < 12; x++) {
          const d = Math.abs(x - 5.5) + Math.abs(y - 5.5);
          if (d < 6) put(x, y, color);
        }
      }
      for (let y = 4; y < 8; y++) for (let x = 4; x < 8; x++) put(x, y, COLORS.cream);
    });
  });

  generateTexture(scene, 'pedestal', 14, 10, P, (put) => {
    const stone = 0xc9b98a;
    const stoneDark = 0xa3946a;
    for (let x = 1; x < 13; x++) { put(x, 3, stone); put(x, 4, stone); }
    for (let x = 2; x < 12; x++) { for (let y = 5; y < 9; y++) put(x, y, stoneDark); }
    for (let x = 0; x < 14; x++) put(x, 9, 0x8c7d54);
  });

  // ---------- UI: pixel-stepped panel + button textures via nine-slice-ish rectangles ----------
  generateTexture(scene, 'ui_panel', 40, 24, 4, (put) => {
    const panel = 0x123822;
    const border = COLORS.gold;
    for (let y = 0; y < 24; y++) for (let x = 0; x < 40; x++) put(x, y, panel);
    for (let x = 0; x < 40; x++) { put(x, 0, border); put(x, 23, border); }
    for (let y = 0; y < 24; y++) { put(0, y, border); put(39, y, border); }
  });

  generateTexture(scene, 'ui_button', 30, 8, 4, (put) => {
    const btn = 0x1a4a2c;
    const border = COLORS.goldBright;
    for (let y = 0; y < 8; y++) for (let x = 0; x < 30; x++) put(x, y, btn);
    for (let x = 0; x < 30; x++) { put(x, 0, border); put(x, 7, border); }
    for (let y = 0; y < 8; y++) { put(0, y, border); put(29, y, border); }
  });

  // ---------- Ground tiles for texture variety ----------
  generateTexture(scene, 'ground_grass', 8, 8, 4, (put) => {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) put(x, y, COLORS.leafGreen);
    put(1, 1, COLORS.leafLight); put(5, 3, COLORS.leafLight); put(3, 6, 0x256b32);
  });

  generateTexture(scene, 'ground_path', 8, 8, 4, (put) => {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) put(x, y, 0xc9a468);
    put(2, 2, 0xb5904f); put(6, 5, 0xb5904f); put(4, 6, 0xddc082);
  });

  generateTexture(scene, 'ground_tile_palace', 8, 8, 4, (put) => {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) put(x, y, 0xe6d3a3);
    for (let x = 0; x < 8; x++) put(x, 0, 0xd4bd85);
    for (let y = 0; y < 8; y++) put(0, y, 0xd4bd85);
  });

  generateTexture(scene, 'ground_carpet', 8, 8, 4, (put) => {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) put(x, y, COLORS.red);
    put(1, 1, 0xb5822c); put(6, 6, 0xb5822c);
  });

  generateTexture(scene, 'water_tile', 8, 8, 4, (put) => {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) put(x, y, COLORS.waterTeal);
    put(2, 2, COLORS.waterHighlight); put(5, 5, COLORS.waterBlue);
  });

  // Simple 1x1 white pixel for particles / tint effects
  generateTexture(scene, 'pixel', 1, 1, 4, (put) => put(0, 0, 0xffffff));
}
