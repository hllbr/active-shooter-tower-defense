import { ACHIEVEMENT_DEFINITIONS } from '../../config/achievements/achievementDefinitions';
import { ACHIEVEMENT_SERIES } from '../../config/achievements/achievementSeries';
import { createInitialPlayerProfile } from '../../config/achievements/playerProfile';
import type { Achievement, AchievementSeries, PlayerProfile } from '../../models/gameTypes';

// ===== ACHIEVEMENT INITIALIZER =====

export class AchievementInitializer {
  /**
   * Initialize achievements system with all required data structures
   */
  public static initializeAchievements(): {
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

  /**
   * Reset achievements to initial state
   */
  public static resetAchievements(achievements: Record<string, Achievement>): Record<string, Achievement> {
    const resetAchievements: Record<string, Achievement> = {};
    
    Object.values(achievements).forEach(achievement => {
      resetAchievements[achievement.id] = {
        ...achievement,
        progress: 0,
        completed: false,
        completedAt: undefined
      };
    });

    return resetAchievements;
  }

  /**
   * Reset player profile to initial state
   */
  public static resetPlayerProfile(): PlayerProfile {
    return createInitialPlayerProfile();
  }
} 