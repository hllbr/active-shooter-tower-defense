import type { DailyMission } from '../../models/gameTypes';

export class MissionProgressTracker {
  private static instance: MissionProgressTracker;

  public static getInstance(): MissionProgressTracker {
    if (!MissionProgressTracker.instance) {
      MissionProgressTracker.instance = new MissionProgressTracker();
    }
    return MissionProgressTracker.instance;
  }

  public updateMissionProgress(
    missions: DailyMission[], 
    eventType: string, 
    eventData?: { amount?: number; perfectWave?: boolean }
  ): { updatedMissions: DailyMission[]; newlyCompleted: DailyMission[] } {
    const updatedMissions = [...missions];
    const newlyCompleted: DailyMission[] = [];

    updatedMissions.forEach(mission => {
      if (mission.completed || mission.expiresAt < Date.now()) return;

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

        case 'perfect_waves':
          if (eventType === 'wave_completed' && eventData?.perfectWave) {
            progressIncrease = 1;
          }
          break;
      }

      if (progressIncrease > 0) {
        mission.progress = Math.min(mission.maxProgress, mission.progress + progressIncrease);
        
        if (mission.progress >= mission.maxProgress && !mission.completed) {
          mission.completed = true;
          newlyCompleted.push(mission);
        }
      }
    });

    return { updatedMissions, newlyCompleted };
  }

  public needsRefresh(lastRefresh: number): boolean {
    const lastRefreshDate = new Date(lastRefresh);
    const today = new Date();
    
    // Check if it's a new day
    return lastRefreshDate.getDate() !== today.getDate() || 
           lastRefreshDate.getMonth() !== today.getMonth() || 
           lastRefreshDate.getFullYear() !== today.getFullYear();
  }
} 