/**
 * 🎉 Live Events System Manager
 * Issue #63: Yeni Oyun Mekanikleri - Dynamic Content
 */

import type { 
  LiveEvent,
  EventType,
  EventReward,
  EventParticipant
} from '../../models/gameTypes';

export interface LiveEventConfig {
  id: string;
  name: string;
  description: string;
  type: EventType;
  startTime: number;
  endTime: number;
  rewards: EventReward;
  maxParticipants: number;
  requirements: string[];
  specialRules: string[];
}

export class LiveEventsManager {
  private static instance: LiveEventsManager;
  private activeEvents: LiveEvent[] = [];
  private eventHistory: LiveEvent[] = [];
  private upcomingEvents: LiveEventConfig[] = [];

  private constructor() {
    this.initializeLiveEventsSystem();
  }

  public static getInstance(): LiveEventsManager {
    if (!LiveEventsManager.instance) {
      LiveEventsManager.instance = new LiveEventsManager();
    }
    return LiveEventsManager.instance;
  }

  /**
   * Initialize live events system
   */
  private initializeLiveEventsSystem(): void {
    this.createUpcomingEvents();
    this.scheduleNextEvent();
  }

  /**
   * Create upcoming events
   */
  private createUpcomingEvents(): void {
    const events: LiveEventConfig[] = [
      {
        id: 'speed_challenge',
        name: 'Hız Mücadelesi',
        description: 'En hızlı şekilde 20 dalgayı tamamla!',
        type: 'speed_challenge',
        startTime: Date.now() + 3600000, // 1 hour from now
        endTime: Date.now() + 7200000, // 2 hours from now
        rewards: {
          gold: 5000,
          researchPoints: 500,
          cosmetics: ['speed_champion_badge'],
          titles: ['Speed Demon'],
          specialRewards: ['exclusive_tower_skin']
        },
        maxParticipants: 100,
        requirements: ['level_10'],
        specialRules: ['time_limit_30_minutes', 'no_pause_allowed']
      },
      {
        id: 'boss_rush',
        name: 'Boss Rush',
        description: 'Ardışık boss\'larla savaş!',
        type: 'boss_rush',
        startTime: Date.now() + 7200000, // 2 hours from now
        endTime: Date.now() + 10800000, // 3 hours from now
        rewards: {
          gold: 8000,
          researchPoints: 800,
          cosmetics: ['boss_slayer_badge'],
          titles: ['Boss Slayer'],
          specialRewards: ['boss_weapon_blueprint']
        },
        maxParticipants: 50,
        requirements: ['level_15', 'defeat_5_bosses'],
        specialRules: ['consecutive_bosses', 'no_healing_between_bosses']
      },
      {
        id: 'resource_efficiency',
        name: 'Kaynak Verimliliği',
        description: 'Minimum kaynakla maksimum performans!',
        type: 'resource_efficiency',
        startTime: Date.now() + 10800000, // 3 hours from now
        endTime: Date.now() + 14400000, // 4 hours from now
        rewards: {
          gold: 3000,
          researchPoints: 300,
          cosmetics: ['efficiency_master_badge'],
          titles: ['Resource Master'],
          specialRewards: ['efficiency_bonus_permanent']
        },
        maxParticipants: 200,
        requirements: ['level_5'],
        specialRules: ['limited_resources', 'efficiency_scoring']
      },
      {
        id: 'tower_specialist',
        name: 'Kule Uzmanı',
        description: 'Tek kule türüyle mücadele et!',
        type: 'tower_specialist',
        startTime: Date.now() + 14400000, // 4 hours from now
        endTime: Date.now() + 18000000, // 5 hours from now
        rewards: {
          gold: 4000,
          researchPoints: 400,
          cosmetics: ['specialist_badge'],
          titles: ['Tower Specialist'],
          specialRewards: ['specialist_tower_upgrade']
        },
        maxParticipants: 150,
        requirements: ['level_8'],
        specialRules: ['single_tower_type', 'specialist_bonuses']
      },
      {
        id: 'endurance_test',
        name: 'Dayanıklılık Testi',
        description: 'Uzun süreli savunma mücadelesi!',
        type: 'endurance_test',
        startTime: Date.now() + 18000000, // 5 hours from now
        endTime: Date.now() + 21600000, // 6 hours from now
        rewards: {
          gold: 10000,
          researchPoints: 1000,
          cosmetics: ['endurance_champion_badge'],
          titles: ['Endurance Master'],
          specialRewards: ['endurance_bonus_permanent']
        },
        maxParticipants: 75,
        requirements: ['level_20'],
        specialRules: ['extended_duration', 'fatigue_system']
      }
    ];

    this.upcomingEvents = events;
  }

  /**
   * Schedule next event
   */
  private scheduleNextEvent(): void {
    // Schedule events based on time
    setInterval(() => {
      this.checkAndStartEvents();
    }, 60000); // Check every minute
  }

  /**
   * Check and start events
   */
  private checkAndStartEvents(): void {
    const currentTime = Date.now();

    for (const eventConfig of this.upcomingEvents) {
      if (currentTime >= eventConfig.startTime && currentTime < eventConfig.endTime) {
        this.startEvent(eventConfig);
      }
    }

    // End expired events
    this.activeEvents = this.activeEvents.filter(event => {
      if (currentTime >= event.endTime) {
        this.endEvent(event);
        return false;
      }
      return true;
    });
  }

  /**
   * Start live event
   */
  private startEvent(eventConfig: LiveEventConfig): void {
    const event: LiveEvent = {
      id: eventConfig.id,
      name: eventConfig.name,
      description: eventConfig.description,
      type: eventConfig.type,
      startTime: eventConfig.startTime,
      endTime: eventConfig.endTime,
      rewards: eventConfig.rewards,
      participants: [],
      leaderboard: [],
      specialRules: eventConfig.specialRules,
      isActive: true,
      currentPhase: 'active'
    };

    this.activeEvents.push(event);
  }

  /**
   * End live event
   */
  private endEvent(event: LiveEvent): void {
    event.isActive = false;
    event.currentPhase = 'completed';

    // Calculate final rankings
    this.calculateFinalRankings(event);

    // Move to history
    this.eventHistory.push(event);

  }

  /**
   * Join event
   */
  public joinEvent(eventId: string, playerId: string, playerData: { level?: number; bossesDefeated?: number; name?: string }): boolean {
    const event = this.activeEvents.find(e => e.id === eventId);
    if (!event || !event.isActive) return false;

    // Check if player meets requirements
    if (!this.checkEventRequirements(event, playerData)) return false;

    // Check if event is full
    if (event.participants.length >= 100) return false; // maxParticipants

    // Check if player already joined
    if (event.participants.some(p => p.playerId === playerId)) return false;

    const participant: EventParticipant = {
      playerId,
      playerName: playerData.name || 'Unknown Player',
      joinTime: Date.now(),
      score: 0,
      achievements: [],
      currentRank: 0
    };

    event.participants.push(participant);
    this.updateLeaderboard(event);

    return true;
  }

  /**
   * Check event requirements
   */
  private checkEventRequirements(event: LiveEvent, playerData: { level?: number; bossesDefeated?: number }): boolean {
    // Simplified requirement checking
    const requirements = this.getEventRequirements(event.id);
    
    for (const requirement of requirements) {
      switch (requirement) {
        case 'level_5':
          if ((playerData.level || 0) < 5) return false;
          break;
        case 'level_8':
          if ((playerData.level || 0) < 8) return false;
          break;
        case 'level_10':
          if ((playerData.level || 0) < 10) return false;
          break;
        case 'level_15':
          if ((playerData.level || 0) < 15) return false;
          break;
        case 'level_20':
          if ((playerData.level || 0) < 20) return false;
          break;
        case 'defeat_5_bosses':
          if ((playerData.bossesDefeated || 0) < 5) return false;
          break;
      }
    }

    return true;
  }

  /**
   * Get event requirements
   */
  private getEventRequirements(eventId: string): string[] {
    const requirements: Record<string, string[]> = {
      'speed_challenge': ['level_10'],
      'boss_rush': ['level_15', 'defeat_5_bosses'],
      'resource_efficiency': ['level_5'],
      'tower_specialist': ['level_8'],
      'endurance_test': ['level_20']
    };

    return requirements[eventId] || [];
  }

  /**
   * Update player score
   */
  public updatePlayerScore(
    eventId: string,
    playerId: string,
    score: number,
    achievements: string[]
  ): boolean {
    const event = this.activeEvents.find(e => e.id === eventId);
    if (!event || !event.isActive) return false;

    const participant = event.participants.find(p => p.playerId === playerId);
    if (!participant) return false;

    participant.score = score;
    participant.achievements = achievements;
    participant.lastUpdate = Date.now();

    this.updateLeaderboard(event);

    return true;
  }

  /**
   * Update leaderboard
   */
  private updateLeaderboard(event: LiveEvent): void {
    // Sort participants by score
    const sortedParticipants = [...event.participants].sort((a, b) => b.score - a.score);

    // Update rankings
    sortedParticipants.forEach((participant, index) => {
      participant.currentRank = index + 1;
    });

    // Update leaderboard
    event.leaderboard = sortedParticipants.slice(0, 10).map(p => ({
      playerId: p.playerId,
      playerName: p.playerName,
      score: p.score,
      rank: p.currentRank,
      achievements: p.achievements
    }));
  }

  /**
   * Calculate final rankings
   */
  private calculateFinalRankings(event: LiveEvent): void {
    this.updateLeaderboard(event);

    // Award rewards based on final rankings
    event.leaderboard.forEach((entry, index) => {
      const participant = event.participants.find(p => p.playerId === entry.playerId);
      if (!participant) return;

      // Award rewards based on rank
      if (index === 0) {
        // 1st place - full rewards
        participant.finalRewards = { ...event.rewards };
      } else if (index < 3) {
        // Top 3 - partial rewards
        participant.finalRewards = {
          gold: Math.floor(event.rewards.gold * 0.7),
          researchPoints: Math.floor(event.rewards.researchPoints * 0.7),
          cosmetics: event.rewards.cosmetics.slice(0, 1),
          titles: event.rewards.titles.slice(0, 1),
          specialRewards: []
        };
      } else if (index < 10) {
        // Top 10 - basic rewards
        participant.finalRewards = {
          gold: Math.floor(event.rewards.gold * 0.3),
          researchPoints: Math.floor(event.rewards.researchPoints * 0.3),
          cosmetics: [],
          titles: [],
          specialRewards: []
        };
      } else {
        // Participation reward
        participant.finalRewards = {
          gold: Math.floor(event.rewards.gold * 0.1),
          researchPoints: Math.floor(event.rewards.researchPoints * 0.1),
          cosmetics: [],
          titles: [],
          specialRewards: []
        };
      }
    });
  }

  /**
   * Get active events
   */
  public getActiveEvents(): LiveEvent[] {
    return this.activeEvents.filter(event => event.isActive);
  }

  /**
   * Get upcoming events
   */
  public getUpcomingEvents(): LiveEventConfig[] {
    const currentTime = Date.now();
    return this.upcomingEvents.filter(event => event.startTime > currentTime);
  }

  /**
   * Get event by ID
   */
  public getEvent(eventId: string): LiveEvent | null {
    return this.activeEvents.find(event => event.id === eventId) || null;
  }

  /**
   * Get player's event participation
   */
  public getPlayerParticipation(playerId: string): {
    activeEvents: LiveEvent[];
    completedEvents: LiveEvent[];
    totalEvents: number;
    totalRewards: EventReward;
  } {
    const activeEvents = this.activeEvents.filter(event =>
      event.participants.some(p => p.playerId === playerId)
    );

    const completedEvents = this.eventHistory.filter(event =>
      event.participants.some(p => p.playerId === playerId)
    );

    const totalRewards: EventReward = {
      gold: 0,
      researchPoints: 0,
      cosmetics: [],
      titles: [],
      specialRewards: []
    };

    // Calculate total rewards from completed events
    completedEvents.forEach(event => {
      const participant = event.participants.find(p => p.playerId === playerId);
      if (participant?.finalRewards) {
        totalRewards.gold += participant.finalRewards.gold;
        totalRewards.researchPoints += participant.finalRewards.researchPoints;
        totalRewards.cosmetics.push(...participant.finalRewards.cosmetics);
        totalRewards.titles.push(...participant.finalRewards.titles);
        totalRewards.specialRewards.push(...participant.finalRewards.specialRewards);
      }
    });

    return {
      activeEvents,
      completedEvents,
      totalEvents: activeEvents.length + completedEvents.length,
      totalRewards
    };
  }

  /**
   * Get event statistics
   */
  public getEventStats(): {
    totalActiveEvents: number;
    totalCompletedEvents: number;
    totalParticipants: number;
    averageParticipants: number;
  } {
    const totalActiveEvents = this.activeEvents.length;
    const totalCompletedEvents = this.eventHistory.length;
    const totalParticipants = this.activeEvents.reduce((sum, event) => 
      sum + event.participants.length, 0
    );
    const averageParticipants = totalActiveEvents > 0 ? 
      totalParticipants / totalActiveEvents : 0;

    return {
      totalActiveEvents,
      totalCompletedEvents,
      totalParticipants,
      averageParticipants
    };
  }
} 