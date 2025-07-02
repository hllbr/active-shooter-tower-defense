import type { GameState } from '../../models/gameTypes';
import type { StateSnapshot } from './types';
import { GameStateSelectors } from './GameStateSelectors';

/**
 * Simple State Change Tracker
 * Tracks basic changes without complex type handling
 */
export class SimpleStateTracker {
  private lastCounts = {
    enemies: 0,
    bullets: 0,
    effects: 0,
    towers: 0
  };
  
  private lastValues = {
    gold: 0,
    currentWave: 0,
    isGameOver: false,
    isPaused: false
  };
  
  /**
   * Check if there are significant changes worth updating
   */
  public hasSignificantChanges(state: GameState): boolean {
    const currentCounts = {
      enemies: state.enemies.length,
      bullets: state.bullets.length,
      effects: state.effects.length,
      towers: state.towers.length
    };
    
    const currentValues = {
      gold: state.gold,
      currentWave: state.currentWave,
      isGameOver: state.isGameOver,
      isPaused: state.isPaused
    };
    
    // Check for any changes in critical values
    const hasCountChanges = 
      currentCounts.enemies !== this.lastCounts.enemies ||
      currentCounts.bullets !== this.lastCounts.bullets ||
      currentCounts.effects !== this.lastCounts.effects ||
      currentCounts.towers !== this.lastCounts.towers;
      
    const hasValueChanges =
      currentValues.gold !== this.lastValues.gold ||
      currentValues.currentWave !== this.lastValues.currentWave ||
      currentValues.isGameOver !== this.lastValues.isGameOver ||
      currentValues.isPaused !== this.lastValues.isPaused;
    
    return hasCountChanges || hasValueChanges;
  }
  
  /**
   * Update tracked values
   */
  public updateSnapshot(state: GameState): void {
    this.lastCounts = {
      enemies: state.enemies.length,
      bullets: state.bullets.length,
      effects: state.effects.length,
      towers: state.towers.length
    };
    
    this.lastValues = {
      gold: state.gold,
      currentWave: state.currentWave,
      isGameOver: state.isGameOver,
      isPaused: state.isPaused
    };
  }
  
  /**
   * Get change summary for debugging
   */
  public getChangeSummary(state: GameState): string {
    const current = GameStateSelectors.getObjectCounts(state);
    const changes = {
      enemies: current.enemies - this.lastCounts.enemies,
      bullets: current.bullets - this.lastCounts.bullets,
      effects: current.effects - this.lastCounts.effects
    };
    
    return `Δ Enemies: ${changes.enemies > 0 ? '+' : ''}${changes.enemies}, ` +
           `Bullets: ${changes.bullets > 0 ? '+' : ''}${changes.bullets}, ` +
           `Effects: ${changes.effects > 0 ? '+' : ''}${changes.effects}`;
  }
  
  /**
   * Get current snapshot for external access
   */
  public getCurrentSnapshot(): StateSnapshot {
    return {
      counts: { ...this.lastCounts },
      values: { ...this.lastValues }
    };
  }
} 