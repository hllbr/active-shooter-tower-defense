import { useGameStore } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/constants';
import type { Enemy, TowerSlot, Position } from '../../models/gameTypes';
import { TargetFinder } from './TargetFinder';
import BossManager from './BossManager';
import { createManagedEffect } from '../effects-system/Effects';
import { EnemyBehaviorSystem } from './EnemyBehaviorSystem';
import { defenseTargetManager } from '../defense-systems/DefenseTargetManager';
import { advancedEnemyPool } from '../memory/AdvancedEnemyPool';

/**
 * Enhanced Movement class responsible for handling enemy movement and collision logic
 * Features:
 * - Dynamic targeting of nearest towers
 * - Curved/angled movement patterns
 * - Visual effects on collision
 * - Performance optimizations
 * - Defense target targeting when no towers are present
 */
export class EnemyMovement {
  // Performance optimization: Cache target calculations
  private static targetCache = new Map<string, { target: TowerSlot | null; timestamp: number }>();
  private static readonly TARGET_CACHE_DURATION = 100; // ms

  /**
   * Updates movement for all active enemies
   */
  static updateEnemyMovement() {
    const { enemies, towerSlots, damageTower, removeEnemy, addGold, hitWall, damageEnemy, wallLevel, isGameOver, isPaused } =
      useGameStore.getState();
    
    // ✅ CRITICAL FIX: Stop enemy movement if game is over or paused
    if (isGameOver || isPaused) {
      return;
    }
    
    // Update enemy behaviors first
    EnemyBehaviorSystem.updateEnemyBehaviors();
    
    // Target validation removed - enemies use dynamic targeting
    
    // Batch calculation cache for this tick
    const distanceCache: Record<string, number> = {};
    const targetCache: Record<string, TowerSlot | null> = {};
    
    // Performance optimization: Batch process enemies
    enemies.forEach((enemy) => {
      // Cache distance to nearest tower for this tick
      if (!distanceCache[enemy.id]) {
        const targetSlot = this.getDynamicTarget(enemy, towerSlots);
        targetCache[enemy.id] = targetSlot;
        if (targetSlot) {
          const dx = targetSlot.x - enemy.position.x;
          const dy = targetSlot.y - enemy.position.y;
          distanceCache[enemy.id] = Math.sqrt(dx * dx + dy * dy);
        } else {
          distanceCache[enemy.id] = 0;
        }
      }
      this.updateSingleEnemyMovement(enemy, { towerSlots, damageTower, removeEnemy, addGold, hitWall, damageEnemy, wallLevel });
    });

    // Clean up old cache entries periodically
    this.cleanupTargetCache();
  }

  /**
   * Updates movement for a single enemy with enhanced targeting
   */
  private static updateSingleEnemyMovement(
    enemy: Enemy, 
    gameActions: {
      towerSlots: TowerSlot[];
      damageTower: (slotIdx: number, damage: number) => void;
      removeEnemy: (id: string) => void;
      addGold: (amount: number) => void;
      hitWall: (slotIdx: number) => void;
      damageEnemy: (id: string, damage: number) => void;
      wallLevel: number;
    }
  ) {
    const { towerSlots, damageTower, removeEnemy, addGold, hitWall, damageEnemy, wallLevel } = gameActions;

    // Check if enemy is frozen
    if (enemy.frozenUntil && enemy.frozenUntil > performance.now()) {
      return;
    }

    // Handle boss-specific updates
    if (enemy.bossType) {
      BossManager.updateBoss(enemy);
      
      // Skip normal movement if boss is in cinematic state
      if (enemy.cinematicState && enemy.cinematicState !== 'normal') {
        return;
      }
    }

    // Handle continuous gold drops for special enemies
    this.handleSpecialEnemyGoldDrop(enemy, addGold);

    // Get dynamic target with caching for performance
    const targetSlot = this.getDynamicTarget(enemy, towerSlots);
    if (!targetSlot) return;

    // Handle slot modifiers
    if (this.handleSlotModifiers(targetSlot)) {
      return; // Enemy is blocked by wall
    }

    // Calculate dynamic direction with curved movement
    const movementData = this.calculateDynamicMovement(enemy, targetSlot, towerSlots);
    
    // Handle avoid behavior
    if (this.handleAvoidBehavior(enemy, towerSlots)) {
      return;
    }

    // Handle collision with target
    if (this.handleTargetCollision(enemy, targetSlot, towerSlots, movementData, { damageTower, removeEnemy, addGold, hitWall, damageEnemy, wallLevel })) {
      // Return enemy to pool after removal
      advancedEnemyPool.release(enemy as unknown as import('../memory/AdvancedEnemyPool').AdvancedEnemy);
      return;
    }

    // Apply enhanced movement with curved patterns
    this.applyEnhancedMovement(enemy, movementData);
  }

  /**
   * Get dynamic target with performance caching
   */
  private static getDynamicTarget(enemy: Enemy, _towerSlots: TowerSlot[]): TowerSlot | null {
    const cacheKey = `${enemy.id}_${Math.floor(enemy.position.x / 50)}_${Math.floor(enemy.position.y / 50)}`;
    const now = performance.now();
    const cached = this.targetCache.get(cacheKey);

    // Use cached target if still valid
    if (cached && (now - cached.timestamp) < this.TARGET_CACHE_DURATION) {
      return cached.target;
    }

    // Calculate new target with enemy-specific targeting
    const target = TargetFinder.getNearestSlot(enemy.position, enemy);
    
    // Cache the result
    this.targetCache.set(cacheKey, { target, timestamp: now });
    
    return target;
  }

  /**
   * Calculate dynamic movement with curved patterns
   */
  private static calculateDynamicMovement(
    enemy: Enemy, 
    targetSlot: TowerSlot, 
    towerSlots: TowerSlot[]
  ): {
    direction: Position;
    distance: number;
    curveFactor: number;
    avoidanceVector: Position;
  } {
    const dx = targetSlot.x - enemy.position.x;
    const dy = targetSlot.y - enemy.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Base direction toward target
    const baseDirection = {
      x: dx / distance,
      y: dy / distance
    };

    // Calculate avoidance vector from nearby towers
    const avoidanceVector = this.calculateAvoidanceVector(enemy, towerSlots);

    // Calculate curve factor based on enemy type and behavior
    const curveFactor = this.calculateCurveFactor(enemy, distance);

    // Combine base direction with avoidance and curve
    const finalDirection = {
      x: baseDirection.x + avoidanceVector.x * 0.3 + (Math.random() - 0.5) * curveFactor,
      y: baseDirection.y + avoidanceVector.y * 0.3 + (Math.random() - 0.5) * curveFactor
    };

    // Normalize final direction
    const dirLength = Math.sqrt(finalDirection.x * finalDirection.x + finalDirection.y * finalDirection.y);
    finalDirection.x /= dirLength;
    finalDirection.y /= dirLength;

    return {
      direction: finalDirection,
      distance,
      curveFactor,
      avoidanceVector
    };
  }

  /**
   * Calculate avoidance vector from nearby towers
   */
  private static calculateAvoidanceVector(enemy: Enemy, towerSlots: TowerSlot[]): Position {
    let avoidanceX = 0;
    let avoidanceY = 0;
    const avoidanceRadius = 120;

    towerSlots.forEach(slot => {
      if (!slot.tower) return;
      
      const dx = enemy.position.x - slot.x;
      const dy = enemy.position.y - slot.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < avoidanceRadius && distance > 0) {
        const force = (avoidanceRadius - distance) / avoidanceRadius;
        avoidanceX += (dx / distance) * force;
        avoidanceY += (dy / distance) * force;
      }
    });

    // Normalize avoidance vector
    const avoidanceLength = Math.sqrt(avoidanceX * avoidanceX + avoidanceY * avoidanceY);
    if (avoidanceLength > 0) {
      avoidanceX /= avoidanceLength;
      avoidanceY /= avoidanceLength;
    }

    return { x: avoidanceX, y: avoidanceY };
  }

  /**
   * Calculate curve factor based on enemy type and distance
   */
  private static calculateCurveFactor(enemy: Enemy, distance: number): number {
    let baseCurve = 0.1;

    // Adjust curve based on enemy behavior
    switch (enemy.behaviorTag) {
      case 'avoid':
        baseCurve = 0.3;
        break;
      case 'stealth':
        baseCurve = 0.2;
        break;
      case 'tank':
        baseCurve = 0.05;
        break;
      case 'ghost':
        baseCurve = 0.4;
        break;
      default:
        baseCurve = 0.1;
    }

    // Increase curve for longer distances
    const distanceFactor = Math.min(distance / 200, 1);
    return baseCurve * (1 + distanceFactor);
  }

  /**
   * Apply enhanced movement with curved patterns
   */
  private static applyEnhancedMovement(
    enemy: Enemy, 
    movementData: {
      direction: Position;
      distance: number;
      curveFactor: number;
      avoidanceVector: Position;
    }
  ) {
    const { direction, curveFactor } = movementData;
    
    // Calculate speed multiplier based on terrain and effects
    let speedMultiplier = 1;
    
    // Apply trench slow effect
    const nearbySlots = this.getNearbySlots(enemy.position, 60);
    nearbySlots.forEach(slot => {
      if (slot.modifier?.type === 'trench') {
        speedMultiplier *= GAME_CONSTANTS.TRENCH_SLOW_MULTIPLIER;
      }
    });

    // Calculate movement with curve
    const baseSpeed = enemy.speed * speedMultiplier * 0.016;
    const curvedSpeed = baseSpeed * (1 + curveFactor * 0.5);

    // Apply movement with slight randomization for natural feel
    const randomFactor = 1 + (Math.random() - 0.5) * 0.1;
    const moveX = direction.x * curvedSpeed * randomFactor;
    const moveY = direction.y * curvedSpeed * randomFactor;

    enemy.position.x += moveX;
    enemy.position.y += moveY;
  }

  /**
   * Get nearby slots for terrain effects
   */
  private static getNearbySlots(position: Position, radius: number): TowerSlot[] {
    const { towerSlots } = useGameStore.getState();
    return towerSlots.filter(slot => {
      const dx = slot.x - position.x;
      const dy = slot.y - position.y;
      return Math.sqrt(dx * dx + dy * dy) <= radius;
    });
  }

  /**
   * Handle slot modifiers (walls, trenches, etc.)
   */
  private static handleSlotModifiers(targetSlot: TowerSlot): boolean {
    if (targetSlot.modifier?.type === 'wall') {
      // Wall blocks movement
      return true;
    }
    return false;
  }

  /**
   * Handle special enemy gold drops
   */
  private static handleSpecialEnemyGoldDrop(enemy: Enemy, addGold: (amount: number) => void): void {
    if (enemy.isSpecial && enemy.lastGoldDrop) {
      const now = performance.now();
      const timeSinceLastDrop = now - enemy.lastGoldDrop;
      
      if (timeSinceLastDrop >= 2000) { // Drop gold every 2 seconds
        addGold(enemy.goldValue);
        enemy.lastGoldDrop = now;
      }
    }
  }

  /**
   * Handles avoid behavior for certain enemy types
   */
  private static handleAvoidBehavior(enemy: Enemy, towerSlots: TowerSlot[]): boolean {
    if (enemy.behaviorTag === 'avoid') {
      const nearby = towerSlots.filter(s => s.tower && Math.hypot(s.x - enemy.position.x, s.y - enemy.position.y) < 150).length;
      if (nearby > 3) {
        // Enhanced avoidance with curved movement
        const avoidanceAngle = Math.random() * Math.PI * 2;
        const avoidanceDistance = enemy.speed * 0.016 * 2;
        enemy.position.x += Math.cos(avoidanceAngle) * avoidanceDistance;
        enemy.position.y += Math.sin(avoidanceAngle) * avoidanceDistance;
        return true;
      }
    }
    return false;
  }

  /**
   * Enhanced collision handling with visual effects
   */
  private static handleTargetCollision(
    enemy: Enemy, 
    targetSlot: TowerSlot, 
    towerSlots: TowerSlot[], 
    movementData: {
      direction: Position;
      distance: number;
      curveFactor: number;
      avoidanceVector: Position;
    },
    actions: {
      damageTower: (slotIdx: number, damage: number) => void;
      removeEnemy: (id: string) => void;
      addGold: (amount: number) => void;
      hitWall: (slotIdx: number) => void;
      damageEnemy: (id: string, damage: number) => void;
      wallLevel: number;
    }
  ): boolean {
    const { distance } = movementData;
    const collisionThreshold = (enemy.size + GAME_CONSTANTS.TOWER_SIZE) / 2;

    if (distance < collisionThreshold) {
      // Create collision visual effect
      this.createCollisionEffect(enemy.position, enemy.type || 'basic');

      // Check if this is a defense target collision (virtual tower with no damage/range)
      if (targetSlot.tower && targetSlot.tower.damage === 0 && targetSlot.tower.range === 0) {
        // Handle defense target collision
        const currentTime = performance.now();
        const collisionHandled = defenseTargetManager.handleEnemyCollision(enemy, currentTime);
        
        if (collisionHandled) {
          // Enemy is destroyed when hitting defense target
          actions.addGold(enemy.goldValue);
          actions.removeEnemy(enemy.id);
          return true;
        }
      }

      // Handle regular tower collision
      if (targetSlot.tower) {
        const slotIdx = towerSlots.findIndex(
          (s) => s.x === targetSlot.x && s.y === targetSlot.y,
        );
        
        if (targetSlot.tower.wallStrength > 0) {
          // Wall exists: Enhanced knockback and stun
          this.handleEnhancedWallCollision(enemy, slotIdx, movementData, actions);
          return true;
        } else {
          // No wall: Damage tower, and the enemy is destroyed
          actions.damageTower(slotIdx, enemy.damage);
        }
      }
      
      // This part runs if there's no wall or no tower (fallback)
      actions.addGold(enemy.goldValue);
      actions.removeEnemy(enemy.id);
      return true;
    }
    return false;
  }

  /**
   * Handle enhanced wall collision with knockback and stun
   */
  private static handleEnhancedWallCollision(
    enemy: Enemy,
    slotIdx: number,
    movementData: {
      direction: Position;
      distance: number;
      curveFactor: number;
      avoidanceVector: Position;
    },
    actions: {
      damageTower: (slotIdx: number, damage: number) => void;
      removeEnemy: (id: string) => void;
      addGold: (amount: number) => void;
      hitWall: (slotIdx: number) => void;
      damageEnemy: (id: string, damage: number) => void;
      wallLevel: number;
    }
  ): void {
    const { direction: _direction } = movementData;
    
    // ✅ NEW: Use advanced defensive visuals system
    // const { advancedDefensiveVisuals } = require('../defense-systems/AdvancedDefensiveVisuals');
    const { towerSlots } = useGameStore.getState();
    const slot = towerSlots[slotIdx];
    
    // Handle collision with enhanced visuals
    advancedDefensiveVisuals.handleDefensiveCollision(enemy, slot, slotIdx, actions);
    
    // Apply stun effect (now handled by advanced system)
    if (!enemy.frozenUntil) {
      enemy.frozenUntil = performance.now() + 1000; // 1 second stun
    }
    
    // Damage the enemy
    actions.damageEnemy(enemy.id, 10);
  }

  /**
   * Create collision visual effect
   */
  private static createCollisionEffect(position: Position, enemyType: string): void {
    const effectType = this.getCollisionEffectType(enemyType);
    createManagedEffect(effectType, position, 800);
  }

  /**
   * Get collision effect type based on enemy type
   */
  private static getCollisionEffectType(enemyType: string): string {
    switch (enemyType) {
      case 'Tank':
      case 'TankBoss':
        return 'heavy_impact';
      case 'Ghost':
      case 'GhostBoss':
        return 'ghost_dissipate';
      case 'Boss':
        return 'boss_explosion';
      default:
        return 'enemy_explosion';
    }
  }

  // Target validation methods removed for production optimization

  /**
   * Clean up old cache entries
   */
  private static cleanupTargetCache(): void {
    const now = performance.now();
    for (const [key, value] of this.targetCache.entries()) {
      if (now - value.timestamp > this.TARGET_CACHE_DURATION * 2) {
        this.targetCache.delete(key);
      }
    }
  }
} 