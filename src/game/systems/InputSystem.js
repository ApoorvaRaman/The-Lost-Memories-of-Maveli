// Reusable proximity-based interaction system.
// Shows a "[E] TALK" style prompt when the player is near an interactable,
// and prevents a single keypress from triggering multiple activations.

import Phaser from 'phaser';
import { COLORS, DEPTHS, PLAYER } from '../constants.js';

export class InteractionManager {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.interactables = [];
    this.currentTarget = null;
    this.locked = false;

    this.promptText = scene.add.text(0, 0, '[E] TALK', {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#f1e4bf',
      backgroundColor: '#123822',
      padding: { x: 8, y: 4 }
    }).setDepth(DEPTHS.hud).setOrigin(0.5, 1).setVisible(false);

    this.keys = scene.input.keyboard.addKeys({ interact: 'E', space: 'SPACE' });
    this.keys.interact.on('down', () => this._tryTrigger());
    this.keys.space.on('down', () => this._tryTrigger());
  }

  /**
   * Register an interactable: { x, y, radius, label, onInteract, isAvailable }
   */
  register(entry) {
    this.interactables.push({
      radius: PLAYER.interactionRadius,
      label: '[E] TALK',
      isAvailable: () => true,
      ...entry
    });
  }

  clear() {
    this.interactables = [];
    this.currentTarget = null;
    this.promptText.setVisible(false);
  }

  _tryTrigger() {
    if (this.locked) return;
    if (this.scene.dialogue && this.scene.dialogue.isActive()) return;
    if (this.currentTarget && this.currentTarget.isAvailable()) {
      this.locked = true;
      this.scene.time.delayedCall(220, () => { this.locked = false; });
      this.currentTarget.onInteract();
    }
  }

  update() {
    if (!this.player || !this.player.sprite) return;
    const px = this.player.sprite.x;
    const py = this.player.sprite.y;

    let closest = null;
    let closestDist = Infinity;

    for (const item of this.interactables) {
      if (!item.isAvailable()) continue;
      const x = typeof item.x === 'function' ? item.x() : item.x;
      const y = typeof item.y === 'function' ? item.y() : item.y;
      const dist = Phaser.Math.Distance.Between(px, py, x, y);
      if (dist <= item.radius && dist < closestDist) {
        closest = item;
        closestDist = dist;
      }
    }

    this.currentTarget = closest;

    if (closest) {
      const x = typeof closest.x === 'function' ? closest.x() : closest.x;
      const y = typeof closest.y === 'function' ? closest.y() : closest.y;
      this.promptText.setText(closest.label).setPosition(x, y - 56).setVisible(true);
    } else {
      this.promptText.setVisible(false);
    }
  }

  destroy() {
    this.keys.interact.removeAllListeners();
    this.keys.space.removeAllListeners();
    this.promptText.destroy();
  }
}
