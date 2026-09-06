import Phaser from 'phaser';
import './styles/main.css';
import { gameConfig } from './game/config.js';

// Note: we deliberately do NOT hook window 'blur'/'focus' to manually sleep/wake
// the Phaser loop here. Phaser already pauses rendering/updates automatically via
// the Page Visibility API (document 'visibilitychange'), which is a more reliable
// signal than window focus/blur — blur can fire from ordinary in-page interactions
// (e.g. clicking a button) and manually sleeping the loop on those events would
// freeze scene timers (delayed calls, tweens) unpredictably during normal play.
const game = new Phaser.Game(gameConfig);

export default game;
