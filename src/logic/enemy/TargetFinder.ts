import { useGameStore } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/constants';
import type { Position } from '../../models/gameTypes';

/**
 * Finder class responsible for finding the nearest target for enemies
 */
export class TargetFinder {
  /**
   * Gets the nearest slot with a tower for an enemy to target
   */
  static getNearestSlot(pos: Position) {
    const slotsWithTowers = useGameStore.getState().towerSlots.filter((s) => s.unlocked && s.tower);

    // Eğer hiç kule yoksa, merkezi hedef al
    if (slotsWithTowers.length === 0) {
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
} 