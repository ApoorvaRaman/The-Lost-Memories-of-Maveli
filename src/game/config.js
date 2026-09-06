import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';

import { BootScene } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { HowToPlayScene } from './scenes/HowToPlayScene.js';
import { CreditsScene } from './scenes/CreditsScene.js';
import { IntroScene } from './scenes/IntroScene.js';
import { MalabarScene } from './scenes/MalabarScene.js';
import { MemoryScene } from './scenes/MemoryScene.js';
import { KochiScene } from './scenes/KochiScene.js';
import { TravancoreScene } from './scenes/TravancoreScene.js';
import { EndingScene } from './scenes/EndingScene.js';
import { CompleteScene } from './scenes/CompleteScene.js';

export const gameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#0a1710',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    HowToPlayScene,
    CreditsScene,
    IntroScene,
    MalabarScene,
    MemoryScene,
    KochiScene,
    TravancoreScene,
    EndingScene,
    CompleteScene
  ]
};
