import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    // Nothing to load from disk — all art is generated procedurally in PreloadScene.
    this.scene.start('PreloadScene');
  }
}
