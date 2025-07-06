import { create } from 'zustand';
import type { GameState } from '../gameTypes';
import { GAME_CONSTANTS } from '../../utils/constants';
import { energyManager } from '../../game-systems/EnergyManager';
import { waveManager } from '../../game-systems/WaveManager';
import { initialState } from './initialState';
import { createEnemySlice, EnemySlice } from './slices/enemySlice';
import { createTowerSlice, TowerSlice } from './slices/towerSlice';
import { createDiceSlice, DiceSlice } from './slices/diceSlice';
import { createMineSlice, MineSlice } from './slices/mineSlice';
import { createWaveSlice, WaveSlice } from './slices/waveSlice';
import { createEnergySlice, EnergySlice, addEnemyKillListener, removeEnemyKillListener } from './slices/energySlice';
import { createEconomySlice, EconomySlice } from './slices/economySlice';
import { createUpgradeSlice, UpgradeSlice } from './slices/upgradeSlice';

export type Store = GameState &
  DiceSlice &
  MineSlice &
  WaveSlice &
  EnergySlice &
  EnemySlice &
  TowerSlice &
  EconomySlice &
  UpgradeSlice & {
    resetGame: () => void;
    setStarted: (started: boolean) => void;
    setRefreshing: (refreshing: boolean) => void;
  };

export const useGameStore = create<Store>((set, get): Store => ({
  ...initialState,
  ...createTowerSlice(set, get),
  ...createEnemySlice(set, get),
  ...createDiceSlice(set, get),
  ...createMineSlice(set, get),
  ...createWaveSlice(set, get),
  ...createEnergySlice(set, get),
  ...createEconomySlice(set, get),
  ...createUpgradeSlice(set, get),

  resetGame: () => set(() => ({ ...initialState, gameStartTime: Date.now() })),

  setStarted: (started) => set(() => ({ isStarted: started })),

  setRefreshing: (refreshing) => set(() => ({
    isRefreshing: refreshing,
    isPreparing: false,
    isPaused: false,
  })),
}));

try {
  const initialEnergy = initialState.energy || GAME_CONSTANTS.BASE_ENERGY || 100;
  const maxEnergy = initialState.maxEnergy || GAME_CONSTANTS.ENERGY_SYSTEM?.MAX_ENERGY_BASE || 100;

  energyManager.init(
    initialEnergy,
    (e, w) => {
      if (isNaN(e) || e < 0) {
        console.warn('⚠️ Energy manager returned invalid value, resetting:', e);
        e = GAME_CONSTANTS.BASE_ENERGY || 100;
      }
      useGameStore.setState({ energy: e, energyWarning: w ?? null });
    },
    maxEnergy
  );

  console.log('✅ Energy Manager initialized successfully');
} catch (error) {
  console.error('❌ Energy Manager initialization failed:', error);
  energyManager.reset();
}

waveManager.on('complete', () => {
  const { lostTowerThisWave, waveStartTime } = useGameStore.getState();
  let bonus = GAME_CONSTANTS.ENERGY_REGEN_WAVE;
  if (!lostTowerThisWave) bonus += 5;
  if (performance.now() - waveStartTime < 60000) bonus += 5;
  energyManager.add(bonus, 'waveComplete');
});

export { addEnemyKillListener, removeEnemyKillListener };
