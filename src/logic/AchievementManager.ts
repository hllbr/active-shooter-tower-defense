import type { GameState, Achievement, AchievementSeries, PlayerProfile } from '../models/gameTypes';
import { ACHIEVEMENT_DEFINITIONS, ACHIEVEMENT_SERIES, createInitialPlayerProfile } from '../config/achievements';

// ===== ACHIEVEMENT MANAGER =====

export class AchievementManager {
  private static instance: AchievementManager;

  public static getInstance(): AchievementManager {
    if (!AchievementManager.instance) {
      AchievementManager.instance = new AchievementManager();
    }
    return AchievementManager.instance;
  }

  // Initialize achievements system
  public initializeAchievements(): {
    achievements: Record<string, Achievement>;
    achievementSeries: Record<string, AchievementSeries>;
    playerProfile: PlayerProfile;
  } {
    // Create achievements map
    const achievements: Record<string, Achievement> = {};
    ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
      achievements[achievement.id] = { ...achievement };
    });

    // Create series map
    const achievementSeries: Record<string, AchievementSeries> = {};
    ACHIEVEMENT_SERIES.forEach(series => {
      achievementSeries[series.id] = { ...series };
    });

    // Create initial player profile
    const playerProfile = createInitialPlayerProfile();

    return {
      achievements,
      achievementSeries,
      playerProfile
    };
  }

  // Update achievement progress based on game events
  public updateAchievements(
    gameState: GameState,
    eventType: string,
    eventData?: any
  ): {
    newlyCompleted: Achievement[];
    updatedAchievements: Record<string, Achievement>;
    updatedProfile: PlayerProfile;
  } {
    const newlyCompleted: Achievement[] = [];
    const updatedAchievements = { ...gameState.achievements };
    const updatedProfile = { ...gameState.playerProfile };

    // Check all achievements for updates
    Object.values(updatedAchievements).forEach(achievement => {
      if (achievement.completed || !achievement.tracking.triggerEvents.includes(eventType)) {
        return;
      }

      // Update progress based on tracking function
      const newProgress = this.calculateProgress(achievement, gameState, eventData);
      
      if (newProgress !== achievement.progress) {
        achievement.progress = newProgress;
        
        // Check if achievement is completed
        if (newProgress >= achievement.target && !achievement.completed) {
          achievement.completed = true;
          achievement.completedAt = Date.now();
          newlyCompleted.push(achievement);

          // Apply rewards
          this.applyAchievementReward(achievement, updatedProfile);
          
          // Update profile stats
          updatedProfile.achievementsCompleted++;
          updatedProfile.achievementPoints += this.getAchievementPoints(achievement);
          updatedProfile.experience += this.getExperienceReward(achievement);
        }
      }
    });

    // Check level up
    this.checkLevelUp(updatedProfile);

    return {
      newlyCompleted,
      updatedAchievements,
      updatedProfile
    };
  }

  // Calculate progress for specific achievement
  private calculateProgress(achievement: Achievement, gameState: GameState, eventData?: any): number {
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
        // This would need special tracking for wave completion times
        return 0; // Placeholder
        
      default:
        return achievement.progress;
    }
  }

  // Apply achievement reward to player profile
  private applyAchievementReward(achievement: Achievement, profile: PlayerProfile): void {
    const reward = achievement.rewards;
    
    switch (reward.type) {
      case 'research_points':
        profile.researchPoints += reward.value;
        break;
        
      case 'title':
        if (!profile.unlockedTitles.includes(reward.name)) {
          profile.unlockedTitles.push(reward.name);
        }
        break;
        
      case 'bonus':
        if (reward.permanent) {
          profile.permanentBonuses[achievement.id] = reward.value;
        }
        break;
        
      case 'cosmetic':
        if (!profile.unlockedCosmetics.includes(reward.name)) {
          profile.unlockedCosmetics.push(reward.name);
        }
        break;
        
      case 'unlock':
        // Handle special unlocks (like prestige system)
        break;
    }
  }

  // Get achievement points based on rarity
  private getAchievementPoints(achievement: Achievement): number {
    switch (achievement.rarity) {
      case 'common': return 10;
      case 'rare': return 25;
      case 'epic': return 50;
      case 'legendary': return 100;
      default: return 10;
    }
  }

  // Get experience reward based on rarity
  private getExperienceReward(achievement: Achievement): number {
    switch (achievement.rarity) {
      case 'common': return 50;
      case 'rare': return 150;
      case 'epic': return 400;
      case 'legendary': return 1000;
      default: return 50;
    }
  }

  // Check if player levels up
  private checkLevelUp(profile: PlayerProfile): void {
    while (profile.experience >= profile.experienceToNext) {
      profile.experience -= profile.experienceToNext;
      profile.level++;
      profile.experienceToNext = this.calculateExperienceToNext(profile.level);
      
      // Level up rewards
      profile.researchPoints += profile.level * 10; // 10 research points per level
    }
  }

  // Calculate experience needed for next level
  private calculateExperienceToNext(level: number): number {
    return Math.floor(1000 * Math.pow(1.15, level - 1));
  }

  // Get achievement category display info
  public getCategoryInfo(category: Achievement['category']): { icon: string; name: string; color: string } {
    switch (category) {
      case 'progression':
        return { icon: '🌊', name: 'İlerleme', color: '#3b82f6' };
      case 'upgrade':
        return { icon: '🔥', name: 'Yükseltme', color: '#ef4444' };
      case 'economy':
        return { icon: '💰', name: 'Ekonomi', color: '#f59e0b' };
      case 'building':
        return { icon: '🏰', name: 'İnşaat', color: '#8b5cf6' };
      case 'combat':
        return { icon: '⚔️', name: 'Savaş', color: '#dc2626' };
      case 'special':
        return { icon: '⚡', name: 'Özel', color: '#7c3aed' };
      case 'defense':
        return { icon: '🛡️', name: 'Savunma', color: '#059669' };
      default:
        return { icon: '🏆', name: 'Genel', color: '#6b7280' };
    }
  }

  // Get rarity display info
  public getRarityInfo(rarity: Achievement['rarity']): { color: string; glow: string } {
    switch (rarity) {
      case 'common':
        return { color: '#9ca3af', glow: 'rgba(156, 163, 175, 0.3)' };
      case 'rare':
        return { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' };
      case 'epic':
        return { color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' };
      case 'legendary':
        return { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' };
      default:
        return { color: '#6b7280', glow: 'rgba(107, 114, 128, 0.3)' };
    }
  }

  // Update player statistics (called from game events)
  public updateStatistics(
    profile: PlayerProfile,
    statType: keyof PlayerProfile['statistics'],
    value: number,
    operation: 'add' | 'set' | 'max' = 'add'
  ): PlayerProfile {
    const updatedProfile = { ...profile };
    const stats = { ...updatedProfile.statistics };
    
    switch (operation) {
      case 'add':
        (stats[statType] as number) += value;
        break;
      case 'set':
        (stats[statType] as number) = value;
        break;
      case 'max':
        (stats[statType] as number) = Math.max((stats[statType] as number), value);
        break;
    }
    
    updatedProfile.statistics = stats;
    return updatedProfile;
  }

  // Get series completion status
  public getSeriesCompletion(achievements: Record<string, Achievement>, series: AchievementSeries): {
    completed: number;
    total: number;
    isComplete: boolean;
    nextAchievement?: Achievement;
  } {
    const seriesAchievements = series.achievements.map(id => achievements[id]).filter(Boolean);
    const completed = seriesAchievements.filter(achievement => achievement.completed).length;
    const total = seriesAchievements.length;
    const isComplete = completed === total;
    
    // Find next uncompleted achievement in series
    const nextAchievement = seriesAchievements.find(achievement => !achievement.completed);
    
    return {
      completed,
      total,
      isComplete,
      nextAchievement
    };
  }

  // Create achievement unlock notification
  public createUnlockNotification(achievement: Achievement): {
    type: 'success';
    message: string;
    duration: number;
  } {
    const rarityInfo = this.getRarityInfo(achievement.rarity);
    const rarityText = achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1);
    
    return {
      type: 'success',
      message: `🏆 ${achievement.title} - ${rarityText} başarı açıldı! ${achievement.rewards.description}`,
      duration: 5000 // 5 seconds for achievements
    };
  }
} 