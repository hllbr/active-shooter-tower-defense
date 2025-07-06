import { GAME_CONSTANTS } from '../../../utils/constants';
import { updateWaveTiles } from '../../../game-systems/TowerPlacementManager';
import { waveRules } from '../../../config/waveRules';
import type { StateCreator } from 'zustand';
import type { Store } from '../index';

export interface WaveSlice {
  nextWave: () => void;
  startPreparation: () => void;
  tickPreparation: (delta: number) => void;
  pausePreparation: () => void;
  resumePreparation: () => void;
  speedUpPreparation: (amount: number) => void;
  startWave: () => void;
}

export const createWaveSlice: StateCreator<Store, [], [], WaveSlice> = (set, _get, _api) => ({
  nextWave: () => set((state: Store) => {
    const newWave = state.currentWave + 1;
    const newEnemiesRequired = GAME_CONSTANTS.getWaveEnemiesRequired(newWave);
    const waveIncome = Math.floor(50 + (state.currentWave * 10));
    console.log(`📈 Wave ${state.currentWave} → ${newWave}: Income +${waveIncome} gold`);
    return {
      currentWave: newWave,
      enemiesKilled: 0,
      enemiesRequired: newEnemiesRequired,
      gold: state.gold + waveIncome,
      lostTowerThisWave: false,
      waveStartTime: performance.now(),
      currentWaveModifier: waveRules[newWave] || null,
      towerSlots: updateWaveTiles(newWave, state.towerSlots),
    };
  }),

  startPreparation: () => set(() => ({
    isPreparing: true,
    isPaused: false,
    prepRemaining: GAME_CONSTANTS.PREP_TIME,
  })),

  tickPreparation: (delta) => set((state: Store) => {
    if (!state.isPreparing || state.isPaused) return {};
    const newRemaining = Math.max(0, state.prepRemaining - delta);
    return { prepRemaining: newRemaining, isPreparing: newRemaining > 0 };
  }),

  pausePreparation: () => set((state: Store) =>
    state.isPreparing ? { isPaused: true } : {}
  ),

  resumePreparation: () => set((state: Store) =>
    state.isPreparing ? { isPaused: false } : {}
  ),

  speedUpPreparation: (amount) => set((state: Store) => ({
    prepRemaining: Math.max(0, state.prepRemaining - amount)
  })),

  startWave: () => set((state: Store) => {
    console.log(`🚀 Starting Wave ${state.currentWave}!`);
    setTimeout(() => {
      import('../../../game-systems/EnemySpawner').then(({ startEnemyWave }) => {
        startEnemyWave(state.currentWave);
      });
    }, 100);
    return {
      isPreparing: false,
      isPaused: false,
      isStarted: true,
      waveStartTime: performance.now(),
      lostTowerThisWave: false,
      prepRemaining: GAME_CONSTANTS.PREP_TIME,
    };
  }),
});
