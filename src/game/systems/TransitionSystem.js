// Reusable fade + title-card transitions between scenes.
// Kept short (0.5 - 1.5s) so it never slows down the overall pacing of the game.

import { COLORS, GAME_WIDTH, GAME_HEIGHT, DEPTHS, TRANSITION_DURATION } from '../constants.js';

export function fadeOutIn(scene, duration = TRANSITION_DURATION, onMid, onComplete) {
  const rect = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.forestDark, 0)
    .setDepth(DEPTHS.transition)
    .setScrollFactor(0);

  scene.tweens.add({
    targets: rect,
    alpha: 1,
    duration: duration / 2,
    onComplete: () => {
      if (onMid) onMid();
      scene.tweens.add({
        targets: rect,
        alpha: 0,
        duration: duration / 2,
        onComplete: () => {
          rect.destroy();
          if (onComplete) onComplete();
        }
      });
    }
  });
}

/**
 * Shows a short location title card ("LEVEL 1 — MALABAR / THE LAND OF THE PEOPLE")
 * over a fade, then calls onComplete.
 */
export function showLevelTitleCard(scene, headline, subline, onComplete) {
  const overlay = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.forestDark, 0)
    .setDepth(DEPTHS.transition)
    .setScrollFactor(0);

  const headlineText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 24, headline, {
    fontFamily: 'Georgia, serif',
    fontSize: '42px',
    fontStyle: 'bold',
    color: '#f1c86b'
  }).setOrigin(0.5).setAlpha(0).setDepth(DEPTHS.transition + 1).setScrollFactor(0);

  const sublineText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 28, subline || '', {
    fontFamily: 'Georgia, serif',
    fontSize: '22px',
    color: '#f1e4bf'
  }).setOrigin(0.5).setAlpha(0).setDepth(DEPTHS.transition + 1).setScrollFactor(0);

  scene.tweens.add({
    targets: overlay,
    alpha: 1,
    duration: 400,
    onComplete: () => {
      scene.tweens.add({ targets: [headlineText, sublineText], alpha: 1, duration: 300 });
      scene.time.delayedCall(1000, () => {
        scene.tweens.add({
          targets: [overlay, headlineText, sublineText],
          alpha: 0,
          duration: 400,
          onComplete: () => {
            overlay.destroy();
            headlineText.destroy();
            sublineText.destroy();
            if (onComplete) onComplete();
          }
        });
      });
    }
  });
}
