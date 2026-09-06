// Lightweight NPC: idle bob animation + dialogue lines, registered with InteractionManager by the scene.

import { DEPTHS } from '../constants.js';

export class NPC {
  constructor(scene, x, y, textureKey, name, lines) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.name = name;
    this.lines = lines;
    this.sprite = scene.add.sprite(x, y, textureKey).setDepth(DEPTHS.entities);

    // subtle idle bob for "movement" without needing full walk cycles
    scene.tweens.add({
      targets: this.sprite,
      y: y - 3,
      duration: 900 + Math.random() * 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  destroy() {
    this.sprite.destroy();
  }
}
