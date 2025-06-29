import type { GameState, DailyMission } from '../models/gameTypes';
import { 
  MissionGenerator, 
  MissionProgressTracker, 
  MissionRewardManager 
} from './missions';

export class DailyMissionsManager {
  private static instance: DailyMissionsManager;
  private missionGenerator: MissionGenerator;
  private progressTracker: MissionProgressTracker;
  private rewardManager: MissionRewardManager;

  private constructor() {
    this.missionGenerator = MissionGenerator.getInstance();
    this.progressTracker = MissionProgressTracker.getInstance();
    this.rewardManager = MissionRewardManager.getInstance();
  }

  public static getInstance(): DailyMissionsManager {
    if (!DailyMissionsManager.instance) {
      DailyMissionsManager.instance = new DailyMissionsManager();
    }
    return DailyMissionsManager.instance;
  }

  // Generate fresh daily missions (called once per day)
  public generateDailyMissions(): DailyMission[] {
    return this.missionGenerator.generateDailyMissions();
  }

  // Update mission progress based on game events
  public updateMissionProgress(
    missions: DailyMission[], 
    eventType: string, 
    eventData?: { amount?: number; perfectWave?: boolean }
  ): { updatedMissions: DailyMission[]; newlyCompleted: DailyMission[] } {
    return this.progressTracker.updateMissionProgress(missions, eventType, eventData);
  }

  // Check if missions need refresh (daily reset)
  public needsRefresh(lastRefresh: number): boolean {
    return this.progressTracker.needsRefresh(lastRefresh);
  }

  // Apply mission rewards
  public applyMissionReward(mission: DailyMission, gameState: GameState): Partial<GameState> {
    return this.rewardManager.applyMissionReward(mission, gameState);
  }

  // Get mission completion notification
  public createCompletionNotification(mission: DailyMission) {
    return this.rewardManager.createCompletionNotification(mission);
  }
} 