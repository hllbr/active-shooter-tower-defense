import type { Achievement, AchievementSeries } from '../../models/gameTypes';

// ===== ACHIEVEMENT HELPER FUNCTIONS =====

export function getAchievementsByCategory(achievements: Record<string, Achievement>, category: Achievement['category']): Achievement[] {
  return Object.values(achievements).filter(achievement => achievement.category === category);
}

export function getCompletedAchievements(achievements: Record<string, Achievement>): Achievement[] {
  return Object.values(achievements).filter(achievement => achievement.completed);
}

export function getAchievementCompletionRate(achievements: Record<string, Achievement>): number {
  const total = Object.keys(achievements).length;
  const completed = getCompletedAchievements(achievements).length;
  return total > 0 ? (completed / total) * 100 : 0;
}

export function getVisibleAchievements(achievements: Record<string, Achievement>): Achievement[] {
  return Object.values(achievements).filter(achievement => !achievement.hidden);
}

export function getSeriesProgress(achievements: Record<string, Achievement>, series: AchievementSeries): {
  completed: number;
  total: number;
  isComplete: boolean;
} {
  const seriesAchievements = series.achievements.map(id => achievements[id]).filter(Boolean);
  const completed = seriesAchievements.filter(achievement => achievement.completed).length;
  const total = seriesAchievements.length;
  
  return {
    completed,
    total,
    isComplete: completed === total
  };
} 