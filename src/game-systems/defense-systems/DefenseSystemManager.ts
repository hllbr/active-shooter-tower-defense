import type { Tower, TowerSlot, Position, Enemy, Effect } from '../../models/gameTypes';
import { GAME_CONSTANTS } from '../../utils/constants';
import { getDefenseRecommendations } from "./helpers/recommendations";

/**
 * Defense System Manager
 * Handles shield generators and repair stations for Issue #54
 */
export class DefenseSystemManager {
  private static instance: DefenseSystemManager;
  
  public static getInstance(): DefenseSystemManager {
    if (!DefenseSystemManager.instance) {
      DefenseSystemManager.instance = new DefenseSystemManager();
    }
    return DefenseSystemManager.instance;
  }

  /**
   * Update all defense systems
   */
  public updateDefenseSystems(
    towerSlots: TowerSlot[],
    enemies: Enemy[],
    addEffect: (effect: Effect) => void,
    currentTime: number
  ): void {
    // Update shield generators
    this.updateShieldGenerators(towerSlots, enemies, addEffect, currentTime);
    
    // Update repair stations
    this.updateRepairStations(towerSlots, currentTime);
  }

  /**
   * Update shield generators
   */
  private updateShieldGenerators(
    towerSlots: TowerSlot[],
    enemies: Enemy[],
    addEffect: (effect: Effect) => void,
    currentTime: number
  ): void {
    const shieldGenerators = towerSlots.filter(slot => 
      slot.tower && slot.tower.towerClass === 'shield_generator'
    );

    for (const generatorSlot of shieldGenerators) {
      const generator = generatorSlot.tower!;
      
      // Regenerate shield strength if damaged
      if (generator.shieldStrength! < generator.maxHealth && currentTime - generator.lastHealthRegen > 1000) {
        generator.shieldStrength = Math.min(
          generator.maxHealth,
          generator.shieldStrength! + (generator.shieldRegenRate || 10)
        );
        generator.lastHealthRegen = currentTime;
      }

      // Apply shield protection to nearby towers
      this.applyShieldProtection(generator, towerSlots, enemies, addEffect, currentTime);
    }
  }

  /**
   * Apply shield protection to nearby towers
   */
  private applyShieldProtection(
    shieldGenerator: Tower,
    towerSlots: TowerSlot[],
    enemies: Enemy[],
    addEffect: (effect: Effect) => void,
    currentTime: number
  ): void {
    const protectionRadius = shieldGenerator.supportRadius || 150;
    const protectionStrength = shieldGenerator.supportIntensity || 0.5;

    // Find towers within protection radius
    const protectedTowers = towerSlots.filter(slot => {
      if (!slot.tower || slot.tower.id === shieldGenerator.id) return false;
      
      const distance = this.getDistance(shieldGenerator.position, slot.tower.position);
      return distance <= protectionRadius;
    });

    // Apply shield effects to protected towers
    for (const protectedSlot of protectedTowers) {
      const tower = protectedSlot.tower!;
      
      // Increase tower's effective health with shield
      const shieldBonus = Math.floor(shieldGenerator.shieldStrength! * protectionStrength);
      if (shieldBonus > 0) {
        tower.wallStrength = Math.max(tower.wallStrength, tower.wallStrength + shieldBonus);
      }

      // Create visual shield effect
      this.createShieldEffect(tower, addEffect, currentTime);
    }

    // Shield generator can intercept incoming damage
    this.interceptIncomingDamage(shieldGenerator, enemies, protectedTowers.map(s => s.tower!));
  }

  /**
   * Update repair stations
   */
  private updateRepairStations(
    towerSlots: TowerSlot[],
    currentTime: number
  ): void {
    const repairStations = towerSlots.filter(slot => 
      slot.tower && slot.tower.towerClass === 'repair_station'
    );

    for (const repairSlot of repairStations) {
      const repairStation = repairSlot.tower!;
      
      // Repair nearby towers
      this.repairNearbyTowers(repairStation, towerSlots, currentTime);
    }
  }

  /**
   * Repair nearby towers
   */
  private repairNearbyTowers(
    repairStation: Tower,
    towerSlots: TowerSlot[],
    currentTime: number
  ): void {
    const repairRadius = repairStation.supportRadius || 120;
    const repairRate = repairStation.repairRate || 15;
    const repairInterval = 1000; // Repair every second

    if (currentTime - repairStation.lastHealthRegen < repairInterval) {
      return;
    }

    // Find damaged towers within repair radius
    const damagedTowers = towerSlots.filter(slot => {
      if (!slot.tower || slot.tower.id === repairStation.id) return false;
      if (slot.tower.health >= slot.tower.maxHealth) return false;
      
      const distance = this.getDistance(repairStation.position, slot.tower.position);
      return distance <= repairRadius;
    });

    // Repair damaged towers
    for (const damagedSlot of damagedTowers) {
      const tower = damagedSlot.tower!;
      
      const healAmount = Math.min(repairRate, tower.maxHealth - tower.health);
      tower.health += healAmount;
      
      // Create repair effect
      this.createRepairEffect(tower, healAmount);
    }

    repairStation.lastHealthRegen = currentTime;
  }

  /**
   * Create shield effect
   */
  private createShieldEffect(
    tower: Tower,
    addEffect: (effect: Effect) => void,
    currentTime: number
  ): void {
    const shieldEffect: Effect = {
      id: `shield-${tower.id}-${currentTime}`,
      position: tower.position,
      type: 'shield',
      radius: tower.size + 10,
      color: '#00bfff',
      life: 100,
      maxLife: 100,
      alpha: 0.3,
      damage: 0,
      size: tower.size + 10,
      speed: { x: 0, y: 0 },
      createdAt: currentTime,
      visual: {
        type: 'circle',
        color: '#00bfff',
        size: tower.size + 10
      }
    };

    addEffect(shieldEffect);
  }

  /**
   * Create repair effect
   */
  private createRepairEffect(
    tower: Tower,
    healAmount: number
  ): void {
    // Create visual repair effect (sparks, tools, etc.)
    if (GAME_CONSTANTS.DEBUG_MODE) {
    }
  }

  /**
   * Intercept incoming damage to shields
   */
  private interceptIncomingDamage(
    shieldGenerator: Tower,
    enemies: Enemy[],
    protectedTowers: Tower[]
  ): void {
    // Check if any enemy is targeting protected towers
    const threateningEnemies = enemies.filter(enemy => {
      return protectedTowers.some(tower => {
        const distance = this.getDistance(enemy.position, tower.position);
        return distance <= enemy.size + tower.size + 20; // Close enough to attack
      });
    });

    // Shield generator can take damage instead of protected towers
    for (const enemy of threateningEnemies) {
      const distanceToShield = this.getDistance(enemy.position, shieldGenerator.position);
      const maxProtectionRange = shieldGenerator.supportRadius || 150;
      
      // If shield is closer than protected tower, it can intercept damage
      if (distanceToShield <= maxProtectionRange) {
        // Logic to redirect damage to shield would go here
        // This would be integrated with the combat system
      }
    }
  }

  /**
   * Get shield status for a tower
   */
  public getShieldStatus(
    tower: Tower,
    towerSlots: TowerSlot[]
  ): { 
    hasShield: boolean; 
    shieldStrength: number; 
    shieldGenerator: Tower | null 
  } {
    const nearbyShields = towerSlots.filter(slot => {
      if (!slot.tower || slot.tower.towerClass !== 'shield_generator') return false;
      
      const distance = this.getDistance(tower.position, slot.tower.position);
      return distance <= (slot.tower.supportRadius || 150);
    });

    if (nearbyShields.length === 0) {
      return { hasShield: false, shieldStrength: 0, shieldGenerator: null };
    }

    // Use the strongest shield generator
    const strongestShield = nearbyShields.reduce((strongest, current) => {
      const currentStrength = current.tower!.shieldStrength || 0;
      const strongestStrength = strongest.tower!.shieldStrength || 0;
      return currentStrength > strongestStrength ? current : strongest;
    });

    return {
      hasShield: true,
      shieldStrength: strongestShield.tower!.shieldStrength || 0,
      shieldGenerator: strongestShield.tower!
    };
  }

  /**
   * Get repair status for a tower
   */
  public getRepairStatus(
    tower: Tower,
    towerSlots: TowerSlot[]
  ): { 
    hasRepair: boolean; 
    repairRate: number; 
    repairStation: Tower | null 
  } {
    const nearbyRepairStations = towerSlots.filter(slot => {
      if (!slot.tower || slot.tower.towerClass !== 'repair_station') return false;
      
      const distance = this.getDistance(tower.position, slot.tower.position);
      return distance <= (slot.tower.supportRadius || 120);
    });

    if (nearbyRepairStations.length === 0) {
      return { hasRepair: false, repairRate: 0, repairStation: null };
    }

    // Use the fastest repair station
    const fastestRepair = nearbyRepairStations.reduce((fastest, current) => {
      const currentRate = current.tower!.repairRate || 0;
      const fastestRate = fastest.tower!.repairRate || 0;
      return currentRate > fastestRate ? current : fastest;
    });

    return {
      hasRepair: true,
      repairRate: fastestRepair.tower!.repairRate || 0,
      repairStation: fastestRepair.tower!
    };
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
  public getDefenseRecommendations(towerSlots: TowerSlot[], enemies: Enemy[]) {
    return getDefenseRecommendations(towerSlots, enemies);
  }


}

// Global defense system manager instance
export const defenseSystemManager = DefenseSystemManager.getInstance(); 
