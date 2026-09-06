import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, DEPTHS } from '../constants.js';
import { MAVELI_ENDING_LINES, MEMORY_3 } from '../data/dialogue.js';
import { DialogueSystem } from '../systems/DialogueSystem.js';
import { fadeOutIn } from '../systems/TransitionSystem.js';
import { AudioSystem } from '../systems/AudioSystem.js';
import { GameState } from '../GameState.js';

export class EndingScene extends Phaser.Scene {
  constructor() {
    super('EndingScene');
  }

  create() {
    this._leaving = false;
    GameState.set('memory3Unlocked', true);
    AudioSystem.startAmbient(100);

    this._buildScene();
    this._buildPookalam();

    this.dialogue = new DialogueSystem(this);

    // Maveli entrance animation
    this.maveli.setAlpha(0).setY(this.maveli.y + 40);
    this.tweens.add({
      targets: this.maveli,
      alpha: 1,
      y: this.maveli.y - 40,
      duration: 900,
      ease: 'Sine.easeOut',
      onComplete: () => {
        AudioSystem.unlock();
        this.time.delayedCall(300, () => this._showMemory3());
      }
    });

    this.events.once('shutdown', () => {
      AudioSystem.stopAmbient();
      if (this.dialogue) this.dialogue.destroy();
    });
  }

  _buildScene() {
    // Warm palace courtyard backdrop
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a0f08);
    this.add.rectangle(GAME_WIDTH / 2, 260, GAME_WIDTH, 340, COLORS.skyEvening, 0.55);
    this.add.circle(GAME_WIDTH / 2, 180, 90, 0xffd98a, 0.4);

    // distant hills / palace silhouette
    const hills = this.add.graphics();
    hills.fillStyle(0x3a2414, 1);
    hills.fillEllipse(300, 420, 700, 160);
    hills.fillEllipse(950, 430, 800, 180);

    // ground
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 120, GAME_WIDTH, 240, 0x4a3020);

    // pillars either side for palace framing
    [220, GAME_WIDTH - 220].forEach((x) => {
      const g = this.add.graphics();
      g.fillStyle(COLORS.gold, 1);
      g.fillRect(x - 22, 220, 44, 320);
      g.fillStyle(0xb5822c, 1);
      g.fillRect(x - 28, 214, 56, 16);
    });

    // Maveli and player
    this.maveli = this.add.sprite(GAME_WIDTH / 2 - 90, 430, 'maveli').setScale(4).setOrigin(0.5, 1).setDepth(DEPTHS.entities);
    this.playerSprite = this.add.sprite(GAME_WIDTH / 2 + 90, 460, 'player_down_0').setScale(4).setOrigin(0.5, 1).setDepth(DEPTHS.entities);

    // gentle camera drift for a cinematic feel
    this.cameras.main.setZoom(1.02);
    this.tweens.add({ targets: this.cameras.main, scrollX: 12, duration: 6000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  _buildPookalam() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT - 150;
    this.add.ellipse(cx, cy + 8, 260, 70, 0x000000, 0.25).setDepth(DEPTHS.shadow);

    const rings = [
      { r: 90, color: COLORS.flowerOrange, count: 14 },
      { r: 66, color: COLORS.flowerPurple, count: 12 },
      { r: 44, color: COLORS.flowerYellow, count: 10 },
      { r: 24, color: COLORS.flowerPink, count: 8 }
    ];

    const container = this.add.container(cx, cy).setDepth(DEPTHS.props);
    rings.forEach((ring) => {
      for (let i = 0; i < ring.count; i++) {
        const angle = (i / ring.count) * Math.PI * 2;
        const petal = this.add.ellipse(Math.cos(angle) * ring.r, Math.sin(angle) * ring.r * 0.4, 20, 12, ring.color);
        container.add(petal);
      }
    });
    const center = this.add.circle(0, 0, 16, COLORS.flowerWhite);
    container.add(center);

    this.tweens.add({ targets: container, scale: 1.06, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // gentle petal fall particles
    this.time.addEvent({
      delay: 400,
      loop: true,
      callback: () => {
        const x = Phaser.Math.Between(100, GAME_WIDTH - 100);
        const petal = this.add.circle(x, -10, 4, [COLORS.flowerPink, COLORS.flowerOrange, COLORS.flowerYellow][Phaser.Math.Between(0, 2)], 0.85)
          .setDepth(DEPTHS.particles);
        this.tweens.add({
          targets: petal,
          y: GAME_HEIGHT + 10,
          x: x + Phaser.Math.Between(-40, 40),
          duration: Phaser.Math.Between(3500, 5500),
          onComplete: () => petal.destroy()
        });
      }
    });
  }

  _showMemory3() {
    this.dialogue.show([{ speaker: MEMORY_3.title, text: MEMORY_3.text }], () => {
      this.dialogue.show(MAVELI_ENDING_LINES, () => this._goToComplete());
    });
  }

  _goToComplete() {
    if (this._leaving) return;
    this._leaving = true;
    AudioSystem.playFinalComplete();
    GameState.set('gameCompleted', true);
    this.time.delayedCall(600, () => {
      fadeOutIn(this, 700, null, () => {
        this.scene.start('CompleteScene');
      });
    });
  }
}
