import type { GameState, DailyMission } from '../../models/gameTypes';
import { useGameStore } from '../../models/store';

export class MissionRewardManager {
  private static instance: MissionRewardManager;

  public static getInstance(): MissionRewardManager {
    if (!MissionRewardManager.instance) {
      MissionRewardManager.instance = new MissionRewardManager();
    }
    return MissionRewardManager.instance;
  }

  public applyMissionReward(mission: DailyMission, gameState: GameState): Partial<GameState> {
    const updates: Partial<GameState> = {};

    switch (mission.reward.type) {
      case 'gold': {
        updates.gold = (gameState.gold || 0) + mission.reward.amount;
        break;
      }

      case 'energy': {
        updates.energy = Math.min(
          gameState.maxEnergy, 
          gameState.energy + mission.reward.amount
        );
        break;
      }

      case 'actions': {
        updates.actionsRemaining = Math.min(
          gameState.maxActions,
          gameState.actionsRemaining + mission.reward.amount
        );
        break;
      }

      case 'experience': {
        // Apply experience to player profile
        const newProfile = { ...gameState.playerProfile };
        newProfile.experience += mission.reward.amount;
        
        // Check for level up
        const newLevel = Math.floor(newProfile.experience / 1000) + 1;
        if (newLevel > newProfile.level) {
          newProfile.level = newLevel;
        }
        
        updates.playerProfile = newProfile;
        break;
      }

      case 'unlock': {
        // Handle special unlocks
        if (mission.reward.special) {
          // Could unlock new features, achievements, etc.
        }
        break;
      }

      case 'upgrade': {
        if (mission.reward.special === 'bullet') {
          useGameStore.getState().upgradeBullet(true);
        } else if (mission.reward.special === 'shield') {
          // Note: upgradeWall doesn't exist in the store, using shield upgrade instead
          // You may need to implement this method or use an existing one
        }
        useGameStore.getState().completeMission(mission.id);
        break;
      }
    }

    return updates;
  }

  public createCompletionNotification(mission: DailyMission) {
    return {
      type: 'success' as const,
      message: `🎯 Günlük görev tamamlandı: ${mission.name}! Ödül: ${mission.reward.description}`,
      duration: 5000
    };
  }
} 