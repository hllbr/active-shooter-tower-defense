import type { GameState, Achievement, AchievementSeries, PlayerProfile } from '../models/gameTypes';
import type { AchievementEventData } from './achievements/AchievementEventTypes';
import {
  AchievementProgressTracker,
  AchievementRewardManager,
  AchievementDisplayHelper,
  AchievementStatisticsManager,
  AchievementSeriesManager,
  AchievementInitializer,
  AchievementEventProcessor
} from './achievements';

// ===== ACHIEVEMENT MANAGER =====

export class AchievementManager {
  private static instance: AchievementManager;
  private progressTracker: AchievementProgressTracker;
  private rewardManager: AchievementRewardManager;
  private displayHelper: AchievementDisplayHelper;
  private statisticsManager: AchievementStatisticsManager;
  private seriesManager: AchievementSeriesManager;
  private eventProcessor: AchievementEventProcessor;

  private constructor() {
    this.progressTracker = new AchievementProgressTracker();
    this.rewardManager = new AchievementRewardManager();
    this.displayHelper = new AchievementDisplayHelper();
    this.statisticsManager = new AchievementStatisticsManager();
    this.seriesManager = new AchievementSeriesManager();
    this.eventProcessor = new AchievementEventProcessor();
  }

  public static getInstance(): AchievementManager {
    if (!AchievementManager.instance) {
      AchievementManager.instance = new AchievementManager();
    }
    return AchievementManager.instance;
  }

  // ===== INITIALIZATION =====

  /**
   * Initialize achievements system
   */
  public initializeAchievements() {
    return AchievementInitializer.initializeAchievements();
  }

  /**
   * Reset achievements to initial state
   */
  public resetAchievements(achievements: Record<string, Achievement>) {
    return AchievementInitializer.resetAchievements(achievements);
  }

  /**
   * Reset player profile to initial state
   */
  public resetPlayerProfile() {
    return AchievementInitializer.resetPlayerProfile();
  }

  // ===== EVENT PROCESSING =====

  /**
   * Update achievement progress based on game events
   */
  public updateAchievements(
    gameState: GameState,
    eventType: string,
    eventData?: AchievementEventData
  ) {
    return this.eventProcessor.processAchievementEvents(gameState, eventType, eventData);
  }

  /**
   * Process multiple events in batch
   */
  public processBatchEvents(
    gameState: GameState,
    events: Array<{ eventType: string; eventData?: AchievementEventData }>
  ) {
    return this.eventProcessor.processBatchEvents(gameState, events);
  }

  /**
   * Check if any achievements are close to completion
   */
  public getNearCompletionAchievements(
    achievements: Record<string, Achievement>,
    threshold: number = 0.8
  ) {
    return this.eventProcessor.getNearCompletionAchievements(achievements, threshold);
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