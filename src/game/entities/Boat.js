// Boat controller for the vallam race. Uses direct four-direction movement
// (prioritizing responsiveness and reliability, as the spec allows) while
// keeping a "steering" feel via slight rotation toward the movement direction.

import Phaser from 'phaser';
import { BOAT, DEPTHS } from '../constants.js';

export class Boat {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'vallam');
    this.sprite.setDepth(DEPTHS.entities);
    this.sprite.body.setSize(34, 10);
    this.sprite.body.setOffset(3, 3);
    this.sprite.setCollideWorldBounds(true);

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });

    this.speedMultiplier = 1;
    this.locked = false;
    this.bobTimer = 0;
  }

  update(delta, canMove = true) {
    if (this.locked) {
      this.sprite.body.setVelocity(0, 0);
      return;
    }

    const body = this.sprite.body;
    let vx = 0;
    let vy = 0;

    if (canMove) {
      const left = this.cursors.left.isDown || this.wasd.left.isDown;
      const right = this.cursors.right.isDown || this.wasd.right.isDown;
      const up = this.cursors.up.isDown || this.wasd.up.isDown;
      const down = this.cursors.down.isDown || this.wasd.down.isDown;

      if (left) vx -= 1;
      if (right) vx += 1;
      if (up) vy -= 1;
      if (down) vy += 0.6; // slight brake-like feel on reverse

      if (vx !== 0 && vy !== 0) {
        const inv = Math.SQRT1_2;
        vx *= inv;
        vy *= inv;
      }
    }

    const speed = BOAT.speed * this.speedMultiplier;
    body.setVelocity(vx * speed, vy * speed);

    // Gentle tilt toward horizontal input for a "steering" feel.
    const targetAngle = vx * 8;
    this.sprite.angle = Phaser.Math.Linear(this.sprite.angle, targetAngle, 0.15);

    // idle bob on water
    this.bobTimer += delta;
    this.sprite.y += Math.sin(this.bobTimer / 260) * 0.15;

    // recover speed multiplier gradually after a collision slow
    if (this.speedMultiplier < 1) {
      this.speedMultiplier = Math.min(1, this.speedMultiplier + delta / 800);
    }
  }

  applyCollisionPenalty() {
    this.speedMultiplier = BOAT.collisionSlow;
    this.scene.cameras.main.shake(BOAT.collisionShakeMs, 0.003);
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.5,
      duration: 90,
      yoyo: true,
      repeat: 1
    });
  }

  lock() {
    this.locked = true;
    this.sprite.body.setVelocity(0, 0);
  }

  destroy() {
    this.sprite.destroy();
  }
}
