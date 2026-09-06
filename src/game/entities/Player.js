// Reusable top-down player controller shared by all exploration levels.

import { PLAYER, DEPTHS } from '../constants.js';

export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'player_down_0');
    this.sprite.setDepth(DEPTHS.entities);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.setSize(20, 14);
    this.sprite.body.setOffset(5, 44);

    this.facing = 'down';
    this.animTimer = 0;
    this.animFrame = 0;
    this.moving = false;

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }

  update(delta, canMove = true) {
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
      if (down) vy += 1;
    }

    this.moving = vx !== 0 || vy !== 0;

    // Normalize diagonal movement so it isn't faster than cardinal movement.
    if (vx !== 0 && vy !== 0) {
      const inv = Math.SQRT1_2;
      vx *= inv;
      vy *= inv;
    }

    body.setVelocity(vx * PLAYER.speed, vy * PLAYER.speed);

    if (vx < 0) this.facing = 'left';
    else if (vx > 0) this.facing = 'right';
    else if (vy < 0) this.facing = 'up';
    else if (vy > 0) this.facing = 'down';

    this._updateAnimation(delta);
  }

  _updateAnimation(delta) {
    if (this.moving) {
      this.animTimer += delta;
      if (this.animTimer > 160) {
        this.animTimer = 0;
        this.animFrame = this.animFrame === 0 ? 1 : 0;
      }
    } else {
      this.animFrame = 0;
      this.animTimer = 0;
    }
    const key = `player_${this.facing}_${this.animFrame}`;
    if (this.sprite.texture.key !== key) {
      this.sprite.setTexture(key);
    }
  }

  freeze() {
    this.sprite.body.setVelocity(0, 0);
  }

  destroy() {
    this.sprite.destroy();
  }
}
