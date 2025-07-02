import type { GameState, Achievement } from '../../models/gameTypes';

// Achievement Event Data Types
interface WaveEventData {
  waveNumber: number;
  enemiesKilled: number;
  timeElapsed: number;
}

interface PurchaseEventData {
  itemType: string;
  cost: number;
  level: number;
}

interface EnemyEventData {
  enemyType: string;
  damage: number;
  isSpecial: boolean;
}

interface TowerEventData {
  towerType: string;
  level: number;
  position: { x: number; y: number };
}

type AchievementEventData = 
  | WaveEventData 
  | PurchaseEventData 
  | EnemyEventData 
  | TowerEventData 
  | Record<string, string | number | boolean>;

export class AchievementProgressTracker {
  // Calculate progress for specific achievement
  public calculateProgress(achievement: Achievement, gameState: GameState, eventData?: AchievementEventData): number {
    switch (achievement.tracking.trackingFunction) {
      case 'trackWaveProgress':
        return gameState.currentWave;
        
      case 'trackFireUpgrades':
        return gameState.fireUpgradesPurchased;
        
      case 'trackShieldUpgrades':
        return gameState.shieldUpgradesPurchased;
        
      case 'trackPackagePurchases':
        return gameState.packagesPurchased;
        
      case 'trackGoldSpending':
        return gameState.totalGoldSpent;
        
      case 'trackActiveTowers':
        return gameState.towers.length;
        
      case 'trackMaxTowerLevel':
        return gameState.towers.length > 0 ? Math.max(...gameState.towers.map(t => t.level)) : 0;
        
      case 'trackEnemyKills':
        return gameState.totalEnemiesKilled;
        
      case 'trackPerfectWaves':
        return gameState.playerProfile.statistics.perfectWaves;
        
      case 'trackMineUpgrades':
        return gameState.defenseUpgradeLimits.mines.purchaseCount;
        
      case 'trackWallUpgrades':
        return gameState.defenseUpgradeLimits.walls.purchaseCount;
        
      case 'trackDiceRolls':
        // This would need to be tracked separately
        return gameState.playerProfile.statistics.totalUpgradesPurchased; // Placeholder
        
      case 'trackEnergyUsage':
        return gameState.energy >= gameState.maxEnergy ? 1 : 0;
        
      case 'trackSpeedrun':
        // Use event data for speedrun tracking
        if (eventData && 'timeElapsed' in eventData && typeof eventData.timeElapsed === 'number' && eventData.timeElapsed < 60000) {
          return achievement.progress + 1; // Count fast wave completions
        }
        return achievement.progress;
        
      default:
        return achievement.progress;
    }
  }

  // Check if achievement should be updated based on event type
  public shouldUpdateAchievement(achievement: Achievement, eventType: string): boolean {
    return !achievement.completed && achievement.tracking.triggerEvents.includes(eventType);
  }

  // Get achievements that need updating for a specific event
  public getAchievementsToUpdate(
    achievements: Record<string, Achievement>,
    eventType: string
  ): Achievement[] {
    return Object.values(achievements).filter(achievement => 
      this.shouldUpdateAchievement(achievement, eventType)
    );
  }
} 