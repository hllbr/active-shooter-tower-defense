/**
 * 👥 Alliance System Manager
 * Issue #63: Yeni Oyun Mekanikleri - Alliance System
 */

import type { 
  Alliance, 
  AllianceMember, 
  AllianceResearch, 
  AllianceBonus, 
  PlayerProfile
} from '../../models/gameTypes';

export class AllianceManager {
  private static instance: AllianceManager;
  private alliances: Map<string, Alliance> = new Map();
  private playerAlliances: Map<string, string> = new Map(); // playerId -> allianceId

  private constructor() {
    this.initializeAllianceSystem();
  }

  public static getInstance(): AllianceManager {
    if (!AllianceManager.instance) {
      AllianceManager.instance = new AllianceManager();
    }
    return AllianceManager.instance;
  }

  /**
   * Initialize alliance system
   */
  private initializeAllianceSystem(): void {
    // Create some default alliances for testing
    this.createAlliance({
      name: 'Elite Defenders',
      tag: 'ELITE',
      level: 1,
      members: [],
      maxMembers: 50,
      research: {
        activeProjects: [],
        completedProjects: [],
        researchPower: 0
      },
      buildings: {
        headquarters: { level: 1, bonuses: [] },
        laboratory: { level: 1, researchSpeed: 1.0 },
        treasury: { level: 1, resourceCapacity: 10000 },
        barracks: { level: 1, memberBonuses: [] }
      },
      events: {
        allianceWars: [],
        cooperativeRaids: [],
        resourceSharing: {
          gold: 0,
          energy: 0,
          researchPoints: 0,
          lastContribution: 0
        }
      }
    });
  }

  /**
   * Create new alliance
   */
  public createAlliance(allianceData: Omit<Alliance, 'id'>): Alliance {
    const alliance: Alliance = {
      id: `alliance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...allianceData
    };

    this.alliances.set(alliance.id, alliance);
    return alliance;
  }

  /**
   * Join alliance
   */
  public joinAlliance(playerId: string, allianceId: string, _playerProfile: PlayerProfile): boolean {
    const alliance = this.alliances.get(allianceId);
    if (!alliance) return false;

    if (alliance.members.length >= alliance.maxMembers) return false;

    const member: AllianceMember = {
      playerId,
      rank: 'member',
      contribution: {
        research: 0,
        resources: 0,
        activity: 0
      },
      permissions: ['view_alliance', 'contribute_resources']
    };

    alliance.members.push(member);
    this.playerAlliances.set(playerId, allianceId);

    // Apply alliance bonuses to player
    this.applyAllianceBonuses(playerId, alliance);

    return true;
  }

  /**
   * Leave alliance
   */
  public leaveAlliance(playerId: string): boolean {
    const allianceId = this.playerAlliances.get(playerId);
    if (!allianceId) return false;

    const alliance = this.alliances.get(allianceId);
    if (!alliance) return false;

    alliance.members = alliance.members.filter(member => member.playerId !== playerId);
    this.playerAlliances.delete(playerId);

    // Remove alliance bonuses from player
    this.removeAllianceBonuses(playerId);

    return true;
  }

  /**
   * Get player's alliance
   */
  public getPlayerAlliance(playerId: string): Alliance | null {
    const allianceId = this.playerAlliances.get(playerId);
    if (!allianceId) return null;

    return this.alliances.get(allianceId) || null;
  }

  /**
   * Contribute resources to alliance
   */
  public contributeResources(
    playerId: string, 
    resourceType: 'gold' | 'energy' | 'researchPoints', 
    amount: number
  ): boolean {
    const alliance = this.getPlayerAlliance(playerId);
    if (!alliance) return false;

    const member = alliance.members.find(m => m.playerId === playerId);
    if (!member) return false;

    // Update member contribution
    member.contribution.resources += amount;

    // Update alliance resource pool
    alliance.events.resourceSharing[resourceType] += amount;
    alliance.events.resourceSharing.lastContribution = Date.now();

    // Update alliance level based on total contributions
    this.updateAllianceLevel(alliance);

    return true;
  }

  /**
   * Start alliance research project
   */
  public startResearchProject(
    allianceId: string, 
    projectType: string, 
    cost: number
  ): boolean {
    const alliance = this.alliances.get(allianceId);
    if (!alliance) return false;

    // Check if alliance has enough research points
    if (alliance.events.resourceSharing.researchPoints < cost) return false;

    const researchProject: AllianceResearch = {
      id: `research_${Date.now()}`,
      type: projectType,
      cost,
      progress: 0,
      maxProgress: cost,
      startTime: Date.now(),
      estimatedCompletion: Date.now() + (cost * 1000), // 1 second per research point
      contributors: []
    };

    alliance.research.activeProjects.push(researchProject);
    alliance.events.resourceSharing.researchPoints -= cost;

    return true;
  }

  /**
   * Contribute to alliance research
   */
  public contributeToResearch(
    playerId: string, 
    projectId: string, 
    amount: number
  ): boolean {
    const alliance = this.getPlayerAlliance(playerId);
    if (!alliance) return false;

    const project = alliance.research.activeProjects.find(p => p.id === projectId);
    if (!project) return false;

    const member = alliance.members.find(m => m.playerId === playerId);
    if (!member) return false;

    // Update project progress
    project.progress += amount;
    member.contribution.research += amount;

    // Check if project is completed
    if (project.progress >= project.maxProgress) {
      this.completeResearchProject(alliance, project);
    }

    return true;
  }

  /**
   * Complete research project
   */
  private completeResearchProject(alliance: Alliance, project: AllianceResearch): void {
    // Move project to completed
    alliance.research.completedProjects.push(project.type);
    alliance.research.activeProjects = alliance.research.activeProjects.filter(p => p.id !== project.id);

    // Apply research bonuses
    this.applyResearchBonuses(alliance, project.type);

    // Grant rewards to contributors
    this.grantResearchRewards(alliance, project);
  }

  /**
   * Apply research bonuses to alliance
   */
  private applyResearchBonuses(alliance: Alliance, researchType: string): void {
    const researchBonuses: Record<string, AllianceBonus[]> = {
      'damage_boost': [
        { type: 'damage_multiplier', value: 0.1, description: '+10% damage for all members' }
      ],
      'energy_efficiency': [
        { type: 'energy_regen', value: 0.2, description: '+20% energy regeneration' }
      ],
      'resource_bonus': [
        { type: 'gold_bonus', value: 0.15, description: '+15% gold earnings' }
      ],
      'experience_boost': [
        { type: 'experience_multiplier', value: 0.25, description: '+25% experience gain' }
      ]
    };

    const bonuses = researchBonuses[researchType] || [];
    alliance.buildings.headquarters.bonuses.push(...bonuses);
  }

  /**
   * Grant research rewards to contributors
   */
  private grantResearchRewards(alliance: Alliance, project: AllianceResearch): void {
    const totalContribution = project.contributors.reduce((sum, c) => sum + c.amount, 0);
    
    for (const contributor of project.contributors) {
      const member = alliance.members.find(m => m.playerId === contributor.playerId);
      if (member) {
        const rewardShare = contributor.amount / totalContribution;
        const _reward = Math.floor(project.cost * rewardShare * 0.5); // 50% of cost as reward
        
        // Grant rewards (would be integrated with player system)
      }
    }
  }

  /**
   * Update alliance level based on total contributions
   */
  private updateAllianceLevel(alliance: Alliance): void {
    const totalContributions = alliance.members.reduce((sum, member) => 
      sum + member.contribution.resources + member.contribution.research, 0
    );

    const newLevel = Math.floor(totalContributions / 10000) + 1;
    if (newLevel > alliance.level) {
      alliance.level = newLevel;
      alliance.maxMembers = Math.min(50, 10 + (newLevel * 5)); // +5 members per level, max 50
      
      // Apply level-up bonuses
      this.applyLevelUpBonuses(alliance);
    }
  }

  /**
   * Apply level-up bonuses to alliance
   */
  private applyLevelUpBonuses(_alliance: Alliance): void {
    // This would be integrated with the alliance system
  }

  /**
   * Apply alliance bonuses to player
   */
  private applyAllianceBonuses(_playerId: string, _alliance: Alliance): void {
    // This would be integrated with the player system
  }

  /**
   * Remove alliance bonuses from player
   */
  private removeAllianceBonuses(_playerId: string): void {
    // This would be integrated with the player system
  }

  /**
   * Get alliance leaderboard
   */
  public getAllianceLeaderboard(): Alliance[] {
    return Array.from(this.alliances.values()).sort((a, b) => {
      // Sort by level, then by total contributions
      if (a.level !== b.level) return b.level - a.level;
      
      const aContributions = a.members.reduce((sum, m) => sum + m.contribution.resources + m.contribution.research, 0);
      const bContributions = b.members.reduce((sum, m) => sum + m.contribution.resources + m.contribution.research, 0);
      
      return bContributions - aContributions;
    });
  }

  /**
   * Get alliance statistics
   */
  public getAllianceStats(allianceId: string): {
    totalMembers: number;
    totalContributions: number;
    activeResearchProjects: number;
    completedResearchProjects: number;
    averageMemberLevel: number;
  } | null {
    const alliance = this.alliances.get(allianceId);
    if (!alliance) return null;

    const totalContributions = alliance.members.reduce((sum, m) => 
      sum + m.contribution.resources + m.contribution.research, 0
    );

    return {
      totalMembers: alliance.members.length,
      totalContributions,
      activeResearchProjects: alliance.research.activeProjects.length,
      completedResearchProjects: alliance.research.completedProjects.length,
      averageMemberLevel: alliance.members.length > 0 ? 
        alliance.members.reduce((sum, m) => sum + m.contribution.activity, 0) / alliance.members.length : 0
    };
  }
} 