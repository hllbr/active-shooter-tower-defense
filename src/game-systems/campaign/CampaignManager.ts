/**
 * 📖 Campaign & Narrative System Manager
 * Issue #63: Yeni Oyun Mekanikleri - Story Progression
 */

import type { 
  CampaignChapter,
  StoryDecision,
  StoryConsequence
} from '../../models/gameTypes';

export interface CampaignProgress {
  currentChapter: string;
  completedChapters: string[];
  storyDecisions: StoryConsequence[];
  worldState: {
    globalEvents: string[];
    factionControl: Record<string, number>;
    resourceAvailability: Record<string, number>;
  };
}

export class CampaignManager {
  private static instance: CampaignManager;
  private campaignProgress!: CampaignProgress;
  private chapters: Map<string, CampaignChapter> = new Map();

  private constructor() {
    this.initializeCampaignSystem();
  }

  public static getInstance(): CampaignManager {
    if (!CampaignManager.instance) {
      CampaignManager.instance = new CampaignManager();
    }
    return CampaignManager.instance;
  }

  /**
   * Initialize campaign system
   */
  private initializeCampaignSystem(): void {
    this.campaignProgress = {
      currentChapter: 'introduction',
      completedChapters: [],
      storyDecisions: [],
      worldState: {
        globalEvents: [],
        factionControl: {},
        resourceAvailability: {}
      }
    };

    this.createCampaignChapters();
  }

  /**
   * Create campaign chapters
   */
  private createCampaignChapters(): void {
    const chapters: CampaignChapter[] = [
      {
        id: 'introduction',
        name: 'İlk Temas',
        description: 'Bilinmeyen düşman güçleri ortaya çıktı...',
        objectives: [
          {
            id: 'survive_first_10_waves',
            type: 'survive_waves',
            target: 10,
            description: 'İlk 10 dalgaya kadar hayatta kal',
            completed: false
          },
          {
            id: 'build_5_towers',
            type: 'build_towers',
            target: 5,
            description: '5 kule inşa et',
            completed: false
          },
          {
            id: 'complete_tutorial',
            type: 'complete_tutorial',
            target: 1,
            description: 'Tutorial\'ı tamamla',
            completed: false
          }
        ],
        rewards: {
          gold: 1000,
          researchPoints: 100,
          cosmetics: ['chapter_1_badge'],
          titles: ['First Contact']
        },
        storyDecisions: [
          {
            id: 'faction_choice',
            description: 'Hangi fraksiyonla ittifak kuracaksın?',
            options: [
              {
                id: 'military_alliance',
                text: 'Askeri Birlik',
                description: 'Güçlü silahlar ve taktiksel avantajlar',
                consequences: ['military_tech_unlock', 'combat_bonus']
              },
              {
                id: 'scientific_alliance',
                text: 'Araştırma Enstitüsü',
                description: 'Gelişmiş teknoloji ve enerji verimliliği',
                consequences: ['advanced_tech_unlock', 'energy_bonus']
              },
              {
                id: 'merchant_alliance',
                text: 'Ticaret Birliği',
                description: 'Ekonomik avantajlar ve kaynak bolluğu',
                consequences: ['economic_bonus', 'resource_bonus']
              }
            ]
          }
        ],
        worldStateChanges: {
          globalEvents: ['first_contact'],
          factionControl: { military: 0, scientific: 0, merchant: 0 },
          resourceAvailability: { gold: 1.0, energy: 1.0, research: 1.0 }
        }
      },
      {
        id: 'escalation',
        name: 'Tırmanma',
        description: 'Düşman güçleri organizeli saldırılara başladı...',
        objectives: [
          {
            id: 'reach_wave_25',
            type: 'survive_waves',
            target: 25,
            description: '25. dalgaya kadar ulaş',
            completed: false
          },
          {
            id: 'research_basic_tech',
            type: 'research_technology',
            target: 3,
            description: '3 temel teknoloji araştır',
            completed: false
          },
          {
            id: 'form_alliance',
            type: 'form_alliance',
            target: 1,
            description: 'Bir ittifak kur',
            completed: false
          }
        ],
        rewards: {
          gold: 2000,
          researchPoints: 200,
          cosmetics: ['chapter_2_badge'],
          titles: ['Escalation Veteran']
        },
        storyDecisions: [
          {
            id: 'defense_strategy',
            description: 'Hangi savunma stratejisini benimseyeceksin?',
            options: [
              {
                id: 'offensive_defense',
                text: 'Saldırgan Savunma',
                description: 'Düşmanı kaynağında durdur',
                consequences: ['damage_bonus', 'aggressive_tactics']
              },
              {
                id: 'defensive_defense',
                text: 'Savunmacı Strateji',
                description: 'Güçlü savunma hatları kur',
                consequences: ['health_bonus', 'defensive_tactics']
              },
              {
                id: 'balanced_approach',
                text: 'Dengeli Yaklaşım',
                description: 'Saldırı ve savunma dengesi',
                consequences: ['balanced_bonus', 'versatile_tactics']
              }
            ]
          }
        ],
        worldStateChanges: {
          globalEvents: ['enemy_escalation', 'organized_attacks'],
          factionControl: { military: 0.3, scientific: 0.3, merchant: 0.3 },
          resourceAvailability: { gold: 1.2, energy: 1.1, research: 1.1 }
        }
      },
      {
        id: 'revelation',
        name: 'Keşif',
        description: 'Düşmanın gerçek doğası ortaya çıkıyor...',
        objectives: [
          {
            id: 'defeat_first_boss',
            type: 'defeat_boss',
            target: 1,
            description: 'İlk boss\'u yen',
            completed: false
          },
          {
            id: 'unlock_advanced_tech',
            type: 'unlock_technology',
            target: 5,
            description: '5 gelişmiş teknoloji aç',
            completed: false
          },
          {
            id: 'make_faction_choice',
            type: 'faction_choice',
            target: 1,
            description: 'Kesin fraksiyon seçimi yap',
            completed: false
          }
        ],
        rewards: {
          gold: 3000,
          researchPoints: 300,
          cosmetics: ['chapter_3_badge'],
          titles: ['Revelation Master']
        },
        storyDecisions: [
          {
            id: 'ultimate_choice',
            description: 'Düşmanın gerçek doğasını öğrendin. Ne yapacaksın?',
            options: [
              {
                id: 'fight_to_end',
                text: 'Sonuna Kadar Savaş',
                description: 'Düşmanı tamamen yok et',
                consequences: ['ultimate_weapon', 'final_confrontation']
              },
              {
                id: 'seek_peace',
                text: 'Barış Arayışı',
                description: 'Alternatif çözüm ara',
                consequences: ['diplomatic_bonus', 'peace_ending']
              },
              {
                id: 'prepare_defense',
                text: 'Savunma Hazırlığı',
                description: 'Güçlü savunma sistemleri kur',
                consequences: ['defense_mastery', 'defensive_ending']
              }
            ]
          }
        ],
        worldStateChanges: {
          globalEvents: ['enemy_revelation', 'true_nature_discovered'],
          factionControl: { military: 0.5, scientific: 0.5, merchant: 0.5 },
          resourceAvailability: { gold: 1.5, energy: 1.3, research: 1.4 }
        }
      }
    ];

    for (const chapter of chapters) {
      this.chapters.set(chapter.id, chapter);
    }
  }

  /**
   * Get current chapter
   */
  public getCurrentChapter(): CampaignChapter | null {
    return this.chapters.get(this.campaignProgress.currentChapter) || null;
  }

  /**
   * Get chapter by ID
   */
  public getChapter(chapterId: string): CampaignChapter | null {
    return this.chapters.get(chapterId) || null;
  }

  /**
   * Update campaign progress
   */
  public updateProgress(
    objectiveId: string,
    progress: number,
    _gameState: unknown
  ): boolean {
    const currentChapter = this.getCurrentChapter();
    if (!currentChapter) return false;

    const objective = currentChapter.objectives.find(obj => obj.id === objectiveId);
    if (!objective) return false;

    // Update objective progress
    objective.progress = Math.min(progress, objective.target);
    objective.completed = objective.progress >= objective.target;

    // Check if chapter is completed
    if (this.isChapterCompleted(currentChapter)) {
      this.completeChapter(currentChapter.id);
    }

    return true;
  }

  /**
   * Check if chapter is completed
   */
  private isChapterCompleted(chapter: CampaignChapter): boolean {
    return chapter.objectives.every(objective => objective.completed);
  }

  /**
   * Complete chapter
   */
  private completeChapter(chapterId: string): void {
    this.campaignProgress.completedChapters.push(chapterId);
    
    // Move to next chapter
    const chapterOrder = ['introduction', 'escalation', 'revelation'];
    const currentIndex = chapterOrder.indexOf(chapterId);
    if (currentIndex < chapterOrder.length - 1) {
      this.campaignProgress.currentChapter = chapterOrder[currentIndex + 1];
    }

    // Apply chapter rewards
    const chapter = this.getChapter(chapterId);
    if (chapter) {
      this.applyChapterRewards(chapter);
    }
  }

  /**
   * Apply chapter rewards
   */
  private applyChapterRewards(chapter: CampaignChapter): void {
    // This would be integrated with the game state
  }

  /**
   * Make story decision
   */
  public makeDecision(
    decisionId: string,
    choiceId: string,
    _gameState: unknown
  ): boolean {
    const currentChapter = this.getCurrentChapter();
    if (!currentChapter) return false;

    const decision = currentChapter.storyDecisions.find(dec => dec.id === decisionId);
    if (!decision) return false;

    const choice = decision.options.find(opt => opt.id === choiceId);
    if (!choice) return false;

    // Record the decision
    this.campaignProgress.storyDecisions.push({
      id: decisionId,
      chapterId: currentChapter.id,
      choiceId,
      timestamp: Date.now(),
      consequences: choice.consequences
    });

    // Apply consequences
    this.applyDecisionConsequences(choice.consequences, _gameState);

    return true;
  }

  /**
   * Apply decision consequences
   */
  private applyDecisionConsequences(consequences: string[], _gameState: unknown): void {
    for (const consequence of consequences) {
      switch (consequence) {
        case 'military_tech_unlock':
          // Unlock military technologies
          break;
        case 'combat_bonus':
          // Apply combat bonuses
          break;
        case 'scientific_tech_unlock':
          // Unlock scientific technologies
          break;
        case 'energy_bonus':
          // Apply energy bonuses
          break;
        case 'economic_bonus':
          // Apply economic bonuses
          break;
        case 'resource_bonus':
          // Apply resource bonuses
          break;
        // Add more consequences as needed
      }
    }
  }

  /**
   * Get campaign statistics
   */
  public getCampaignStats(): {
    totalChapters: number;
    completedChapters: number;
    currentChapter: string;
    totalDecisions: number;
    worldState: CampaignProgress['worldState'];
  } {
    return {
      totalChapters: this.chapters.size,
      completedChapters: this.campaignProgress.completedChapters.length,
      currentChapter: this.campaignProgress.currentChapter,
      totalDecisions: this.campaignProgress.storyDecisions.length,
      worldState: this.campaignProgress.worldState
    };
  }

  /**
   * Get available story decisions
   */
  public getAvailableDecisions(): StoryDecision[] {
    const currentChapter = this.getCurrentChapter();
    if (!currentChapter) return [];

    return currentChapter.storyDecisions.filter(decision => {
      // Check if decision hasn't been made yet
      return !this.campaignProgress.storyDecisions.some(
        madeDecision => madeDecision.id === decision.id
      );
    });
  }

  /**
   * Get campaign progression
   */
  public getCampaignProgression(): {
    currentChapter: CampaignChapter | null;
    completedObjectives: number;
    totalObjectives: number;
    progressPercentage: number;
  } {
    const currentChapter = this.getCurrentChapter();
    if (!currentChapter) {
      return {
        currentChapter: null,
        completedObjectives: 0,
        totalObjectives: 0,
        progressPercentage: 0
      };
    }

    const completedObjectives = currentChapter.objectives.filter(obj => obj.completed).length;
    const totalObjectives = currentChapter.objectives.length;
    const progressPercentage = (completedObjectives / totalObjectives) * 100;

    return {
      currentChapter,
      completedObjectives,
      totalObjectives,
      progressPercentage
    };
  }
} 