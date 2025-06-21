import { GAME_CONSTANTS } from '../utils/Constants';
export type WaveStartHandler = () => void;
export type WaveCompleteHandler = () => void;

export class WaveManager {
  private waveActive = false;
  private idleTimer: number | null = null;
  private onStart: WaveStartHandler;
  private onComplete: WaveCompleteHandler;
  private startListeners: WaveStartHandler[] = [];
  private completeListeners: WaveCompleteHandler[] = [];

  constructor(start: WaveStartHandler, complete: WaveCompleteHandler) {
    this.onStart = start;
    this.onComplete = complete;
  }

  setHandlers(start: WaveStartHandler, complete: WaveCompleteHandler) {
    this.onStart = start;
    this.onComplete = complete;
  }

  on(event: 'start' | 'complete', fn: () => void) {
    if (event === 'start') this.startListeners.push(fn);
    else this.completeListeners.push(fn);
  }

  startWave(wave: number) {
    if (this.waveActive) return;
    if (GAME_CONSTANTS.DEBUG_MODE) {
      console.log(`[WaveManager] Wave ${wave} started`);
    }
    this.waveActive = true;
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    this.onStart();
    this.startListeners.forEach(l => l());
  }

  scheduleAutoStart(wave: number, delay: number) {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = window.setTimeout(() => this.startWave(wave), delay);
  }

  cancelAutoStart() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
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
      this.completeListeners.forEach(l => l());
    }
  }

  isWaveActive() {
    return this.waveActive;
  }
}

export const waveManager = new WaveManager(() => {}, () => {});
