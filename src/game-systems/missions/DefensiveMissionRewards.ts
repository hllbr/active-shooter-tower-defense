/**
 * 🛡️ Defensive Mission Rewards System
 * Links trench and wall upgrades to mission rewards with synchronization
 */

import { useGameStore } from '../../models/store';
import { towerDurabilityBalancer } from '../tower-system/TowerDurabilityBalancer';

export interface DefensiveMissionReward {
  id: string;
  type: 'trench_upgrade' | 'wall_upgrade' | 'defensive_bonus' | 'durability_boost';
  target: 'trench' | 'wall' | 'tower' | 'global';
  value: number;
  description: string;
  missionRequirement: string;
  isActive: boolean;
  duration?: number; // For temporary bonuses
  startTime?: number;
}

export interface DefensiveMission {
  id: string;
  name: string;
  description: string;
  objective: {
    type: 'upgrade_walls' | 'upgrade_trenches' | 'kill_in_trenches' | 'survive_with_walls' | 'defensive_mastery';
    target: number;
    current: number;
  };
  reward: DefensiveMissionReward;
  completed: boolean;
  progress: number;
  maxProgress: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: 'defensive' | 'upgrade' | 'survival' | 'mastery';
}

export class DefensiveMissionRewards {
  private static instance: DefensiveMissionRewards;
  private activeRewards: Map<string, DefensiveMissionReward>;
  private missions: DefensiveMission[];
  private rewardEffects: Map<string, { type: string; value: number; duration?: number }>;

  private constructor() {
    this.activeRewards = new Map();
    this.rewardEffects = new Map();
    this.missions = this.generateDefensiveMissions();
  }

  public static getInstance(): DefensiveMissionRewards {
    if (!DefensiveMissionRewards.instance) {
      DefensiveMissionRewards.instance = new DefensiveMissionRewards();
    }
    return DefensiveMissionRewards.instance;
  }

  /**
   * Generate defensive missions with rewards
   */
  private generateDefensiveMissions(): DefensiveMission[] {
    const missions: DefensiveMission[] = [
      // Trench-related missions
      {
        id: 'trench_upgrade_1',
        name: 'Trench Warfare Basics',
        description: 'Upgrade 3 trenches to level 1',
        objective: {
          type: 'upgrade_trenches',
          target: 3,
          current: 0
        },
        reward: {
          id: 'trench_slow_bonus_1',
          type: 'defensive_bonus',
          target: 'trench',
          value: 5, // +5% slow bonus
          description: '+5% trench slow bonus',
          missionRequirement: 'trench_upgrade_1',
          isActive: false
        },
        completed: false,
        progress: 0,
        maxProgress: 3,
        difficulty: 'easy',
        category: 'defensive'
      },
      {
        id: 'trench_mastery',
        name: 'Trench Master',
        description: 'Kill 50 enemies in trenches',
        objective: {
          type: 'kill_in_trenches',
          target: 50,
          current: 0
        },
        reward: {
          id: 'trench_slow_bonus_2',
          type: 'defensive_bonus',
          target: 'trench',
          value: 10, // +10% slow bonus
          description: '+10% trench slow bonus',
          missionRequirement: 'trench_mastery',
          isActive: false
        },
        completed: false,
        progress: 0,
        maxProgress: 50,
        difficulty: 'medium',
        category: 'mastery'
      },
      {
        id: 'trench_expert',
        name: 'Trench Expert',
        description: 'Upgrade 5 trenches to level 3',
        objective: {
          type: 'upgrade_trenches',
          target: 5,
          current: 0
        },
        reward: {
          id: 'trench_micro_stun',
          type: 'defensive_bonus',
          target: 'trench',
          value: 500, // +500ms micro-stun duration
          description: '+500ms micro-stun duration for all trenches',
          missionRequirement: 'trench_expert',
          isActive: false
        },
        completed: false,
        progress: 0,
        maxProgress: 5,
        difficulty: 'hard',
        category: 'upgrade'
      },

      // Wall-related missions
      {
        id: 'wall_upgrade_1',
        name: 'Wall Builder',
        description: 'Upgrade 5 walls to level 1',
        objective: {
          type: 'upgrade_walls',
          target: 5,
          current: 0
        },
        reward: {
          id: 'wall_hp_bonus_1',
          type: 'defensive_bonus',
          target: 'wall',
          value: 10, // +10% wall HP bonus
          description: '+10% wall HP bonus',
          missionRequirement: 'wall_upgrade_1',
          isActive: false
        },
        completed: false,
        progress: 0,
        maxProgress: 5,
        difficulty: 'easy',
        category: 'defensive'
      },
      {
        id: 'wall_survivor',
        name: 'Wall Survivor',
        description: 'Survive 10 waves with walls intact',
        objective: {
          type: 'survive_with_walls',
          target: 10,
          current: 0
        },
        reward: {
          id: 'wall_hp_bonus_2',
          type: 'defensive_bonus',
          target: 'wall',
          value: 15, // +15% wall HP bonus
          description: '+15% wall HP bonus',
          missionRequirement: 'wall_survivor',
          isActive: false
        },
        completed: false,
        progress: 0,
        maxProgress: 10,
        difficulty: 'medium',
        category: 'survival'
      },
      {
        id: 'wall_master',
        name: 'Wall Master',
        description: 'Upgrade 8 walls to level 3',
        objective: {
          type: 'upgrade_walls',
          target: 8,
          current: 0
        },
        reward: {
          id: 'wall_regeneration',
          type: 'defensive_bonus',
          target: 'wall',
          value: 5, // +5 HP regeneration per second
          description: 'Walls regenerate 5 HP per second',
          missionRequirement: 'wall_master',
          isActive: false
        },
        completed: false,
        progress: 0,
        maxProgress: 8,
        difficulty: 'expert',
        category: 'upgrade'
      },

      // Defensive mastery missions
      {
        id: 'defensive_mastery_1',
        name: 'Defensive Novice',
        description: 'Complete 5 defensive missions',
        objective: {
          type: 'defensive_mastery',
          target: 5,
          current: 0
        },
        reward: {
          id: 'tower_durability_boost_1',
          type: 'durability_boost',
          target: 'tower',
          value: 10, // +10% tower durability
          description: '+10% tower durability',
          missionRequirement: 'defensive_mastery_1',
          isActive: false
        },
        completed: false,
        progress: 0,
        maxProgress: 5,
        difficulty: 'medium',
        category: 'mastery'
      },
      {
        id: 'defensive_mastery_2',
        name: 'Defensive Expert',
        description: 'Complete 15 defensive missions',
        objective: {
          type: 'defensive_mastery',
          target: 15,
          current: 0
        },
        reward: {
          id: 'tower_durability_boost_2',
          type: 'durability_boost',
          target: 'tower',
          value: 20, // +20% tower durability
          description: '+20% tower durability',
          missionRequirement: 'defensive_mastery_2',
          isActive: false
        },
        completed: false,
        progress: 0,
        maxProgress: 15,
        difficulty: 'hard',
        category: 'mastery'
      },
      {
        id: 'defensive_mastery_3',
        name: 'Defensive Legend',
        description: 'Complete 30 defensive missions',
        objective: {
          type: 'defensive_mastery',
          target: 30,
          current: 0
        },
        reward: {
          id: 'global_defensive_aura',
          type: 'defensive_bonus',
          target: 'global',
          value: 25, // +25% global defensive bonus
          description: '+25% global defensive bonus',
          missionRequirement: 'defensive_mastery_3',
          isActive: false
        },
        completed: false,
        progress: 0,
        maxProgress: 30,
        difficulty: 'expert',
        category: 'mastery'
      }
    ];

    return missions;
  }

  /**
   * Update mission progress based on game events
   */
  updateMissionProgress(
    eventType: string,
    _eventData?: { 
      trenchLevel?: number; 
      wallLevel?: number; 
      enemyType?: string;
      waveNumber?: number;
    }
  ): DefensiveMission[] {
    const updatedMissions: DefensiveMission[] = [];

    this.missions.forEach(mission => {
      if (mission.completed) {
        updatedMissions.push(mission);
        return;
      }

      let progressIncrease = 0;

      switch (mission.objective.type) {
        case 'upgrade_trenches':
          if (eventType === 'trench_upgraded') {
            progressIncrease = 1;
          }
          break;

        case 'upgrade_walls':
          if (eventType === 'wall_upgraded') {
            progressIncrease = 1;
          }
          break;

        case 'kill_in_trenches':
          if (eventType === 'enemy_killed_in_trench') {
            progressIncrease = 1;
          }
          break;

        case 'survive_with_walls':
          if (eventType === 'wave_completed_with_walls') {
            progressIncrease = 1;
          }
          break;

        case 'defensive_mastery':
          if (eventType === 'defensive_mission_completed') {
            progressIncrease = 1;
          }
          break;
      }

      if (progressIncrease > 0) {
        mission.progress = Math.min(mission.maxProgress, mission.progress + progressIncrease);
        
        if (mission.progress >= mission.maxProgress && !mission.completed) {
          mission.completed = true;
          this.activateMissionReward(mission.reward);
        }
      }

      updatedMissions.push(mission);
    });

    this.missions = updatedMissions;
    this.saveMissionProgress();
    
    return updatedMissions;
  }

  /**
   * Activate mission reward
   */
  private activateMissionReward(reward: DefensiveMissionReward): void {
    reward.isActive = true;
    reward.startTime = performance.now();
    this.activeRewards.set(reward.id, reward);

    // Apply reward effects
    this.applyRewardEffect(reward);

    // Show notification
    this.showRewardNotification(reward);

    // Update mission progress for mastery missions
    if (reward.type === 'defensive_bonus' || reward.type === 'durability_boost') {
      this.updateMissionProgress('defensive_mission_completed');
    }
  }

  /**
   * Apply reward effect to game systems
   */
  private applyRewardEffect(reward: DefensiveMissionReward): void {
    switch (reward.type) {
      case 'defensive_bonus':
        this.applyDefensiveBonus(reward);
        break;

      case 'durability_boost':
        this.applyDurabilityBoost(reward);
        break;

      case 'trench_upgrade':
        this.applyTrenchUpgrade(reward);
        break;

      case 'wall_upgrade':
        this.applyWallUpgrade(reward);
        break;
    }

    // Store effect for later removal
    this.rewardEffects.set(reward.id, {
      type: reward.type,
      target: reward.target,
      value: reward.value,
      startTime: reward.startTime
    });
  }

  /**
   * Apply defensive bonus
   */
  private applyDefensiveBonus(reward: DefensiveMissionReward): void {
    switch (reward.target) {
      case 'trench':
        // Apply trench slow bonus
        this.applyTrenchSlowBonus(reward.value);
        break;

      case 'wall':
        // Apply wall HP bonus
        this.applyWallHPBonus(reward.value);
        break;

      case 'global':
        // Apply global defensive bonus
        this.applyGlobalDefensiveBonus(reward.value);
        break;
    }
  }

  /**
   * Apply durability boost
   */
  private applyDurabilityBoost(reward: DefensiveMissionReward): void {
    if (reward.target === 'tower') {
      // Apply tower durability boost
      this.applyTowerDurabilityBoost(reward.value);
    }
  }

  /**
   * Apply trench slow bonus
   */
  private applyTrenchSlowBonus(_bonusPercentage: number): void {
    // This would modify the trench slow effect globally
    // Implementation depends on how trench effects are managed
  }

  /**
   * Apply wall HP bonus
   */
  private applyWallHPBonus(_bonusPercentage: number): void {
    // This would modify wall HP globally
    // Implementation depends on how wall HP is managed
  }

  /**
   * Apply global defensive bonus
   */
  private applyGlobalDefensiveBonus(_bonusPercentage: number): void {
    // This would apply a global defensive bonus
    // Could affect multiple systems
  }

  /**
   * Apply tower durability boost
   */
  private applyTowerDurabilityBoost(bonusPercentage: number): void {
    // Apply durability boost to all towers
    const state = useGameStore.getState();
    const currentWave = state.currentWave;
    
    const updatedSlots = state.towerSlots.map(slot => {
      if (!slot.tower) return slot;
      
      const baseHealth = towerDurabilityBalancer.calculateTowerHealth(slot.tower.level, currentWave);
      const boostedHealth = Math.round(baseHealth * (1 + bonusPercentage / 100));
      
      return {
        ...slot,
        tower: {
          ...slot.tower,
          maxHealth: boostedHealth,
          health: Math.min(slot.tower.health, boostedHealth)
        }
      };
    });

    useGameStore.setState({ towerSlots: updatedSlots });
  }

  /**
   * Apply trench upgrade
   */
  private applyTrenchUpgrade(_reward: DefensiveMissionReward): void {
    // This would upgrade a specific trench or provide trench upgrade benefits
  }

  /**
   * Apply wall upgrade
   */
  private applyWallUpgrade(_reward: DefensiveMissionReward): void {
    // This would upgrade a specific wall or provide wall upgrade benefits
  }

  /**
   * Show reward notification
   */
  private showRewardNotification(reward: DefensiveMissionReward): void {
    const notification = {
      id: `defensive-reward-${reward.id}`,
      type: 'success' as const,
      message: `🛡️ Defensive Reward: ${reward.description}`,
      timestamp: Date.now(),
      duration: 5000
    };

    useGameStore.getState().addNotification(notification);
  }

  /**
   * Get active rewards
   */
  getActiveRewards(): DefensiveMissionReward[] {
    return Array.from(this.activeRewards.values());
  }

  /**
   * Get all missions
   */
  getAllMissions(): DefensiveMission[] {
    return [...this.missions];
  }

  /**
   * Get completed missions
   */
  getCompletedMissions(): DefensiveMission[] {
    return this.missions.filter(mission => mission.completed);
  }

  /**
   * Get mission by ID
   */
  getMission(id: string): DefensiveMission | null {
    return this.missions.find(mission => mission.id === id) || null;
  }

  /**
   * Check if mission is completed
   */
  isMissionCompleted(id: string): boolean {
    const mission = this.getMission(id);
    return mission?.completed || false;
  }

  /**
   * Get mission progress percentage
   */
  getMissionProgress(id: string): number {
    const mission = this.getMission(id);
    if (!mission) return 0;
    return (mission.progress / mission.maxProgress) * 100;
  }

  /**
   * Save mission progress to store
   */
  private saveMissionProgress(): void {
    const completedMissionIds = this.missions
      .filter(m => m.completed)
      .map(m => m.id);

    const activeRewardIds = Array.from(this.activeRewards.keys());

    useGameStore.setState({
      completedDefensiveMissions: completedMissionIds,
      activeDefensiveRewards: activeRewardIds
    });
  }

  /**
   * Load mission progress from store
   */
  loadMissionProgress(): void {
    const state = useGameStore.getState();
    const completedMissionIds = state.completedDefensiveMissions || [];
    const activeRewardIds = state.activeDefensiveRewards || [];

    // Mark completed missions
    this.missions.forEach(mission => {
      if (completedMissionIds.includes(mission.id)) {
        mission.completed = true;
        mission.progress = mission.maxProgress;
      }
    });

    // Reactivate active rewards
    activeRewardIds.forEach(rewardId => {
      const mission = this.missions.find(m => m.reward.id === rewardId);
      if (mission && mission.completed) {
        this.activateMissionReward(mission.reward);
      }
    });
  }

  /**
   * Reset all mission progress
   */
  resetProgress(): void {
    this.missions.forEach(mission => {
      mission.completed = false;
      mission.progress = 0;
    });

    this.activeRewards.clear();
    this.rewardEffects.clear();

    useGameStore.setState({
      completedDefensiveMissions: [],
      activeDefensiveRewards: []
    });
  }

  /**
   * Get defensive statistics
   */
  getDefensiveStats(): {
    totalMissions: number;
    completedMissions: number;
    completionRate: number;
    activeRewards: number;
    totalRewards: number;
  } {
    const totalMissions = this.missions.length;
    const completedMissions = this.getCompletedMissions().length;
    const completionRate = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;
    const activeRewards = this.activeRewards.size;
    const totalRewards = this.missions.length; // Each mission has one reward

    return {
      totalMissions,
      completedMissions,
      completionRate,
      activeRewards,
      totalRewards
    };
  }

  /**
   * Clean up expired rewards
   */
  cleanup(): void {
    const now = performance.now();
    
    for (const [rewardId, reward] of this.activeRewards.entries()) {
      if (reward.duration && reward.startTime) {
        if (now > reward.startTime + reward.duration) {
          // Remove expired reward
          this.activeRewards.delete(rewardId);
          this.rewardEffects.delete(rewardId);
        }
      }
    }
  }
}

export const defensiveMissionRewards = DefensiveMissionRewards.getInstance(); 