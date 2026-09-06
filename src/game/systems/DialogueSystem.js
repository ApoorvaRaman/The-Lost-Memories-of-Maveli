// Reusable parchment-style dialogue box. One instance per scene.
// Prevents double-advance from a single input event via an internal lock.

import { COLORS, GAME_WIDTH, GAME_HEIGHT, DEPTHS } from '../constants.js';

export class DialogueSystem {
  constructor(scene) {
    this.scene = scene;
    this.queue = [];
    this.active = false;
    this.advanceLocked = false;
    this.onCompleteCallback = null;
    this._buildUI();
  }

  _buildUI() {
    const scene = this.scene;
    const boxW = 980;
    const boxH = 170;
    const x = GAME_WIDTH / 2;
    const y = GAME_HEIGHT - boxH / 2 - 24;

    this.container = scene.add.container(x, y).setDepth(DEPTHS.dialogue).setScrollFactor(0);
    this.container.setVisible(false);

    const bg = scene.add.rectangle(0, 0, boxW, boxH, COLORS.parchment, 0.97)
      .setStrokeStyle(6, COLORS.brownDark);
    const bgInner = scene.add.rectangle(0, 0, boxW - 14, boxH - 14, COLORS.parchmentDark, 0)
      .setStrokeStyle(2, COLORS.gold);

    this.nameText = scene.add.text(-boxW / 2 + 30, -boxH / 2 + 18, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#5a3826'
    });

    this.bodyText = scene.add.text(-boxW / 2 + 30, -boxH / 2 + 56, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: '#2b1d10',
      wordWrap: { width: boxW - 60 },
      lineSpacing: 6
    });

    this.continueIndicator = scene.add.text(boxW / 2 - 40, boxH / 2 - 36, '\u25BC', {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: '#5a3826'
    });
    scene.tweens.add({
      targets: this.continueIndicator,
      y: this.continueIndicator.y + 6,
      yoyo: true,
      repeat: -1,
      duration: 500
    });

    this.container.add([bg, bgInner, this.nameText, this.bodyText, this.continueIndicator]);

    // Input handlers: keyboard (E / Space) and pointer (click)
    this.keys = scene.input.keyboard.addKeys({ interact: 'E', space: 'SPACE' });
    this.keys.interact.on('down', () => this._tryAdvance());
    this.keys.space.on('down', () => this._tryAdvance());
    this.pointerHandler = () => this._tryAdvance();
  }

  _tryAdvance() {
    if (!this.active || this.advanceLocked) return;
    this.advance();
  }

  /**
   * Show a sequence of { speaker, text } lines.
   * onComplete fires once all lines have been shown and dismissed.
   */
  show(lines, onComplete) {
    this.queue = Array.isArray(lines) ? [...lines] : [lines];
    this.onCompleteCallback = onComplete || null;
    this.active = true;
    this.container.setVisible(true);
    this.scene.input.on('pointerdown', this.pointerHandler);
    this._lockBriefly();
    this._renderNext();
  }

  _renderNext() {
    if (this.queue.length === 0) {
      this.close();
      return;
    }
    const line = this.queue.shift();
    this.nameText.setText(line.speaker || '');
    this.bodyText.setText(line.text || '');
    this._lockBriefly();
  }

  advance() {
    this._renderNext();
  }

  _lockBriefly() {
    this.advanceLocked = true;
    this.scene.time.delayedCall(180, () => { this.advanceLocked = false; });
  }

  close() {
    this.active = false;
    this.container.setVisible(false);
    this.scene.input.off('pointerdown', this.pointerHandler);
    const cb = this.onCompleteCallback;
    this.onCompleteCallback = null;
    if (cb) cb();
  }

  isActive() {
    return this.active;
  }

  destroy() {
    this.scene.input.off('pointerdown', this.pointerHandler);
    if (this.keys) {
      this.keys.interact.removeAllListeners();
      this.keys.space.removeAllListeners();
    }
    this.container.destroy();
  }
}
