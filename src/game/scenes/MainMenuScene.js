import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, DEPTHS } from '../constants.js';
import { createButton } from '../systems/UIHelpers.js';
import { GameState } from '../GameState.js';
import { AudioSystem } from '../systems/AudioSystem.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    GameState.set('currentLevel', 'menu');

    this._buildBackground();

    this.add.text(GAME_WIDTH / 2, 140, 'THE LOST MEMORIES\nOF MAVELI', {
      fontFamily: 'Georgia, serif',
      fontSize: '56px',
      fontStyle: 'bold',
      color: '#f1e4bf',
      align: 'center',
      stroke: '#0a2116',
      strokeThickness: 6,
      lineSpacing: 6
    }).setOrigin(0.5).setDepth(DEPTHS.hud);

    this.add.text(GAME_WIDTH / 2, 250, 'A Mini Onam Story', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      fontStyle: 'italic',
      color: '#f1c86b'
    }).setOrigin(0.5).setDepth(DEPTHS.hud);

    const startY = 400;
    createButton(this, GAME_WIDTH / 2, startY, 'START GAME', () => this._startGame(), { width: 320 });
    createButton(this, GAME_WIDTH / 2, startY + 76, 'HOW TO PLAY', () => {
      this.scene.start('HowToPlayScene');
    }, { width: 320 });
    createButton(this, GAME_WIDTH / 2, startY + 152, 'CREDITS', () => {
      this.scene.start('CreditsScene');
    }, { width: 320 });

    // Mute toggle
    this.muteText = this.add.text(GAME_WIDTH - 30, 30, GameState.get('muted') ? '\uD83D\uDD07 MUTED' : '\uD83D\uDD0A SOUND', {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#f1e4bf',
      backgroundColor: '#123822',
      padding: { x: 10, y: 6 }
    }).setOrigin(1, 0).setDepth(DEPTHS.hud).setInteractive({ useHandCursor: true });

    this.muteText.on('pointerdown', () => {
      AudioSystem.unlock();
      const muted = AudioSystem.toggleMute();
      GameState.set('muted', muted);
      this.muteText.setText(muted ? '\uD83D\uDD07 MUTED' : '\uD83D\uDD0A SOUND');
    });

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 26, 'Move with WASD / Arrow Keys   \u2022   Interact with E / Space', {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#d9c793'
    }).setOrigin(0.5).setDepth(DEPTHS.hud);
  }

  _startGame() {
    AudioSystem.unlock();
    GameState.reset();
    this.scene.start('IntroScene');
  }

  _buildBackground() {
    // Sky
    this.add.rectangle(GAME_WIDTH / 2, 220, GAME_WIDTH, 440, COLORS.skyWarm);
    // distant hills
    const hills = this.add.graphics();
    hills.fillStyle(0x2f6b4a, 1);
    hills.fillEllipse(300, 420, 700, 160);
    hills.fillEllipse(900, 430, 800, 180);
    // sun glow
    this.add.circle(1080, 140, 70, 0xffe8b0, 0.5);
    this.add.circle(1080, 140, 46, 0xfff2c6, 0.8);

    // Water / backwater
    this.add.rectangle(GAME_WIDTH / 2, 520, GAME_WIDTH, 200, COLORS.waterTeal);
    for (let i = 0; i < 10; i++) {
      this.add.rectangle(80 + i * 130, 480 + (i % 2) * 30, 60, 6, COLORS.waterHighlight, 0.4);
    }

    // Ground band
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 90, GAME_WIDTH, 180, COLORS.leafGreen);

    // Palace/house silhouette
    const house = this.add.sprite(180, 470, 'house_malabar').setScale(3.2).setOrigin(0.5, 1);

    // coconut trees scattered
    [ [60, 560, 2.6], [1220, 540, 2.8], [900, 600, 2.2], [1120, 610, 2.0] ].forEach(([x, y, s]) => {
      this.add.sprite(x, y, 'coconut_tree').setScale(s).setOrigin(0.5, 1);
    });

    // flowers along the path
    const flowerKeys = ['flower_pink', 'flower_orange', 'flower_yellow', 'flower_white', 'flower_purple'];
    for (let i = 0; i < 14; i++) {
      const key = flowerKeys[i % flowerKeys.length];
      this.add.sprite(120 + i * 78, GAME_HEIGHT - 40 + Math.sin(i) * 10, key).setScale(1.4);
    }

    // pathway
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 10, GAME_WIDTH, 60, 0xc9a468, 0.85);
  }
}
