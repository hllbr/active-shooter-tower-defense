// ===== ACHIEVEMENTS MODULE EXPORTS =====

// Achievement Definitions
export { ACHIEVEMENT_DEFINITIONS } from './achievementDefinitions';

// Achievement Series
export { ACHIEVEMENT_SERIES } from './achievementSeries';

// Player Profile
export { createInitialPlayerProfile } from './playerProfile';

// Helper Functions
export {
  getAchievementsByCategory,
  getCompletedAchievements,
  getAchievementCompletionRate,
  getVisibleAchievements,
  getSeriesProgress
} from './achievementHelpers';

// Re-export types for convenience
export type { Achievement, AchievementSeries, PlayerProfile } from '../../models/gameTypes'; 