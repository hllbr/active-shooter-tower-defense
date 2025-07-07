/**
 * ⭐ Prestige & Legacy System Manager
 * Issue #63: Yeni Oyun Mekanikleri - Meta-Progression
 */

import type { 
  PlayerProfile,
  LegacyBonus,
  PrestigeReward
} from '../../models/gameTypes';

export interface PrestigeData {
  prestigeLevel: number;
  prestigePoints: number;
  totalPrestiges: number;
  lastPrestigeTime: number;
  
  // Legacy bonuses (permanent)
  legacyBonuses: LegacyBonus[];
  
  // Prestige rewards
  prestigeRewards: PrestigeReward[];
  
  // Reset requirements
  resetRequirements: {
    minWave: number;
    minPlaytime: number;
    achievementsRequired: string[];
  };
}

export class PrestigeManager {
  private static instance: PrestigeManager;
  private prestigeData!: PrestigeData;

  private constructor() {
    this.initializePrestigeSystem();
  }

  public static getInstance(): PrestigeManager {
    if (!PrestigeManager.instance) {
      PrestigeManager.instance = new PrestigeManager();
    }
    return PrestigeManager.instance;
  }

  /**
   * Initialize prestige system
   */
  private initializePrestigeSystem(): void {
    this.prestigeData = {
      prestigeLevel: 0,
      prestigePoints: 0,
      totalPrestiges: 0,
      lastPrestigeTime: 0,
      
      legacyBonuses: [
        {
          type: 'damage_multiplier',
          value: 0.1,
          description: '+10% damage from prestige',
          permanent: true
        },
        {
          type: 'gold_bonus',
          value: 0.15,
          description: '+15% gold earnings from prestige',
          permanent: true
        },
        {
          type: 'energy_efficiency',
          value: 0.2,
          description: '+20% energy efficiency from prestige',
          permanent: true
        },
        {
          type: 'research_speed',
          value: 0.25,
          description: '+25% research speed from prestige',
          permanent: true
        }
      ],
      
      prestigeRewards: [
        {
          level: 1,
          rewards: {
            cosmetics: ['prestige_1_badge'],
            titles: ['Prestige Initiate'],
            specialAbilities: ['prestige_1_ability']
          }
        },
        {
          level: 5,
          rewards: {
            cosmetics: ['prestige_5_skin'],
            titles: ['Prestige Master'],
            specialAbilities: ['prestige_5_ability']
          }
        },
        {
          level: 10,
          rewards: {
            cosmetics: ['prestige_10_aura'],
            titles: ['Prestige Legend'],
            specialAbilities: ['prestige_10_ability']
          }
        },
        {
          level: 25,
          rewards: {
            cosmetics: ['prestige_25_effect'],
            titles: ['Prestige Immortal'],
            specialAbilities: ['prestige_25_ability']
          }
        },
        {
          level: 50,
          rewards: {
            cosmetics: ['prestige_50_ascension'],
            titles: ['Prestige God'],
            specialAbilities: ['godlike_ascension']
          }
        }
      ],
      
      resetRequirements: {
        minWave: 25,
        minPlaytime: 3600000, // 1 hour in milliseconds
        achievementsRequired: ['wave_survivor_25', 'tower_master_100']
      }
    };
  }

  /**
   * Check if player can prestige
   */
  public canPrestige(playerProfile: PlayerProfile, gameState: {
    currentWave: number;
    gameStartTime: number;
    achievements: Record<string, { id: string; completed: boolean }>;
    playerProfile: PlayerProfile;
    towers: { level: number }[];
  }): boolean {
    // Check wave requirement
    if (gameState.currentWave < this.prestigeData.resetRequirements.minWave) {
      return false;
    }

    // Check playtime requirement
    const playtime = Date.now() - gameState.gameStartTime;
    if (playtime < this.prestigeData.resetRequirements.minPlaytime) {
      return false;
    }

    // Check achievements requirement
    const requiredAchievements = this.prestigeData.resetRequirements.achievementsRequired;
    const completedAchievements = Object.values(gameState.achievements)
      .filter((achievement) => achievement.completed)
      .map((achievement) => achievement.id);

    for (const requiredAchievement of requiredAchievements) {
      if (!completedAchievements.includes(requiredAchievement)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Perform prestige reset
   */
  public performPrestige(
    playerProfile: PlayerProfile,
    gameState: {
      currentWave: number;
      gameStartTime: number;
      achievements: Record<string, { id: string; completed: boolean }>;
      playerProfile: PlayerProfile;
      towers: { level: number }[];
    }
  ): {
    success: boolean;
    prestigePoints: number;
    legacyBonuses: LegacyBonus[];
    newRewards: PrestigeReward[];
  } {
    if (!this.canPrestige(playerProfile, gameState)) {
      return {
        success: false,
        prestigePoints: 0,
        legacyBonuses: [],
        newRewards: []
      };
    }

    // Calculate prestige points based on performance
    const prestigePoints = this.calculatePrestigePoints(gameState);
    
    // Update prestige data
    this.prestigeData.prestigeLevel++;
    this.prestigeData.prestigePoints += prestigePoints;
    this.prestigeData.totalPrestiges++;
    this.prestigeData.lastPrestigeTime = Date.now();

    // Apply legacy bonuses
    const legacyBonuses = this.applyLegacyBonuses();

    // Get new rewards for this prestige level
    const newRewards = this.getPrestigeRewards(this.prestigeData.prestigeLevel);

    return {
      success: true,
      prestigePoints,
      legacyBonuses,
      newRewards
    };
  }

  /**
   * Calculate prestige points based on game performance
   */
  private calculatePrestigePoints(gameState: {
    currentWave: number;
    gameStartTime: number;
    achievements: Record<string, { id: string; completed: boolean }>;
    playerProfile: PlayerProfile;
    towers: { level: number }[];
  }): number {
    let points = 0;

    // Base points for reaching minimum wave
    points += Math.floor(gameState.currentWave / 10) * 10;

    // Bonus points for achievements
    const completedAchievements = Object.values(gameState.achievements)
      .filter((achievement) => achievement.completed).length;
    points += completedAchievements * 5;

    // Bonus points for perfect waves
    points += (gameState.playerProfile.statistics?.perfectWaves || 0) * 2;

    // Bonus points for total playtime
    const playtimeHours = (Date.now() - gameState.gameStartTime) / (1000 * 60 * 60);
    points += Math.floor(playtimeHours) * 3;

    // Bonus points for high tower levels
    const maxTowerLevel = Math.max(...(gameState.towers?.map((tower) => tower.level) || [0]));
    points += maxTowerLevel * 2;

    return Math.max(10, points); // Minimum 10 points
  }

  /**
   * Apply legacy bonuses to player
   */
  private applyLegacyBonuses(): LegacyBonus[] {
    const appliedBonuses: LegacyBonus[] = [];
    
    for (const bonus of this.prestigeData.legacyBonuses) {
      // Apply bonus based on prestige level
      const bonusValue = bonus.value * this.prestigeData.prestigeLevel;
      appliedBonuses.push({
        ...bonus,
        value: bonusValue,
        description: bonus.description.replace(/\+(\d+)%/, `+${Math.round(bonusValue * 100)}%`)
      });
    }

    return appliedBonuses;
  }

  /**
   * Get prestige rewards for a specific level
   */
  public getPrestigeRewards(level: number): PrestigeReward[] {
    return this.prestigeData.prestigeRewards.filter(reward => reward.level === level);
  }

  /**
   * Get all available prestige rewards
   */
  public getAllPrestigeRewards(): PrestigeReward[] {
    return this.prestigeData.prestigeRewards.filter(reward => 
      reward.level <= this.prestigeData.prestigeLevel
    );
  }

  /**
   * Get prestige statistics
   */
  public getPrestigeStats(): {
    currentLevel: number;
    totalPrestiges: number;
    prestigePoints: number;
    nextLevelRequirement: number;
    legacyBonuses: LegacyBonus[];
  } {
    const nextLevelRequirement = this.calculateNextLevelRequirement();

    return {
      currentLevel: this.prestigeData.prestigeLevel,
      totalPrestiges: this.prestigeData.totalPrestiges,
      prestigePoints: this.prestigeData.prestigePoints,
      nextLevelRequirement,
      legacyBonuses: this.prestigeData.legacyBonuses
    };
  }

  /**
   * Calculate requirement for next prestige level
   */
  private calculateNextLevelRequirement(): number {
    const baseRequirement = 25;
    const levelMultiplier = Math.pow(1.5, this.prestigeData.prestigeLevel);
    return Math.floor(baseRequirement * levelMultiplier);
  }

  /**
   * Get prestige multiplier for various game aspects
   */
  public getPrestigeMultipliers(): {
    damage: number;
    gold: number;
    energy: number;
    research: number;
    experience: number;
  } {
    const level = this.prestigeData.prestigeLevel;
    
    return {
      damage: 1 + (level * 0.1), // +10% per level
      gold: 1 + (level * 0.15), // +15% per level
      energy: 1 + (level * 0.2), // +20% per level
      research: 1 + (level * 0.25), // +25% per level
      experience: 1 + (level * 0.3) // +30% per level
    };
  }

  /**
   * Check if player has unlocked specific prestige features
   */
  public hasUnlockedFeature(featureId: string): boolean {
    const featureUnlocks: Record<string, number> = {
      'prestige_shop': 1,
      'legacy_abilities': 5,
      'ascension_mode': 10,
      'divine_powers': 25,
      'godlike_ascension': 50
    };

    const requiredLevel = featureUnlocks[featureId];
    return requiredLevel ? this.prestigeData.prestigeLevel >= requiredLevel : false;
  }

  /**
   * Get prestige progression information
   */
  public getPrestigeProgression(gameState: {
    currentWave: number;
    gameStartTime: number;
    achievements: Record<string, { id: string; completed: boolean }>;
    playerProfile: PlayerProfile;
    towers: { level: number }[];
  }): {
    canPrestige: boolean;
    requirements: {
      wave: { current: number; required: number; met: boolean };
      playtime: { current: number; required: number; met: boolean };
      achievements: { current: number; required: number; met: boolean };
    };
    estimatedPrestigePoints: number;
  } {
    const playtime = Date.now() - gameState.gameStartTime;
    const completedAchievements = Object.values(gameState.achievements)
      .filter((achievement) => achievement.completed).length;

    return {
      canPrestige: this.canPrestige(gameState.playerProfile, gameState),
      requirements: {
        wave: {
          current: gameState.currentWave,
          required: this.prestigeData.resetRequirements.minWave,
          met: gameState.currentWave >= this.prestigeData.resetRequirements.minWave
        },
        playtime: {
          current: playtime,
          required: this.prestigeData.resetRequirements.minPlaytime,
          met: playtime >= this.prestigeData.resetRequirements.minPlaytime
        },
        achievements: {
          current: completedAchievements,
          required: this.prestigeData.resetRequirements.achievementsRequired.length,
          met: completedAchievements >= this.prestigeData.resetRequirements.achievementsRequired.length
        }
      },
      estimatedPrestigePoints: this.calculatePrestigePoints(gameState)
    };
  }
} 