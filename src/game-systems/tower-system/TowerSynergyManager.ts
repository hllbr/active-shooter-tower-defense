import type { Tower, TowerSlot, Position } from '../../models/gameTypes';

/**
 * Enhanced Tower Synergy Manager
 * Manages tower combinations, synergy bonuses, strategic positioning, and UI display
 * Implements Issue #54 tower synergy requirements with active synergy tracking
 */
export class TowerSynergyManager {
  private static instance: TowerSynergyManager;
  
  public static getInstance(): TowerSynergyManager {
    if (!TowerSynergyManager.instance) {
      TowerSynergyManager.instance = new TowerSynergyManager();
    }
    return TowerSynergyManager.instance;
  }

  /**
   * Calculate synergy bonuses for a tower based on nearby towers
   */
  public calculateSynergyBonuses(
    tower: Tower, 
    allTowerSlots: TowerSlot[]
  ): { damage: number; range: number; fireRate: number } {
    const bonuses = { damage: 0, range: 0, fireRate: 0 };
    
    if (!tower.towerClass) return bonuses;
    
    const nearbyTowers = this.getNearbyTowers(tower, allTowerSlots, 200);
    
    // Apply synergy combinations
    for (const nearbyTower of nearbyTowers) {
      if (!nearbyTower.towerClass) continue;
      
      const synergyBonus = this.getSynergyBonus(tower.towerClass, nearbyTower.towerClass);
      if (synergyBonus) {
        bonuses.damage += synergyBonus.damage || 0;
        bonuses.range += synergyBonus.range || 0;
        bonuses.fireRate += synergyBonus.fireRate || 0;
      }
    }
    
    return bonuses;
  }

  /**
   * Get active synergies for display in UI
   */
  public getActiveSynergies(towerSlots: TowerSlot[]): Array<{
    towerId: string;
    towerClass: string;
    synergies: Array<{
      partnerClass: string;
      bonuses: { damage?: number; range?: number; fireRate?: number };
      description: string;
    }>;
  }> {
    const activeSynergies: Array<{
      towerId: string;
      towerClass: string;
      synergies: Array<{
        partnerClass: string;
        bonuses: { damage?: number; range?: number; fireRate?: number };
        description: string;
      }>;
    }> = [];

    for (const slot of towerSlots) {
      if (!slot.tower || !slot.tower.towerClass) continue;

      const nearbyTowers = this.getNearbyTowers(slot.tower, towerSlots, 200);
      const synergies: Array<{
        partnerClass: string;
        bonuses: { damage?: number; range?: number; fireRate?: number };
        description: string;
      }> = [];

      for (const nearbyTower of nearbyTowers) {
        if (!nearbyTower.towerClass) continue;

        const synergyBonus = this.getSynergyBonus(slot.tower!.towerClass!, nearbyTower.towerClass);
        if (synergyBonus) {
          synergies.push({
            partnerClass: nearbyTower.towerClass,
            bonuses: synergyBonus,
            description: this.getSynergyDescription(slot.tower!.towerClass!, nearbyTower.towerClass)
          });
        }
      }

      if (synergies.length > 0) {
        activeSynergies.push({
          towerId: slot.tower!.id,
          towerClass: slot.tower!.towerClass!,
          synergies
        });
      }
    }

    return activeSynergies;
  }

  /**
   * Get synergy description for UI display
   */
  private getSynergyDescription(towerClass1: string, towerClass2: string): string {
    const descriptions: Record<string, string> = {
      'sniper_radar': 'Spotter-Sniper: Enhanced targeting and critical hits',
      'gatling_supply_depot': 'Supply-Artillery: Sustained rapid fire',
      'laser_shield_generator': 'Protected Firepower: Shielded laser beams',
      'mortar_radar': 'Guided Artillery: Precision mortar strikes',
      'flamethrower_supply_depot': 'Fuel Supply: Extended flame duration',
      'mortar_stealth_detector': 'Target Marking: Revealed enemy targeting',
      'radar_sniper': 'Enhanced Targeting: Critical hit enablement',
      'supply_depot_gatling': 'Ammo Supply: Sustained gatling fire',
      'shield_generator_repair_station': 'Defense Network: Coordinated protection',
      'shield_generator_shield_generator': 'Shield Network: Reinforced barriers',
      'repair_station_repair_station': 'Repair Network: Accelerated healing',
      'shield_generator_laser': 'Protected Firepower: Shielded laser beams',
      'emp_stealth_detector': 'Electronic Warfare: Disruption and detection',
      'stealth_detector_sniper': 'Target Acquisition: Precision ghost hunting',
      'air_defense_radar': 'Air Superiority: Enhanced aerial targeting',
      'sniper_supply_depot': 'Precision Support: Enhanced sniper accuracy',
      'mortar_shield_generator': 'Protected Artillery: Shielded mortar fire',
      'gatling_repair_station': 'Sustained Fire: Continuous gatling operation',
      'flamethrower_emp': 'Disruption Combo: Fire and electronic warfare'
    };

    const key1 = `${towerClass1}_${towerClass2}`;
    const key2 = `${towerClass2}_${towerClass1}`;
    
    return descriptions[key1] || descriptions[key2] || 'Synergy Bonus';
  }

  /**
   * Get nearby towers within specified radius
   */
  private getNearbyTowers(
    tower: Tower, 
    allTowerSlots: TowerSlot[], 
    radius: number
  ): Tower[] {
    const nearbyTowers: Tower[] = [];
    
    for (const slot of allTowerSlots) {
      if (!slot.tower || slot.tower.id === tower.id) continue;
      
      const distance = this.getDistance(tower.position, slot.tower.position);
      if (distance <= radius) {
        nearbyTowers.push(slot.tower);
      }
    }
    
    return nearbyTowers;
  }

  /**
   * Get synergy bonus between two tower types
   */
  private getSynergyBonus(
    towerClass1: string, 
    towerClass2: string
  ): { damage?: number; range?: number; fireRate?: number } | null {
    const synergyCombinations = {
      // ASSAULT COMBINATIONS
      'sniper_radar': { damage: 0.5, range: 0.2 }, // Spotter-Sniper combo
      'gatling_supply_depot': { damage: 0.3, fireRate: 0.25 }, // Supply-Artillery combo
      'laser_shield_generator': { damage: 0.2, range: 0.15 }, // Defensive support
      
      // AREA CONTROL COMBINATIONS
      'mortar_radar': { damage: 0.4, range: 0.3 }, // Guided mortars
      'flamethrower_supply_depot': { fireRate: 0.3, damage: 0.2 }, // Fuel supply
      'mortar_stealth_detector': { damage: 0.3, range: 0.2 }, // Target marking
      
      // SUPPORT COMBINATIONS
      'radar_sniper': { damage: 0.5, range: 0.2 }, // Enhanced targeting
      'supply_depot_gatling': { damage: 0.3, fireRate: 0.25 }, // Ammo supply
      'shield_generator_repair_station': { fireRate: 0.2, range: 0.1 }, // Defense network
      
      // DEFENSIVE COMBINATIONS
      'shield_generator_shield_generator': { damage: 0.1, range: 0.2 }, // Shield network
      'repair_station_repair_station': { fireRate: 0.15, range: 0.15 }, // Repair network
      'shield_generator_laser': { damage: 0.2, range: 0.15 }, // Protected firepower
      
      // SPECIALIST COMBINATIONS
      'emp_stealth_detector': { damage: 0.4, range: 0.25 }, // Electronic warfare
      'stealth_detector_sniper': { damage: 0.6, range: 0.3 }, // Target acquisition
      'air_defense_radar': { damage: 0.3, range: 0.4 }, // Air superiority
      
      // CROSS-CATEGORY COMBOS
      'sniper_supply_depot': { damage: 0.25, range: 0.1 }, // Precision support
      'mortar_shield_generator': { damage: 0.2, fireRate: 0.1 }, // Protected artillery
      'gatling_repair_station': { fireRate: 0.2, damage: 0.1 }, // Sustained fire
      'flamethrower_emp': { damage: 0.3, fireRate: 0.15 }, // Disruption combo
    };
    
    // Check both directions
    const key1 = `${towerClass1}_${towerClass2}`;
    const key2 = `${towerClass2}_${towerClass1}`;
    
    return synergyCombinations[key1 as keyof typeof synergyCombinations] || 
           synergyCombinations[key2 as keyof typeof synergyCombinations] || 
           null;
  }

  /**
   * Calculate distance between two positions
   */
  private getDistance(pos1: Position, pos2: Position): number {
    return Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + 
      Math.pow(pos1.y - pos2.y, 2)
    );
  }

  /**
   * Update synergy bonuses for all towers
   */
  public updateAllSynergyBonuses(towerSlots: TowerSlot[]): void {
    for (const slot of towerSlots) {
      if (!slot.tower) continue;
      
      const bonuses = this.calculateSynergyBonuses(slot.tower, towerSlots);
      slot.tower.synergyBonuses = bonuses;
    }
  }

  /**
   * Get strategic positioning bonuses
   */
  public getPositioningBonus(
    tower: Tower,
    position: Position,
    allTowerSlots: TowerSlot[]
  ): { damage: number; range: number; fireRate: number } {
    const bonuses = { damage: 0, range: 0, fireRate: 0 };
    
    // High ground bonus (simulated - could be based on actual terrain)
    if (this.isHighGround(position)) {
      bonuses.range += 0.25; // +25% range on high ground
    }
    
    // Chokepoint bonus (simulated - could be based on enemy path analysis)
    if (this.isChokepoint(position)) {
      if (tower.areaOfEffect && tower.areaOfEffect > 0) {
        bonuses.damage += 0.5; // +50% damage for AoE weapons in chokepoints
      }
    }
    
    // Overlapping fields bonus
    const overlappingTowers = this.getOverlappingTowers(tower, allTowerSlots);
    if (overlappingTowers.length > 0) {
      bonuses.damage += overlappingTowers.length * 0.1; // +10% per overlapping tower
    }
    
    return bonuses;
  }

  /**
   * Check if position is high ground (placeholder implementation)
   */
  private isHighGround(position: Position): boolean {
    // Simplified: top 20% of screen is considered high ground
    return position.y < window.innerHeight * 0.2;
  }

  /**
   * Check if position is a chokepoint (placeholder implementation)
   */
  private isChokepoint(position: Position): boolean {
    // Simplified: center areas are considered chokepoints
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const distance = Math.sqrt(
      Math.pow(position.x - centerX, 2) + 
      Math.pow(position.y - centerY, 2)
    );
    return distance < 150; // Within 150px of center
  }

  /**
   * Get towers with overlapping range
   */
  private getOverlappingTowers(tower: Tower, allTowerSlots: TowerSlot[]): Tower[] {
    const overlapping: Tower[] = [];
    
    for (const slot of allTowerSlots) {
      if (!slot.tower || slot.tower.id === tower.id) continue;
      
      const distance = this.getDistance(tower.position, slot.tower.position);
      const rangeOverlap = tower.range + slot.tower.range;
      
      if (distance < rangeOverlap * 0.5) { // 50% range overlap required
        overlapping.push(slot.tower);
      }
    }
    
    return overlapping;
  }

  /**
   * Get recommended tower combinations
   */
  public getRecommendedCombinations(
    existingTowers: Tower[]
  ): Array<{ towerClass: string; reason: string; bonus: string }> {
    const recommendations: Array<{ towerClass: string; reason: string; bonus: string }> = [];
    
    for (const tower of existingTowers) {
      if (!tower.towerClass) continue;
      
      const synergies = this.getAvailableSynergies(tower.towerClass);
      for (const synergy of synergies) {
        // Check if we don't already have this combination
        const hasCombo = existingTowers.some(t => t.towerClass === synergy.towerClass);
        if (!hasCombo) {
          recommendations.push({
            towerClass: synergy.towerClass,
            reason: `Synergy with ${tower.towerClass}`,
            bonus: synergy.bonusDescription
          });
        }
      }
    }
    
    return recommendations.slice(0, 3); // Return top 3 recommendations
  }

  /**
   * Get available synergies for a tower class
   */
  private getAvailableSynergies(towerClass: string): Array<{ towerClass: string; bonusDescription: string }> {
    const synergies: Record<string, Array<{ towerClass: string; bonusDescription: string }>> = {
      sniper: [
        { towerClass: 'radar', bonusDescription: '+50% damage, +20% range' },
        { towerClass: 'supply_depot', bonusDescription: '+25% damage, +10% range' }
      ],
      gatling: [
        { towerClass: 'supply_depot', bonusDescription: '+30% damage, +25% fire rate' },
        { towerClass: 'repair_station', bonusDescription: '+20% fire rate, +10% damage' }
      ],
      laser: [
        { towerClass: 'shield_generator', bonusDescription: '+20% damage, +15% range' }
      ],
      mortar: [
        { towerClass: 'radar', bonusDescription: '+40% damage, +30% range' },
        { towerClass: 'stealth_detector', bonusDescription: '+30% damage, +20% range' }
      ],
      flamethrower: [
        { towerClass: 'supply_depot', bonusDescription: '+30% fire rate, +20% damage' },
        { towerClass: 'emp', bonusDescription: '+30% damage, +15% fire rate' }
      ],
      radar: [
        { towerClass: 'sniper', bonusDescription: 'Enables sniper critical hits' },
        { towerClass: 'air_defense', bonusDescription: '+30% damage, +40% range' }
      ],
      supply_depot: [
        { towerClass: 'gatling', bonusDescription: 'Sustains gatling fire rate' },
        { towerClass: 'mortar', bonusDescription: 'Faster reload times' }
      ]
    };
    
    return synergies[towerClass] || [];
  }

  /**
   * Get synergy visual effects for rendering
   */
  public getSynergyVisualEffects(towerSlots: TowerSlot[]): Array<{
    position: Position;
    color: string;
    radius: number;
    opacity: number;
    type: 'synergy' | 'positioning';
  }> {
    const effects: Array<{
      position: Position;
      color: string;
      radius: number;
      opacity: number;
      type: 'synergy' | 'positioning';
    }> = [];

    for (const slot of towerSlots) {
      if (!slot.tower) continue;

      // Add synergy glow effects
      const activeSynergies = this.getActiveSynergies(towerSlots);
      const towerSynergies = activeSynergies.find(s => s.towerId === slot.tower!.id);
      
      if (towerSynergies && towerSynergies.synergies.length > 0) {
        effects.push({
          position: slot.tower.position,
          color: '#00FFFF', // Cyan for synergy
          radius: 30,
          opacity: 0.6,
          type: 'synergy'
        });
      }

      // Add positioning bonus effects
      const positioningBonus = this.getPositioningBonus(slot.tower, slot.tower.position, towerSlots);
      if (positioningBonus.damage > 0 || positioningBonus.range > 0 || positioningBonus.fireRate > 0) {
        effects.push({
          position: slot.tower.position,
          color: '#FFD700', // Gold for positioning
          radius: 25,
          opacity: 0.4,
          type: 'positioning'
        });
      }
    }

    return effects;
  }
}

// Export singleton instance
export const towerSynergyManager = TowerSynergyManager.getInstance(); 