import { useGameStore } from '../models/store';
import { WaveSpawnManager } from './enemy/WaveSpawnManager';
import { pauseGameSceneSounds, resumeGameSceneSounds } from '../utils/sound/soundEffects';
import { dynamicSpawnController } from './spawn-system';
import { aiManager } from './ai-automation';

/**
 * GamePauseManager - Centralized pause state management
 * 
 * This manager handles all pause-related functionality including:
 * - Stopping/resuming enemy spawning
 * - Pausing/resuming game sounds
 * - Stopping/resuming AI automation
 * - Managing pause state transitions
 */
export class GamePauseManager {
  private static isCurrentlyPaused = false;
  private static pauseStateSnapshot: {
    wasSpawningActive: boolean;
    wasAIActive: boolean;
    currentWave: number;
  } | null = null;

  /**
   * Pause the game - stops all game activity
   */
  static pauseGame(): void {
    if (this.isCurrentlyPaused) return;

    const state = useGameStore.getState();
    
    // Take snapshot of current state for resume
    this.pauseStateSnapshot = {
      wasSpawningActive: WaveSpawnManager.isSpawningActive(),
      wasAIActive: state.isStarted && !state.isGameOver,
      currentWave: state.currentWave
    };

    // Stop enemy spawning
    WaveSpawnManager.stopEnemyWave();
    WaveSpawnManager.stopContinuousSpawning();
    dynamicSpawnController.stopWaveSpawning();

    // Pause game scene sounds (keep UI sounds active)
    pauseGameSceneSounds();

    // Stop AI automation
    aiManager.pauseAutomation();

    this.isCurrentlyPaused = true;
  }

  /**
   * Resume the game - restores previous state
   */
  static resumeGame(): void {
    if (!this.isCurrentlyPaused || !this.pauseStateSnapshot) return;

    const state = useGameStore.getState();
    
    // Resume game scene sounds
    resumeGameSceneSounds();

    // Resume AI automation if it was active
    if (this.pauseStateSnapshot.wasAIActive) {
      aiManager.resumeAutomation();
    }

    // Resume spawning if it was active and game conditions are met
    if (this.pauseStateSnapshot.wasSpawningActive && 
        state.isStarted && 
        !state.isGameOver && 
        state.isFirstTowerPlaced) {
      
      // Resume wave spawning
      if (state.waveStatus === 'in_progress') {
        WaveSpawnManager.startEnemyWave(state.currentWave);
      }
      
      // Resume continuous spawning if in idle mode (preparation phase)
      if (state.waveStatus === 'idle') {
        WaveSpawnManager.startContinuousSpawning();
      }
    }

    this.isCurrentlyPaused = false;
    this.pauseStateSnapshot = null;
  }

  /**
   * Check if the game is currently paused
   */
  static isPaused(): boolean {
    return this.isCurrentlyPaused;
  }

  /**
   * Force reset pause state (for game restart scenarios)
   */
  static reset(): void {
    this.isCurrentlyPaused = false;
    this.pauseStateSnapshot = null;
  }

  /**
   * Get current pause state information
   */
  static getPauseState(): {
    isPaused: boolean;
    hasSnapshot: boolean;
  } {
    return {
      isPaused: this.isCurrentlyPaused,
      hasSnapshot: this.pauseStateSnapshot !== null
    };
  }
}
