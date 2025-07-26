import { create } from 'zustand';
import type { GameState } from '../gameTypes';
import { GAME_CONSTANTS } from '../../utils/constants';
import { energyManager } from '../../game-systems/EnergyManager';
import { waveManager } from '../../game-systems/WaveManager';
import { Logger } from '../../utils/Logger';
import { GamePauseManager } from '../../game-systems/GamePauseManager';
import { initialState } from './initialState';
import { createEnemySlice, type EnemySlice } from './slices/enemySlice';
import { createTowerSlice, type TowerSlice } from './slices/towerSlice';
import { createDiceSlice, type DiceSlice } from './slices/diceSlice';
import { createMineSlice, type MineSlice } from './slices/mineSlice';
import { createWaveSlice, type WaveSlice } from './slices/waveSlice';
import { createEnergySlice, type EnergySlice, addEnemyKillListener, removeEnemyKillListener } from './slices/energySlice';
import { createEconomySlice, type EconomySlice } from './slices/economySlice';
import { createResourceSlice, type ResourceSlice } from './slices/resourceSlice';
import { createUpgradeSlice, type UpgradeSlice } from './slices/upgradeSlice';
import { createEnvironmentSlice, type EnvironmentSlice } from './slices/environmentSlice';
import { createMissionSlice, type MissionSlice } from './slices/missionSlice';

export type Store = GameState &
  DiceSlice &
  MineSlice &
  WaveSlice &
  EnergySlice &
  EnemySlice &
  TowerSlice &
  EconomySlice &
  ResourceSlice &
  UpgradeSlice &
  EnvironmentSlice &
  MissionSlice & {
    resetGame: () => void;
    setStarted: (started: boolean) => void;
    setRefreshing: (refreshing: boolean) => void;
    /**
     * Set the global pause state (UI-based pause, e.g., upgrade screen)
     */
    setPaused: (paused: boolean) => void;
    /**
     * Set the first tower placed state (for wave spawn gating)
     */
    setFirstTowerPlaced: (placed: boolean) => void;
    setGameReadyForWaves: (ready: boolean) => void;
  };

export const useGameStore = create<Store>((set, get, api) => ({
  ...initialState,
  ...createEnemySlice(set, get, api),
  ...createTowerSlice(set, get, api),
  ...createDiceSlice(set, get, api),
  ...createMineSlice(set, get, api),
  ...createWaveSlice(set, get, api),
  ...createEnergySlice(set, get, api),
  ...createEconomySlice(set, get, api),
  ...createResourceSlice(set, get, api),
  ...createUpgradeSlice(set, get, api),
  ...createEnvironmentSlice(set, get, api),
  ...createMissionSlice(set, get, api),

  resetGame: () => {
    set(initialState);
    energyManager.reset();
    GamePauseManager.reset();
  },

  setStarted: (started: boolean) => set({ isStarted: started }),
  setRefreshing: (refreshing: boolean) => set({ isRefreshing: refreshing }),

  /**
   * Set the global pause state (UI-based pause, e.g., upgrade screen)
   */
  setPaused: (paused: boolean) => {
    set({ isPaused: paused });
    // Use GamePauseManager to handle all pause-related actions
    if (paused) {
      GamePauseManager.pauseGame();
    } else {
      GamePauseManager.resumeGame();
    }
  },

  /**
   * Set the first tower placed state (for wave spawn gating)
   */
  setFirstTowerPlaced: (placed: boolean) => set({ isFirstTowerPlaced: placed }),
  setGameReadyForWaves: (ready: boolean) => set({ gameReadyForWaves: ready }),
}));


// Performance-optimized energy manager initialization
try {
  const initialEnergy = initialState.energy || GAME_CONSTANTS.BASE_ENERGY || 100;
  const maxEnergy = initialState.maxEnergy || GAME_CONSTANTS.ENERGY_SYSTEM?.MAX_ENERGY_BASE || 100;

  energyManager.init(
    initialEnergy,
    (e, w) => {
      if (isNaN(e) || e < 0) {
        Logger.warn('⚠️ Energy manager returned invalid value, resetting:', e);
        e = GAME_CONSTANTS.BASE_ENERGY || 100;
      }
      useGameStore.setState({ energy: e, energyWarning: w ?? null });
    },
    maxEnergy
  );

  // Set up cooldown state listener for performance optimization
  energyManager.onCooldownChange((cooldownState) => {
    // Only update if the cooldown state actually changed
    const currentState = useGameStore.getState();
    if (currentState.energyCooldownState?.isActive !== cooldownState.isActive ||
        currentState.energyCooldownState?.remainingTime !== cooldownState.remainingTime) {
      useGameStore.setState({ energyCooldownState: cooldownState });
    }
  });

} catch (error) {
  Logger.error('❌ Energy Manager initialization failed:', error);
  energyManager.reset();
}

// Performance-optimized wave completion handler
waveManager.on('complete', () => {
  const { lostTowerThisWave, waveStartTime } = useGameStore.getState();
  let bonus = GAME_CONSTANTS.ENERGY_REGEN_WAVE;
  
  if (!lostTowerThisWave) bonus += 5;
  if (performance.now() - waveStartTime < 60000) bonus += 5;
  
  energyManager.add(bonus, 'waveComplete');
});

// Performance optimization: Cleanup old energy history periodically
setInterval(() => {
  energyManager.cleanup();
}, 30000); // Clean up every 30 seconds

export { addEnemyKillListener, removeEnemyKillListener };
