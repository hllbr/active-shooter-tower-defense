// Game constants removed as not needed
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
    // Wave start processing
    this.waveActive = true;
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    
    // 🆕 WEATHER SYSTEM: Automatically activate weather effects at wave start
    try {
      import('./market/WeatherEffectMarket').then(({ weatherEffectMarket }) => {
        weatherEffectMarket.onWaveStart(wave);
      });
    } catch (error) {
      console.warn('Weather system not available:', error);
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
    
    // Wave progress tracking
    
    if (kills >= required) {
      this.waveActive = false;
      
      // ✅ CRITICAL FIX: Trigger upgrade screen when wave completes
      // Show upgrade screen after wave 1 and every subsequent wave
      if (wave >= 1) {
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
