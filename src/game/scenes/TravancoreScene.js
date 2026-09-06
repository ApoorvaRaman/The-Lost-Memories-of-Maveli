import Phaser from 'phaser';
import { COLORS, DEPTHS, LEVEL3 } from '../constants.js';
import { TRAVANCORE_LAYOUT } from '../data/levels.js';
import { TRAVANCORE_NPCS, TRAVANCORE_CLUES, PALACE_HINT } from '../data/dialogue.js';
import { Player } from '../entities/Player.js';
import { NPC } from '../entities/NPC.js';
import { DialogueSystem } from '../systems/DialogueSystem.js';
import { InteractionManager } from '../systems/InputSystem.js';
import { createHUDText, createPanel } from '../systems/UIHelpers.js';
import { showLevelTitleCard, fadeOutIn } from '../systems/TransitionSystem.js';
import { AudioSystem } from '../systems/AudioSystem.js';
import { GameState } from '../GameState.js';

export class TravancoreScene extends Phaser.Scene {
  constructor() {
    super('TravancoreScene');
  }

  create() {
    this._leaving = false;
    GameState.set('currentLevel', 'travancore');
    AudioSystem.startAmbient(60);

    const W = LEVEL3.worldWidth;
    const H = LEVEL3.worldHeight;
    this.physics.world.setBounds(0, 0, W, H);
    this.cameras.main.setBounds(0, 0, W, H);

    this._buildGround(W, H);
    this._buildStaticObstacles();
    this._buildDecoration();

    this.player = new Player(this, 640, 700);
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);
    this.physics.add.collider(this.player.sprite, this.obstacles);

    this.interaction = new InteractionManager(this, this.player);
    this.dialogue = new DialogueSystem(this);

    this._buildNPCs();
    this._buildClues();
    this._buildPuzzle();
    this._buildFinalDoor();
    this._buildHUD();
    this._buildClueTracker();

    showLevelTitleCard(this, 'LEVEL 3 \u2014 TRAVANCORE', 'THE FINAL MEMORY');

    this.events.once('shutdown', () => this._cleanup());
  }

  // ---------------- World ----------------

  _buildGround(W, H) {
    const g = this.add.graphics().setDepth(DEPTHS.ground);
    for (let y = 0; y < H; y += 32) {
      for (let x = 0; x < W; x += 32) {
        g.fillStyle(0xe6d3a3, 1);
        g.fillRect(x, y, 32, 32);
      }
    }
    // red carpet down the middle
    g.fillStyle(COLORS.red, 0.85);
    g.fillRect(W / 2 - 90, 100, 180, H - 200);
  }

  _buildStaticObstacles() {
    this.obstacles = this.physics.add.staticGroup();
    const W = LEVEL3.worldWidth;

    // Palace side walls (as long invisible collidable zones with decorative wall sprites)
    for (let y = 60; y < LEVEL3.worldHeight - 60; y += 160) {
      [120, W - 120].forEach((x) => {
        const zone = this.add.zone(x, y, 80, 140);
        this.physics.add.existing(zone, true);
        this.obstacles.add(zone);
      });
    }

    // Pillars flanking the carpet
    const pillarYs = [220, 400, 600];
    pillarYs.forEach((y) => {
      [[420, y], [860, y]].forEach(([x, py]) => {
        const zone = this.add.zone(x, py, 50, 50);
        this.physics.add.existing(zone, true);
        this.obstacles.add(zone);
      });
    });
  }

  _buildDecoration() {
    const W = LEVEL3.worldWidth;
    const H = LEVEL3.worldHeight;

    // side wall decoration
    for (let y = 40; y < H - 40; y += 160) {
      this.add.sprite(120, y, 'house_palace_wall').setScale(2.4).setOrigin(0.5, 0.5).setDepth(DEPTHS.props);
      this.add.sprite(W - 120, y, 'house_palace_wall').setScale(2.4).setOrigin(0.5, 0.5).setDepth(DEPTHS.props);
    }

    // pillars
    const pillarYs = [220, 400, 600];
    pillarYs.forEach((y) => {
      [[420, y], [860, y]].forEach(([x, py]) => {
        const g = this.add.graphics().setDepth(DEPTHS.props);
        g.fillStyle(COLORS.gold, 1);
        g.fillRect(x - 18, py - 60, 36, 120);
        g.fillStyle(0xb5822c, 1);
        g.fillRect(x - 22, py - 66, 44, 14);
        g.fillRect(x - 22, py + 54, 44, 14);
        this.add.ellipse(x, py + 62, 50, 14, 0x000000, 0.2).setDepth(DEPTHS.shadow);
      });
    });

    // potted plants
    for (let i = 0; i < 6; i++) {
      const x = 220 + i * 160;
      this.add.sprite(x, 80, 'banana_plant').setScale(1.6).setOrigin(0.5, 1).setDepth(DEPTHS.props);
    }
  }

  _buildNPCs() {
    const guardPos = TRAVANCORE_LAYOUT.guard;
    const data = TRAVANCORE_NPCS[0];
    this.guard = new NPC(this, guardPos.x, guardPos.y, 'npc_guard1', data.name, data.lines);

    this.interaction.register({
      x: guardPos.x,
      y: guardPos.y,
      radius: 72,
      label: '[E] TALK',
      onInteract: () => {
        AudioSystem.unlock();
        AudioSystem.playInteract();
        const lines = data.lines.map((text) => ({ speaker: data.name, text }));
        this.dialogue.show(lines);
      }
    });
  }

  _buildClues() {
    this.clueMarkers = [];
    TRAVANCORE_LAYOUT.clueSpots.forEach((spot) => {
      const clueData = TRAVANCORE_CLUES.find((c) => c.key === spot.key);
      const marker = this.add.circle(spot.x, spot.y, 14, COLORS.goldBright, 0.9).setDepth(DEPTHS.props);
      this.tweens.add({ targets: marker, alpha: 0.4, duration: 700, yoyo: true, repeat: -1 });
      const glowRing = this.add.circle(spot.x, spot.y, 24, COLORS.goldBright, 0.15).setDepth(DEPTHS.props - 1);
      this.clueMarkers.push({ marker, glowRing, key: spot.key });

      this.interaction.register({
        x: spot.x,
        y: spot.y,
        radius: 60,
        label: '[E] EXAMINE',
        isAvailable: () => !GameState.get('cluesFound')[spot.key],
        onInteract: () => {
          AudioSystem.unlock();
          AudioSystem.playInteract();
          GameState.markClueFound(spot.key);
          this._refreshClueTracker();
          marker.setVisible(false);
          glowRing.setVisible(false);
          this.dialogue.show([{ speaker: clueData.title, text: clueData.text }]);
        }
      });
    });
  }

  _buildClueTracker() {
    this.clueTrackerPanel = createPanel(this, 1150, 90, 220, 130, { alpha: 0.9 });
    this.clueTrackerTitle = createHUDText(this, 1060, 40, 'CLUES FOUND', { fontSize: '15px' }).setScrollFactor(0);
    this.clueTexts = {};
    ['equality', 'prosperity', 'happiness'].forEach((key, i) => {
      this.clueTexts[key] = createHUDText(this, 1060, 66 + i * 24, `\u25CB ${key.toUpperCase()}`, { fontSize: '14px', fontStyle: 'normal', color: '#d9c793' }).setScrollFactor(0);
    });
    this.clueTrackerPanel.setScrollFactor(0);
    this._refreshClueTracker();
  }

  _refreshClueTracker() {
    const clues = GameState.get('cluesFound');
    ['equality', 'prosperity', 'happiness'].forEach((key) => {
      const found = clues[key];
      this.clueTexts[key].setText(`${found ? '\u25CF' : '\u25CB'} ${key.toUpperCase()}`);
      this.clueTexts[key].setColor(found ? '#f1c86b' : '#d9c793');
    });
  }

  // ---------------- Puzzle ----------------

  _buildPuzzle() {
    const pedestalsData = TRAVANCORE_LAYOUT.pedestals;
    const order = ['prosperity', 'equality', 'happiness']; // intentionally shuffled from the solution
    this.pedestals = pedestalsData.map((p, i) => {
      const sprite = this.add.sprite(p.x, p.y, 'pedestal').setScale(3).setOrigin(0.5, 0.5).setDepth(DEPTHS.props);
      const symbol = this.add.sprite(p.x, p.y - 26, `symbol_${order[i]}`).setScale(2.6).setDepth(DEPTHS.props + 1)
        .setInteractive({ useHandCursor: true });
      const label = this.add.text(p.x, p.y + 34, order[i].toUpperCase(), {
        fontFamily: 'Georgia, serif', fontSize: '13px', fontStyle: 'bold', color: '#f1e4bf',
        backgroundColor: '#123822', padding: { x: 5, y: 2 }
      }).setOrigin(0.5).setDepth(DEPTHS.props + 1);
      const selectRing = this.add.circle(p.x, p.y - 26, 30, COLORS.goldBright, 0)
        .setStrokeStyle(3, COLORS.goldBright, 0).setDepth(DEPTHS.props + 1);

      const pedestal = { slot: p.slot, x: p.x, y: p.y, key: order[i], symbol, label, selectRing };
      symbol.on('pointerdown', () => this._onPedestalClicked(pedestal));
      return pedestal;
    });

    this.selectedPedestal = null;
    this.puzzleHint = this.add.text(this.pedestals[1].x, this.pedestals[1].y - 90, PALACE_HINT, {
      fontFamily: 'Georgia, serif', fontSize: '15px', color: '#f1e4bf', align: 'center',
      wordWrap: { width: 420 }, backgroundColor: '#123822', padding: { x: 10, y: 6 }
    }).setOrigin(0.5).setDepth(DEPTHS.props + 1);

    this.puzzleFeedback = this.add.text(this.pedestals[1].x, this.pedestals[1].y + 70, '', {
      fontFamily: 'Georgia, serif', fontSize: '16px', fontStyle: 'bold', color: '#f1c86b'
    }).setOrigin(0.5).setDepth(DEPTHS.props + 1);
  }

  _onPedestalClicked(pedestal) {
    if (GameState.get('puzzleSolved')) return;
    AudioSystem.unlock();

    if (!this.selectedPedestal) {
      this.selectedPedestal = pedestal;
      pedestal.selectRing.setStrokeStyle(3, COLORS.goldBright, 1);
      AudioSystem.playPuzzleSelect();
      return;
    }

    if (this.selectedPedestal === pedestal) {
      // deselect
      pedestal.selectRing.setStrokeStyle(3, COLORS.goldBright, 0);
      this.selectedPedestal = null;
      return;
    }

    // swap the two pedestals' keys/symbols
    const a = this.selectedPedestal;
    const b = pedestal;
    const tmpKey = a.key;
    a.key = b.key;
    b.key = tmpKey;
    a.symbol.setTexture(`symbol_${a.key}`);
    b.symbol.setTexture(`symbol_${b.key}`);
    a.label.setText(a.key.toUpperCase());
    b.label.setText(b.key.toUpperCase());

    a.selectRing.setStrokeStyle(3, COLORS.goldBright, 0);
    this.selectedPedestal = null;

    AudioSystem.playPuzzleSelect();
    this._checkPuzzle();
  }

  _checkPuzzle() {
    const order = this.pedestals
      .slice()
      .sort((p1, p2) => p1.slot - p2.slot)
      .map((p) => p.key);

    const correct = order.every((key, i) => key === LEVEL3.solution[i]);

    if (correct) {
      this._onPuzzleSolved();
    } else {
      this.puzzleFeedback.setText('Not quite yet...').setColor('#e4753a');
      AudioSystem.playPuzzleWrong();
      this.time.delayedCall(1200, () => {
        if (!GameState.get('puzzleSolved')) this.puzzleFeedback.setText('');
      });
    }
  }

  _onPuzzleSolved() {
    GameState.set('puzzleSolved', true);
    AudioSystem.playPuzzleCorrect();
    this.puzzleFeedback.setText('The pillars align!').setColor('#f1c86b');
    this.puzzleHint.setText('EQUALITY \u2192 PROSPERITY \u2192 HAPPINESS');

    this.pedestals.forEach((p) => {
      this.tweens.add({ targets: p.symbol, scale: 3.2, duration: 400, yoyo: true, repeat: 1, ease: 'Sine.easeInOut' });
      p.selectRing.setStrokeStyle(3, COLORS.goldBright, 0);
    });

    this._openFinalDoor();
  }

  // ---------------- Final door ----------------

  _buildFinalDoor() {
    const door = TRAVANCORE_LAYOUT.finalDoor;
    this.doorGraphics = this.add.graphics().setDepth(DEPTHS.props);
    this._drawDoor(false);

    this.doorZone = this.add.zone(door.x, door.y, 140, 40);
    this.physics.add.existing(this.doorZone, true);
    this.doorBlockCollider = this.physics.add.collider(this.player?.sprite, this.doorZone);

    this.interaction.register({
      x: door.x,
      y: door.y + 30,
      radius: 70,
      label: '[E] ENTER',
      isAvailable: () => GameState.get('puzzleSolved') && !this._leaving,
      onInteract: () => this._enterFinalRoom()
    });
  }

  _drawDoor(open) {
    const door = TRAVANCORE_LAYOUT.finalDoor;
    this.doorGraphics.clear();
    if (!open) {
      this.doorGraphics.fillStyle(0x3d2417, 1);
      this.doorGraphics.fillRect(door.x - 70, door.y - 40, 140, 80);
      this.doorGraphics.fillStyle(COLORS.gold, 1);
      this.doorGraphics.fillRect(door.x - 70, door.y - 44, 140, 8);
    } else {
      this.doorGraphics.fillStyle(0x1c1206, 1);
      this.doorGraphics.fillRect(door.x - 70, door.y - 40, 140, 80);
      this.doorGraphics.fillStyle(COLORS.goldBright, 0.5);
      this.doorGraphics.fillRect(door.x - 30, door.y - 40, 60, 80);
    }
  }

  _openFinalDoor() {
    this.time.delayedCall(400, () => {
      this._drawDoor(true);
      if (this.doorBlockCollider) {
        this.physics.world.removeCollider(this.doorBlockCollider);
      }
      this.hudObjective.setText('The final room has opened. Approach and press E.').setColor('#f1c86b');
    });
  }

  _enterFinalRoom() {
    if (this._leaving) return;
    this._leaving = true;
    AudioSystem.playFinalComplete();
    this.player.freeze();
    fadeOutIn(this, 700, null, () => {
      this.scene.start('EndingScene');
    });
  }

  _buildHUD() {
    this.hudTitle = createHUDText(this, 30, 24, 'TRAVANCORE \u2014 THE FINAL MEMORY', { fontSize: '20px' }).setScrollFactor(0);
    this.hudObjective = createHUDText(this, 30, 54, 'Find the clues and arrange the symbols in the correct order.', { fontSize: '15px', fontStyle: 'normal', color: '#f1c86b' }).setScrollFactor(0);
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
