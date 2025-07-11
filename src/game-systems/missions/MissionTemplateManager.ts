export interface MissionTemplate {
  name: string;
  description: string;
  category: 'combat' | 'economic' | 'survival' | 'exploration';
  objective: {
    type: 'survive_waves' | 'kill_enemies' | 'build_towers' | 'earn_gold' | 'complete_upgrades' | 'use_abilities' | 'perfect_waves';
    target: number;
    description: string;
    trackingKey: string;
  };
  reward: {
    type: 'gold' | 'energy' | 'actions' | 'experience' | 'unlock';
    amount: number;
    description: string;
    special?: string;
  };
}

export class MissionTemplateManager {
  private static instance: MissionTemplateManager;

  public static getInstance(): MissionTemplateManager {
    if (!MissionTemplateManager.instance) {
      MissionTemplateManager.instance = new MissionTemplateManager();
    }
    return MissionTemplateManager.instance;
  }

  public getMissionTemplates(difficulty: 'easy' | 'medium' | 'hard'): MissionTemplate[] {
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
          name: 'Ateş Gücü Denemesi',
          description: '20 düşman öldür ve Ateş Gücü 3 seviyesine ulaş',
          category: 'combat' as const,
          objective: {
            type: 'kill_enemies' as const,
            target: 20,
            description: 'Görevsel eliminasyon',
            trackingKey: 'totalEnemiesKilled'
          },
          reward: {
            type: 'upgrade' as const,
            amount: 1,
            description: 'Ateş Gücü Seviye 4',
            special: 'bullet'
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

  public getSecretMissionTemplates(): MissionTemplate[] {
    return [
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
  }
} 