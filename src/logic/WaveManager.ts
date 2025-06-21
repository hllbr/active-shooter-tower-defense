import { GAME_CONSTANTS } from '../utils/Constants';
export type WaveStartHandler = () => void;
export type WaveCompleteHandler = () => void;

export class WaveManager {
  private waveActive = false;
  private idleTimer: number | null = null;
  private onStart: WaveStartHandler;
  private onComplete: WaveCompleteHandler;

  constructor(start: WaveStartHandler, complete: WaveCompleteHandler) {
    this.onStart = start;
    this.onComplete = complete;
  }

  setHandlers(start: WaveStartHandler, complete: WaveCompleteHandler) {
    this.onStart = start;
    this.onComplete = complete;
  }

  startWave(wave: number) {
    if (this.waveActive) return;
    if (GAME_CONSTANTS.DEBUG_MODE) {
      console.log(`[WaveManager] Wave ${wave} started`);
    }
    this.waveActive = true;
    this.onStart();
  }

  checkComplete(
    wave: number,
    remainingEnemies: number,
    pendingSpawns: boolean,
    kills: number,
  ) {
    if (!this.waveActive) return;
    if (!pendingSpawns && remainingEnemies === 0) {
      if (GAME_CONSTANTS.DEBUG_MODE) {
        console.log(`[WaveManager] Wave ${wave} completed - ${kills} enemies defeated`);
      }
      this.waveActive = false;
      this.onComplete();
    }
  }
}

export const waveManager = new WaveManager(() => {}, () => {});
