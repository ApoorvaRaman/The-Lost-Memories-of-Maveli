import Phaser from 'phaser';
import { COLORS, DEPTHS, LEVEL2 } from '../constants.js';
import { KOCHI_OBSTACLES } from '../data/levels.js';
import { KOCHI_INTRO } from '../data/dialogue.js';
import { Boat } from '../entities/Boat.js';
import { DialogueSystem } from '../systems/DialogueSystem.js';
import { createHUDText } from '../systems/UIHelpers.js';
import { showLevelTitleCard, fadeOutIn } from '../systems/TransitionSystem.js';
import { AudioSystem } from '../systems/AudioSystem.js';
import { GameState } from '../GameState.js';

const FINISH_Y = 120;
const START_Y = LEVEL2.worldHeight - 120;

export class KochiScene extends Phaser.Scene {
  constructor() {
    super('KochiScene');
  }

  create() {
    this._leaving = false;
    this._raceStarted = false;
    this._finished = false;
    this._elapsed = 0;
    GameState.set('currentLevel', 'kochi');
    AudioSystem.startAmbient(70);

    const W = LEVEL2.worldWidth;
    const H = LEVEL2.worldHeight;
    this.physics.world.setBounds(0, 0, W, H);
    this.cameras.main.setBounds(0, 0, W, H);

    this._buildCanal(W, H);
    this._buildObstacles();
    this._buildFinishLine(W);

    this.boat = new Boat(this, W / 2, START_Y);
    this.cameras.main.startFollow(this.boat.sprite, true, 0.1, 0.15);

    this.physics.add.overlap(this.boat.sprite, this.obstacleGroup, (boatSprite, obstacle) => {
      this._handleCollision(obstacle);
    });

    this.physics.add.overlap(this.boat.sprite, this.finishZone, () => {
      this._handleFinish();
    });

    this.dialogue = new DialogueSystem(this);

    this._buildHUD();

    showLevelTitleCard(this, 'LEVEL 2 \u2014 KOCHI', 'THE VALLAM RACE', () => {
      this.dialogue.show(KOCHI_INTRO, () => {
        this._raceStarted = true;
      });
    });

    this.events.once('shutdown', () => this._cleanup());
  }

  _buildCanal(W, H) {
    const g = this.add.graphics().setDepth(DEPTHS.ground);
    g.fillStyle(COLORS.waterTeal, 1);
    g.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 40) {
      g.fillStyle(COLORS.waterHighlight, 0.15);
      g.fillRect((y % 80 === 0) ? 0 : 20, y, W, 4);
    }

    // banks
    const bankW = 90;
    this.add.rectangle(bankW / 2, H / 2, bankW, H, COLORS.leafGreen).setDepth(DEPTHS.ground + 1);
    this.add.rectangle(W - bankW / 2, H / 2, bankW, H, COLORS.leafGreen).setDepth(DEPTHS.ground + 1);

    // bank collision (keep boat within the channel)
    this.bankGroup = this.physics.add.staticGroup();
    const leftBank = this.add.zone(bankW / 2, H / 2, bankW, H);
    const rightBank = this.add.zone(W - bankW / 2, H / 2, bankW, H);
    [leftBank, rightBank].forEach((z) => {
      this.physics.add.existing(z, true);
      this.bankGroup.add(z);
    });

    // decorative palms and huts along the banks
    for (let y = 40; y < H; y += 160) {
      this.add.sprite(30, y, 'coconut_tree').setScale(2).setOrigin(0.5, 1).setDepth(DEPTHS.props);
      this.add.sprite(W - 30, y, 'coconut_tree').setScale(2).setOrigin(0.5, 1).setDepth(DEPTHS.props);
    }
  }

  _buildObstacles() {
    this.obstacleGroup = this.physics.add.staticGroup();
    this.obstacleTimers = {};

    KOCHI_OBSTACLES.forEach((o, i) => {
      let sprite;
      if (o.type === 'log') {
        sprite = this.add.sprite(o.x, o.y, 'log').setScale(1.3).setDepth(DEPTHS.props);
        sprite.body_w = o.w; sprite.body_h = o.h;
      } else if (o.type === 'rock') {
        sprite = this.add.sprite(o.x, o.y, 'rock').setScale(1.6).setDepth(DEPTHS.props);
        sprite.body_w = o.r * 2; sprite.body_h = o.r * 2;
      } else {
        sprite = this.add.sprite(o.x, o.y, 'water_plant').setScale(2).setDepth(DEPTHS.props);
        sprite.body_w = o.r * 2; sprite.body_h = o.r * 2;
      }
      this.physics.add.existing(sprite, true);
      sprite.body.setSize(sprite.body_w, sprite.body_h);
      sprite.obstacleId = `obs_${i}`;
      this.obstacleGroup.add(sprite);
    });

    // collide with banks too
    this.physics.add.collider(this.obstacleGroup, this.obstacleGroup);
  }

  _buildFinishLine(W) {
    const g = this.add.graphics().setDepth(DEPTHS.props);
    for (let x = 90; x < W - 90; x += 24) {
      g.fillStyle((Math.floor(x / 24) % 2 === 0) ? 0xffffff : 0x1c1c1c, 1);
      g.fillRect(x, FINISH_Y - 8, 24, 16);
    }
    this.add.text(W / 2, FINISH_Y - 44, 'FINISH', {
      fontFamily: 'Georgia, serif', fontSize: '22px', fontStyle: 'bold', color: '#f1c86b',
      stroke: '#0a2116', strokeThickness: 4
    }).setOrigin(0.5).setDepth(DEPTHS.props);

    const zone = this.add.zone(W / 2, FINISH_Y, W - 180, 20);
    this.physics.add.existing(zone, true);
    this.finishZone = zone;
  }

  _buildHUD() {
    this.hudTitle = createHUDText(this, 30, 24, 'KOCHI \u2014 THE VALLAM RACE', { fontSize: '20px' }).setScrollFactor(0);
    this.hudObjective = createHUDText(this, 30, 54, 'Reach the finish line!', { fontSize: '16px', fontStyle: 'normal', color: '#f1c86b' }).setScrollFactor(0);
    this.hudTimer = createHUDText(this, 1250, 24, 'TIME: 00:00', { fontSize: '18px' }).setOrigin(1, 0).setScrollFactor(0);
  }

  _handleCollision(obstacle) {
    const id = obstacle.obstacleId;
    const now = this.time.now;
    if (this.obstacleTimers[id] && now - this.obstacleTimers[id] < 500) return; // avoid rapid repeat spam
    this.obstacleTimers[id] = now;
    this.boat.applyCollisionPenalty();
    AudioSystem.unlock();
    AudioSystem.playCollision();
  }

  _handleFinish() {
    if (this._finished) return;
    this._finished = true;
    this._raceStarted = false;
    this.boat.lock();
    AudioSystem.playLevelComplete();
    this.hudObjective.setText('Finish line reached!').setColor('#f1c86b');
    GameState.set('raceCompleted', true);

    this.time.delayedCall(1200, () => {
      GameState.set('memory2Unlocked', true);
      this._leaving = true;
      fadeOutIn(this, 600, null, () => {
        this.scene.start('MemoryScene', { memoryIndex: 1, nextScene: 'TravancoreScene' });
      });
    });
  }

  update(time, delta) {
    const canMove = this._raceStarted && !this.dialogue.isActive() && !this._finished && !this._leaving;
    this.boat.update(delta, canMove);

    if (this._raceStarted && !this._finished) {
      this._elapsed += delta;
      const secs = Math.floor(this._elapsed / 1000);
      const mm = String(Math.floor(secs / 60)).padStart(2, '0');
      const ss = String(secs % 60).padStart(2, '0');
      this.hudTimer.setText(`TIME: ${mm}:${ss}`);
    }

    // Safety net: if boat somehow gets wedged, gently nudge it back toward channel center.
    if (this.boat.sprite.x < 70 || this.boat.sprite.x > LEVEL2.worldWidth - 70) {
      this.boat.sprite.x = Phaser.Math.Clamp(this.boat.sprite.x, 75, LEVEL2.worldWidth - 75);
    }
  }

  _cleanup() {
    AudioSystem.stopAmbient();
    if (this.dialogue) this.dialogue.destroy();
  }
}
