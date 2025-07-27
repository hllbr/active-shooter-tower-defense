import { useGameStore } from '../models/store';
import { startBackgroundMusic, stopBackgroundMusic } from '../utils/sound';
import { waveManager } from './WaveManager';
import { EnemyMovement } from './enemy/EnemyMovement';
import { EnhancedEnemyMovement } from './enemy/EnhancedEnemyMovement';
import { WaveSpawnManager } from './enemy/WaveSpawnManager';
import { DynamicGameStartManager } from './DynamicGameStartManager';
import { GAME_CONSTANTS } from '../utils/constants';
import { missionManager } from './MissionManager';
import { gameAnalytics } from './analytics/GameAnalyticsManager';
import type { Enemy, TowerClass } from '../models/gameTypes';

/**
 * GameFlowManager - Handles core game flow and initialization
 * Follows SOLID principles for maintainable and extensible code
 */
export class GameFlowManager {
  private static instance: GameFlowManager;
  private isInitialized = false;
  private soundStarted = false;

  private constructor() {}

  static getInstance(): GameFlowManager {
    if (!GameFlowManager.instance) {
      GameFlowManager.instance = new GameFlowManager();
    }
    return GameFlowManager.instance;
  }

           /**
          * Initialize game flow systems
          */
         initialize(): void {
           if (this.isInitialized) return;
           
           // Initialize core systems
           this.initializeSoundSystem();
           this.initializeEnemyMovement();
           this.initializeWaveSystem();
           this.initializeMissionSystem();
           
           this.isInitialized = true;
         }

  /**
   * Start game with proper initialization sequence
   */
  startGame(): void {
    const state = useGameStore.getState();
    
    // Start analytics session
    gameAnalytics.startSession();
    
    // Ensure sound is started immediately
    this.ensureSoundStarted();
    
    // Initialize dynamic game start if needed
    if (!state.isFirstTowerPlaced) {
      DynamicGameStartManager.initializeDynamicGameStart();
    }
    
    // Start wave system
    this.startWaveSystem();
  }

  /**
   * Ensure enemies move immediately after spawning
   */
  private initializeEnemyMovement(): void {
    // Initialize enhanced enemy movement system
    EnhancedEnemyMovement.initialize();
    
    // Force enemy movement update on game start
    const originalUpdateEnemyMovement = EnhancedEnemyMovement.updateEnemyMovement;
    
    // Override to ensure immediate movement
    EnhancedEnemyMovement.updateEnemyMovement = () => {
      const state = useGameStore.getState();
      
      // Ensure enemies always have movement targets
      if (state.enemies.length > 0 && state.isStarted && !state.isPaused) {
        // Force pathfinding update for all enemies
        state.enemies.forEach(enemy => {
          if (enemy.position && !enemy.frozenUntil) {
            // Ensure enemy has a valid target
            this.ensureEnemyHasTarget(enemy);
          }
        });
      }
      
      // Call original method
      originalUpdateEnemyMovement();
    };
  }

  /**
   * Ensure enemy has a valid movement target
   */
  /**
   * Ensure enemy has a valid movement target
   */
  private ensureEnemyHasTarget(_enemy: Enemy): void {
    // Enemies use dynamic targeting, no need to store targets
    // This method is kept for compatibility but doesn't need to do anything
  }

           /**
          * Initialize wave system with proper enemy movement
          */
         private initializeWaveSystem(): void {
           // Override wave start to ensure immediate enemy movement
           const originalStartWave = waveManager.startWave;
           
           waveManager.startWave = (wave: number) => {
             // Call original method
             originalStartWave.call(waveManager, wave);
             
             // Force enemy movement update after wave start
             setTimeout(() => {
               EnemyMovement.updateEnemyMovement();
             }, 100);
           };
         }

         /**
          * Initialize mission system with progress tracking
          */
         private initializeMissionSystem(): void {
           // Initialize mission manager
           missionManager.initialize();
           
           // Set up mission progress tracking
           this.setupMissionProgressTracking();
         }

         /**
          * Set up mission progress tracking for game events
          */
         private setupMissionProgressTracking(): void {
           const state = useGameStore.getState();
           
           // Track wave completion
           const originalNextWave = state.nextWave;
           state.nextWave = () => {
             const currentWave = state.currentWave;
             originalNextWave();
             
             // Update mission progress for wave completion
             missionManager.updateMissionProgress('wave_completed', { waveNumber: currentWave });
           };
           
           // ✅ FIXED: Track enemy kills - the addEnemyKill function now exists and handles mission tracking internally
           // No need to override it since it's already integrated in the enemy slice
           
           // Track tower building
           const originalBuildTower = state.buildTower;
           state.buildTower = (slotIdx: number, free?: boolean, towerType?: 'attack' | 'economy', towerClass?: TowerClass) => {
             originalBuildTower(slotIdx, free, towerType, towerClass);
             
             // Update mission progress for tower building
             missionManager.updateMissionProgress('tower_built');
           };
           
           // Track gold earning
           const originalAddGold = state.addGold;
           state.addGold = (amount: number) => {
             originalAddGold(amount);
             
             // Update mission progress for gold earning
             missionManager.updateMissionProgress('gold_earned', { amount });
           };
           
           // Track upgrade purchases
           const originalPurchaseUpgrade = state.purchaseIndividualFireUpgrade;
           state.purchaseIndividualFireUpgrade = (upgradeId: string, cost: number, maxLevel: number) => {
             const result = originalPurchaseUpgrade(upgradeId, cost, maxLevel);
             
             if (result) {
               // Update mission progress for upgrade purchase
               missionManager.updateMissionProgress('upgrade_purchased');
             }
             
             return result;
           };
         }

  /**
   * Start wave system with proper initialization
   */
  private startWaveSystem(): void {
    const state = useGameStore.getState();
    
    // Start wave spawning
    WaveSpawnManager.startEnemyWave(state.currentWave);
    
    // Force immediate enemy movement update
    setTimeout(() => {
      EnemyMovement.updateEnemyMovement();
    }, 50);
  }

  /**
   * Initialize sound system with immediate startup
   */
  private initializeSoundSystem(): void {
    // Sound will be started by the game loop when the game starts
    // This ensures proper timing and prevents conflicts
  }

  /**
   * Ensure sound is started immediately
   */
  private ensureSoundStarted(): void {
    if (this.soundStarted) return;
    
    try {
      startBackgroundMusic();
      this.soundStarted = true;
              } catch {
      // Failed to start background music
    }
  }

  /**
   * Stop game flow and cleanup
   */
  stopGame(): void {
    // End analytics session
    gameAnalytics.endSession();
    
    stopBackgroundMusic();
    this.soundStarted = false;
    
    // Stop wave spawning
    WaveSpawnManager.stopEnemyWave();
    WaveSpawnManager.stopContinuousSpawning();
  }

  /**
   * Reset game flow state
   */
  reset(): void {
    this.stopGame();
    this.isInitialized = false;
  }

  /**
   * Get build UI state for tower slots
   */
  getBuildUIState(slotIdx: number): {
    canBuild: boolean;
    isDisabled: boolean;
    tooltip: string;
    reason: string;
  } {
    const state = useGameStore.getState();
    const slot = state.towerSlots[slotIdx];
    
    if (!slot) {
      return {
        canBuild: false,
        isDisabled: true,
        tooltip: 'Invalid slot',
        reason: 'invalid'
      };
    }

    // Check if slot is locked
    if (!slot.unlocked) {
      const unlockCost = GAME_CONSTANTS.TOWER_SLOT_UNLOCK_GOLD[slotIdx] ?? 2400;
      const canUnlock = state.gold >= unlockCost && 
                       state.energy >= GAME_CONSTANTS.ENERGY_COSTS.buildTower;
      
      return {
        canBuild: false,
        isDisabled: !canUnlock,
        tooltip: canUnlock 
          ? `Unlock for ${unlockCost} gold` 
          : `Not enough gold (${unlockCost} required)`,
        reason: canUnlock ? 'locked' : 'insufficient_gold'
      };
    }

    // Check if slot already has tower
    if (slot.tower) {
      return {
        canBuild: false,
        isDisabled: true,
        tooltip: 'Slot occupied',
        reason: 'occupied'
      };
    }

    // Check resources for building
    const canAffordGold = state.gold >= GAME_CONSTANTS.TOWER_COST;
    const canAffordEnergy = state.energy >= GAME_CONSTANTS.ENERGY_COSTS.buildTower;
    const canBuild = canAffordGold && canAffordEnergy;

    let tooltip = 'Build tower';
    let reason = 'can_build';

    if (!canAffordGold) {
      tooltip = `Not enough gold (${GAME_CONSTANTS.TOWER_COST} required)`;
      reason = 'insufficient_gold';
    } else if (!canAffordEnergy) {
      tooltip = `Not enough energy (${GAME_CONSTANTS.ENERGY_COSTS.buildTower} required)`;
      reason = 'insufficient_energy';
    }

    return {
      canBuild,
      isDisabled: !canBuild,
      tooltip,
      reason
    };
  }

  /**
   * Update pathfinding when towers are placed or destroyed
   */
  updatePathfinding(): void {
    const state = useGameStore.getState();
    
    // Force enemy movement update to recalculate paths
    if (state.enemies.length > 0) {
      EnemyMovement.updateEnemyMovement();
    }
  }

  /**
   * Check and fix game state issues
   */
  checkAndFixGameState(): void {
    const state = useGameStore.getState();
    
    // Check if game is stuck in a bad state
    if (state.isStarted && !state.isGameOver && !state.isPaused && !state.isRefreshing) {
      // Game should be running but might be stuck
      // Game state check: Game should be running
      
      // Check if enemies are spawning
      if (state.enemies.length === 0 && state.isFirstTowerPlaced) {
        // No enemies found, checking spawn system...
        this.ensureEnemySpawning();
      }
      
      // Check if towers are firing
      if (state.towerSlots.some(slot => slot.tower) && state.enemies.length > 0) {
        // Towers present but not firing, checking tower system...
        this.ensureTowerFiring();
      }
    }
  }

  /**
   * Ensure enemy spawning is working
   */
  private ensureEnemySpawning(): void {
    const state = useGameStore.getState();
    
    // If we have towers but no enemies, start spawning
    if (state.towerSlots.some(slot => slot.tower) && state.enemies.length === 0) {
      // Starting enemy spawning...
      
      // Import and start wave spawning
      import('./enemy/WaveSpawnManager').then(({ WaveSpawnManager }) => {
        if (!WaveSpawnManager.isSpawningActive()) {
          WaveSpawnManager.startEnemyWave(state.currentWave);
        }
      });
    }
  }

  /**
   * Ensure tower firing is working
   */
  private ensureTowerFiring(): void {
    const state = useGameStore.getState();
    
    // Check if towers have valid targets
    const towersWithTargets = state.towerSlots.filter(slot => {
      if (!slot.tower) return false;
      
      // Check if any enemies are in range
      return state.enemies.some(enemy => {
        const distance = Math.hypot(
          slot.x - enemy.position.x,
          slot.y - enemy.position.y
        );
        return distance <= slot.tower!.range;
      });
    });
    
    if (towersWithTargets.length > 0) {
      // Found ${towersWithTargets.length} towers with targets
    }
  }
}

// Export singleton instance
export const gameFlowManager = GameFlowManager.getInstance(); 