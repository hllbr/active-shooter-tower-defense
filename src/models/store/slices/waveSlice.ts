import { GAME_CONSTANTS } from '../../../utils/constants';
import { updateWaveTiles } from '../../../game-systems/TowerPlacementManager';
import { ProceduralWaveGenerator, WavePerformanceTracker, InWaveScalingManager } from '../../../config/waveConfig';
import type { StateCreator } from 'zustand';
import type { Store } from '../index';
import type { WaveStatus } from '../../gameTypes';

export interface WaveSlice {
  nextWave: () => void;
  startPreparation: () => void;
  tickPreparation: (delta: number) => void;
  pausePreparation: () => void;
  resumePreparation: () => void;
  speedUpPreparation: (amount: number) => void;
  startWave: () => void;
  completeWave: () => void;
}

export const createWaveSlice: StateCreator<Store, [], [], WaveSlice> = (set, _get, _api) => ({
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
      towerSlots: updateWaveTiles(newWave, state.towerSlots),
      waveStatus: 'idle' as WaveStatus,
      prepRemaining: prepTime,
    };
  }),

  startPreparation: () => set(() => ({
    waveStatus: 'in_progress' as WaveStatus,
    prepRemaining: GAME_CONSTANTS.PREP_TIME,
  })),

  tickPreparation: (delta) => set((state: Store) => {
    if (state.waveStatus !== 'in_progress') return {};
    const newRemaining = Math.max(0, state.prepRemaining - delta);
    return { 
      prepRemaining: newRemaining, 
      waveStatus: newRemaining > 0 ? 'in_progress' : 'completed' as WaveStatus 
    };
  }),

  pausePreparation: () => set((state: Store) =>
    state.waveStatus === 'in_progress' ? { waveStatus: 'idle' as WaveStatus } : {}
  ),

  resumePreparation: () => set((state: Store) =>
    state.waveStatus === 'idle' ? { waveStatus: 'in_progress' as WaveStatus } : {}
  ),

  speedUpPreparation: (amount) => set((state: Store) => ({
    prepRemaining: Math.max(0, state.prepRemaining - amount)
  })),

  startWave: () => set((state: Store) => {
    // ✅ NEW: Start in-wave scaling tracking
    InWaveScalingManager.startWave(state.currentWave);
    
    setTimeout(() => {
      import('../../../game-systems/EnemySpawner').then(({ startEnemyWave }) => {
        startEnemyWave(state.currentWave);
      });
      import('../../../game-systems/market/WeatherEffectMarket').then(({ weatherEffectMarket }) => {
        weatherEffectMarket.autoActivateEffects(state.currentWave);
      });
    }, 100);
    
    return {
      waveStatus: 'in_progress' as WaveStatus,
      waveStartTime: performance.now(),
      lostTowerThisWave: false,
      prepRemaining: GAME_CONSTANTS.PREP_TIME,
    };
  }),

  completeWave: () => set((state: Store) => {
    // ✅ NEW: Record wave completion for performance tracking
    const completionTime = performance.now() - state.waveStartTime;
    WavePerformanceTracker.recordWaveCompletion(state.currentWave, completionTime);
    
    // ✅ NEW: Reset in-wave scaling
    InWaveScalingManager.reset();
    
    return {
      waveStatus: 'completed' as WaveStatus,
    };
  }),
});
