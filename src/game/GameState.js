// A small, centralized state manager. Avoids scattering globals across scenes.
// Scenes read/write through this singleton instead of touching each other directly.

const DEFAULT_STATE = () => ({
  currentLevel: 'menu',
  flowersCollected: 0,
  flowersRequired: 5,
  collectedFlowerIds: [],
  memory1Unlocked: false,
  memory2Unlocked: false,
  memory3Unlocked: false,
  pookalamProgress: 0, // 0..5
  raceCompleted: false,
  puzzleSolved: false,
  gameCompleted: false,
  muted: false,
  cluesFound: {
    equality: false,
    prosperity: false,
    happiness: false
  }
});

class GameStateManager {
  constructor() {
    this.state = DEFAULT_STATE();
  }

  reset() {
    this.state = DEFAULT_STATE();
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    this.state[key] = value;
  }

  collectFlower(flowerId) {
    if (this.state.collectedFlowerIds.includes(flowerId)) return false; // no duplicates
    this.state.collectedFlowerIds.push(flowerId);
    this.state.flowersCollected += 1;
    this.state.pookalamProgress = this.state.flowersCollected;
    return true;
  }

  isFlowerCollected(flowerId) {
    return this.state.collectedFlowerIds.includes(flowerId);
  }

  markClueFound(clueKey) {
    if (this.state.cluesFound[clueKey] !== undefined) {
      this.state.cluesFound[clueKey] = true;
    }
  }

  allCluesFound() {
    const c = this.state.cluesFound;
    return c.equality && c.prosperity && c.happiness;
  }
}

// Singleton instance shared across the whole game.
export const GameState = new GameStateManager();
