import { useGameStore } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/constants';
import type { Position, Enemy, TowerSlot } from '../../models/gameTypes';

/**
 * Enhanced Finder class responsible for finding the nearest target for enemies
 * Features:
 * - Dynamic target selection based on enemy type
 * - Performance optimizations with spatial partitioning
 * - Advanced targeting logic for different enemy behaviors
 */
export class TargetFinder {
  // Performance optimization: Cache for target calculations
  private static targetCache = new Map<string, { target: TowerSlot; timestamp: number }>();
  private static readonly CACHE_DURATION = 50; // ms

  /**
   * Gets the nearest slot with a tower for an enemy to target
   * Enhanced with dynamic targeting based on enemy type
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

    // If no towers, target center
    if (slotsWithTowers.length === 0) {
      const centerTarget = this.getCenterTarget();
      this.targetCache.set(cacheKey, { target: centerTarget, timestamp: now });
      return centerTarget;
    }

    // Enhanced targeting based on enemy type
    const target = this.getDynamicTarget(pos, slotsWithTowers, enemy);
    
    // Cache the result
    this.targetCache.set(cacheKey, { target, timestamp: now });
    
    return target;
  }

  /**
   * Get center target when no towers exist
   */
  private static getCenterTarget() {
    const centerX = GAME_CONSTANTS.CANVAS_WIDTH / 2;
    const centerY = GAME_CONSTANTS.CANVAS_HEIGHT / 2;
    return {
      x: centerX,
      y: centerY,
      unlocked: true,
      tower: null,
      type: 'fixed' as const,
      wasDestroyed: false,
      modifier: undefined
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
   * Get nearest tower (basic targeting)
   */
  private static getNearestTower(pos: Position, slotsWithTowers: TowerSlot[]) {
    let minDist = Infinity;
    let nearest = slotsWithTowers[0];
    
    slotsWithTowers.forEach((slot) => {
      const dx = slot.x - pos.x;
      const dy = slot.y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        nearest = slot;
      }
    });
    
    return nearest;
  }

  /**
   * Get avoidance target (for enemies that avoid towers)
   */
  private static getAvoidanceTarget(pos: Position, slotsWithTowers: TowerSlot[]) {
    // Find the least defended area
    const defenseMap = this.createDefenseMap(slotsWithTowers);
    return this.findLeastDefendedArea(pos, defenseMap);
  }

  /**
   * Get stealth target (for stealth enemies)
   */
  private static getStealthTarget(pos: Position, slotsWithTowers: TowerSlot[]) {
    // Prefer isolated towers
    const isolatedTowers = slotsWithTowers.filter(slot => {
      const nearbyTowers = slotsWithTowers.filter(other => {
        const dx = slot.x - other.x;
        const dy = slot.y - other.y;
        return Math.sqrt(dx * dx + dy * dy) < 200;
      });
      return nearbyTowers.length <= 2; // Isolated if 2 or fewer nearby towers
    });

    if (isolatedTowers.length > 0) {
      return this.getNearestTower(pos, isolatedTowers);
    }

    return this.getNearestTower(pos, slotsWithTowers);
  }

  /**
   * Get tank target (for tank enemies)
   */
  private static getTankTarget(pos: Position, slotsWithTowers: TowerSlot[]) {
    // Tanks prefer the most direct path to center
    const centerX = GAME_CONSTANTS.CANVAS_WIDTH / 2;
    const centerY = GAME_CONSTANTS.CANVAS_HEIGHT / 2;
    
    // Find tower closest to the line between enemy and center
    let bestTarget = slotsWithTowers[0];
    let bestScore = Infinity;

    slotsWithTowers.forEach(slot => {
      const score = this.calculateDirectPathScore(pos, { x: centerX, y: centerY }, slot);
      if (score < bestScore) {
        bestScore = score;
        bestTarget = slot;
      }
    });

    return bestTarget;
  }

  /**
   * Get ghost target (for ghost enemies)
   */
  private static getGhostTarget(pos: Position, slotsWithTowers: TowerSlot[]) {
    // Ghosts prefer the path with least resistance
    const pathScores = slotsWithTowers.map(slot => ({
      slot,
      score: this.calculatePathResistance(pos, slot, slotsWithTowers)
    }));

    pathScores.sort((a, b) => a.score - b.score);
    return pathScores[0].slot;
  }

  /**
   * Get boss target (for boss enemies)
   */
  private static getBossTarget(pos: Position, slotsWithTowers: TowerSlot[], enemy: Enemy) {
    // Bosses target the strongest tower or the most strategic position
    if (enemy.bossType === 'legendary' || enemy.bossType === 'major') {
      // Target the highest level tower
      const strongestTower = slotsWithTowers.reduce((strongest, current) => {
        if (!current.tower || !strongest.tower) return current;
        return current.tower.level > strongest.tower.level ? current : strongest;
      });
      return strongestTower;
    }

    // Regular boss targeting
    return this.getNearestTower(pos, slotsWithTowers);
  }

  /**
   * Create a defense map for avoidance calculations
   */
  private static createDefenseMap(slotsWithTowers: TowerSlot[]) {
    const defenseMap = new Map<string, number>();
    
    slotsWithTowers.forEach(slot => {
      const key = `${Math.floor(slot.x / 100)}_${Math.floor(slot.y / 100)}`;
      const currentDefense = defenseMap.get(key) || 0;
      defenseMap.set(key, currentDefense + (slot.tower?.level || 1));
    });

    return defenseMap;
  }

  /**
   * Find least defended area
   */
  private static findLeastDefendedArea(_pos: Position, _defenseMap: Map<string, number>) {
    // This is a simplified version - in a full implementation,
    // you would analyze the defense map to find gaps
    const { towerSlots } = useGameStore.getState();
    const unlockedSlots = towerSlots.filter(s => s.unlocked);
    
    // Find unlocked slot with no tower
    const emptySlot = unlockedSlots.find(s => !s.tower);
    if (emptySlot) {
      return emptySlot;
    }

    // Fallback to center
    return this.getCenterTarget();
  }

  /**
   * Calculate direct path score for tank targeting
   */
  private static calculateDirectPathScore(start: Position, end: Position, tower: TowerSlot): number {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate distance from tower to the direct path line
    const pathVector = { x: dx / distance, y: dy / distance };
    const towerToStart = { x: tower.x - start.x, y: tower.y - start.y };
    
    // Project tower position onto path
    const projection = towerToStart.x * pathVector.x + towerToStart.y * pathVector.y;
    const projectedPoint = {
      x: start.x + pathVector.x * projection,
      y: start.y + pathVector.y * projection
    };
    
    // Distance from tower to projected point
    const towerToPath = Math.sqrt(
      Math.pow(tower.x - projectedPoint.x, 2) + 
      Math.pow(tower.y - projectedPoint.y, 2)
    );
    
    return towerToPath;
  }

  /**
   * Calculate path resistance for ghost targeting
   */
  private static calculatePathResistance(start: Position, target: TowerSlot, allTowers: TowerSlot[]): number {
    const dx = target.x - start.x;
    const dy = target.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    let resistance = 0;
    allTowers.forEach(tower => {
      if (tower === target) return;
      
      // Calculate distance from tower to the path line
      const towerToStart = { x: tower.x - start.x, y: tower.y - start.y };
      const pathVector = { x: dx / distance, y: dy / distance };
      
      const projection = towerToStart.x * pathVector.x + towerToStart.y * pathVector.y;
      const projectedPoint = {
        x: start.x + pathVector.x * projection,
        y: start.y + pathVector.y * projection
      };
      
      const towerToPath = Math.sqrt(
        Math.pow(tower.x - projectedPoint.x, 2) + 
        Math.pow(tower.y - projectedPoint.y, 2)
      );
      
      // Add resistance based on proximity to path
      if (towerToPath < 100) {
        resistance += (100 - towerToPath) * (tower.tower?.level || 1);
      }
    });
    
    return resistance;
  }

  /**
   * Gets all slots within a certain radius of a position
   */
  static getSlotsInRadius(pos: Position, radius: number) {
    const towerSlots = useGameStore.getState().towerSlots;
    return towerSlots.filter(slot => {
      const dx = slot.x - pos.x;
      const dy = slot.y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist <= radius;
    });
  }

  /**
   * Gets the closest enemy to a position (for towers to target)
   */
  static getClosestEnemy(pos: Position) {
    const enemies = useGameStore.getState().enemies;
    if (enemies.length === 0) return null;

    let closest = enemies[0];
    let minDist = Infinity;

    enemies.forEach(enemy => {
      const dx = enemy.position.x - pos.x;
      const dy = enemy.position.y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        closest = enemy;
      }
    });

    return closest;
  }

  /**
   * Gets enemies within a certain radius of a position
   */
  static getEnemiesInRadius(pos: Position, radius: number) {
    const enemies = useGameStore.getState().enemies;
    return enemies.filter(enemy => {
      const dx = enemy.position.x - pos.x;
      const dy = enemy.position.y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist <= radius;
    });
  }

  /**
   * Clean up old cache entries
   */
  static cleanupCache() {
    const now = performance.now();
    const maxAge = this.CACHE_DURATION * 2;

    for (const [key, value] of this.targetCache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.targetCache.delete(key);
      }
    }
  }
} 