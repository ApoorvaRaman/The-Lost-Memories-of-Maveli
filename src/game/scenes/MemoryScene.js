import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, DEPTHS } from '../constants.js';
import { MEMORIES } from '../data/memories.js';
import { fadeOutIn } from '../systems/TransitionSystem.js';
import { AudioSystem } from '../systems/AudioSystem.js';
import { GameState } from '../GameState.js';

export class MemoryScene extends Phaser.Scene {
  constructor() {
    super('MemoryScene');
  }

  init(data) {
    this.memoryIndex = data.memoryIndex ?? 0;
    this.nextScene = data.nextScene || 'MainMenuScene';
    this.nextSceneData = data.nextSceneData || {};
  }

  create() {
    this._leaving = false;
    const memory = MEMORIES[this.memoryIndex];

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.forestDark);

    // soft radiant glow behind the memory card
    const glow = this.add.circle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 40, COLORS.goldBright, 0.5);
    this.tweens.add({ targets: glow, radius: 340, alpha: 0, duration: 1400, ease: 'Sine.easeOut' });

    // gentle petal particles
    this._spawnPetals();

    const panel = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 820, 320, COLORS.parchment, 0.97)
      .setStrokeStyle(6, COLORS.gold).setAlpha(0).setDepth(DEPTHS.dialogue);

    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, memory.title, {
      fontFamily: 'Georgia, serif', fontSize: '30px', fontStyle: 'bold', color: '#5a3826'
    }).setOrigin(0.5).setAlpha(0).setDepth(DEPTHS.dialogue);

    const body = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, memory.text, {
      fontFamily: 'Georgia, serif', fontSize: '21px', color: '#2b1d10', align: 'center',
      wordWrap: { width: 700 }, lineSpacing: 8
    }).setOrigin(0.5).setAlpha(0).setDepth(DEPTHS.dialogue);

    const clueTag = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, `CLUE RECOVERED: ${memory.clue}`, {
      fontFamily: 'Georgia, serif', fontSize: '17px', fontStyle: 'bold', color: '#8c4527'
    }).setOrigin(0.5).setAlpha(0).setDepth(DEPTHS.dialogue);

    const continueHint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 145, 'Click or press E / Space to continue', {
      fontFamily: 'Georgia, serif', fontSize: '14px', color: '#5a3826'
    }).setOrigin(0.5).setAlpha(0).setDepth(DEPTHS.dialogue);

    this.tweens.add({
      targets: [panel, title, body, clueTag, continueHint],
      alpha: 1,
      duration: 500,
      delay: 200
    });

    AudioSystem.unlock();
    AudioSystem.playLevelComplete();

    this.locked = true;
    this.time.delayedCall(900, () => { this.locked = false; });

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

  _spawnPetals() {
    for (let i = 0; i < 16; i++) {
      const x = Phaser.Math.Between(100, GAME_WIDTH - 100);
      const petal = this.add.circle(x, -20, 5, [COLORS.flowerPink, COLORS.flowerOrange, COLORS.flowerYellow, COLORS.flowerPurple][i % 4], 0.8)
        .setDepth(DEPTHS.particles);
      this.tweens.add({
        targets: petal,
        y: GAME_HEIGHT + 20,
        x: x + Phaser.Math.Between(-60, 60),
        duration: Phaser.Math.Between(2500, 4500),
        delay: Phaser.Math.Between(0, 1200),
        onComplete: () => petal.destroy()
      });
    }
  }

  _advance() {
    if (this.locked || this._leaving) return;
    this._leaving = true;
    fadeOutIn(this, 500, null, () => {
      this.scene.start(this.nextScene, this.nextSceneData);
    });
  }
}
