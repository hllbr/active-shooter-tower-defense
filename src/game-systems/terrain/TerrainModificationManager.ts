/**
 * 🏗️ Terrain Modification System Manager
 * Issue #63: Yeni Oyun Mekanikleri - Strategic Depth
 */

import type { 
  Position, 
  TerrainModification,
  TerrainModificationType,
  TerrainModificationCost
} from '../../models/gameTypes';

export interface TerrainModificationRequest {
  type: TerrainModificationType;
  position: Position;
  cost: TerrainModificationCost;
  description: string;
  effects: string[];
  duration?: number; // Permanent if undefined
}

export class TerrainModificationManager {
  private static instance: TerrainModificationManager;
  private modifications: TerrainModification[] = [];
  private modificationHistory: TerrainModification[] = [];

  private constructor() {
    this.initializeTerrainModificationSystem();
  }

  public static getInstance(): TerrainModificationManager {
    if (!TerrainModificationManager.instance) {
      TerrainModificationManager.instance = new TerrainModificationManager();
    }
    return TerrainModificationManager.instance;
  }

  /**
   * Initialize terrain modification system
   */
  private initializeTerrainModificationSystem(): void {
    // System is ready for modifications
  }

  /**
   * Create terrain modification
   */
  public createModification(
    request: TerrainModificationRequest,
    playerId: string
  ): TerrainModification | null {
    // Validate modification request
    if (!this.validateModificationRequest(request)) {
      return null;
    }

    const modification: TerrainModification = {
      id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: request.type,
      position: request.position,
      cost: request.cost,
      description: request.description,
      effects: request.effects,
      createdBy: playerId,
      createdAt: Date.now(),
      duration: request.duration,
      isActive: true
    };

    this.modifications.push(modification);
    this.modificationHistory.push(modification);

    // Apply modification effects
    this.applyModificationEffects(modification);

    return modification;
  }

  /**
   * Validate modification request
   */
  private validateModificationRequest(request: TerrainModificationRequest): boolean {
    // Check if position is valid
    if (request.position.x < 0 || request.position.y < 0 || 
        request.position.x > 1920 || request.position.y > 1080) {
      return false;
    }

    // Check if modification type is valid
    const validTypes: TerrainModificationType[] = [
      'crater', 'bridge', 'platform', 'trench', 'wall', 'tunnel', 'elevation'
    ];
    if (!validTypes.includes(request.type)) {
      return false;
    }

    // Check if position is not already modified
    const existingModification = this.modifications.find(mod => 
      this.getDistance(mod.position, request.position) < 50
    );
    if (existingModification) {
      return false;
    }

    return true;
  }

  /**
   * Apply modification effects
   */
  private applyModificationEffects(modification: TerrainModification): void {
    switch (modification.type) {
      case 'crater':
        this.applyCraterEffects(modification);
        break;
      case 'bridge':
        this.applyBridgeEffects(modification);
        break;
      case 'platform':
        this.applyPlatformEffects(modification);
        break;
      case 'trench':
        this.applyTrenchEffects(modification);
        break;
      case 'wall':
        this.applyWallEffects(modification);
        break;
      case 'tunnel':
        this.applyTunnelEffects(modification);
        break;
      case 'elevation':
        this.applyElevationEffects(modification);
        break;
    }
  }

  /**
   * Apply crater effects
   */
  private applyCraterEffects(modification: TerrainModification): void {
    // Crater creates area denial and slows enemies
    modification.effects.push(
      'area_denial',
      'enemy_slow',
      'tower_range_penalty'
    );
  }

  /**
   * Apply bridge effects
   */
  private applyBridgeEffects(modification: TerrainModification): void {
    // Bridge creates new pathways and tower bonuses
    modification.effects.push(
      'new_pathway',
      'tower_range_bonus',
      'movement_speed_bonus'
    );
  }

  /**
   * Apply platform effects
   */
  private applyPlatformEffects(modification: TerrainModification): void {
    // Platform provides elevated position for towers
    modification.effects.push(
      'elevated_position',
      'tower_damage_bonus',
      'line_of_sight_improvement'
    );
  }

  /**
   * Apply trench effects
   */
  private applyTrenchEffects(modification: TerrainModification): void {
    // Trench provides cover and slows enemies
    modification.effects.push(
      'cover_bonus',
      'enemy_slow',
      'defensive_position'
    );
  }

  /**
   * Apply wall effects
   */
  private applyWallEffects(modification: TerrainModification): void {
    // Wall blocks enemy movement and provides cover
    modification.effects.push(
      'movement_block',
      'cover_bonus',
      'defensive_barrier'
    );
  }

  /**
   * Apply tunnel effects
   */
  private applyTunnelEffects(modification: TerrainModification): void {
    // Tunnel creates underground pathways
    modification.effects.push(
      'underground_pathway',
      'stealth_bonus',
      'surprise_attack'
    );
  }

  /**
   * Apply elevation effects
   */
  private applyElevationEffects(modification: TerrainModification): void {
    // Elevation provides height advantage
    modification.effects.push(
      'height_advantage',
      'tower_range_bonus',
      'visibility_bonus'
    );
  }

  /**
   * Get modification cost
   */
  public getModificationCost(type: TerrainModificationType): TerrainModificationCost {
    const costs: Record<TerrainModificationType, TerrainModificationCost> = {
      crater: { gold: 200, energy: 50, researchPoints: 10 },
      bridge: { gold: 150, energy: 30, researchPoints: 5 },
      platform: { gold: 100, energy: 20, researchPoints: 3 },
      trench: { gold: 80, energy: 15, researchPoints: 2 },
      wall: { gold: 120, energy: 25, researchPoints: 4 },
      tunnel: { gold: 300, energy: 80, researchPoints: 15 },
      elevation: { gold: 250, energy: 60, researchPoints: 12 }
    };

    return costs[type];
  }

  /**
   * Get available modifications for position
   */
  public getAvailableModifications(position: Position): TerrainModificationRequest[] {
    const availableModifications: TerrainModificationRequest[] = [];

    // Check if position is near water (bridge opportunity)
    if (this.isNearWater(position)) {
      availableModifications.push({
        type: 'bridge',
        position,
        cost: this.getModificationCost('bridge'),
        description: 'Create bridge to cross water',
        effects: ['new_pathway', 'tower_range_bonus']
      });
    }

    // Check if position is on low ground (elevation opportunity)
    if (this.isLowGround(position)) {
      availableModifications.push({
        type: 'elevation',
        position,
        cost: this.getModificationCost('elevation'),
        description: 'Raise ground level for better positioning',
        effects: ['height_advantage', 'tower_range_bonus']
      });
    }

    // Always available modifications
    availableModifications.push(
      {
        type: 'crater',
        position,
        cost: this.getModificationCost('crater'),
        description: 'Create crater for area denial',
        effects: ['area_denial', 'enemy_slow']
      },
      {
        type: 'platform',
        position,
        cost: this.getModificationCost('platform'),
        description: 'Build elevated platform',
        effects: ['elevated_position', 'tower_damage_bonus']
      },
      {
        type: 'trench',
        position,
        cost: this.getModificationCost('trench'),
        description: 'Dig defensive trench',
        effects: ['cover_bonus', 'enemy_slow']
      },
      {
        type: 'wall',
        position,
        cost: this.getModificationCost('wall'),
        description: 'Build defensive wall',
        effects: ['movement_block', 'cover_bonus']
      }
    );

    return availableModifications;
  }

  /**
   * Check if position is near water
   */
  private isNearWater(_position: Position): boolean {
    // Simplified water detection - could be based on actual terrain data
    return Math.random() < 0.3; // 30% chance of being near water
  }

  /**
   * Check if position is on low ground
   */
  private isLowGround(_position: Position): boolean {
    // Simplified elevation detection
    return Math.random() < 0.4; // 40% chance of being low ground
  }

  /**
   * Get distance between two positions
   */
  private getDistance(pos1: Position, pos2: Position): number {
    return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
  }

  /**
   * Get modifications at position
   */
  public getModificationsAt(position: Position): TerrainModification[] {
    return this.modifications.filter(modification => {
      const distance = this.getDistance(modification.position, position);
      return distance < 100 && modification.isActive; // 100px radius
    });
  }

  /**
   * Remove modification
   */
  public removeModification(modificationId: string): boolean {
    const modification = this.modifications.find(mod => mod.id === modificationId);
    if (!modification) return false;

    modification.isActive = false;
    modification.removedAt = Date.now();

    return true;
  }

  /**
   * Get modification statistics
   */
  public getModificationStats(): {
    totalModifications: number;
    activeModifications: number;
    modificationsByType: Record<TerrainModificationType, number>;
    totalCost: TerrainModificationCost;
  } {
    const activeModifications = this.modifications.filter(mod => mod.isActive);
    const modificationsByType: Record<TerrainModificationType, number> = {
      crater: 0, bridge: 0, platform: 0, trench: 0, wall: 0, tunnel: 0, elevation: 0
    };

    const totalCost: TerrainModificationCost = { gold: 0, energy: 0, researchPoints: 0 };

    for (const modification of activeModifications) {
      modificationsByType[modification.type]++;
      totalCost.gold += modification.cost.gold;
      totalCost.energy += modification.cost.energy;
      totalCost.researchPoints += modification.cost.researchPoints;
    }

    return {
      totalModifications: this.modifications.length,
      activeModifications: activeModifications.length,
      modificationsByType,
      totalCost
    };
  }

  /**
   * Get strategic value of position
   */
  public getStrategicValue(position: Position): number {
    let value = 0;

    // Base value
    value += 10;

    // Value from nearby modifications
    const nearbyModifications = this.getModificationsAt(position);
    for (const modification of nearbyModifications) {
      switch (modification.type) {
        case 'platform':
          value += 20; // High strategic value
          break;
        case 'elevation':
          value += 15; // Good strategic value
          break;
        case 'bridge':
          value += 12; // Moderate strategic value
          break;
        case 'wall':
          value += 8; // Defensive value
          break;
        case 'trench':
          value += 6; // Cover value
          break;
        case 'crater':
          value += 4; // Area denial value
          break;
      }
    }

    // Value from terrain features
    if (this.isNearWater(position)) value += 5;
    if (this.isLowGround(position)) value += 3;

    return value;
  }
} 