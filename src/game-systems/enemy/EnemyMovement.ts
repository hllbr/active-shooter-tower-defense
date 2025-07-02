import { useGameStore } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/constants';
import type { Enemy, TowerSlot } from '../../models/gameTypes';
import { TargetFinder } from './TargetFinder';

/**
 * Movement class responsible for handling enemy movement and collision logic
 */
export class EnemyMovement {
  /**
   * Updates movement for all active enemies
   */
  static updateEnemyMovement() {
    const { enemies, towerSlots, damageTower, removeEnemy, addGold, hitWall, damageEnemy, wallLevel, isGameOver } =
      useGameStore.getState();
    
    // ✅ CRITICAL FIX: Stop enemy movement if game is over
    if (isGameOver) {
      return;
    }
    
    enemies.forEach((enemy) => {
      this.updateSingleEnemyMovement(enemy, { towerSlots, damageTower, removeEnemy, addGold, hitWall, damageEnemy, wallLevel });
    });
  }

  /**
   * Updates movement for a single enemy
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

    // Handle continuous gold drops for special enemies
    this.handleSpecialEnemyGoldDrop(enemy, addGold);

    const targetSlot = TargetFinder.getNearestSlot(enemy.position);
    if (!targetSlot) return;

    // Handle slot modifiers
    if (this.handleSlotModifiers(targetSlot)) {
      return; // Enemy is blocked by wall
    }

    const dx = targetSlot.x - enemy.position.x;
    const dy = targetSlot.y - enemy.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Handle avoid behavior
    if (this.handleAvoidBehavior(enemy, towerSlots)) {
      return;
    }

    // Handle collision with target
    if (this.handleTargetCollision(enemy, targetSlot, towerSlots, dx, dy, dist, { damageTower, removeEnemy, addGold, hitWall, damageEnemy, wallLevel })) {
      return;
    }

    // Move toward target
    this.moveTowardTarget(enemy, targetSlot, dx, dy, dist);
  }

  /**
   * Handles continuous gold drops for special enemies
   */
  private static handleSpecialEnemyGoldDrop(enemy: Enemy, addGold: (amount: number) => void) {
    if (enemy.isSpecial && enemy.lastGoldDrop) {
      const now = performance.now();
      if (now - enemy.lastGoldDrop >= GAME_CONSTANTS.MICROBE_ENEMY.goldDropInterval) {
        addGold(enemy.goldValue);
        enemy.lastGoldDrop = now;
      }
    }
  }

  /**
   * Handles slot modifiers (walls, trenches, etc.)
   */
  private static handleSlotModifiers(targetSlot: TowerSlot): boolean {
    if (targetSlot.modifier) {
      const mod = targetSlot.modifier;
      if (mod.expiresAt && mod.expiresAt < performance.now()) {
        targetSlot.modifier = undefined;
      } else if (mod.type === 'wall') {
        return true; // Block enemy
      }
    }
    return false;
  }

  /**
   * Handles avoid behavior for certain enemy types
   */
  private static handleAvoidBehavior(enemy: Enemy, towerSlots: TowerSlot[]): boolean {
    if (enemy.behaviorTag === 'avoid') {
      const nearby = towerSlots.filter(s => s.tower && Math.hypot(s.x - enemy.position.x, s.y - enemy.position.y) < 150).length;
      if (nearby > 3) {
        enemy.position.x += (Math.random() - 0.5) * enemy.speed * 0.016;
        enemy.position.y += (Math.random() - 0.5) * enemy.speed * 0.016;
        return true;
      }
    }
    return false;
  }

  /**
   * Handles collision with target slot
   */
  private static handleTargetCollision(
    enemy: Enemy, 
    targetSlot: TowerSlot, 
    towerSlots: TowerSlot[], 
    dx: number, 
    dy: number, 
    dist: number,
    actions: {
      damageTower: (slotIdx: number, damage: number) => void;
      removeEnemy: (id: string) => void;
      addGold: (amount: number) => void;
      hitWall: (slotIdx: number) => void;
      damageEnemy: (id: string, damage: number) => void;
      wallLevel: number;
    }
  ): boolean {
    if (dist < (enemy.size + GAME_CONSTANTS.TOWER_SIZE) / 2) {
      if (targetSlot.tower) {
        const slotIdx = towerSlots.findIndex(
          (s) => s.x === targetSlot.x && s.y === targetSlot.y,
        );
        
        if (targetSlot.tower.wallStrength > 0) {
          // Wall exists: Knockback and stun the enemy
          this.handleWallCollision(enemy, slotIdx, dx, dy, dist, actions);
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
   * Handles wall collision with knockback and stun
   */
  private static handleWallCollision(
    enemy: Enemy, 
    slotIdx: number, 
    dx: number, 
    dy: number, 
    dist: number,
    actions: {
      hitWall: (slotIdx: number) => void;
      damageEnemy: (id: string, damage: number) => void;
      wallLevel: number;
    }
  ) {
    actions.hitWall(slotIdx);

    // Apply wall collision damage
    const wallDamage = GAME_CONSTANTS.WALL_SYSTEM.WALL_COLLISION_DAMAGE[actions.wallLevel] ?? 0;
    if (wallDamage > 0) {
      actions.damageEnemy(enemy.id, wallDamage);
    }

    // Apply knockback
    const knockbackVector = { x: -dx / dist, y: -dy / dist };
    enemy.position.x += knockbackVector.x * GAME_CONSTANTS.KNOCKBACK_DISTANCE;
    enemy.position.y += knockbackVector.y * GAME_CONSTANTS.KNOCKBACK_DISTANCE;

    // Apply stun
    enemy.frozenUntil = performance.now() + GAME_CONSTANTS.KNOCKBACK_STUN_DURATION;
  }

  /**
   * Moves enemy toward target
   */
  private static moveTowardTarget(enemy: Enemy, targetSlot: TowerSlot, dx: number, dy: number, dist: number) {
    let speedMult = 1;
    if (targetSlot.modifier && targetSlot.modifier.type === 'trench') {
      speedMult = GAME_CONSTANTS.TRENCH_SLOW_MULTIPLIER;
    }
    
    const moveX = (dx / dist) * enemy.speed * speedMult * 0.016;
    const moveY = (dy / dist) * enemy.speed * speedMult * 0.016;
    enemy.position.x += moveX;
    enemy.position.y += moveY;
  }
} 