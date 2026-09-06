import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, DEPTHS } from '../constants.js';
import { INTRO_CARDS } from '../data/dialogue.js';
import { fadeOutIn } from '../systems/TransitionSystem.js';

export class IntroScene extends Phaser.Scene {
  constructor() {
    super('IntroScene');
  }

  create() {
    this.cardIndex = 0;
    this.locked = false;

    this._buildBackground();

    this.card = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 170, 1080, 220, COLORS.parchment, 0.96)
      .setStrokeStyle(6, COLORS.brownDark)
      .setDepth(DEPTHS.dialogue);

    this.cardText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 170, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#2b1d10',
      align: 'center',
      wordWrap: { width: 980 },
      lineSpacing: 8
    }).setOrigin(0.5).setDepth(DEPTHS.dialogue);

    this.continueHint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 70, 'Click, press E, or press Space to continue', {
      fontFamily: 'Georgia, serif',
      fontSize: '15px',
      color: '#5a3826'
    }).setOrigin(0.5).setDepth(DEPTHS.dialogue);

    this.skipText = this.add.text(GAME_WIDTH - 30, 30, 'SKIP \u25B6', {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#f1e4bf',
      backgroundColor: '#123822',
      padding: { x: 10, y: 6 }
    }).setOrigin(1, 0).setDepth(DEPTHS.hud).setInteractive({ useHandCursor: true });
    this.skipText.on('pointerdown', () => this._goToMalabar());

    this._showCard(0);

    this.input.on('pointerdown', () => this._advance());
    this.keys = this.input.keyboard.addKeys({ interact: 'E', space: 'SPACE' });
    this.keys.interact.on('down', () => this._advance());
    this.keys.space.on('down', () => this._advance());

    this.events.once('shutdown', () => {
      this.input.off('pointerdown');
      this.keys.interact.removeAllListeners();
      this.keys.space.removeAllListeners();
    });
  }

  _buildBackground() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.forestDark);
    this.add.rectangle(GAME_WIDTH / 2, 300, GAME_WIDTH, 500, COLORS.skyEvening, 0.5);
    this.add.circle(GAME_WIDTH / 2, 220, 90, 0xf1c86b, 0.5);
    const house = this.add.sprite(GAME_WIDTH / 2, 420, 'house_malabar').setScale(4).setOrigin(0.5, 1).setAlpha(0.9);
    [[220, 480], [1060, 480], [340, 500], [940, 500]].forEach(([x, y]) => {
      this.add.sprite(x, y, 'coconut_tree').setScale(2.6).setOrigin(0.5, 1).setAlpha(0.85);
    });
  }

  _showCard(index) {
    const card = INTRO_CARDS[index];
    this.cardText.setText(card.text);
    this.locked = true;
    this.time.delayedCall(250, () => { this.locked = false; });
  }

  _advance() {
    if (this.locked) return;
    this.cardIndex += 1;
    if (this.cardIndex >= INTRO_CARDS.length) {
      this._goToMalabar();
      return;
    }
    this._showCard(this.cardIndex);
  }

  _goToMalabar() {
    if (this._leaving) return;
    this._leaving = true;
    fadeOutIn(this, 600, null, () => {
      this.scene.start('MalabarScene');
    });
  }
}
