import type { StateCreator } from 'zustand';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { WavePerformanceTracker, ProceduralWaveGenerator, InWaveScalingManager } from '../../../config/waveConfig';
import type { Store } from '../index';
import type { WaveStatus } from '../../gameTypes';
import { gameAnalytics } from '../../../game-systems/analytics/GameAnalyticsManager';

export interface WaveSlice {
  currentWave: number;
  enemiesKilled: number;
  enemiesRequired: number;
  waveStatus: WaveStatus;
  waveStartTime: number;
  lostTowerThisWave: boolean;
  prepRemaining: number;
  showWavePreview: boolean;
  wavePreviewCountdown: number;
  nextWave: () => void;
  startPreparation: () => void;
  startWave: () => void;
  completeWave: () => void;
  tickPreparation: (delta: number) => void;
  showWavePreviewOverlay: () => void;
  hideWavePreviewOverlay: () => void;
  startWavePreviewCountdown: () => void;
  speedUpPreparation: (amount: number) => void;
  isPreparing: boolean;
}

export const createWaveSlice: StateCreator<Store, [], [], WaveSlice> = (set, _get, _api) => ({
  currentWave: 1,
  enemiesKilled: 0,
  enemiesRequired: 10,
  waveStatus: 'idle' as WaveStatus,
  waveStartTime: 0,
  lostTowerThisWave: false,
  prepRemaining: GAME_CONSTANTS.PREP_TIME,
  showWavePreview: false,
  wavePreviewCountdown: 5,
  isPreparing: false,

  nextWave: () => set((state: Store) => {
    const newWave = state.currentWave + 1;
    const playerPerformance = WavePerformanceTracker.getPlayerPerformance();
    
    // ✅ NEW: Generate dynamic wave configuration
    const waveConfig = ProceduralWaveGenerator.generateWaveConfig(newWave, playerPerformance);
    const newEnemiesRequired = GAME_CONSTANTS.getWaveEnemiesRequired(newWave);
    const waveIncome = Math.floor(50 + (state.currentWave * 10));
    
    // ✅ NEW: Calculate adaptive preparation time
    const prepTime = Math.max(
      waveConfig.adaptiveTiming.minPrepTime,
      Math.min(
        waveConfig.adaptiveTiming.maxPrepTime,
        waveConfig.adaptiveTiming.basePrepTime * waveConfig.adaptiveTiming.performanceMultiplier
      )
    );
    
    return {
      currentWave: newWave,
      enemiesKilled: 0,
      enemiesRequired: newEnemiesRequired,
      gold: state.gold + waveIncome,
      lostTowerThisWave: false,
      waveStartTime: performance.now(),
      currentWaveModifier: waveConfig.modifier || undefined,
      towerSlots: state.towerSlots, // Simplified for now
      waveStatus: 'idle' as WaveStatus,
      prepRemaining: prepTime,
      showWavePreview: false,
      wavePreviewCountdown: 5,
      isPreparing: false,
    };
  }),

  startPreparation: () => set(() => ({
    waveStatus: 'in_progress' as WaveStatus,
    prepRemaining: GAME_CONSTANTS.PREP_TIME,
    isPreparing: true,
  })),

  startWave: () => set((state: Store) => {
    if (state.towers.length === 0) {
      // Don't start the wave until the player has at least one tower
      return {};
    }

    // Track analytics event
    gameAnalytics.trackEvent('wave_start', {
      waveNumber: state.currentWave,
      towersCount: state.towers.length,
      gold: state.gold,
      energy: state.energy
    });

    // ✅ NEW: Start in-wave scaling tracking
    InWaveScalingManager.startWave(state.currentWave);
    
    // ✅ NEW: Check for fire hazard
    setTimeout(() => {
      import('../../../game-systems/FireHazardManager').then(({ FireHazardManager }) => {
        if (FireHazardManager.shouldTriggerFireHazard(state.currentWave)) {
          const burningTowerId = FireHazardManager.startFireHazard(state.towerSlots);
          if (burningTowerId) {
            // Fire hazard started - no additional action needed
          }
        }
      });
    }, 2000); // Check for fire hazard 2 seconds after wave starts
    
    setTimeout(() => {
      import('../../../game-systems/EnemySpawner').then(({ startEnemyWave }) => {
        startEnemyWave(state.currentWave);
      });
      // import('../../../game-systems/market/WeatherEffectMarket').then(({ weatherEffectMarket }) => {
      //   weatherEffectMarket.autoActivateEffects(state.currentWave);
      // });
    }, 100);
    
    return {
      waveStatus: 'in_progress' as WaveStatus,
      waveStartTime: performance.now(),
      lostTowerThisWave: false,
      prepRemaining: GAME_CONSTANTS.PREP_TIME,
      showWavePreview: false,
      isPreparing: true,
    };
  }),

  completeWave: () => set((state: Store) => {
    // ✅ NEW: Record wave completion for performance tracking
    const completionTime = performance.now() - state.waveStartTime;
    WavePerformanceTracker.recordWaveCompletion(state.currentWave, completionTime);
    
    // Track analytics event
    gameAnalytics.trackEvent('wave_complete', {
      waveNumber: state.currentWave,
      completionTime,
      perfectWave: !state.lostTowerThisWave,
      enemiesKilled: state.enemiesKilled,
      towersRemaining: state.towers.length,
      goldEarned: state.gold - (state.gold - 50 - (state.currentWave * 10)) // Estimate gold earned
    });
    
    // ✅ NEW: Reset in-wave scaling
    InWaveScalingManager.reset();
    
    return {
      waveStatus: 'completed' as WaveStatus,
      isPreparing: false,
    };
  }),

  tickPreparation: (delta: number) => set((state: Store) => {
    if (state.waveStatus !== 'in_progress') return {};
    
    const newPrepRemaining = Math.max(0, state.prepRemaining - delta);
    
    // Show wave preview when preparation time is running low
    if (newPrepRemaining <= 5000 && !state.showWavePreview) {
      return {
        prepRemaining: newPrepRemaining,
        showWavePreview: true,
      };
    }
    
    return {
      prepRemaining: newPrepRemaining,
    };
  }),

  // ✅ NEW: Wave preview management
  showWavePreviewOverlay: () => set(() => ({
    showWavePreview: true,
    wavePreviewCountdown: 5,
  })),

  hideWavePreviewOverlay: () => set(() => ({
    showWavePreview: false,
  })),

  startWavePreviewCountdown: () => set((state: Store) => {
    if (!state.showWavePreview) return {};
    
    const newCountdown = Math.max(0, state.wavePreviewCountdown - 1);
    
    if (newCountdown === 0) {
      // Countdown complete, start the wave
      setTimeout(() => {
        const { startWave, hideWavePreviewOverlay } = _get();
        hideWavePreviewOverlay();
        startWave();
      }, 100);
    }
    
    return {
      wavePreviewCountdown: newCountdown,
    };
  }),

  speedUpPreparation: (amount: number) => set((state: Store) => ({
    prepRemaining: Math.max(0, state.prepRemaining - amount)
  })),
});
