import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, DEPTHS } from '../constants.js';
import { createButton } from '../systems/UIHelpers.js';
import { GameState } from '../GameState.js';
import { AudioSystem } from '../systems/AudioSystem.js';

export class CompleteScene extends Phaser.Scene {
  constructor() {
    super('CompleteScene');
  }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.forestDark);

    // soft golden backdrop glow
    this.add.circle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 260, COLORS.goldBright, 0.08);

    this.add.text(GAME_WIDTH / 2, 190, 'STORY COMPLETE', {
      fontFamily: 'Georgia, serif',
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#f1c86b'
    }).setOrigin(0.5).setDepth(DEPTHS.hud);

    this.add.text(GAME_WIDTH / 2, 250, 'THE LOST MEMORIES OF MAVELI', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#f1e4bf'
    }).setOrigin(0.5).setDepth(DEPTHS.hud);

    this.add.text(GAME_WIDTH / 2, 330, 'The three memories live on in the hearts of the people.', {
      fontFamily: 'Georgia, serif',
      fontSize: '19px',
      fontStyle: 'italic',
      color: '#d9c793',
      align: 'center',
      wordWrap: { width: 700 }
    }).setOrigin(0.5).setDepth(DEPTHS.hud);

    // small completed pookalam motif
    const container = this.add.container(GAME_WIDTH / 2, 460).setDepth(DEPTHS.hud);
    const colors = [COLORS.flowerOrange, COLORS.flowerPurple, COLORS.flowerYellow, COLORS.flowerPink];
    for (let ring = 0; ring < 3; ring++) {
      const r = 26 + ring * 20;
      const count = 8 + ring * 3;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const petal = this.add.ellipse(Math.cos(angle) * r, Math.sin(angle) * r * 0.5, 14, 8, colors[(ring + i) % colors.length]);
        container.add(petal);
      }
    }
    container.add(this.add.circle(0, 0, 10, COLORS.flowerWhite));

    createButton(this, GAME_WIDTH / 2, 600, 'PLAY AGAIN', () => this._playAgain(), { width: 300 });
    createButton(this, GAME_WIDTH / 2, 668, 'MAIN MENU', () => this._toMenu(), { width: 300 });
  }

  _playAgain() {
    AudioSystem.unlock();
    GameState.reset();
    this.scene.start('IntroScene');
  }

  _toMenu() {
    AudioSystem.unlock();
    GameState.reset();
    this.scene.start('MainMenuScene');
  }
}
