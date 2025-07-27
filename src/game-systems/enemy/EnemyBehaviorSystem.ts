import { useGameStore } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/constants';
import type { Enemy, TowerSlot, Position } from '../../models/gameTypes';
import { createManagedEffect } from '../effects-system/Effects';
import { advancedPoolManager } from '../memory/AdvancedPoolManager';
import type { AdvancedEnemy } from '../memory/AdvancedEnemyPool';
import { BossPhaseManager } from './BossPhaseManager';

/**
 * Enhanced Enemy Behavior System
 * Supports dynamic fleeing, group attacks, and boss phase transitions
 */
export class EnemyBehaviorSystem {
  // Performance optimization: Cache behavior calculations
  private static behaviorCache = new Map<string, { behavior: string; timestamp: number }>();
  private static readonly BEHAVIOR_CACHE_DURATION = 200; // ms
  
  // Group attack coordination
  private static groupTargets = new Map<string, { target: TowerSlot; members: string[]; timestamp: number }>();
  private static readonly GROUP_TARGET_DURATION = 3000; // ms
  
  // Fleeing enemy tracking
  private static fleeingEnemies = new Set<string>();
  private static fleeStartTimes = new Map<string, number>();
  
  // Boss phase transition tracking
  private static bossPhaseTransitions = new Map<string, { phase: number; timestamp: number }>();

  /**
   * Initialize behavior system
   */
  static initialize(): void {
    this.behaviorCache.clear();
    this.groupTargets.clear();
    this.fleeingEnemies.clear();
    this.fleeStartTimes.clear();
    this.bossPhaseTransitions.clear();
    BossPhaseManager.initialize();
  }

  /**
   * Update enemy behavior for all active enemies
   */
  static updateEnemyBehaviors(): void {
    const { enemies, towerSlots } = useGameStore.getState();
    
    // Update group coordination
    this.updateGroupCoordination(enemies, towerSlots);
    
    // Update individual enemy behaviors
    enemies.forEach(enemy => {
      this.updateSingleEnemyBehavior(enemy, towerSlots);
    });
    
    // Clean up old cache entries
    this.cleanupBehaviorCache();
  }

  /**
   * Update behavior for a single enemy
   */
  private static updateSingleEnemyBehavior(enemy: Enemy, towerSlots: TowerSlot[]): void {
    // Skip if enemy is frozen
    if (enemy.frozenUntil && enemy.frozenUntil > performance.now()) {
      return;
    }

    // Handle boss phase transitions using new BossPhaseManager
    if (enemy.bossType && enemy.health && enemy.maxHealth) {
      BossPhaseManager.updateBossPhase(enemy);
    }

    // Determine behavior based on enemy type and current state
    const behavior = this.determineEnemyBehavior(enemy, towerSlots);
    
    // Apply behavior-specific logic
    switch (behavior) {
      case 'flee':
        this.applyFleeBehavior(enemy, towerSlots);
        break;
      case 'group_attack':
        this.applyGroupAttackBehavior(enemy, towerSlots);
        break;
      case 'normal':
      default:
        this.applyNormalBehavior(enemy, towerSlots);
        break;
    }
  }

  /**
   * Determine the appropriate behavior for an enemy
   */
  private static determineEnemyBehavior(enemy: Enemy, towerSlots: TowerSlot[]): string {
    const cacheKey = `${enemy.id}_${Math.floor(enemy.position.x / 50)}_${Math.floor(enemy.position.y / 50)}`;
    const now = performance.now();
    const cached = this.behaviorCache.get(cacheKey);

    // Use cached behavior if still valid
    if (cached && (now - cached.timestamp) < this.BEHAVIOR_CACHE_DURATION) {
      return cached.behavior;
    }

    let behavior = 'normal';

    // Check for flee conditions
    if (this.shouldEnemyFlee(enemy, towerSlots)) {
      behavior = 'flee';
    }
    // Check for group attack conditions
    else if (this.shouldEnemyGroupAttack(enemy, towerSlots)) {
      behavior = 'group_attack';
    }

    // Cache the behavior
    this.behaviorCache.set(cacheKey, { behavior, timestamp: now });
    
    return behavior;
  }

  /**
   * Check if enemy should flee
   */
  private static shouldEnemyFlee(enemy: Enemy, _towerSlots: TowerSlot[]): boolean {
    // Boss flee logic
    if (enemy.bossType && enemy.fleeThreshold && enemy.health && enemy.maxHealth) {
      const healthPercentage = enemy.health / enemy.maxHealth;
      if (healthPercentage <= enemy.fleeThreshold) {
        return true;
      }
    }

    // Scout enemies flee when heavily outnumbered
    if (enemy.behaviorTag === 'avoid' || enemy.type === 'Scout') {
      const nearbyTowers = this.getNearbyTowers(enemy.position, 150);
      const nearbyEnemies = this.getNearbyEnemies(enemy.position, 200);
      
      if (nearbyTowers.length > 2 && nearbyEnemies.length < 3) {
        return true;
      }
    }

    // Ghost enemies flee when health is low
    if (enemy.behaviorTag === 'ghost' && enemy.health && enemy.maxHealth) {
      const healthPercentage = enemy.health / enemy.maxHealth;
      if (healthPercentage <= 0.3) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if enemy should participate in group attack
   */
  private static shouldEnemyGroupAttack(enemy: Enemy, _towerSlots: TowerSlot[]): boolean {
    // Tank enemies prefer group attacks
    if (enemy.behaviorTag === 'tank' || enemy.type === 'Tank') {
      const nearbyEnemies = this.getNearbyEnemies(enemy.position, 120);
      return nearbyEnemies.length >= 2;
    }

    // Berserker enemies group attack when health is high
    if (enemy.behaviorTag === 'rage' || enemy.type === 'Berserker') {
      if (enemy.health && enemy.maxHealth) {
        const healthPercentage = enemy.health / enemy.maxHealth;
        if (healthPercentage > 0.7) {
          const nearbyEnemies = this.getNearbyEnemies(enemy.position, 100);
          return nearbyEnemies.length >= 1;
        }
      }
    }

    // Boss enemies can coordinate group attacks
    if (enemy.bossType && enemy.canSpawnMinions) {
      const nearbyEnemies = this.getNearbyEnemies(enemy.position, 200);
      return nearbyEnemies.length >= 3;
    }

    return false;
  }

  /**
   * Apply flee behavior to enemy
   */
  private static applyFleeBehavior(enemy: Enemy, towerSlots: TowerSlot[]): void {
    // Mark enemy as fleeing
    if (!this.fleeingEnemies.has(enemy.id)) {
      this.fleeingEnemies.add(enemy.id);
      this.fleeStartTimes.set(enemy.id, performance.now());
      
      // Create flee visual effect
      this.createFleeEffect(enemy.position);
    }

    // Calculate flee direction (away from nearest tower)
    const nearestTower = this.getNearestTower(enemy.position, towerSlots);
    if (nearestTower) {
      const fleeDirection = this.calculateFleeDirection(enemy.position, nearestTower);
      
      // Apply flee movement with increased speed
      const fleeSpeed = enemy.speed * 1.5 * 0.016; // 50% speed boost
      enemy.position.x += fleeDirection.x * fleeSpeed;
      enemy.position.y += fleeDirection.y * fleeSpeed;
      
      // Change color to indicate fleeing
      enemy.color = this.getFleeColor(enemy.color);
    }

    // Check if flee should end
    this.checkFleeEndCondition(enemy);
  }

  /**
   * Apply group attack behavior to enemy
   */
  private static applyGroupAttackBehavior(enemy: Enemy, towerSlots: TowerSlot[]): void {
    // Find or create group target
    const groupTarget = this.getGroupTarget(enemy, towerSlots);
    if (groupTarget) {
      // Add enemy to group
      this.addEnemyToGroup(enemy.id, groupTarget);
      
      // Move toward group target with coordinated timing
      const groupMovement = this.calculateGroupMovement(enemy, groupTarget);
      enemy.position.x += groupMovement.x;
      enemy.position.y += groupMovement.y;
      
      // Visual indicator for group attack
      enemy.color = this.getGroupAttackColor(enemy.color);
    }
  }

  /**
   * Apply normal behavior to enemy
   */
  private static applyNormalBehavior(enemy: Enemy, _towerSlots: TowerSlot[]): void {
    if (this.fleeingEnemies.has(enemy.id)) {
      this.fleeingEnemies.delete(enemy.id);
      this.fleeStartTimes.delete(enemy.id);
      
      enemy.color = this.getOriginalColor(enemy.type || 'Basic');
    }
  }



  /**
   * Update group coordination
   */
  private static updateGroupCoordination(enemies: Enemy[], towerSlots: TowerSlot[]): void {
    const now = performance.now();
    
    // Clean up old group targets
    for (const [groupId, groupData] of this.groupTargets.entries()) {
      if (now - groupData.timestamp > this.GROUP_TARGET_DURATION) {
        this.groupTargets.delete(groupId);
      }
    }

    // Find new group targets
    const tankEnemies = enemies.filter(e => e.behaviorTag === 'tank' || e.type === 'Tank');
    tankEnemies.forEach(enemy => {
      const nearbyEnemies = this.getNearbyEnemies(enemy.position, 150);
      if (nearbyEnemies.length >= 2) {
        const target = this.findOptimalGroupTarget(enemy.position, towerSlots);
        if (target) {
          this.createGroupTarget(enemy.id, target, nearbyEnemies.map(e => e.id));
        }
      }
    });
  }

  /**
   * Get group target for enemy
   */
  private static getGroupTarget(enemy: Enemy, towerSlots: TowerSlot[]): TowerSlot | null {
    // Check existing groups
    for (const [_groupId, groupData] of this.groupTargets.entries()) {
      if (groupData.members.includes(enemy.id)) {
        return groupData.target;
      }
    }

    // Create new group if conditions are met
    const nearbyEnemies = this.getNearbyEnemies(enemy.position, 120);
    if (nearbyEnemies.length >= 2) {
      const target = this.findOptimalGroupTarget(enemy.position, towerSlots);
      if (target) {
        this.createGroupTarget(enemy.id, target, nearbyEnemies.map(e => e.id));
        return target;
      }
    }

    return null;
  }

  /**
   * Create a new group target
   */
  private static createGroupTarget(leaderId: string, target: TowerSlot, memberIds: string[]): void {
    const groupId = `group_${leaderId}_${Date.now()}`;
    this.groupTargets.set(groupId, {
      target,
      members: memberIds,
      timestamp: performance.now()
    });
  }

  /**
   * Add enemy to existing group
   */
  private static addEnemyToGroup(enemyId: string, target: TowerSlot): void {
    // Find existing group with this target
    for (const [_groupId, groupData] of this.groupTargets.entries()) {
      if (groupData.target === target && !groupData.members.includes(enemyId)) {
        groupData.members.push(enemyId);
        groupData.timestamp = performance.now(); // Refresh timestamp
        return;
      }
    }
  }

  /**
   * Calculate group movement with coordination
   */
  private static calculateGroupMovement(enemy: Enemy, target: TowerSlot): Position {
    const dx = target.x - enemy.position.x;
    const dy = target.y - enemy.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return { x: 0, y: 0 };

    const speed = enemy.speed * 0.016;
    const direction = { x: dx / distance, y: dy / distance };
    
    // Add slight randomization for natural group movement
    const randomFactor = 1 + (Math.random() - 0.5) * 0.1;
    
    return {
      x: direction.x * speed * randomFactor,
      y: direction.y * speed * randomFactor
    };
  }

  /**
   * Calculate flee direction
   */
  private static calculateFleeDirection(enemyPos: Position, towerPos: Position): Position {
    const dx = enemyPos.x - towerPos.x;
    const dy = enemyPos.y - towerPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) {
      // If enemy is at tower position, flee in random direction
      const angle = Math.random() * Math.PI * 2;
      return { x: Math.cos(angle), y: Math.sin(angle) };
    }
    
    return { x: dx / distance, y: dy / distance };
  }

  /**
   * Check if flee should end
   */
  private static checkFleeEndCondition(enemy: Enemy): void {
    const fleeStartTime = this.fleeStartTimes.get(enemy.id);
    if (!fleeStartTime) return;

    const fleeDuration = performance.now() - fleeStartTime;
    const maxFleeDuration = 5000; // 5 seconds

    if (fleeDuration > maxFleeDuration) {
      this.fleeingEnemies.delete(enemy.id);
      this.fleeStartTimes.delete(enemy.id);
      enemy.color = this.getOriginalColor(enemy.type || 'Basic');
      const enemyPool = advancedPoolManager.getPool<AdvancedEnemy>('enemy');
      if (enemyPool) enemyPool.release(enemy as AdvancedEnemy);
    }
  }

  /**
   * Find optimal group target
   */
  private static findOptimalGroupTarget(enemyPos: Position, towerSlots: TowerSlot[]): TowerSlot | null {
    const slotsWithTowers = towerSlots.filter(s => s.unlocked && s.tower);
    if (slotsWithTowers.length === 0) return null;

    // Find the most strategic target (closest to multiple enemies)
    let bestTarget: TowerSlot | null = null;
    let bestScore = -1;

    slotsWithTowers.forEach(slot => {
      const distance = this.calculateDistance(enemyPos, slot);
      const score = 1 / (distance + 1); // Closer is better
      
      if (score > bestScore) {
        bestScore = score;
        bestTarget = slot;
      }
    });

    return bestTarget;
  }

  /**
   * Get nearby towers
   */
  private static getNearbyTowers(position: Position, radius: number): TowerSlot[] {
    const { towerSlots } = useGameStore.getState();
    return towerSlots.filter(slot => {
      if (!slot.tower) return false;
      const distance = this.calculateDistance(position, slot);
      return distance <= radius;
    });
  }

  /**
   * Get nearby enemies
   */
  private static getNearbyEnemies(position: Position, radius: number): Enemy[] {
    const { enemies } = useGameStore.getState();
    return enemies.filter(enemy => {
      const distance = this.calculateDistance(position, enemy.position);
      return distance <= radius;
    });
  }

  /**
   * Get nearest tower
   */
  private static getNearestTower(position: Position, towerSlots: TowerSlot[]): TowerSlot | null {
    const slotsWithTowers = towerSlots.filter(s => s.unlocked && s.tower);
    if (slotsWithTowers.length === 0) return null;

    let nearest: TowerSlot | null = null;
    let minDistance = Infinity;

    slotsWithTowers.forEach(slot => {
      const distance = this.calculateDistance(position, slot);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = slot;
      }
    });

    return nearest;
  }

  /**
   * Calculate distance between two positions
   */
  private static calculateDistance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Create flee visual effect
   */
  private static createFleeEffect(position: Position): void {
    createManagedEffect('flee', position, 1000);
  }

  /**
   * Create phase transition effect
   */
  private static createPhaseTransitionEffect(position: Position, _phase: number): void {
    createManagedEffect('phase_transition', position, 2000);
  }

  /**
   * Get flee color
   */
  private static getFleeColor(originalColor: string): string {
    // Make color more red to indicate fleeing
    return originalColor.replace('#', '#ff');
  }

  /**
   * Get group attack color
   */
  private static getGroupAttackColor(originalColor: string): string {
    // Make color more orange to indicate group attack
    return originalColor.replace('#', '#ff8');
  }

  /**
   * Get phase color
   */
  private static getPhaseColor(originalColor: string, phase: number): string {
    const phaseColors = ['#ff0000', '#ff6600', '#ffcc00', '#ff0066'];
    return phaseColors[Math.min(phase - 1, phaseColors.length - 1)];
  }

  /**
   * Get original color for enemy type
   */
  private static getOriginalColor(enemyType: string): string {
    const typeDef = GAME_CONSTANTS.ENEMY_TYPES[enemyType as keyof typeof GAME_CONSTANTS.ENEMY_TYPES];
    return typeDef ? typeDef.color : '#ff3333';
  }

  /**
   * Clean up behavior cache
   */
  private static cleanupBehaviorCache(): void {
    const now = performance.now();
    for (const [key, data] of this.behaviorCache.entries()) {
      if (now - data.timestamp > this.BEHAVIOR_CACHE_DURATION) {
        this.behaviorCache.delete(key);
      }
    }
  }

  /**
   * Get behavior statistics for debugging
   */
  static getBehaviorStats(): {
    fleeingCount: number;
    groupAttackCount: number;
    bossPhaseTransitions: number;
  } {
    return {
      fleeingCount: this.fleeingEnemies.size,
      groupAttackCount: this.groupTargets.size,
      bossPhaseTransitions: this.bossPhaseTransitions.size
    };
  }
} 