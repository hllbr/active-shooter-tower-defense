/**
 * 🏛️ Faction System Manager
 * Issue #63: Yeni Oyun Mekanikleri - Strategic Depth
 */

import type { 
  Faction,
  FactionType,
  FactionAbility,
  FactionRelationship,
  FactionTechnology
} from '../../models/gameTypes';

export interface FactionMember {
  playerId: string;
  playerName: string;
  joinDate: number;
  contribution: number;
  rank: 'recruit' | 'member' | 'veteran' | 'elite' | 'leader';
  specializations: string[];
}

export class FactionManager {
  private static instance: FactionManager;
  private factions: Map<string, Faction> = new Map();
  private factionRelationships: Map<string, FactionRelationship> = new Map();

  private constructor() {
    this.initializeFactionSystem();
  }

  public static getInstance(): FactionManager {
    if (!FactionManager.instance) {
      FactionManager.instance = new FactionManager();
    }
    return FactionManager.instance;
  }

  /**
   * Initialize faction system
   */
  private initializeFactionSystem(): void {
    this.createDefaultFactions();
    this.initializeFactionRelationships();
  }

  /**
   * Create default factions
   */
  private createDefaultFactions(): void {
    const defaultFactions: Faction[] = [
      {
        id: 'military_order',
        name: 'Askeri Düzen',
        description: 'Güçlü silahlar ve taktiksel üstünlük arayan savaşçılar',
        type: 'military',
        leader: 'Commander_Alpha',
        members: [],
        maxMembers: 50,
        level: 1,
        experience: 0,
        resources: {
          gold: 10000,
          researchPoints: 1000,
          influence: 100,
          technology: 50
        },
        abilities: [
          {
            id: 'tactical_superiority',
            name: 'Taktiksel Üstünlük',
            description: 'Tüm kulelerin hasarı %20 artar',
            type: 'passive',
            effect: 'damage_bonus_20',
            cost: { gold: 0, researchPoints: 0 }
          },
          {
            id: 'combat_expertise',
            name: 'Savaş Uzmanlığı',
            description: 'Kritik vuruş şansı %15 artar',
            type: 'passive',
            effect: 'critical_chance_15',
            cost: { gold: 0, researchPoints: 0 }
          },
          {
            id: 'strategic_planning',
            name: 'Stratejik Planlama',
            description: 'Kule menzili %25 artar',
            type: 'passive',
            effect: 'range_bonus_25',
            cost: { gold: 0, researchPoints: 0 }
          }
        ],
        technologies: [
          {
            id: 'advanced_weaponry',
            name: 'Gelişmiş Silahlar',
            description: 'Tüm silah sistemleri geliştirildi',
            level: 1,
            maxLevel: 5,
            cost: { gold: 5000, researchPoints: 500 }
          },
          {
            id: 'tactical_analysis',
            name: 'Taktiksel Analiz',
            description: 'Düşman davranışları analiz edildi',
            level: 1,
            maxLevel: 3,
            cost: { gold: 3000, researchPoints: 300 }
          }
        ],
        specializations: ['combat', 'tactics', 'weapons'],
        reputation: 100,
        territory: ['north_region', 'east_region'],
        isActive: true
      },
      {
        id: 'scientific_guild',
        name: 'Bilim Loncası',
        description: 'Teknoloji ve araştırma odaklı bilim insanları',
        type: 'scientific',
        leader: 'Dr_Innovation',
        members: [],
        maxMembers: 40,
        level: 1,
        experience: 0,
        resources: {
          gold: 8000,
          researchPoints: 2000,
          influence: 80,
          technology: 100
        },
        abilities: [
          {
            id: 'research_efficiency',
            name: 'Araştırma Verimliliği',
            description: 'Araştırma puanları %30 daha hızlı kazanılır',
            type: 'passive',
            effect: 'research_bonus_30',
            cost: { gold: 0, researchPoints: 0 }
          },
          {
            id: 'energy_optimization',
            name: 'Enerji Optimizasyonu',
            description: 'Enerji tüketimi %25 azalır',
            type: 'passive',
            effect: 'energy_saving_25',
            cost: { gold: 0, researchPoints: 0 }
          },
          {
            id: 'technological_breakthrough',
            name: 'Teknolojik Atılım',
            description: 'Yeni teknolojiler %20 daha hızlı açılır',
            type: 'passive',
            effect: 'tech_unlock_speed_20',
            cost: { gold: 0, researchPoints: 0 }
          }
        ],
        technologies: [
          {
            id: 'advanced_ai',
            name: 'Gelişmiş Yapay Zeka',
            description: 'Otomatik sistemler geliştirildi',
            level: 1,
            maxLevel: 5,
            cost: { gold: 4000, researchPoints: 800 }
          },
          {
            id: 'energy_systems',
            name: 'Enerji Sistemleri',
            description: 'Verimli enerji yönetimi',
            level: 1,
            maxLevel: 4,
            cost: { gold: 2500, researchPoints: 500 }
          }
        ],
        specializations: ['research', 'technology', 'energy'],
        reputation: 90,
        territory: ['central_region', 'south_region'],
        isActive: true
      },
      {
        id: 'merchant_alliance',
        name: 'Tüccar İttifakı',
        description: 'Ekonomi ve ticaret odaklı iş insanları',
        type: 'merchant',
        leader: 'Trader_Prime',
        members: [],
        maxMembers: 60,
        level: 1,
        experience: 0,
        resources: {
          gold: 15000,
          researchPoints: 500,
          influence: 120,
          technology: 30
        },
        abilities: [
          {
            id: 'economic_advantage',
            name: 'Ekonomik Avantaj',
            description: 'Altın kazanımı %25 artar',
            type: 'passive',
            effect: 'gold_bonus_25',
            cost: { gold: 0, researchPoints: 0 }
          },
          {
            id: 'resource_efficiency',
            name: 'Kaynak Verimliliği',
            description: 'Tüm kaynaklar %20 daha verimli kullanılır',
            type: 'passive',
            effect: 'resource_efficiency_20',
            cost: { gold: 0, researchPoints: 0 }
          },
          {
            id: 'trade_networks',
            name: 'Ticaret Ağları',
            description: 'Özel eşyalar %15 daha sık bulunur',
            type: 'passive',
            effect: 'loot_bonus_15',
            cost: { gold: 0, researchPoints: 0 }
          }
        ],
        technologies: [
          {
            id: 'trade_routes',
            name: 'Ticaret Yolları',
            description: 'Gelişmiş ticaret ağları',
            level: 1,
            maxLevel: 5,
            cost: { gold: 6000, researchPoints: 300 }
          },
          {
            id: 'resource_management',
            name: 'Kaynak Yönetimi',
            description: 'Verimli kaynak kullanımı',
            level: 1,
            maxLevel: 4,
            cost: { gold: 3500, researchPoints: 200 }
          }
        ],
        specializations: ['economy', 'trade', 'resources'],
        reputation: 110,
        territory: ['west_region', 'central_region'],
        isActive: true
      }
    ];

    for (const faction of defaultFactions) {
      this.factions.set(faction.id, faction);
    }
  }

  /**
   * Initialize faction relationships
   */
  private initializeFactionRelationships(): void {
    const relationships: FactionRelationship[] = [
      {
        faction1: 'military_order',
        faction2: 'scientific_guild',
        relationship: 'neutral',
        trustLevel: 50,
        tradeAgreements: [],
        conflicts: []
      },
      {
        faction1: 'military_order',
        faction2: 'merchant_alliance',
        relationship: 'allied',
        trustLevel: 75,
        tradeAgreements: ['weapon_supply', 'resource_exchange'],
        conflicts: []
      },
      {
        faction1: 'scientific_guild',
        faction2: 'merchant_alliance',
        relationship: 'cooperative',
        trustLevel: 65,
        tradeAgreements: ['technology_exchange', 'research_funding'],
        conflicts: []
      }
    ];

    for (const relationship of relationships) {
      const key = this.getRelationshipKey(relationship.faction1, relationship.faction2);
      this.factionRelationships.set(key, relationship);
    }
  }

  /**
   * Get relationship key
   */
  private getRelationshipKey(faction1: string, faction2: string): string {
    return [faction1, faction2].sort().join('_');
  }

  /**
   * Create new faction
   */
  public createFaction(
    name: string,
    description: string,
    type: FactionType,
    leaderId: string,
    leaderName: string
  ): Faction | null {
    // Check if faction name already exists
    const existingFaction = Array.from(this.factions.values()).find(f => f.name === name);
    if (existingFaction) return null;

    const faction: Faction = {
      id: `faction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      type,
      leader: leaderId,
      members: [{
        playerId: leaderId,
        playerName: leaderName,
        joinDate: Date.now(),
        contribution: 0,
        rank: 'leader',
        specializations: []
      }],
      maxMembers: 30,
      level: 1,
      experience: 0,
      resources: {
        gold: 5000,
        researchPoints: 500,
        influence: 50,
        technology: 25
      },
      abilities: [],
      technologies: [],
      specializations: [],
      reputation: 50,
      territory: [],
      isActive: true
    };

    this.factions.set(faction.id, faction);
    return faction;
  }

  /**
   * Join faction
   */
  public joinFaction(factionId: string, playerId: string, playerName: string): boolean {
    const faction = this.factions.get(factionId);
    if (!faction || !faction.isActive) return false;

    // Check if faction is full
    if (faction.members.length >= faction.maxMembers) return false;

    // Check if player is already a member
    if (faction.members.some(member => member.playerId === playerId)) return false;

    const member: FactionMember = {
      playerId,
      playerName,
      joinDate: Date.now(),
      contribution: 0,
      rank: 'recruit',
      specializations: []
    };

    faction.members.push(member);
    return true;
  }

  /**
   * Leave faction
   */
  public leaveFaction(factionId: string, playerId: string): boolean {
    const faction = this.factions.get(factionId);
    if (!faction) return false;

    const memberIndex = faction.members.findIndex(member => member.playerId === playerId);
    if (memberIndex === -1) return false;

    // Leader cannot leave faction
    if (faction.members[memberIndex].rank === 'leader') return false;

    faction.members.splice(memberIndex, 1);
    return true;
  }

  /**
   * Update member contribution
   */
  public updateContribution(
    factionId: string,
    playerId: string,
    contribution: number
  ): boolean {
    const faction = this.factions.get(factionId);
    if (!faction) return false;

    const member = faction.members.find(m => m.playerId === playerId);
    if (!member) return false;

    member.contribution += contribution;

    // Update rank based on contribution
    this.updateMemberRank(faction, member);

    // Update faction experience
    faction.experience += Math.floor(contribution / 10);

    // Check for level up
    this.checkFactionLevelUp(faction);

    return true;
  }

  /**
   * Update member rank
   */
  private updateMemberRank(faction: Faction, member: FactionMember): void {
    const contribution = member.contribution;
    
    if (contribution >= 10000) {
      member.rank = 'elite';
    } else if (contribution >= 5000) {
      member.rank = 'veteran';
    } else if (contribution >= 1000) {
      member.rank = 'member';
    } else {
      member.rank = 'recruit';
    }
  }

  /**
   * Check faction level up
   */
  private checkFactionLevelUp(faction: Faction): void {
    const experienceNeeded = faction.level * 1000;
    
    if (faction.experience >= experienceNeeded) {
      faction.level++;
      faction.experience -= experienceNeeded;
      faction.maxMembers += 5;
      
      // Unlock new abilities and technologies
      this.unlockFactionFeatures(faction);
    }
  }

  /**
   * Unlock faction features
   */
  private unlockFactionFeatures(faction: Faction): void {
    const newAbilities = this.getFactionAbilitiesForLevel(faction.type, faction.level);
    const newTechnologies = this.getFactionTechnologiesForLevel(faction.type, faction.level);

    faction.abilities.push(...newAbilities);
    faction.technologies.push(...newTechnologies);
  }

  /**
   * Get faction abilities for level
   */
  private getFactionAbilitiesForLevel(type: FactionType, level: number): FactionAbility[] {
    const abilities: Record<FactionType, Record<number, FactionAbility[]>> = {
      military: {
        2: [{
          id: 'advanced_tactics',
          name: 'Gelişmiş Taktikler',
          description: 'Kule saldırı hızı %15 artar',
          type: 'passive',
          effect: 'attack_speed_15',
          cost: { gold: 0, researchPoints: 0 }
        }],
        3: [{
          id: 'combat_mastery',
          name: 'Savaş Ustalığı',
          description: 'Kritik hasar %25 artar',
          type: 'passive',
          effect: 'critical_damage_25',
          cost: { gold: 0, researchPoints: 0 }
        }]
      },
      scientific: {
        2: [{
          id: 'advanced_research',
          name: 'Gelişmiş Araştırma',
          description: 'Araştırma maliyeti %20 azalır',
          type: 'passive',
          effect: 'research_cost_reduction_20',
          cost: { gold: 0, researchPoints: 0 }
        }],
        3: [{
          id: 'technological_mastery',
          name: 'Teknoloji Ustalığı',
          description: 'Teknoloji etkileri %30 güçlenir',
          type: 'passive',
          effect: 'tech_effect_boost_30',
          cost: { gold: 0, researchPoints: 0 }
        }]
      },
      merchant: {
        2: [{
          id: 'advanced_trading',
          name: 'Gelişmiş Ticaret',
          description: 'Ticaret bonusları %25 artar',
          type: 'passive',
          effect: 'trade_bonus_25',
          cost: { gold: 0, researchPoints: 0 }
        }],
        3: [{
          id: 'economic_mastery',
          name: 'Ekonomi Ustalığı',
          description: 'Tüm ekonomik bonuslar %30 güçlenir',
          type: 'passive',
          effect: 'economic_bonus_30',
          cost: { gold: 0, researchPoints: 0 }
        }]
      },
      neutral: {},
      chaos: {}
    };
    return abilities[type][level] || [];
  }

  /**
   * Get faction technologies for level
   */
  private getFactionTechnologiesForLevel(type: FactionType, level: number): FactionTechnology[] {
    const technologies: Record<FactionType, Record<number, FactionTechnology[]>> = {
      military: {
        2: [{
          id: 'military_doctrine',
          name: 'Askeri Doktrin',
          description: 'Gelişmiş savaş stratejileri',
          level: 1,
          maxLevel: 3,
          cost: { gold: 4000, researchPoints: 400 }
        }],
        3: [{
          id: 'weapon_specialization',
          name: 'Silah Uzmanlığı',
          description: 'Özel silah sistemleri',
          level: 1,
          maxLevel: 4,
          cost: { gold: 6000, researchPoints: 600 }
        }]
      },
      scientific: {
        2: [{
          id: 'research_methodology',
          name: 'Araştırma Metodolojisi',
          description: 'Gelişmiş araştırma teknikleri',
          level: 1,
          maxLevel: 3,
          cost: { gold: 3000, researchPoints: 600 }
        }],
        3: [{
          id: 'experimental_tech',
          name: 'Deneysel Teknoloji',
          description: 'Yenilikçi teknolojiler',
          level: 1,
          maxLevel: 4,
          cost: { gold: 5000, researchPoints: 1000 }
        }]
      },
      merchant: {
        2: [{
          id: 'trade_networks',
          name: 'Ticaret Ağları',
          description: 'Gelişmiş ticaret sistemleri',
          level: 1,
          maxLevel: 3,
          cost: { gold: 5000, researchPoints: 300 }
        }],
        3: [{
          id: 'economic_systems',
          name: 'Ekonomik Sistemler',
          description: 'Gelişmiş ekonomi yönetimi',
          level: 1,
          maxLevel: 4,
          cost: { gold: 7000, researchPoints: 400 }
        }]
      },
      neutral: {},
      chaos: {}
    };
    return technologies[type][level] || [];
  }

  /**
   * Get faction by ID
   */
  public getFaction(factionId: string): Faction | null {
    return this.factions.get(factionId) || null;
  }

  /**
   * Get all factions
   */
  public getAllFactions(): Faction[] {
    return Array.from(this.factions.values()).filter(faction => faction.isActive);
  }

  /**
   * Get player's faction
   */
  public getPlayerFaction(playerId: string): Faction | null {
    return Array.from(this.factions.values()).find(faction =>
      faction.members.some(member => member.playerId === playerId)
    ) || null;
  }

  /**
   * Get faction relationship
   */
  public getFactionRelationship(faction1Id: string, faction2Id: string): FactionRelationship | null {
    const key = this.getRelationshipKey(faction1Id, faction2Id);
    return this.factionRelationships.get(key) || null;
  }

  /**
   * Get faction statistics
   */
  public getFactionStats(): {
    totalFactions: number;
    totalMembers: number;
    averageMembers: number;
    mostPopularFaction: Faction | null;
  } {
    const activeFactions = this.getAllFactions();
    const totalMembers = activeFactions.reduce((sum, faction) => sum + faction.members.length, 0);
    const averageMembers = activeFactions.length > 0 ? totalMembers / activeFactions.length : 0;
    const mostPopularFaction = activeFactions.reduce((max, faction) =>
      faction.members.length > (max?.members.length || 0) ? faction : max, null as Faction | null
    );

    return {
      totalFactions: activeFactions.length,
      totalMembers,
      averageMembers,
      mostPopularFaction
    };
  }
} 