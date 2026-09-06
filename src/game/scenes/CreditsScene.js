import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, DEPTHS } from '../constants.js';
import { createButton } from '../systems/UIHelpers.js';

export class CreditsScene extends Phaser.Scene {
  constructor() {
    super('CreditsScene');
  }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.forestDark);

    this.add.text(GAME_WIDTH / 2, 100, 'CREDITS', {
      fontFamily: 'Georgia, serif',
      fontSize: '40px',
      fontStyle: 'bold',
      color: '#f1c86b'
    }).setOrigin(0.5).setDepth(DEPTHS.hud);

    const lines = [
      'THE LOST MEMORIES OF MAVELI',
      'A Mini Onam Story',
      '',
      'Design & Development',
      'Built with Phaser 3 and Vite',
      '',
      'All artwork generated procedurally',
      'as original pixel-art-inspired assets.',
      '',
      'Inspired by the culture, landscapes and',
      'folklore of Kerala. Made with respect',
      'for the spirit of Onam.',
      '',
      'Thank you for playing.'
    ];

    this.add.text(GAME_WIDTH / 2, 340, lines.join('\n'), {
      fontFamily: 'Georgia, serif',
      fontSize: '19px',
      color: '#f1e4bf',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5).setDepth(DEPTHS.hud);

    createButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 60, 'BACK', () => {
      this.scene.start('MainMenuScene');
    }, { width: 260 });
  }
}
