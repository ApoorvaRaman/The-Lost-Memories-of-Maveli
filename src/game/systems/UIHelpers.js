// Small shared helpers so buttons/panels look consistent across every screen
// without duplicating styling code in each scene.

import { COLORS, DEPTHS } from '../constants.js';
import { AudioSystem } from './AudioSystem.js';

/**
 * Creates a clickable pixel-styled button with hover/pressed states.
 * Returns a container so callers can position/destroy it as one unit.
 */
export function createButton(scene, x, y, label, onClick, options = {}) {
  const width = options.width || 300;
  const height = options.height || 56;

  const container = scene.add.container(x, y).setDepth(options.depth ?? DEPTHS.hud);

  const bg = scene.add.rectangle(0, 0, width, height, COLORS.panelGreen, 1)
    .setStrokeStyle(3, COLORS.gold)
    .setInteractive({ useHandCursor: true });

  const text = scene.add.text(0, 0, label, {
    fontFamily: 'Georgia, serif',
    fontSize: options.fontSize || '22px',
    fontStyle: 'bold',
    color: '#f1e4bf'
  }).setOrigin(0.5);

  container.add([bg, text]);

  bg.on('pointerover', () => {
    bg.setFillStyle(COLORS.leafGreen);
    bg.setStrokeStyle(3, COLORS.goldBright);
  });
  bg.on('pointerout', () => {
    bg.setFillStyle(COLORS.panelGreen);
    bg.setStrokeStyle(3, COLORS.gold);
  });
  bg.on('pointerdown', () => {
    container.setScale(0.96);
  });
  bg.on('pointerup', () => {
    container.setScale(1);
    AudioSystem.unlock();
    AudioSystem.playClick();
    if (onClick) onClick();
  });

  // Keyboard-accessible focus ring toggle isn't native to Phaser DOM,
  // but we expose a simple programmatic activate() for accessibility hooks.
  container.activate = () => {
    AudioSystem.unlock();
    AudioSystem.playClick();
    if (onClick) onClick();
  };

  return container;
}

export function createPanel(scene, x, y, width, height, options = {}) {
  const container = scene.add.container(x, y).setDepth(options.depth ?? DEPTHS.hud);
  const bg = scene.add.rectangle(0, 0, width, height, options.fill ?? COLORS.panelGreen, options.alpha ?? 0.92)
    .setStrokeStyle(options.borderWidth ?? 4, options.border ?? COLORS.gold);
  container.add(bg);
  container.bg = bg;
  return container;
}

export function createHUDText(scene, x, y, text, options = {}) {
  return scene.add.text(x, y, text, {
    fontFamily: 'Georgia, serif',
    fontSize: options.fontSize || '20px',
    fontStyle: options.fontStyle || 'bold',
    color: options.color || '#f1e4bf',
    ...(options.stroke ? { stroke: '#0a2116', strokeThickness: 3 } : {})
  }).setDepth(DEPTHS.hud).setScrollFactor(0);
}
