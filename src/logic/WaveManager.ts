import { GAME_CONSTANTS } from '../utils/constants';
import { useGameStore } from '../models/store';

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
    required: number,
  ) {
    const state = useGameStore.getState();
    
    // ✅ CRITICAL FIX: Stop wave management if game is over
    if (state.isGameOver) {
      this.waveActive = false;
      if (this.idleTimer) {
        clearTimeout(this.idleTimer);
        this.idleTimer = null;
      }
      return;
    }
    
    if (!this.waveActive) return;
    
    // DEBUG: Always log progress for Wave 1
    if (wave === 1 || GAME_CONSTANTS.DEBUG_MODE) {
      console.log(`🌊 Wave ${wave}: ${kills}/${required} enemies killed, ${remainingEnemies} remaining, pending: ${pendingSpawns}`);
    }
    
    if (kills >= required) {
      console.log(`✅ Wave ${wave} COMPLETED! ${kills}/${required} enemies defeated`);
      this.waveActive = false;
      
      // ✅ CRITICAL FIX: Trigger upgrade screen when wave completes
      // Show upgrade screen after wave 1 and every subsequent wave
      if (wave >= 1) {
        console.log(`🔄 Opening upgrade screen for Wave ${wave} completion`);
        useGameStore.getState().setRefreshing(true);
      }
      
      this.onComplete();
      this.completeListeners.forEach(l => l());
    }
  }

  isWaveActive() {
    return this.waveActive;
  }
}

export const waveManager = new WaveManager(() => {}, () => {});
