import type { DailyMission } from '../../models/gameTypes';
import { MissionTemplateManager, type MissionTemplate } from './MissionTemplateManager';

export class MissionGenerator {
  private static instance: MissionGenerator;
  private templateManager: MissionTemplateManager;

  private constructor() {
    this.templateManager = MissionTemplateManager.getInstance();
  }

  public static getInstance(): MissionGenerator {
    if (!MissionGenerator.instance) {
      MissionGenerator.instance = new MissionGenerator();
    }
    return MissionGenerator.instance;
  }

  public generateDailyMissions(): DailyMission[] {
    const missions: DailyMission[] = [];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const expiresAt = tomorrow.getTime();

    // Generate 3 missions: 1 easy, 1 medium, 1 hard
    missions.push(this.generateMission('easy', expiresAt));
    missions.push(this.generateMission('medium', expiresAt));
    missions.push(this.generateMission('hard', expiresAt));

    // 20% chance for a secret mission
    if (Math.random() < 0.2) {
      missions.push(this.generateSecretMission(expiresAt));
    }

    return missions;
  }

  private generateMission(difficulty: 'easy' | 'medium' | 'hard', expiresAt: number): DailyMission {
    const missionTemplates = this.templateManager.getMissionTemplates(difficulty);
    const template = missionTemplates[Math.floor(Math.random() * missionTemplates.length)];
    
    return this.createMissionFromTemplate(template, expiresAt, difficulty, false);
  }

  private generateSecretMission(expiresAt: number): DailyMission {
    const secretTemplates = this.templateManager.getSecretMissionTemplates();
    const template = secretTemplates[Math.floor(Math.random() * secretTemplates.length)];
    
    return this.createMissionFromTemplate(template, expiresAt, 'hard', true);
  }

  private createMissionFromTemplate(
    template: MissionTemplate, 
    expiresAt: number, 
    difficulty: 'easy' | 'medium' | 'hard',
    isSecret: boolean
  ): DailyMission {
    const prefix = isSecret ? 'secret' : 'daily';
    
    return {
      id: `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: template.name,
      description: template.description,
      category: template.category,
      objective: template.objective,
      reward: template.reward,
      expiresAt,
      completed: false,
      progress: 0,
      maxProgress: template.objective.target,
      difficulty,
      isSecret
    };
  }
} 