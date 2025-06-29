import type { GameState, DailyMission } from '../models/gameTypes';

export class DailyMissionsManager {
  private static instance: DailyMissionsManager;

  public static getInstance(): DailyMissionsManager {
    if (!DailyMissionsManager.instance) {
      DailyMissionsManager.instance = new DailyMissionsManager();
    }
    return DailyMissionsManager.instance;
  }

  // Generate fresh daily missions (called once per day)
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
    const missionTemplates = this.getMissionTemplates(difficulty);
    const template = missionTemplates[Math.floor(Math.random() * missionTemplates.length)];
    
    return {
      id: `daily_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      isSecret: false
    };
  }

  private generateSecretMission(expiresAt: number): DailyMission {
    const secretTemplates = [
      {
        name: 'Gizli Operasyon',
        description: 'Hiç kule kaybetmeden 15 wave tamamla',
        category: 'survival' as const,
        objective: {
          type: 'perfect_waves' as const,
          target: 15,
          description: 'Mükemmel wave\'ler',
          trackingKey: 'perfectWaves'
        },
        reward: {
          type: 'gold' as const,
          amount: 2500,
          description: '+2500 Bonus Altın',
          special: 'secret_achievement'
        }
      }
    ];

    const template = secretTemplates[Math.floor(Math.random() * secretTemplates.length)];
    
    return {
      id: `secret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: template.name,
      description: template.description,
      category: template.category,
      objective: template.objective,
      reward: template.reward,
      expiresAt,
      completed: false,
      progress: 0,
      maxProgress: template.objective.target,
      difficulty: 'hard',
      isSecret: true
    };
  }

  private getMissionTemplates(difficulty: 'easy' | 'medium' | 'hard') {
    const templates = {
      easy: [
        {
          name: 'Çaylak Savaşçı',
          description: '5 wave tamamla',
          category: 'combat' as const,
          objective: {
            type: 'survive_waves' as const,
            target: 5,
            description: 'Wave tamamlama',
            trackingKey: 'wavesCompleted'
          },
          reward: {
            type: 'gold' as const,
            amount: 500,
            description: '+500 Altın'
          }
        },
        {
          name: 'İnşaatçı',
          description: '3 kule inşa et',
          category: 'economic' as const,
          objective: {
            type: 'build_towers' as const,
            target: 3,
            description: 'Kule inşası',
            trackingKey: 'towersBuilt'
          },
          reward: {
            type: 'energy' as const,
            amount: 50,
            description: '+50 Enerji'
          }
        },
        {
          name: 'Altın Avcısı',
          description: '1000 altın kazan',
          category: 'economic' as const,
          objective: {
            type: 'earn_gold' as const,
            target: 1000,
            description: 'Altın kazanma',
            trackingKey: 'totalGoldEarned'
          },
          reward: {
            type: 'actions' as const,
            amount: 3,
            description: '+3 Aksiyon'
          }
        }
      ],
      medium: [
        {
          name: 'Düşman Avcısı',
          description: '100 düşman öldür',
          category: 'combat' as const,
          objective: {
            type: 'kill_enemies' as const,
            target: 100,
            description: 'Düşman eliminasyonu',
            trackingKey: 'totalEnemiesKilled'
          },
          reward: {
            type: 'gold' as const,
            amount: 1200,
            description: '+1200 Altın'
          }
        },
        {
          name: 'Yükseltme Ustası',
          description: '5 yükseltme satın al',
          category: 'economic' as const,
          objective: {
            type: 'complete_upgrades' as const,
            target: 5,
            description: 'Yükseltme satın alma',
            trackingKey: 'totalUpgradesPurchased'
          },
          reward: {
            type: 'energy' as const,
            amount: 100,
            description: '+100 Enerji'
          }
        },
        {
          name: 'Dayanıklılık Testi',
          description: '15 wave tamamla',
          category: 'survival' as const,
          objective: {
            type: 'survive_waves' as const,
            target: 15,
            description: 'Uzun soluklı savaş',
            trackingKey: 'wavesCompleted'
          },
          reward: {
            type: 'gold' as const,
            amount: 1500,
            description: '+1500 Altın'
          }
        }
      ],
      hard: [
        {
          name: 'Elit Komutan',
          description: '25 wave tamamla',
          category: 'survival' as const,
          objective: {
            type: 'survive_waves' as const,
            target: 25,
            description: 'Epik dayanıklılık',
            trackingKey: 'wavesCompleted'
          },
          reward: {
            type: 'gold' as const,
            amount: 3000,
            description: '+3000 Altın + Experience'
          }
        },
        {
          name: 'Katil Makinesi',
          description: '500 düşman öldür',
          category: 'combat' as const,
          objective: {
            type: 'kill_enemies' as const,
            target: 500,
            description: 'Toplu düşman eliminasyonu',
            trackingKey: 'totalEnemiesKilled'
          },
          reward: {
            type: 'experience' as const,
            amount: 1000,
            description: '+1000 Experience Points'
          }
        },
        {
          name: 'Mükemmeliyetçi',
          description: '10 mükemmel wave tamamla',
          category: 'survival' as const,
          objective: {
            type: 'perfect_waves' as const,
            target: 10,
            description: 'Hiç kule kaybetmeden',
            trackingKey: 'perfectWaves'
          },
          reward: {
            type: 'unlock' as const,
            amount: 1,
            description: 'Özel Achievement Unlock',
            special: 'perfectionist_badge'
          }
        }
      ]
    };

    return templates[difficulty];
  }

  // Update mission progress based on game events
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

  // Check if missions need refresh (daily reset)
  public needsRefresh(lastRefresh: number): boolean {
    const lastRefreshDate = new Date(lastRefresh);
    const today = new Date();
    
    // Check if it's a new day
    return lastRefreshDate.getDate() !== today.getDate() || 
           lastRefreshDate.getMonth() !== today.getMonth() || 
           lastRefreshDate.getFullYear() !== today.getFullYear();
  }

  // Apply mission rewards
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
    }

    return updates;
  }

  // Get mission completion notification
  public createCompletionNotification(mission: DailyMission) {
    return {
      type: 'success' as const,
      message: `🎯 Günlük görev tamamlandı: ${mission.name}! Ödül: ${mission.reward.description}`,
      duration: 5000
    };
  }
} 