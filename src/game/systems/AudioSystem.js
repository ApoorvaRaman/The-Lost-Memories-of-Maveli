// Lightweight procedural audio using the Web Audio API directly.
// Avoids external audio file dependencies and never crashes the game if audio is blocked.
// Ambient tones and short effects are synthesized on demand.

class AudioSystemManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.ambientNodes = null;
    this.masterGain = null;
    this.unlocked = false;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 0.5;
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      // Audio unavailable — game must continue silently.
      this.ctx = null;
    }
  }

  // Must be called after a user gesture due to browser autoplay policy.
  unlock() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    this.unlocked = true;
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.5;
    }
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  _safe(fn) {
    if (!this.ctx || !this.unlocked) return;
    try { fn(); } catch (e) { /* never let audio crash the game */ }
  }

  playTone(freq, duration = 0.15, type = 'sine', gain = 0.25, delay = 0) {
    this._safe(() => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.value = 0;
      osc.connect(g);
      g.connect(this.masterGain);
      const t0 = this.ctx.currentTime + delay;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(gain, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
      osc.start(t0);
      osc.stop(t0 + duration + 0.05);
    });
  }

  playCollect() {
    this.playTone(660, 0.12, 'triangle', 0.3);
    this.playTone(880, 0.15, 'triangle', 0.25, 0.06);
  }

  playInteract() {
    this.playTone(440, 0.08, 'sine', 0.2);
  }

  playPuzzleSelect() {
    this.playTone(520, 0.1, 'square', 0.15);
  }

  playPuzzleWrong() {
    this.playTone(220, 0.2, 'sawtooth', 0.2);
    this.playTone(180, 0.25, 'sawtooth', 0.15, 0.08);
  }

  playPuzzleCorrect() {
    this.playTone(523, 0.15, 'triangle', 0.25);
    this.playTone(659, 0.15, 'triangle', 0.25, 0.1);
    this.playTone(784, 0.25, 'triangle', 0.3, 0.2);
  }

  playCollision() {
    this.playTone(140, 0.12, 'sawtooth', 0.25);
  }

  playLevelComplete() {
    [523, 659, 784, 1046].forEach((f, i) => this.playTone(f, 0.2, 'triangle', 0.28, i * 0.09));
  }

  playFinalComplete() {
    [392, 523, 659, 784, 1046].forEach((f, i) => this.playTone(f, 0.3, 'triangle', 0.3, i * 0.12));
  }

  playClick() {
    this.playTone(300, 0.06, 'square', 0.15);
  }

  // Very soft ambient pad — a couple of slow detuned oscillators.
  startAmbient(baseFreq = 110) {
    this._safe(() => {
      this.stopAmbient();
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.value = baseFreq;
      osc2.frequency.value = baseFreq * 1.5;
      g.gain.value = 0;
      osc1.connect(g);
      osc2.connect(g);
      g.connect(this.masterGain);
      const t0 = this.ctx.currentTime;
      g.gain.linearRampToValueAtTime(0.05, t0 + 1.5);
      osc1.start(t0);
      osc2.start(t0);
      this.ambientNodes = { osc1, osc2, gain: g };
    });
  }

  stopAmbient() {
    this._safe(() => {
      if (this.ambientNodes) {
        const { osc1, osc2, gain } = this.ambientNodes;
        const t0 = this.ctx.currentTime;
        gain.gain.linearRampToValueAtTime(0, t0 + 0.4);
        osc1.stop(t0 + 0.5);
        osc2.stop(t0 + 0.5);
        this.ambientNodes = null;
      }
    });
  }
}

export const AudioSystem = new AudioSystemManager();
