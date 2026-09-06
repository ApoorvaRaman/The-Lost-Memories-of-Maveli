import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, DEPTHS } from '../constants.js';
import { createButton, createPanel } from '../systems/UIHelpers.js';

const ENTRIES = [
  { label: 'MOVE', desc: 'WASD or Arrow Keys' },
  { label: 'INTERACT', desc: 'E or Space — talk to villagers, examine clues' },
  { label: 'BOAT', desc: 'WASD or Arrow Keys to steer the vallam' },
  { label: 'PUZZLE', desc: 'Mouse or touch — click symbols to arrange them' }
];

const OBJECTIVES = [
  'Explore the village and talk to villagers.',
  'Collect five flowers to complete the pookalam.',
  'Win the vallam race down the Kochi backwaters.',
  'Find clues in the palace and solve the symbol puzzle.'
];

export class HowToPlayScene extends Phaser.Scene {
  constructor() {
    super('HowToPlayScene');
  }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.forestDark);

    this.add.text(GAME_WIDTH / 2, 60, 'HOW TO PLAY', {
      fontFamily: 'Georgia, serif',
      fontSize: '40px',
      fontStyle: 'bold',
      color: '#f1c86b'
    }).setOrigin(0.5).setDepth(DEPTHS.hud);

    const panel1 = createPanel(this, 340, 320, 560, 420);
    this.add.text(340, 150, 'CONTROLS', {
      fontFamily: 'Georgia, serif', fontSize: '24px', fontStyle: 'bold', color: '#f1e4bf'
    }).setOrigin(0.5).setDepth(DEPTHS.hud);

    ENTRIES.forEach((entry, i) => {
      const y = 200 + i * 90;
      this.add.text(120, y, entry.label, {
        fontFamily: 'Georgia, serif', fontSize: '22px', fontStyle: 'bold', color: '#f1c86b'
      }).setDepth(DEPTHS.hud);
      this.add.text(120, y + 30, entry.desc, {
        fontFamily: 'Georgia, serif', fontSize: '17px', color: '#f1e4bf', wordWrap: { width: 480 }
      }).setDepth(DEPTHS.hud);
    });

    const panel2 = createPanel(this, 940, 320, 560, 420);
    this.add.text(940, 150, 'YOUR JOURNEY', {
      fontFamily: 'Georgia, serif', fontSize: '24px', fontStyle: 'bold', color: '#f1e4bf'
    }).setOrigin(0.5).setDepth(DEPTHS.hud);

    OBJECTIVES.forEach((text, i) => {
      const y = 200 + i * 90;
      this.add.text(700, y, `\u2022 ${text}`, {
        fontFamily: 'Georgia, serif', fontSize: '18px', color: '#f1e4bf', wordWrap: { width: 480 }
      }).setDepth(DEPTHS.hud);
    });

    createButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 60, 'BACK', () => {
      this.scene.start('MainMenuScene');
    }, { width: 260 });
  }
}
