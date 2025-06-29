import type { Achievement, PlayerProfile } from '../../models/gameTypes';

export class AchievementRewardManager {
  // Apply achievement reward to player profile
  public applyAchievementReward(achievement: Achievement, profile: PlayerProfile): PlayerProfile {
    const updatedProfile = { ...profile };
    const reward = achievement.rewards;
    
    switch (reward.type) {
      case 'research_points':
        updatedProfile.researchPoints += reward.value;
        break;
        
      case 'title':
        if (!updatedProfile.unlockedTitles.includes(reward.name)) {
          updatedProfile.unlockedTitles.push(reward.name);
        }
        break;
        
      case 'bonus':
        if (reward.permanent) {
          updatedProfile.permanentBonuses[achievement.id] = reward.value;
        }
        break;
        
      case 'cosmetic':
        if (!updatedProfile.unlockedCosmetics.includes(reward.name)) {
          updatedProfile.unlockedCosmetics.push(reward.name);
        }
        break;
        
      case 'unlock':
        // Handle special unlocks (like prestige system)
        break;
    }

    return updatedProfile;
  }

  // Get achievement points based on rarity
  public getAchievementPoints(achievement: Achievement): number {
    switch (achievement.rarity) {
      case 'common': return 10;
      case 'rare': return 25;
      case 'epic': return 50;
      case 'legendary': return 100;
      default: return 10;
    }
  }

  // Get experience reward based on rarity
  public getExperienceReward(achievement: Achievement): number {
    switch (achievement.rarity) {
      case 'common': return 50;
      case 'rare': return 150;
      case 'epic': return 400;
      case 'legendary': return 1000;
      default: return 50;
    }
  }

  // Check if player levels up and apply level up rewards
  public checkLevelUp(profile: PlayerProfile): PlayerProfile {
    const updatedProfile = { ...profile };
    
    while (updatedProfile.experience >= updatedProfile.experienceToNext) {
      updatedProfile.experience -= updatedProfile.experienceToNext;
      updatedProfile.level++;
      updatedProfile.experienceToNext = this.calculateExperienceToNext(updatedProfile.level);
      
      // Level up rewards
      updatedProfile.researchPoints += updatedProfile.level * 10; // 10 research points per level
    }

    return updatedProfile;
  }

  // Calculate experience needed for next level
  private calculateExperienceToNext(level: number): number {
    return Math.floor(1000 * Math.pow(1.15, level - 1));
  }

  // Process achievement completion and apply all rewards
  public processAchievementCompletion(
    achievement: Achievement, 
    profile: PlayerProfile
  ): PlayerProfile {
    let updatedProfile = { ...profile };
    
    // Apply achievement reward
    updatedProfile = this.applyAchievementReward(achievement, updatedProfile);
    
    // Update profile stats
    updatedProfile.achievementsCompleted++;
    updatedProfile.achievementPoints += this.getAchievementPoints(achievement);
    updatedProfile.experience += this.getExperienceReward(achievement);
    
    // Check for level up
    updatedProfile = this.checkLevelUp(updatedProfile);
    
    return updatedProfile;
  }
} 