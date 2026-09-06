import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../constants.js';
import { buildAllTextures } from '../systems/TextureFactory.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, COLORS.forestDark);
    this.add.text(cx, cy - 60, 'THE LOST MEMORIES OF MAVELI', {
      fontFamily: 'Georgia, serif',
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#f1c86b'
    }).setOrigin(0.5);

    const barBg = this.add.rectangle(cx, cy + 20, 420, 24, 0x1a4a2c).setStrokeStyle(3, COLORS.gold);
    const barFill = this.add.rectangle(cx - 205, cy + 20, 10, 16, COLORS.goldBright).setOrigin(0, 0.5);

    const loadingText = this.add.text(cx, cy + 60, 'Preparing Kerala...', {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#f1e4bf'
    }).setOrigin(0.5);

    // Generate textures progressively across a couple of frames so the bar is visible
    // even though generation itself is fast and synchronous.
    this.time.delayedCall(50, () => {
      buildAllTextures(this);
      barFill.width = 400;
      loadingText.setText('Ready.');
      this.time.delayedCall(250, () => {
        this.scene.start('MainMenuScene');
      });
    });
  }
}
