import { useGameStore } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/constants';
import type { Position, Enemy, TowerSlot } from '../../models/gameTypes';
import { defenseTargetManager } from '../defense-systems/DefenseTargetManager';

/**
 * Enhanced Finder class responsible for finding the nearest target for enemies
 * Features:
 * - Dynamic target selection based on enemy type
 * - Performance optimizations with spatial partitioning
 * - Advanced targeting logic for different enemy behaviors
 * - Defense target targeting when no towers are present
 */
export class TargetFinder {
  // Performance optimization: Cache for target calculations
  private static targetCache = new Map<string, { target: TowerSlot; timestamp: number }>();
  private static readonly CACHE_DURATION = 50; // ms

  /**
   * Gets the nearest slot with a tower for an enemy to target
   * Enhanced with dynamic targeting based on enemy type
   * Now includes defense target targeting when no towers are present
   */
  static getNearestSlot(pos: Position, enemy?: Enemy) {
    const cacheKey = `${Math.floor(pos.x / 50)}_${Math.floor(pos.y / 50)}_${enemy?.type || 'basic'}`;
    const now = performance.now();
    const cached = this.targetCache.get(cacheKey);

    // Use cached result if still valid
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.target;
    }

    const slotsWithTowers = useGameStore.getState().towerSlots.filter((s) => s.unlocked && s.tower);

    // If no towers, target defense target (base/energy core)
    if (slotsWithTowers.length === 0) {
      const defenseTarget = this.getDefenseTargetAsSlot();
      if (defenseTarget) {
        this.targetCache.set(cacheKey, { target: defenseTarget, timestamp: now });
        return defenseTarget;
      }
    }

    // Enhanced targeting based on enemy type
    const target = this.getDynamicTarget(pos, slotsWithTowers, enemy);
    
    // Cache the result
    this.targetCache.set(cacheKey, { target, timestamp: now });
    
    return target;
  }

  /**
   * Get defense target as a TowerSlot for compatibility
   */
  private static getDefenseTargetAsSlot(): TowerSlot | null {
    const defenseTarget = defenseTargetManager.getDefenseTarget();
    if (!defenseTarget || !defenseTarget.isActive || !defenseTarget.isVulnerable) {
      return null;
    }

    // Create a virtual tower slot for the defense target
    return {
      x: defenseTarget.position.x,
      y: defenseTarget.position.y,
      unlocked: true,
      tower: {
        id: defenseTarget.id,
        position: defenseTarget.position,
        size: defenseTarget.size,
        isActive: defenseTarget.isActive,
        level: 1,
        range: 0,
        fireRate: 0,
        lastFired: 0,
        health: defenseTarget.health,
        maxHealth: defenseTarget.maxHealth,
        wallStrength: defenseTarget.shieldStrength,
        specialAbility: 'none',
        healthRegenRate: 0,
        lastHealthRegen: 0,
        specialCooldown: 0,
        lastSpecialUse: 0,
        multiShotCount: 0,
        chainLightningJumps: 0,
        freezeDuration: 0,
        burnDuration: 0,
        acidStack: 0,
        quantumState: false,
        nanoSwarmCount: 0,
        psiRange: 0,
        timeWarpSlow: 0,
        spaceGravity: 0,
        legendaryAura: false,
        divineProtection: false,
        cosmicEnergy: 0,
        infinityLoop: false,
        godModeActive: false,
        damage: 0
      }
    };
  }

  /**
   * Get dynamic target based on enemy type and behavior
   */
  private static getDynamicTarget(pos: Position, slotsWithTowers: TowerSlot[], enemy?: Enemy) {
    if (!enemy) {
      // Fallback to nearest tower
      return this.getNearestTower(pos, slotsWithTowers);
    }

    // Different targeting strategies based on enemy type
    switch (enemy.behaviorTag) {
      case 'avoid':
        return this.getAvoidanceTarget(pos, slotsWithTowers);
      case 'stealth':
        return this.getStealthTarget(pos, slotsWithTowers);
      case 'tank':
        return this.getTankTarget(pos, slotsWithTowers);
      case 'ghost':
        return this.getGhostTarget(pos, slotsWithTowers);
      case 'boss':
        return this.getBossTarget(pos, slotsWithTowers, enemy);
      default:
        return this.getNearestTower(pos, slotsWithTowers);
    }
  }

  /**
   * Get nearest tower (fallback method)
   */
  private static getNearestTower(pos: Position, slotsWithTowers: TowerSlot[]): TowerSlot {
    let nearest = slotsWithTowers[0];
    let minDistance = Infinity;

    for (const slot of slotsWithTowers) {
      const distance = Math.sqrt(
        Math.pow(pos.x - slot.x, 2) + Math.pow(pos.y - slot.y, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = slot;
      }
    }

    return nearest;
  }

  /**
   * Get avoidance target (for scout/avoid enemies)
   */
  private static getAvoidanceTarget(pos: Position, slotsWithTowers: TowerSlot[]): TowerSlot {
    // Avoidance enemies prefer isolated towers
    let bestTarget = slotsWithTowers[0];
    let bestScore = -Infinity;

    for (const slot of slotsWithTowers) {
      const distance = Math.sqrt(
        Math.pow(pos.x - slot.x, 2) + Math.pow(pos.y - slot.y, 2)
      );
      
      // Count nearby towers
      const nearbyTowers = slotsWithTowers.filter(otherSlot => {
        const otherDistance = Math.sqrt(
          Math.pow(slot.x - otherSlot.x, 2) + Math.pow(slot.y - otherSlot.y, 2)
        );
        return otherDistance < 150 && otherSlot !== slot;
      }).length;

      // Prefer isolated towers (fewer nearby towers)
      const isolationScore = 100 - nearbyTowers * 20;
      const distanceScore = Math.max(0, 200 - distance);
      const totalScore = isolationScore + distanceScore;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestTarget = slot;
      }
    }

    return bestTarget;
  }

  /**
   * Get stealth target (for assassin/stealth enemies)
   */
  private static getStealthTarget(pos: Position, slotsWithTowers: TowerSlot[]): TowerSlot {
    // Stealth enemies prefer weak or isolated towers
    let bestTarget = slotsWithTowers[0];
    let bestScore = -Infinity;

    for (const slot of slotsWithTowers) {
      if (!slot.tower) continue;

      const distance = Math.sqrt(
        Math.pow(pos.x - slot.x, 2) + Math.pow(pos.y - slot.y, 2)
      );
      
      // Prefer weak towers (low health)
      const healthScore = Math.max(0, 100 - slot.tower.health);
      const distanceScore = Math.max(0, 150 - distance);
      const totalScore = healthScore + distanceScore;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestTarget = slot;
      }
    }

    return bestTarget;
  }

  /**
   * Get tank target (for tank enemies)
   */
  private static getTankTarget(pos: Position, slotsWithTowers: TowerSlot[]): TowerSlot {
    // Tank enemies prefer direct path to center
    const centerX = GAME_CONSTANTS.CANVAS_WIDTH / 2;
    const centerY = GAME_CONSTANTS.CANVAS_HEIGHT / 2;
    
    let bestTarget = slotsWithTowers[0];
    let bestScore = -Infinity;

    for (const slot of slotsWithTowers) {
      const distanceToEnemy = Math.sqrt(
        Math.pow(pos.x - slot.x, 2) + Math.pow(pos.y - slot.y, 2)
      );
      
      const distanceToCenter = Math.sqrt(
        Math.pow(slot.x - centerX, 2) + Math.pow(slot.y - centerY, 2)
      );
      
      // Prefer towers closer to center
      const centerScore = Math.max(0, 200 - distanceToCenter);
      const distanceScore = Math.max(0, 100 - distanceToEnemy);
      const totalScore = centerScore + distanceScore;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestTarget = slot;
      }
    }

    return bestTarget;
  }

  /**
   * Get ghost target (for ghost enemies)
   */
  private static getGhostTarget(pos: Position, slotsWithTowers: TowerSlot[]): TowerSlot {
    // Ghost enemies prefer least resistance path
    let bestTarget = slotsWithTowers[0];
    let bestScore = -Infinity;

    for (const slot of slotsWithTowers) {
      const distance = Math.sqrt(
        Math.pow(pos.x - slot.x, 2) + Math.pow(pos.y - slot.y, 2)
      );
      
      // Count enemies near this tower (ghosts avoid crowded areas)
      const nearbyEnemies = useGameStore.getState().enemies.filter(enemy => {
        const enemyDistance = Math.sqrt(
          Math.pow(enemy.position.x - slot.x, 2) + Math.pow(enemy.position.y - slot.y, 2)
        );
        return enemyDistance < 120;
      }).length;

      // Prefer less crowded areas
      const crowdScore = Math.max(0, 50 - nearbyEnemies * 10);
      const distanceScore = Math.max(0, 150 - distance);
      const totalScore = crowdScore + distanceScore;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestTarget = slot;
      }
    }

    return bestTarget;
  }

  /**
   * Get boss target (for boss enemies)
   */
  private static getBossTarget(pos: Position, slotsWithTowers: TowerSlot[], _enemy: Enemy): TowerSlot {
    // Boss enemies target strongest towers
    let bestTarget = slotsWithTowers[0];
    let bestScore = -Infinity;

    for (const slot of slotsWithTowers) {
      if (!slot.tower) continue;

      const distance = Math.sqrt(
        Math.pow(pos.x - slot.x, 2) + Math.pow(pos.y - slot.y, 2)
      );
      
      // Prefer strong towers (high level, high damage)
      const strengthScore = slot.tower.level * 10 + slot.tower.damage;
      const distanceScore = Math.max(0, 100 - distance);
      const totalScore = strengthScore + distanceScore;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestTarget = slot;
      }
    }

    return bestTarget;
  }

  /**
   * Get center target (fallback when no towers exist)
   */
  private static getCenterTarget(): TowerSlot {
    return {
      x: GAME_CONSTANTS.CANVAS_WIDTH / 2,
      y: GAME_CONSTANTS.CANVAS_HEIGHT / 2,
      unlocked: true,
      tower: null
    };
  }

  /**
   * Clean up old cache entries
   */
  static cleanupCache(): void {
    const now = performance.now();
    for (const [key, value] of this.targetCache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.targetCache.delete(key);
      }
    }
  }
} 