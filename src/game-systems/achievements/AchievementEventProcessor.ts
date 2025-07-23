import type { GameState, Achievement, PlayerProfile } from '../../models/gameTypes';
import type { AchievementEventData } from './AchievementEventTypes';
import { AchievementProgressTracker } from './AchievementProgressTracker';
import { AchievementRewardManager } from './AchievementRewardManager';

// ===== ACHIEVEMENT EVENT PROCESSOR =====

export class AchievementEventProcessor {
  private progressTracker: AchievementProgressTracker;
  private rewardManager: AchievementRewardManager;

  constructor() {
    this.progressTracker = new AchievementProgressTracker();
    this.rewardManager = new AchievementRewardManager();
  }

  /**
   * Process achievement events and update progress
   */
  public processAchievementEvents(
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
          // Validation: Only unlock if validate returns true (or is not present)
          const isValid = typeof achievement.validate === 'function' ? achievement.validate(gameState, eventData) : true;
          if (isValid) {
            achievement.completed = true;
            achievement.completedAt = Date.now();
            newlyCompleted.push(achievement);
            // Process achievement completion and rewards
            updatedProfile = this.rewardManager.processAchievementCompletion(achievement, updatedProfile);
          }
        }
      }
    });

    return {
      newlyCompleted,
      updatedAchievements,
      updatedProfile
    };
  }

  /**
   * Process multiple events in batch
   */
  public processBatchEvents(
    gameState: GameState,
    events: Array<{ eventType: string; eventData?: AchievementEventData }>
  ): {
    newlyCompleted: Achievement[];
    updatedAchievements: Record<string, Achievement>;
    updatedProfile: PlayerProfile;
  } {
    let currentState = gameState;
    let allNewlyCompleted: Achievement[] = [];

    events.forEach(({ eventType, eventData }) => {
      const result = this.processAchievementEvents(currentState, eventType, eventData);
      
      allNewlyCompleted = [...allNewlyCompleted, ...result.newlyCompleted];
      currentState = {
        ...currentState,
        achievements: result.updatedAchievements,
        playerProfile: result.updatedProfile
      };
    });

    return {
      newlyCompleted: allNewlyCompleted,
      updatedAchievements: currentState.achievements,
      updatedProfile: currentState.playerProfile
    };
  }

  /**
   * Check if any achievements are close to completion
   */
  public getNearCompletionAchievements(
    achievements: Record<string, Achievement>,
    threshold: number = 0.8
  ): Achievement[] {
    return Object.values(achievements).filter(achievement => {
      if (achievement.completed) return false;
      const progressPercentage = achievement.progress / achievement.target;
      return progressPercentage >= threshold;
    });
  }
} 