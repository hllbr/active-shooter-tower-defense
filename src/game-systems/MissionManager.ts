import { useGameStore } from '../models/store';
// GameState import removed for production
// Logger import removed for production

/**
 * Sequential Mission Interface - Replaces DailyMission
 */
export interface SequentialMission {
  id: string;
  missionNumber: number; // 1-300
  name: string;
  description: string;
  category: 'combat' | 'economic' | 'survival' | 'exploration' | 'progression';
  objective: MissionObjective;
  reward: MissionReward;
  completed: boolean;
  progress: number;
  maxProgress: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'legendary';
  unlockCondition?: {
    type: 'wave' | 'mission' | 'achievement' | 'upgrade';
    value: number | string;
  };
  gameplayReward?: GameplayReward;
}

/**
 * Mission Objective Interface
 */
export interface MissionObjective {
  type: 'survive_waves' | 'kill_enemies' | 'build_towers' | 'earn_gold' | 'complete_upgrades' | 'use_abilities' | 'perfect_waves' | 'reach_wave' | 'upgrade_tower_level' | 'earn_experience';
  target: number;
  description: string;
  trackingKey: string;
}

/**
 * Mission Reward Interface
 */
export interface MissionReward {
  type: 'gold' | 'energy' | 'actions' | 'experience' | 'unlock' | 'upgrade' | 'gameplay_bonus';
  amount: number;
  description: string;
  special?: string;
}

/**
 * Real-time Gameplay Reward Interface
 */
export interface GameplayReward {
  type: 'multi_fire' | 'temporary_mines' | 'tower_repair' | 'damage_boost' | 'gold_bonus' | 'energy_bonus';
  duration: number; // milliseconds, 0 for permanent
  value: number;
  description: string;
  target?: 'all_towers' | 'specific_tower' | 'global';
}

/**
 * Mission Progress Update Result
 */
export interface MissionProgressResult {
  updatedMissions: SequentialMission[];
  newlyCompleted: SequentialMission[];
  gameplayRewards: GameplayReward[];
}

/**
 * MissionManager - Handles sequential mission progression and real-time rewards
 * Follows SOLID principles for maintainable and extensible code
 */
export class MissionManager {
  private static instance: MissionManager;
  private missions: SequentialMission[] = [];
  private currentMissionIndex: number = 0;
  private activeGameplayRewards: Map<string, { reward: GameplayReward; startTime: number }> = new Map();
  private isInitialized = false;

  private constructor() {}

  static getInstance(): MissionManager {
    if (!MissionManager.instance) {
      MissionManager.instance = new MissionManager();
    }
    return MissionManager.instance;
  }

  /**
   * Initialize the mission system with 300 sequential missions
   */
  initialize(): void {
    if (this.isInitialized) return;

    this.generateSequentialMissions();
    this.loadMissionProgress();
    this.isInitialized = true;

    // MissionManager initialized with 300 sequential missions
  }

  /**
   * Generate all 300 sequential missions
   */
  private generateSequentialMissions(): void {
    this.missions = [];

    // Generate missions 1-300 with progressive difficulty and rewards
    for (let i = 1; i <= 300; i++) {
      const mission = this.createMission(i);
      this.missions.push(mission);
    }

    // Generated sequential missions
  }

  /**
   * Create a mission based on its number (1-300)
   */
  private createMission(missionNumber: number): SequentialMission {
    const difficulty = this.getDifficultyForMission(missionNumber);
    const category = this.getCategoryForMission(missionNumber);
    const objective = this.createObjectiveForMission(missionNumber, difficulty);
    const reward = this.createRewardForMission(missionNumber, difficulty);
    const gameplayReward = this.createGameplayRewardForMission(missionNumber);

    return {
      id: `mission_${missionNumber.toString().padStart(3, '0')}`,
      missionNumber,
      name: this.generateMissionName(missionNumber, category),
      description: this.generateMissionDescription(missionNumber, objective),
      category,
      objective,
      reward,
      completed: false,
      progress: 0,
      maxProgress: objective.target,
      difficulty,
      unlockCondition: this.getUnlockCondition(missionNumber),
      gameplayReward
    };
  }

  /**
   * Get difficulty based on mission number
   */
  private getDifficultyForMission(missionNumber: number): 'easy' | 'medium' | 'hard' | 'expert' | 'legendary' {
    if (missionNumber <= 50) return 'easy';
    if (missionNumber <= 100) return 'medium';
    if (missionNumber <= 150) return 'hard';
    if (missionNumber <= 250) return 'expert';
    return 'legendary';
  }

  /**
   * Get category based on mission number
   */
  private getCategoryForMission(missionNumber: number): 'combat' | 'economic' | 'survival' | 'exploration' | 'progression' {
    const categories: Array<'combat' | 'economic' | 'survival' | 'exploration' | 'progression'> = [
      'combat', 'economic', 'survival', 'exploration', 'progression'
    ];
    return categories[missionNumber % categories.length];
  }

  /**
   * Create objective based on mission number and difficulty
   */
  private createObjectiveForMission(missionNumber: number, difficulty: string): MissionObjective {
    const objectives = [
      {
        type: 'survive_waves' as const,
        baseTarget: 5,
        multiplier: 2
      },
      {
        type: 'kill_enemies' as const,
        baseTarget: 20,
        multiplier: 5
      },
      {
        type: 'build_towers' as const,
        baseTarget: 3,
        multiplier: 1
      },
      {
        type: 'earn_gold' as const,
        baseTarget: 500,
        multiplier: 100
      },
      {
        type: 'complete_upgrades' as const,
        baseTarget: 2,
        multiplier: 1
      },
      {
        type: 'reach_wave' as const,
        baseTarget: 10,
        multiplier: 2
      },
      {
        type: 'upgrade_tower_level' as const,
        baseTarget: 5,
        multiplier: 1
      }
    ];

    const objective = objectives[missionNumber % objectives.length];
    const difficultyMultiplier = this.getDifficultyMultiplier(difficulty);
    const target = Math.floor(objective.baseTarget + (missionNumber * objective.multiplier * difficultyMultiplier));

    return {
      type: objective.type,
      target,
      description: this.getObjectiveDescription(objective.type, target),
      trackingKey: this.getTrackingKey(objective.type)
    };
  }

  /**
   * Get difficulty multiplier for scaling objectives
   */
  private getDifficultyMultiplier(difficulty: string): number {
    switch (difficulty) {
      case 'easy': return 0.5;
      case 'medium': return 1.0;
      case 'hard': return 1.5;
      case 'expert': return 2.0;
      case 'legendary': return 3.0;
      default: return 1.0;
    }
  }

  /**
   * Get objective description
   */
  private getObjectiveDescription(type: string, target: number): string {
    switch (type) {
      case 'survive_waves': return `${target} wave tamamla`;
      case 'kill_enemies': return `${target} düşman öldür`;
      case 'build_towers': return `${target} kule inşa et`;
      case 'earn_gold': return `${target} altın kazan`;
      case 'complete_upgrades': return `${target} yükseltme satın al`;
      case 'reach_wave': return `Wave ${target}'e ulaş`;
      case 'upgrade_tower_level': return `${target} kule seviyesi yükselt`;
      default: return `Hedef: ${target}`;
    }
  }

  /**
   * Get tracking key for objective
   */
  private getTrackingKey(type: string): string {
    switch (type) {
      case 'survive_waves': return 'wavesCompleted';
      case 'kill_enemies': return 'totalEnemiesKilled';
      case 'build_towers': return 'totalTowersBuilt';
      case 'earn_gold': return 'totalGoldEarned';
      case 'complete_upgrades': return 'totalUpgradesPurchased';
      case 'reach_wave': return 'currentWave';
      case 'upgrade_tower_level': return 'totalTowerUpgrades';
      default: return 'progress';
    }
  }

  /**
   * Create reward based on mission number and difficulty
   */
  private createRewardForMission(missionNumber: number, _difficulty: string): MissionReward {
    const baseGold = 100 + (missionNumber * 10);
    const baseEnergy = 20 + (missionNumber * 2);
    const baseActions = 1 + Math.floor(missionNumber / 10);

    // Special rewards for milestone missions
    if (missionNumber % 25 === 0) {
      return {
        type: 'unlock',
        amount: 1,
        description: 'Özel Kilit Açma',
        special: `milestone_${missionNumber}`
      };
    }

    // Regular rewards based on category
    const rewardTypes: Array<'gold' | 'energy' | 'actions' | 'experience'> = ['gold', 'energy', 'actions', 'experience'];
    const rewardType = rewardTypes[missionNumber % rewardTypes.length];

    switch (rewardType) {
      case 'gold':
        return {
          type: 'gold',
          amount: baseGold,
          description: `+${baseGold} Altın`
        };
      case 'energy':
        return {
          type: 'energy',
          amount: baseEnergy,
          description: `+${baseEnergy} Enerji`
        };
      case 'actions':
        return {
          type: 'actions',
          amount: baseActions,
          description: `+${baseActions} Aksiyon`
        };
      case 'experience':
        return {
          type: 'experience',
          amount: missionNumber * 10,
          description: `+${missionNumber * 10} Deneyim`
        };
      default:
        return {
          type: 'gold',
          amount: baseGold,
          description: `+${baseGold} Altın`
        };
    }
  }

  /**
   * Create gameplay reward for mission
   */
  private createGameplayRewardForMission(missionNumber: number): GameplayReward | undefined {
    // Only provide gameplay rewards for certain missions
    if (missionNumber % 10 === 0) {
      const rewards: GameplayReward[] = [
        {
          type: 'multi_fire',
          duration: 30000, // 30 seconds
          value: 3,
          description: 'Tüm kuleler için 3 mermi atışı',
          target: 'all_towers'
        },
        {
          type: 'temporary_mines',
          duration: 45000, // 45 seconds
          value: 5,
          description: '5 geçici mayın',
          target: 'global'
        },
        {
          type: 'tower_repair',
          duration: 0, // Permanent
          value: 100,
          description: 'Tüm kuleleri tamir et',
          target: 'all_towers'
        },
        {
          type: 'damage_boost',
          duration: 60000, // 60 seconds
          value: 1.5,
          description: '%50 hasar artışı',
          target: 'all_towers'
        }
      ];

      return rewards[missionNumber % rewards.length];
    }

    return undefined;
  }

  /**
   * Generate mission name
   */
  private generateMissionName(missionNumber: number, category: string): string {
    const prefixes = {
      combat: ['Savaşçı', 'Komutan', 'Elit', 'Kahraman', 'Savaş'],
      economic: ['Tüccar', 'Ekonomist', 'Altın', 'Zengin', 'Ticaret'],
      survival: ['Hayatta Kalma', 'Dayanıklılık', 'Sürdürülebilirlik', 'Güç', 'İrade'],
      exploration: ['Kaşif', 'Araştırmacı', 'Keşif', 'Macera', 'Bilinmeyen'],
      progression: ['İlerleme', 'Gelişim', 'Yükseliş', 'Evrim', 'Dönüşüm']
    };

    const prefix = prefixes[category][missionNumber % prefixes[category].length];
    return `${prefix} ${missionNumber}`;
  }

  /**
   * Generate mission description
   */
  private generateMissionDescription(missionNumber: number, objective: MissionObjective): string {
    return objective.description;
  }

  /**
   * Get unlock condition for mission
   */
  private getUnlockCondition(missionNumber: number): { type: 'wave' | 'mission' | 'achievement' | 'upgrade'; value: number | string } | undefined {
    if (missionNumber === 1) return undefined; // First mission is always available

    // Missions unlock based on previous mission completion
    return {
      type: 'mission',
      value: missionNumber - 1
    };
  }

  /**
   * Load mission progress from store
   */
  private loadMissionProgress(): void {
    const state = useGameStore.getState();
    const completedMissions = state.completedMissions || [];

    // Update mission completion status
    this.missions.forEach(mission => {
      mission.completed = completedMissions.includes(mission.id);
      if (mission.completed) {
        mission.progress = mission.maxProgress;
      }
    });

    // Find current mission index
    this.currentMissionIndex = this.missions.findIndex(m => !m.completed);
    if (this.currentMissionIndex === -1) {
      this.currentMissionIndex = this.missions.length - 1; // All missions completed
    }

    // Loaded mission progress
  }

  /**
   * Update mission progress based on game events
   */
  updateMissionProgress(
    eventType: string,
    eventData?: { amount?: number; perfectWave?: boolean; waveNumber?: number }
  ): MissionProgressResult {
    const result: MissionProgressResult = {
      updatedMissions: [...this.missions],
      newlyCompleted: [],
      gameplayRewards: []
    };

    // Update progress for all active missions
    this.missions.forEach((mission, index) => {
      if (mission.completed) return;

      let progressIncrease = 0;

      switch (mission.objective.type) {
        case 'survive_waves':
          if (eventType === 'wave_completed') {
            progressIncrease = 1;
          }
          break;

        case 'kill_enemies':
          if (eventType === 'enemy_killed') {
            progressIncrease = 1;
          }
          break;

        case 'build_towers':
          if (eventType === 'tower_built') {
            progressIncrease = 1;
          }
          break;

        case 'earn_gold':
          if (eventType === 'gold_earned') {
            progressIncrease = eventData?.amount || 0;
          }
          break;

        case 'complete_upgrades':
          if (eventType === 'upgrade_purchased') {
            progressIncrease = 1;
          }
          break;

        case 'reach_wave':
          if (eventType === 'wave_completed' && eventData?.waveNumber) {
            progressIncrease = eventData.waveNumber;
          }
          break;

        case 'upgrade_tower_level':
          if (eventType === 'tower_upgraded') {
            progressIncrease = 1;
          }
          break;
      }

      if (progressIncrease > 0) {
        const _oldProgress = mission.progress;
        mission.progress = Math.min(mission.maxProgress, mission.progress + progressIncrease);
        
        if (mission.progress >= mission.maxProgress && !mission.completed) {
          mission.completed = true;
          result.newlyCompleted.push(mission);
          
          // Apply gameplay reward if available
          if (mission.gameplayReward) {
            result.gameplayRewards.push(mission.gameplayReward);
            this.activateGameplayReward(mission.gameplayReward);
          }

          // Update current mission index
          if (index === this.currentMissionIndex) {
            this.currentMissionIndex = this.findNextAvailableMission();
          }
        }
      }
    });

    // Save progress to store
    this.saveMissionProgress();

    return result;
  }

  /**
   * Find next available mission
   */
  private findNextAvailableMission(): number {
    for (let i = this.currentMissionIndex + 1; i < this.missions.length; i++) {
      if (!this.missions[i].completed) {
        return i;
      }
    }
    return this.missions.length - 1; // All missions completed
  }

  /**
   * Activate gameplay reward
   */
  private activateGameplayReward(reward: GameplayReward): void {
    const rewardId = `${reward.type}_${Date.now()}`;
    
    this.activeGameplayRewards.set(rewardId, {
      reward,
      startTime: Date.now()
    });

    // Apply reward effects
    this.applyGameplayReward(reward);

    // Activated gameplay reward

    // Remove temporary rewards after duration
    if (reward.duration > 0) {
      setTimeout(() => {
        this.deactivateGameplayReward(rewardId);
      }, reward.duration);
    }
  }

  /**
   * Apply gameplay reward effects
   */
  private applyGameplayReward(reward: GameplayReward): void {
    const state = useGameStore.getState();

    switch (reward.type) {
      case 'multi_fire':
        // Apply multi-fire to all towers
        if (reward.target === 'all_towers') {
          state.towerSlots.forEach(slot => {
            if (slot.tower) {
              slot.tower.multiShotCount = reward.value;
            }
          });
        }
        break;

      case 'tower_repair':
        // Repair all towers
        if (reward.target === 'all_towers') {
          state.towerSlots.forEach(slot => {
            if (slot.tower) {
              slot.tower.health = slot.tower.maxHealth;
            }
          });
        }
        break;

      case 'damage_boost':
        // Apply damage boost to all towers
        if (reward.target === 'all_towers') {
          state.towerSlots.forEach(slot => {
            if (slot.tower) {
              slot.tower.damage *= reward.value;
            }
          });
        }
        break;

      case 'temporary_mines':
        // Add temporary mines (handled by mine system)
        // This would integrate with the existing mine system
        break;
    }
  }

  /**
   * Deactivate gameplay reward
   */
  private deactivateGameplayReward(rewardId: string): void {
    const rewardData = this.activeGameplayRewards.get(rewardId);
    if (!rewardData) return;

    const { reward } = rewardData;
    this.activeGameplayRewards.delete(rewardId);

    // Remove reward effects
    this.removeGameplayReward(reward);

    // Deactivated gameplay reward
  }

  /**
   * Remove gameplay reward effects
   */
  private removeGameplayReward(reward: GameplayReward): void {
    const state = useGameStore.getState();

    switch (reward.type) {
      case 'multi_fire':
        // Reset multi-fire for all towers
        if (reward.target === 'all_towers') {
          state.towerSlots.forEach(slot => {
            if (slot.tower) {
              slot.tower.multiShotCount = 1; // Reset to default
            }
          });
        }
        break;

      case 'damage_boost':
        // Remove damage boost from all towers
        if (reward.target === 'all_towers') {
          state.towerSlots.forEach(slot => {
            if (slot.tower) {
              slot.tower.damage /= reward.value; // Reverse the boost
            }
          });
        }
        break;
    }
  }

  /**
   * Save mission progress to store
   */
  private saveMissionProgress(): void {
    const completedMissionIds = this.missions
      .filter(m => m.completed)
      .map(m => m.id);

    useGameStore.setState({
      completedMissions: completedMissionIds
    });
  }

  /**
   * Get current mission
   */
  getCurrentMission(): SequentialMission | null {
    if (this.currentMissionIndex >= 0 && this.currentMissionIndex < this.missions.length) {
      return this.missions[this.currentMissionIndex];
    }
    return null;
  }

  /**
   * Get available missions (unlocked and not completed)
   */
  getAvailableMissions(): SequentialMission[] {
    return this.missions.filter(mission => {
      if (mission.completed) return false;
      
      // Check unlock condition
      if (mission.unlockCondition) {
        switch (mission.unlockCondition.type) {
          case 'mission':
            const requiredMission = this.missions.find(m => m.missionNumber === mission.unlockCondition!.value);
            return requiredMission?.completed || false;
          case 'wave':
            const currentWave = useGameStore.getState().currentWave;
            return currentWave >= (mission.unlockCondition.value as number);
          default:
            return true;
        }
      }
      
      return true;
    });
  }

  /**
   * Get mission by number
   */
  getMissionByNumber(missionNumber: number): SequentialMission | null {
    return this.missions.find(m => m.missionNumber === missionNumber) || null;
  }

  /**
   * Get mission progress percentage
   */
  getMissionProgress(): number {
    const completed = this.missions.filter(m => m.completed).length;
    return (completed / this.missions.length) * 100;
  }

  /**
   * Get active gameplay rewards
   */
  getActiveGameplayRewards(): GameplayReward[] {
    return Array.from(this.activeGameplayRewards.values()).map(data => data.reward);
  }

  /**
   * Reset mission progress (for testing)
   */
  resetProgress(): void {
    this.missions.forEach(mission => {
      mission.completed = false;
      mission.progress = 0;
    });
    this.currentMissionIndex = 0;
    this.activeGameplayRewards.clear();
    this.saveMissionProgress();
  }
}

// Export singleton instance
export const missionManager = MissionManager.getInstance(); 