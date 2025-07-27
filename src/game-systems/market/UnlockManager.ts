/**
 * 🔓 Unlock Manager
 * Handles progressive unlock system and tracks unlock progress
 * Follows SOLID principles for maintainability and extensibility
 */

import { useGameStore } from '../../models/store';

import { UnlockRequirements } from './MarketManager';

export interface UnlockCondition {
  type: 'wave' | 'level' | 'gold' | 'achievement' | 'mission' | 'purchase';
  value: number | string;
  description: string;
  currentValue?: number | string;
  isMet: boolean;
}

export interface UnlockProgress {
  itemId: string;
  conditions: UnlockCondition[];
  allConditionsMet: boolean;
  unlockDate?: number;
  progressPercentage: number;
}

export interface UnlockEvent {
  itemId: string;
  itemName: string;
  unlockType: string;
  timestamp: number;
}

export class UnlockManager {
  private static instance: UnlockManager | null = null;
  private unlockProgress: Map<string, UnlockProgress> = new Map();
  private unlockHistory: UnlockEvent[] = [];
  private unlockListeners: Array<(event: UnlockEvent) => void> = [];

  private constructor() {}

  public static getInstance(): UnlockManager {
    if (!UnlockManager.instance) {
      UnlockManager.instance = new UnlockManager();
    }
    return UnlockManager.instance;
  }

  /**
   * Check if an item can be unlocked based on current game state
   */
  public checkUnlockConditions(itemId: string, requirements: UnlockRequirements): UnlockProgress {
    const gameState = useGameStore.getState();
    const conditions: UnlockCondition[] = [];

    // Wave requirement
    if (requirements.minWave) {
      const isMet = gameState.currentWave >= requirements.minWave;
      conditions.push({
        type: 'wave',
        value: requirements.minWave,
        description: `Reach Wave ${requirements.minWave}`,
        currentValue: gameState.currentWave,
        isMet
      });
    }

    // Level requirement
    if (requirements.minLevel) {
      const isMet = gameState.playerProfile.level >= requirements.minLevel;
      conditions.push({
        type: 'level',
        value: requirements.minLevel,
        description: `Reach Level ${requirements.minLevel}`,
        currentValue: gameState.playerProfile.level,
        isMet
      });
    }

    // Gold requirement
    if (requirements.minGold) {
      const isMet = gameState.gold >= requirements.minGold;
      conditions.push({
        type: 'gold',
        value: requirements.minGold,
        description: `Have ${requirements.minGold} Gold`,
        currentValue: gameState.gold,
        isMet
      });
    }

    // Achievement requirements
    if (requirements.requiredAchievements) {
      for (const achievementId of requirements.requiredAchievements) {
        const achievement = gameState.achievements[achievementId];
        const isMet = achievement && achievement.completed;
        conditions.push({
          type: 'achievement',
          value: achievementId,
          description: `Complete: ${achievement?.title || achievementId}`,
          currentValue: isMet ? 'Completed' : 'Incomplete',
          isMet
        });
      }
    }

    // Mission requirements
    if (requirements.requiredMissions) {
      for (const missionId of requirements.requiredMissions) {
        const isMet = gameState.completedMissions.includes(missionId);
        conditions.push({
          type: 'mission',
          value: missionId,
          description: `Complete Mission: ${missionId}`,
          currentValue: isMet ? 'Completed' : 'Incomplete',
          isMet
        });
      }
    }

    // Purchase requirements
    if (requirements.requiredPurchases) {
      const { category, count } = requirements.requiredPurchases;
      let currentCount = 0;
      
      switch (category) {
        case 'offense':
          currentCount = gameState.fireUpgradesPurchased;
          break;
        case 'defense':
          currentCount = gameState.shieldUpgradesPurchased;
          break;
        case 'support':
          currentCount = gameState.defenseUpgradesPurchased;
          break;
      }
      
      const isMet = currentCount >= count;
      conditions.push({
        type: 'purchase',
        value: count,
        description: `Purchase ${count} ${category} items`,
        currentValue: currentCount,
        isMet
      });
    }

    const allConditionsMet = conditions.every(condition => condition.isMet);
    const progressPercentage = conditions.length > 0 
      ? (conditions.filter(c => c.isMet).length / conditions.length) * 100 
      : 100;

    const progress: UnlockProgress = {
      itemId,
      conditions,
      allConditionsMet,
      progressPercentage
    };

    // Update unlock date if newly unlocked
    if (allConditionsMet) {
      const existingProgress = this.unlockProgress.get(itemId);
      if (!existingProgress?.unlockDate) {
        progress.unlockDate = Date.now();
        this.recordUnlockEvent(itemId, 'progressive_unlock');
      }
    }

    this.unlockProgress.set(itemId, progress);
    return progress;
  }

  /**
   * Get unlock progress for an item
   */
  public getUnlockProgress(itemId: string): UnlockProgress | null {
    return this.unlockProgress.get(itemId) || null;
  }

  /**
   * Get all unlock progress
   */
  public getAllUnlockProgress(): UnlockProgress[] {
    return Array.from(this.unlockProgress.values());
  }

  /**
   * Get recently unlocked items
   */
  public getRecentlyUnlockedItems(withinHours: number = 24): UnlockProgress[] {
    const cutoffTime = Date.now() - (withinHours * 60 * 60 * 1000);
    return Array.from(this.unlockProgress.values())
      .filter(progress => progress.unlockDate && progress.unlockDate > cutoffTime)
      .sort((a, b) => (b.unlockDate || 0) - (a.unlockDate || 0));
  }

  /**
   * Get unlock statistics
   */
  public getUnlockStatistics(): {
    totalItems: number;
    unlockedItems: number;
    lockedItems: number;
    averageProgress: number;
    nextUnlocks: UnlockProgress[];
  } {
    const allProgress = this.getAllUnlockProgress();
    const unlockedItems = allProgress.filter(p => p.allConditionsMet);
    const lockedItems = allProgress.filter(p => !p.allConditionsMet);
    
    const averageProgress = allProgress.length > 0
      ? allProgress.reduce((sum, p) => sum + p.progressPercentage, 0) / allProgress.length
      : 0;

    // Get items closest to unlocking (highest progress but not yet unlocked)
    const nextUnlocks = lockedItems
      .sort((a, b) => b.progressPercentage - a.progressPercentage)
      .slice(0, 5);

    return {
      totalItems: allProgress.length,
      unlockedItems: unlockedItems.length,
      lockedItems: lockedItems.length,
      averageProgress,
      nextUnlocks
    };
  }

  /**
   * Record an unlock event
   */
  public recordUnlockEvent(itemId: string, unlockType: string): void {
    const event: UnlockEvent = {
      itemId,
      itemName: this.getItemName(itemId),
      unlockType,
      timestamp: Date.now()
    };

    this.unlockHistory.push(event);
    
    // Keep only last 100 events
    if (this.unlockHistory.length > 100) {
      this.unlockHistory = this.unlockHistory.slice(-100);
    }

    // Notify listeners
    this.unlockListeners.forEach(listener => {
      try {
        listener(event);
      } catch {
        // Unlock listener error
      }
    });

    // Unlock event recorded
  }

  /**
   * Get unlock history
   */
  public getUnlockHistory(): UnlockEvent[] {
    return [...this.unlockHistory];
  }

  /**
   * Add unlock event listener
   */
  public addUnlockListener(listener: (event: UnlockEvent) => void): void {
    this.unlockListeners.push(listener);
  }

  /**
   * Remove unlock event listener
   */
  public removeUnlockListener(listener: (event: UnlockEvent) => void): void {
    const index = this.unlockListeners.indexOf(listener);
    if (index > -1) {
      this.unlockListeners.splice(index, 1);
    }
  }

  /**
   * Get item name (placeholder - would be integrated with item system)
   */
  private getItemName(itemId: string): string {
    // This would be integrated with the actual item system
    return itemId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Reset unlock progress (for testing or new game)
   */
  public resetUnlockProgress(): void {
    this.unlockProgress.clear();
    this.unlockHistory = [];
    // Unlock progress reset
  }

  /**
   * Export unlock data for save/load
   */
  public exportUnlockData(): {
    progress: Record<string, UnlockProgress>;
    history: UnlockEvent[];
  } {
    return {
      progress: Object.fromEntries(this.unlockProgress),
      history: this.unlockHistory
    };
  }

  /**
   * Import unlock data from save/load
   */
  public importUnlockData(data: {
    progress: Record<string, UnlockProgress>;
    history: UnlockEvent[];
  }): void {
    this.unlockProgress = new Map(Object.entries(data.progress));
    this.unlockHistory = data.history;
    // Unlock data imported
  }
}

// Export singleton instance
export const unlockManager = UnlockManager.getInstance(); 