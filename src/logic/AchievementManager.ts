import { ACHIEVEMENT_DEFINITIONS } from '../config/achievements/achievementDefinitions';
import { ACHIEVEMENT_SERIES } from '../config/achievements/achievementSeries';
import { createInitialPlayerProfile } from '../config/achievements/playerProfile';
import type { GameState, Achievement, AchievementSeries, PlayerProfile } from '../models/gameTypes';
import {
  AchievementProgressTracker,
  AchievementRewardManager,
  AchievementDisplayHelper,
  AchievementStatisticsManager,
  AchievementSeriesManager
} from './achievements';

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

// ===== ACHIEVEMENT MANAGER =====

export class AchievementManager {
  private static instance: AchievementManager;
  private progressTracker: AchievementProgressTracker;
  private rewardManager: AchievementRewardManager;
  private displayHelper: AchievementDisplayHelper;
  private statisticsManager: AchievementStatisticsManager;
  private seriesManager: AchievementSeriesManager;

  private constructor() {
    this.progressTracker = new AchievementProgressTracker();
    this.rewardManager = new AchievementRewardManager();
    this.displayHelper = new AchievementDisplayHelper();
    this.statisticsManager = new AchievementStatisticsManager();
    this.seriesManager = new AchievementSeriesManager();
  }

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
    ACHIEVEMENT_DEFINITIONS.forEach((achievement: Achievement) => {
      achievements[achievement.id] = { ...achievement };
    });

    // Create series map
    const achievementSeries: Record<string, AchievementSeries> = {};
    ACHIEVEMENT_SERIES.forEach((series: AchievementSeries) => {
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
    eventData?: AchievementEventData
  ): {
    newlyCompleted: Achievement[];
    updatedAchievements: Record<string, Achievement>;
    updatedProfile: PlayerProfile;
  } {
    const newlyCompleted: Achievement[] = [];
    const updatedAchievements = { ...gameState.achievements };
    let updatedProfile = { ...gameState.playerProfile };

    // Get achievements that need updating
    const achievementsToUpdate = this.progressTracker.getAchievementsToUpdate(updatedAchievements, eventType);

    // Check all achievements for updates
    achievementsToUpdate.forEach(achievement => {
      // Update progress based on tracking function
      const newProgress = this.progressTracker.calculateProgress(achievement, gameState, eventData);
      
      if (newProgress !== achievement.progress) {
        achievement.progress = newProgress;
        
        // Check if achievement is completed
        if (newProgress >= achievement.target && !achievement.completed) {
          achievement.completed = true;
          achievement.completedAt = Date.now();
          newlyCompleted.push(achievement);

          // Process achievement completion and rewards
          updatedProfile = this.rewardManager.processAchievementCompletion(achievement, updatedProfile);
        }
      }
    });

    return {
      newlyCompleted,
      updatedAchievements,
      updatedProfile
    };
  }

  // ===== DELEGATE TO SPECIALIZED COMPONENTS =====

  // Progress tracking methods
  public calculateProgress(achievement: Achievement, gameState: GameState, eventData?: AchievementEventData): number {
    return this.progressTracker.calculateProgress(achievement, gameState, eventData);
  }

  public shouldUpdateAchievement(achievement: Achievement, eventType: string): boolean {
    return this.progressTracker.shouldUpdateAchievement(achievement, eventType);
  }

  // Reward management methods
  public applyAchievementReward(achievement: Achievement, profile: PlayerProfile): PlayerProfile {
    return this.rewardManager.applyAchievementReward(achievement, profile);
  }

  public getAchievementPoints(achievement: Achievement): number {
    return this.rewardManager.getAchievementPoints(achievement);
  }

  public getExperienceReward(achievement: Achievement): number {
    return this.rewardManager.getExperienceReward(achievement);
  }

  public checkLevelUp(profile: PlayerProfile): PlayerProfile {
    return this.rewardManager.checkLevelUp(profile);
  }

  // Display helper methods
  public getCategoryInfo(category: Achievement['category']) {
    return this.displayHelper.getCategoryInfo(category);
  }

  public getRarityInfo(rarity: Achievement['rarity']) {
    return this.displayHelper.getRarityInfo(rarity);
  }

  public createUnlockNotification(achievement: Achievement) {
    return this.displayHelper.createUnlockNotification(achievement);
  }

  public getProgressPercentage(achievement: Achievement): number {
    return this.displayHelper.getProgressPercentage(achievement);
  }

  public getProgressText(achievement: Achievement): string {
    return this.displayHelper.getProgressText(achievement);
  }

  public getAchievementStatus(achievement: Achievement) {
    return this.displayHelper.getAchievementStatus(achievement);
  }

  // Statistics management methods
  public updateStatistics(
    profile: PlayerProfile,
    statType: keyof PlayerProfile['statistics'],
    value: number,
    operation: 'add' | 'set' | 'max' = 'add'
  ): PlayerProfile {
    return this.statisticsManager.updateStatistics(profile, statType, value, operation);
  }

  public updateMultipleStatistics(
    profile: PlayerProfile,
    updates: Array<{
      statType: keyof PlayerProfile['statistics'];
      value: number;
      operation?: 'add' | 'set' | 'max';
    }>
  ): PlayerProfile {
    return this.statisticsManager.updateMultipleStatistics(profile, updates);
  }

  public getStatisticsSummary(profile: PlayerProfile) {
    return this.statisticsManager.getStatisticsSummary(profile);
  }

  public checkForNewRecord(
    profile: PlayerProfile,
    statType: keyof PlayerProfile['statistics'],
    newValue: number
  ) {
    return this.statisticsManager.checkForNewRecord(profile, statType, newValue);
  }

  // Series management methods
  public getSeriesCompletion(achievements: Record<string, Achievement>, series: AchievementSeries) {
    return this.seriesManager.getSeriesCompletion(achievements, series);
  }

  public getAllSeriesCompletions(
    achievements: Record<string, Achievement>,
    series: Record<string, AchievementSeries>
  ) {
    return this.seriesManager.getAllSeriesCompletions(achievements, series);
  }

  public checkSeriesReward(achievements: Record<string, Achievement>, series: AchievementSeries) {
    return this.seriesManager.checkSeriesReward(achievements, series);
  }

  public getAchievementsBySeries(achievements: Record<string, Achievement>, seriesId: string): Achievement[] {
    return this.seriesManager.getAchievementsBySeries(achievements, seriesId);
  }

  public getSeriesByCategory(
    series: Record<string, AchievementSeries>,
    category: Achievement['category']
  ): AchievementSeries[] {
    return this.seriesManager.getSeriesByCategory(series, category);
  }

  public getNextAchievementInSeries(achievements: Record<string, Achievement>, series: AchievementSeries) {
    return this.seriesManager.getNextAchievementInSeries(achievements, series);
  }
} 