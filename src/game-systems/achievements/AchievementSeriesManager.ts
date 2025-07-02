import type { Achievement, AchievementSeries } from '../../models/gameTypes';

export class AchievementSeriesManager {
  // Get series completion status
  public getSeriesCompletion(
    achievements: Record<string, Achievement>, 
    series: AchievementSeries
  ): {
    completed: number;
    total: number;
    isComplete: boolean;
    nextAchievement?: Achievement;
    progressPercentage: number;
  } {
    const seriesAchievements = series.achievements
      .map(id => achievements[id])
      .filter(Boolean);
    
    const completed = seriesAchievements.filter(achievement => achievement.completed).length;
    const total = seriesAchievements.length;
    const isComplete = completed === total;
    const progressPercentage = total > 0 ? (completed / total) * 100 : 0;
    
    // Find next uncompleted achievement in series
    const nextAchievement = seriesAchievements.find(achievement => !achievement.completed);
    
    return {
      completed,
      total,
      isComplete,
      nextAchievement,
      progressPercentage
    };
  }

  // Get all series completion statuses
  public getAllSeriesCompletions(
    achievements: Record<string, Achievement>,
    series: Record<string, AchievementSeries>
  ): Record<string, {
    completed: number;
    total: number;
    isComplete: boolean;
    nextAchievement?: Achievement;
    progressPercentage: number;
  }> {
    const seriesCompletions: Record<string, {
      completed: number;
      total: number;
      isComplete: boolean;
      nextAchievement?: Achievement;
      progressPercentage: number;
    }> = {};
    
    Object.values(series).forEach(seriesData => {
      seriesCompletions[seriesData.id] = this.getSeriesCompletion(achievements, seriesData);
    });
    
    return seriesCompletions;
  }

  // Check if series reward should be given
  public checkSeriesReward(
    achievements: Record<string, Achievement>,
    series: AchievementSeries
  ): { shouldGiveReward: boolean; reward?: AchievementSeries['seriesReward'] } {
    const completion = this.getSeriesCompletion(achievements, series);
    
    if (completion.isComplete && series.seriesReward) {
      return {
        shouldGiveReward: true,
        reward: series.seriesReward
      };
    }
    
    return { shouldGiveReward: false };
  }

  // Get achievements by series
  public getAchievementsBySeries(
    achievements: Record<string, Achievement>,
    seriesId: string
  ): Achievement[] {
    return Object.values(achievements).filter(achievement => 
      achievement.series === seriesId
    );
  }

  // Get series by category
  public getSeriesByCategory(
    series: Record<string, AchievementSeries>,
    category: Achievement['category']
  ): AchievementSeries[] {
    return Object.values(series).filter(seriesData => 
      seriesData.category === category
    );
  }

  // Get next achievement in series for display
  public getNextAchievementInSeries(
    achievements: Record<string, Achievement>,
    series: AchievementSeries
  ): { achievement?: Achievement; position: number; total: number } {
    const seriesAchievements = series.achievements
      .map(id => achievements[id])
      .filter(Boolean);
    
    const nextAchievement = seriesAchievements.find(achievement => !achievement.completed);
    const position = nextAchievement 
      ? seriesAchievements.indexOf(nextAchievement) + 1 
      : seriesAchievements.length;
    
    return {
      achievement: nextAchievement,
      position,
      total: seriesAchievements.length
    };
  }
} 