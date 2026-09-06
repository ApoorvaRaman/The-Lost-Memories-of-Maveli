import Phaser from 'phaser';
import { COLORS, DEPTHS, LEVEL1 } from '../constants.js';
import { MALABAR_LAYOUT } from '../data/levels.js';
import { MALABAR_NPCS } from '../data/dialogue.js';
import { FLOWER_PALETTE } from '../data/memories.js';
import { Player } from '../entities/Player.js';
import { NPC } from '../entities/NPC.js';
import { DialogueSystem } from '../systems/DialogueSystem.js';
import { InteractionManager } from '../systems/InputSystem.js';
import { createHUDText } from '../systems/UIHelpers.js';
import { showLevelTitleCard, fadeOutIn } from '../systems/TransitionSystem.js';
import { AudioSystem } from '../systems/AudioSystem.js';
import { GameState } from '../GameState.js';

export class MalabarScene extends Phaser.Scene {
  constructor() {
    super('MalabarScene');
  }

  create() {
    this._leaving = false;
    GameState.set('currentLevel', 'malabar');
    AudioSystem.startAmbient(90);

    const W = LEVEL1.worldWidth;
    const H = LEVEL1.worldHeight;
    this.physics.world.setBounds(0, 0, W, H);
    this.cameras.main.setBounds(0, 0, W, H);

    this._buildGround(W, H);
    this._buildStaticObstacles();
    this._buildDecoration();

    // Player
    this.player = new Player(this, 640, 500);
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);
    this.physics.add.collider(this.player.sprite, this.obstacles);

    // Interaction system
    this.interaction = new InteractionManager(this, this.player);
    this.dialogue = new DialogueSystem(this);

    // NPCs
    this._buildNPCs();

    // Flowers
    this.flowerSprites = {};
    this._buildFlowers();

    // Pookalam mini display
    this._buildPookalam();

    // HUD
    this._buildHUD();

    // Level title card
    showLevelTitleCard(this, 'LEVEL 1 \u2014 MALABAR', 'THE LAND OF THE PEOPLE');

    this.events.once('shutdown', () => this._cleanup());
  }

  // ---------------- World building ----------------

  _buildGround(W, H) {
    const g = this.add.graphics().setDepth(DEPTHS.ground);
    const tileSize = 32;
    for (let y = 0; y < H; y += tileSize) {
      for (let x = 0; x < W; x += tileSize) {
        g.fillStyle(COLORS.leafGreen, 1);
        g.fillRect(x, y, tileSize, tileSize);
      }
    }
    // path (a simple cross pattern)
    g.fillStyle(0xc9a468, 0.9);
    g.fillRect(0, 460, W, 90);
    g.fillRect(600, 0, 90, H);
  }

  _buildStaticObstacles() {
    this.obstacles = this.physics.add.staticGroup();
    const layout = MALABAR_LAYOUT;

    layout.houses.forEach((h) => {
      const sprite = this.add.sprite(h.x, h.y, 'house_malabar').setScale(3.2).setOrigin(0.5, 1).setDepth(DEPTHS.props);
      const zone = this.add.zone(h.x, h.y - 40, 220, 90);
      this.physics.add.existing(zone, true);
      this.obstacles.add(zone);
    });

    // Pond as a soft obstacle (visual only handled separately; block movement)
    const pond = layout.pond;
    const pondZone = this.add.zone(pond.x, pond.y, pond.radiusX * 1.7, pond.radiusY * 1.7);
    this.physics.add.existing(pondZone, true);
    this.obstacles.add(pondZone);
  }

  _buildDecoration() {
    const layout = MALABAR_LAYOUT;

    // Pond visual
    const pond = layout.pond;
    const pondGfx = this.add.graphics().setDepth(DEPTHS.ground + 1);
    pondGfx.fillStyle(COLORS.waterTeal, 1);
    pondGfx.fillEllipse(pond.x, pond.y, pond.radiusX * 2, pond.radiusY * 2);
    pondGfx.fillStyle(COLORS.waterHighlight, 0.5);
    pondGfx.fillEllipse(pond.x - 30, pond.y - 20, 40, 16);

    // Trees (visual, some as light obstacles too for density)
    layout.trees.forEach((t, i) => {
      this.add.sprite(t.x, t.y, 'coconut_tree').setScale(2.4).setOrigin(0.5, 1).setDepth(DEPTHS.entities + (t.y / 10000));
      // shadow
      this.add.ellipse(t.x, t.y + 4, 40, 12, 0x000000, 0.2).setDepth(DEPTHS.shadow);
    });

    // Banana plants + fences as scattered decoration
    for (let i = 0; i < 8; i++) {
      const x = 100 + (i * 137) % 1100;
      const y = 780 + ((i * 53) % 90);
      this.add.sprite(x, y, 'banana_plant').setScale(2).setOrigin(0.5, 1).setDepth(DEPTHS.props);
    }

    // Lamps near houses
    layout.houses.forEach((h) => {
      const g = this.add.graphics().setDepth(DEPTHS.props);
      g.fillStyle(0x5a3826, 1);
      g.fillRect(h.x + 130, h.y - 60, 4, 40);
      g.fillStyle(0xf1c86b, 0.9);
      g.fillCircle(h.x + 132, h.y - 64, 7);
    });
  }

  _buildNPCs() {
    this.npcs = [];
    MALABAR_NPCS.forEach((data, i) => {
      const pos = MALABAR_LAYOUT.npcs[i];
      const npc = new NPC(this, pos.x, pos.y, `npc_${data.id}`, data.name, data.lines);
      this.npcs.push(npc);

      this.interaction.register({
        x: pos.x,
        y: pos.y,
        radius: 72,
        label: '[E] TALK',
        isAvailable: () => true,
        onInteract: () => {
          AudioSystem.unlock();
          AudioSystem.playInteract();
          const lines = data.lines.map((text) => ({ speaker: data.name, text }));
          this.dialogue.show(lines);
        }
      });
    });
  }

  _buildFlowers() {
    MALABAR_LAYOUT.flowers.forEach((f) => {
      if (GameState.isFlowerCollected(f.id)) return;
      const sprite = this.add.sprite(f.x, f.y, `flower_${f.color}`).setScale(2.4).setDepth(DEPTHS.props);
      const glow = this.add.circle(f.x, f.y, 22, FLOWER_PALETTE[f.color], 0.25).setDepth(DEPTHS.props - 1);
      this.tweens.add({ targets: [sprite, glow], y: '-=6', duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.tweens.add({ targets: glow, alpha: 0.45, duration: 700, yoyo: true, repeat: -1 });
      this.flowerSprites[f.id] = { sprite, glow };

      this.interaction.register({
        x: f.x,
        y: f.y,
        radius: 56,
        label: '[E] PICK FLOWER',
        isAvailable: () => !GameState.isFlowerCollected(f.id),
        onInteract: () => this._collectFlower(f)
      });
    });
  }

  _collectFlower(f) {
    const collected = GameState.collectFlower(f.id);
    if (!collected) return; // already collected — ignore duplicate attempts

    AudioSystem.unlock();
    AudioSystem.playCollect();

    const entry = this.flowerSprites[f.id];
    if (entry) {
      this.tweens.add({
        targets: [entry.sprite, entry.glow],
        scale: 0,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          entry.sprite.destroy();
          entry.glow.destroy();
        }
      });
    }

    this._updateHUD();
    this._growPookalamPetal(f.color);

    if (GameState.get('flowersCollected') >= LEVEL1.flowersRequired) {
      this.time.delayedCall(400, () => this._completeLevel());
    }
  }

  _buildPookalam() {
    const center = MALABAR_LAYOUT.pookalamCenter;
    this.pookalamContainer = this.add.container(center.x, center.y).setDepth(DEPTHS.props);
    const ring = this.add.circle(0, 0, 44, 0x8c6a3a, 0.4).setStrokeStyle(3, COLORS.gold);
    this.pookalamContainer.add(ring);
    this.pookalamPetals = [];

    // small caption above the pookalam
    this.add.text(center.x, center.y - 70, 'POOKALAM', {
      fontFamily: 'Georgia, serif', fontSize: '16px', fontStyle: 'bold', color: '#f1e4bf',
      backgroundColor: '#123822', padding: { x: 6, y: 3 }
    }).setOrigin(0.5).setDepth(DEPTHS.props);
  }

  _growPookalamPetal(colorName) {
    const center = MALABAR_LAYOUT.pookalamCenter;
    const count = this.pookalamPetals.length;
    const angle = (count / LEVEL1.flowersRequired) * Math.PI * 2;
    const r = 30;
    const petal = this.add.circle(Math.cos(angle) * r, Math.sin(angle) * r, 12, FLOWER_PALETTE[colorName]);
    petal.setScale(0);
    this.pookalamContainer.add(petal);
    this.pookalamPetals.push(petal);
    this.tweens.add({ targets: petal, scale: 1, duration: 300, ease: 'Back.easeOut' });
  }

  _buildHUD() {
    this.hudTitle = createHUDText(this, 30, 24, 'MALABAR \u2014 THE LAND OF THE PEOPLE', { fontSize: '20px' });
    this.hudObjective = createHUDText(this, 30, 54, 'Collect 5 flowers to complete the pookalam.', { fontSize: '16px', fontStyle: 'normal', color: '#f1c86b' });
    this.hudCount = createHUDText(this, 30, 82, `FLOWERS: ${GameState.get('flowersCollected')}/${LEVEL1.flowersRequired}`, { fontSize: '18px' });
    [this.hudTitle, this.hudObjective, this.hudCount].forEach(t => t.setScrollFactor(0));
  }

  _updateHUD() {
    this.hudCount.setText(`FLOWERS: ${GameState.get('flowersCollected')}/${LEVEL1.flowersRequired}`);
  }

  _completeLevel() {
    if (this._leaving) return;
    this._leaving = true;
    AudioSystem.playLevelComplete();
    this.hudObjective.setText('Pookalam complete!').setColor('#f1c86b');
    this.player.freeze();

    // celebratory pulse
    this.tweens.add({ targets: this.pookalamContainer, scale: 1.15, duration: 300, yoyo: true, repeat: 2 });

    this.time.delayedCall(1200, () => {
      GameState.set('memory1Unlocked', true);
      fadeOutIn(this, 600, null, () => {
        this.scene.start('MemoryScene', { memoryIndex: 0, nextScene: 'KochiScene' });
      });
    });
  }

  update(time, delta) {
    const canMove = !this.dialogue.isActive() && !this._leaving;
    this.player.update(delta, canMove);
    this.interaction.update();
  }

  _cleanup() {
    AudioSystem.stopAmbient();
    if (this.dialogue) this.dialogue.destroy();
    if (this.interaction) this.interaction.destroy();
  }
}
