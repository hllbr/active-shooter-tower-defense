import { useGameStore } from '../../models/store';
// import { GAME_CONSTANTS } from '../../utils/constants';
import type { Enemy, TowerSlot, Position } from '../../models/gameTypes';
import { TargetFinder } from './TargetFinder';
import { advancedEnemyPool } from '../memory/AdvancedEnemyPool';

/**
 * Enhanced Enemy Movement System
 * Implements advanced movement patterns: zigzag, straight rush, speed boost when near towers
 * Follows SOLID principles with single responsibility for movement behavior
 */
export class EnhancedEnemyMovement {
  // Performance optimization: Cache movement calculations
  private static movementCache = new Map<string, { 
    pattern: string; 
    speedMultiplier: number; 
    timestamp: number 
  }>();
  private static readonly CACHE_DURATION = 100; // ms

  // Movement pattern tracking
  private static patternOffsets = new Map<string, { x: number; y: number; phase: number }>();

  /**
   * Update movement for all active enemies with enhanced patterns
   */
  static updateEnemyMovement() {
    const { enemies, towerSlots, damageTower, removeEnemy, addGold, hitWall, damageEnemy, wallLevel, isGameOver, isPaused } =
      useGameStore.getState();
    
    // Stop movement if game is over or paused
    if (isGameOver || isPaused) {
      return;
    }
    
    // Batch process enemies for performance
    enemies.forEach((enemy) => {
      this.updateSingleEnemyMovement(enemy, { 
        towerSlots, 
        damageTower, 
        removeEnemy, 
        addGold, 
        hitWall, 
        damageEnemy, 
        wallLevel 
      });
    });

    // Clean up old cache entries
    this.cleanupMovementCache();
  }

  /**
   * Update movement for a single enemy with enhanced patterns
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

    // Get movement pattern and speed multiplier
    const movementData = this.getMovementData(enemy, towerSlots);
    
    // Get target
    const targetSlot = TargetFinder.getNearestSlot(enemy.position, enemy);
    if (!targetSlot) return;

    // Handle collision with target
    if (this.handleTargetCollision(enemy, targetSlot, towerSlots, { damageTower, removeEnemy, addGold, hitWall, damageEnemy, wallLevel })) {
      advancedEnemyPool.release(enemy as unknown as import('../memory/AdvancedEnemyPool').AdvancedEnemy);
      return;
    }

    // Apply enhanced movement with patterns
    this.applyEnhancedMovement(enemy, targetSlot, movementData);
  }

  /**
   * Get movement data with caching for performance
   */
  private static getMovementData(enemy: Enemy, towerSlots: TowerSlot[]) {
    const cacheKey = `${enemy.id}_${Math.floor(enemy.position.x / 50)}_${Math.floor(enemy.position.y / 50)}`;
    const now = performance.now();
    const cached = this.movementCache.get(cacheKey);

    // Use cached data if still valid
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached;
    }

    // Calculate new movement data
    const pattern = this.determineMovementPattern(enemy);
    const speedMultiplier = this.calculateSpeedMultiplier(enemy, towerSlots);
    
    const movementData = { pattern, speedMultiplier, timestamp: now };
    
    // Cache the result
    this.movementCache.set(cacheKey, movementData);
    
    return movementData;
  }

  /**
   * Determine movement pattern based on enemy type and behavior
   */
  private static determineMovementPattern(enemy: Enemy): string {
    // Boss enemies use straight rush
    if (enemy.bossType) {
      return 'straight_rush';
    }

    // Different patterns based on enemy type and behavior
    switch (enemy.behaviorTag) {
      case 'avoid':
        return 'zigzag';
      case 'stealth':
        return 'stealth';
      case 'tank':
        return 'straight_rush';
      case 'ghost':
        return 'ghost';
      case 'rage':
        return 'straight_rush';
      case 'group':
        return 'group';
      case 'flee':
        return 'flee';
      default:
        return 'normal';
    }
  }

  /**
   * Calculate speed multiplier based on proximity to towers
   */
  private static calculateSpeedMultiplier(enemy: Enemy, towerSlots: TowerSlot[]): number {
    let speedMultiplier = 1.0;

    // Check for nearby towers
    const nearbyTowers = towerSlots.filter(slot => 
      slot.tower && 
      Math.hypot(slot.x - enemy.position.x, slot.y - enemy.position.y) < 150
    );

    if (nearbyTowers.length > 0) {
      // Speed boost when near towers (except for certain enemy types)
      if (!['tank', 'golem'].includes(enemy.behaviorTag || '')) {
        speedMultiplier = 1.3; // 30% speed boost
      }
    }

    // Additional speed modifiers based on enemy type
    switch (enemy.behaviorTag) {
      case 'rage':
        speedMultiplier *= 1.2; // Rage enemies are faster
        break;
      case 'flee':
        speedMultiplier *= 1.5; // Fleeing enemies are much faster
        break;
      case 'tank':
        speedMultiplier *= 0.8; // Tank enemies are slower
        break;
    }

    return speedMultiplier;
  }

  /**
   * Apply enhanced movement with patterns
   */
  private static applyEnhancedMovement(
    enemy: Enemy, 
    targetSlot: TowerSlot, 
    movementData: { pattern: string; speedMultiplier: number; timestamp: number }
  ) {
    const { pattern, speedMultiplier } = movementData;
    const baseSpeed = enemy.speed * speedMultiplier * 0.016;

    // Get or initialize pattern offset
    let patternOffset = this.patternOffsets.get(enemy.id);
    if (!patternOffset) {
      patternOffset = { x: 0, y: 0, phase: 0 };
      this.patternOffsets.set(enemy.id, patternOffset);
    }

    // Calculate base direction toward target
    const dx = targetSlot.x - enemy.position.x;
    const dy = targetSlot.y - enemy.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;

    const baseDirection = {
      x: dx / distance,
      y: dy / distance
    };

    // Apply pattern-specific movement
    let finalDirection = { ...baseDirection };
    let patternSpeed = baseSpeed;

    switch (pattern) {
      case 'zigzag':
        finalDirection = this.applyZigzagPattern(baseDirection, patternOffset);
        break;
      case 'straight_rush':
        finalDirection = this.applyStraightRushPattern(baseDirection, patternOffset);
        patternSpeed = baseSpeed * 1.2; // Rush is faster
        break;
      case 'stealth':
        finalDirection = this.applyStealthPattern(baseDirection, patternOffset);
        patternSpeed = baseSpeed * 0.8; // Stealth is slower
        break;
      case 'ghost':
        finalDirection = this.applyGhostPattern(baseDirection, patternOffset);
        break;
      case 'group':
        finalDirection = this.applyGroupPattern(baseDirection, patternOffset);
        break;
      case 'flee':
        finalDirection = this.applyFleePattern(baseDirection, patternOffset);
        patternSpeed = baseSpeed * 1.5; // Flee is fastest
        break;
      default:
        // Normal movement
        break;
    }

    // Apply movement
    enemy.position.x += finalDirection.x * patternSpeed;
    enemy.position.y += finalDirection.y * patternSpeed;

    // Update pattern phase
    patternOffset.phase += 0.1;
    this.patternOffsets.set(enemy.id, patternOffset);
  }

  /**
   * Apply zigzag movement pattern
   */
  private static applyZigzagPattern(baseDirection: Position, patternOffset: { x: number; y: number; phase: number }): Position {
    const zigzagAmplitude = 0.3;
    const zigzagFrequency = 2;
    
    const zigzagX = Math.sin(patternOffset.phase * zigzagFrequency) * zigzagAmplitude;
    const zigzagY = Math.cos(patternOffset.phase * zigzagFrequency) * zigzagAmplitude;

    return {
      x: baseDirection.x + zigzagX,
      y: baseDirection.y + zigzagY
    };
  }

  /**
   * Apply straight rush movement pattern
   */
  private static applyStraightRushPattern(baseDirection: Position, patternOffset: { x: number; y: number; phase: number }): Position {
    // Straight rush with slight forward momentum
    const rushIntensity = Math.sin(patternOffset.phase) * 0.1;
    
    return {
      x: baseDirection.x * (1 + rushIntensity),
      y: baseDirection.y * (1 + rushIntensity)
    };
  }

  /**
   * Apply stealth movement pattern
   */
  private static applyStealthPattern(baseDirection: Position, patternOffset: { x: number; y: number; phase: number }): Position {
    // Stealth with subtle side-to-side movement
    const stealthAmplitude = 0.15;
    const stealthFrequency = 1.5;
    
    const stealthX = Math.sin(patternOffset.phase * stealthFrequency) * stealthAmplitude;
    const stealthY = Math.cos(patternOffset.phase * stealthFrequency) * stealthAmplitude;

    return {
      x: baseDirection.x + stealthX,
      y: baseDirection.y + stealthY
    };
  }

  /**
   * Apply ghost movement pattern
   */
  private static applyGhostPattern(baseDirection: Position, patternOffset: { x: number; y: number; phase: number }): Position {
    // Ghost with ethereal floating movement
    const ghostAmplitude = 0.2;
    const ghostFrequency = 0.8;
    
    const ghostX = Math.sin(patternOffset.phase * ghostFrequency) * ghostAmplitude;
    const ghostY = Math.cos(patternOffset.phase * ghostFrequency * 1.5) * ghostAmplitude;

    return {
      x: baseDirection.x + ghostX,
      y: baseDirection.y + ghostY
    };
  }

  /**
   * Apply group movement pattern
   */
  private static applyGroupPattern(baseDirection: Position, patternOffset: { x: number; y: number; phase: number }): Position {
    // Group movement with coordinated patterns
    const groupAmplitude = 0.25;
    const groupFrequency = 1.2;
    
    const groupX = Math.sin(patternOffset.phase * groupFrequency) * groupAmplitude;
    const groupY = Math.cos(patternOffset.phase * groupFrequency) * groupAmplitude;

    return {
      x: baseDirection.x + groupX,
      y: baseDirection.y + groupY
    };
  }

  /**
   * Apply flee movement pattern
   */
  private static applyFleePattern(baseDirection: Position, patternOffset: { x: number; y: number; phase: number }): Position {
    // Flee with erratic movement
    const fleeAmplitude = 0.4;
    const fleeFrequency = 3;
    
    const fleeX = Math.sin(patternOffset.phase * fleeFrequency) * fleeAmplitude;
    const fleeY = Math.cos(patternOffset.phase * fleeFrequency * 0.7) * fleeAmplitude;

    return {
      x: baseDirection.x + fleeX,
      y: baseDirection.y + fleeY
    };
  }

  /**
   * Handle collision with target
   */
  private static handleTargetCollision(
    enemy: Enemy, 
    targetSlot: TowerSlot, 
    towerSlots: TowerSlot[],
    actions: {
      damageTower: (slotIdx: number, damage: number) => void;
      removeEnemy: (id: string) => void;
      addGold: (amount: number) => void;
      hitWall: (slotIdx: number) => void;
      damageEnemy: (id: string, damage: number) => void;
      wallLevel: number;
    }
  ): boolean {
    const distance = Math.hypot(targetSlot.x - enemy.position.x, targetSlot.y - enemy.position.y);
    
    if (distance < enemy.size / 2 + (targetSlot.tower?.size || 0) / 2) {
      // Handle collision logic (same as original)
      if (targetSlot.tower) {
        const slotIdx = towerSlots.findIndex(s => s.x === targetSlot.x && s.y === targetSlot.y);
        
        if (targetSlot.tower.wallStrength > 0) {
          actions.hitWall(slotIdx);
          return true;
        } else {
          actions.damageTower(slotIdx, enemy.damage);
        }
      }
      
      actions.addGold(enemy.goldValue);
      actions.removeEnemy(enemy.id);
      return true;
    }
    
    return false;
  }

  /**
   * Clean up old cache entries
   */
  private static cleanupMovementCache() {
    const now = performance.now();
    for (const [key, value] of this.movementCache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.movementCache.delete(key);
      }
    }

    // Clean up pattern offsets for removed enemies
    const { enemies } = useGameStore.getState();
    const activeEnemyIds = new Set(enemies.map(e => e.id));
    
    for (const [enemyId] of this.patternOffsets.entries()) {
      if (!activeEnemyIds.has(enemyId)) {
        this.patternOffsets.delete(enemyId);
      }
    }
  }

  /**
   * Initialize movement system
   */
  static initialize(): void {
    this.movementCache.clear();
    this.patternOffsets.clear();
  }
} 