import type { PlayerProfile } from '../../models/gameTypes';

export class AchievementStatisticsManager {
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

  // Update multiple statistics at once
  public updateMultipleStatistics(
    profile: PlayerProfile,
    updates: Array<{
      statType: keyof PlayerProfile['statistics'];
      value: number;
      operation?: 'add' | 'set' | 'max';
    }>
  ): PlayerProfile {
    let updatedProfile = { ...profile };
    
    updates.forEach(({ statType, value, operation = 'add' }) => {
      updatedProfile = this.updateStatistics(updatedProfile, statType, value, operation);
    });
    
    return updatedProfile;
  }

  // Get statistics summary for display
  public getStatisticsSummary(profile: PlayerProfile): {
    totalPlaytime: string;
    averageWavesPerGame: number;
    completionRate: number;
    totalExperience: number;
  } {
    const stats = profile.statistics;
    
    // Format playtime
    const totalPlaytime = this.formatPlaytime(stats.totalPlaytime);
    
    // Calculate average waves per game
    const averageWavesPerGame = stats.gamesPlayed > 0 
      ? Math.round(stats.totalWavesCompleted / stats.gamesPlayed * 10) / 10 
      : 0;
    
    // Calculate completion rate (perfect waves / total waves)
    const completionRate = stats.totalWavesCompleted > 0 
      ? Math.round((stats.perfectWaves / stats.totalWavesCompleted) * 100) 
      : 0;
    
    return {
      totalPlaytime,
      averageWavesPerGame,
      completionRate,
      totalExperience: profile.experience
    };
  }

  // Format playtime in human readable format
  private formatPlaytime(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}s ${minutes}dk`;
    }
    return `${minutes}dk`;
  }

  // Check if a new record is achieved
  public checkForNewRecord(
    profile: PlayerProfile,
    statType: keyof PlayerProfile['statistics'],
    newValue: number
  ): { isNewRecord: boolean; previousRecord: number } {
    const currentValue = profile.statistics[statType] as number;
    const isNewRecord = newValue > currentValue;
    
    return {
      isNewRecord,
      previousRecord: currentValue
    };
  }
} 