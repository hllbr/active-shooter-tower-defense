import { GAME_CONSTANTS } from '../../utils/constants';
import type { Position } from '../../models/gameTypes';

/**
 * Manager class responsible for calculating spawn positions for enemies
 */
export class SpawnPositionManager {
  /**
   * Gets a random spawn position from screen edges
   */
  static getRandomSpawnPosition(): Position {
    // Spawn enemies from random screen edges
    const edge = Math.floor(Math.random() * 4);
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    switch (edge) {
      case 0: // top
        return { x: Math.random() * w, y: -GAME_CONSTANTS.ENEMY_SIZE / 2 };
      case 1: // right
        return { x: w + GAME_CONSTANTS.ENEMY_SIZE / 2, y: Math.random() * h };
      case 2: // bottom
        return { x: Math.random() * w, y: h + GAME_CONSTANTS.ENEMY_SIZE / 2 };
      default: // left
        return { x: -GAME_CONSTANTS.ENEMY_SIZE / 2, y: Math.random() * h };
    }
  }

  /**
   * Gets spawn position from a specific edge
   */
  static getSpawnPositionFromEdge(edge: 'top' | 'right' | 'bottom' | 'left'): Position {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    switch (edge) {
      case 'top':
        return { x: Math.random() * w, y: -GAME_CONSTANTS.ENEMY_SIZE / 2 };
      case 'right':
        return { x: w + GAME_CONSTANTS.ENEMY_SIZE / 2, y: Math.random() * h };
      case 'bottom':
        return { x: Math.random() * w, y: h + GAME_CONSTANTS.ENEMY_SIZE / 2 };
      case 'left':
        return { x: -GAME_CONSTANTS.ENEMY_SIZE / 2, y: Math.random() * h };
    }
  }

  /**
   * Gets spawn position from a specific corner
   */
  static getSpawnPositionFromCorner(corner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'): Position {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    switch (corner) {
      case 'topLeft':
        return { x: -GAME_CONSTANTS.ENEMY_SIZE / 2, y: -GAME_CONSTANTS.ENEMY_SIZE / 2 };
      case 'topRight':
        return { x: w + GAME_CONSTANTS.ENEMY_SIZE / 2, y: -GAME_CONSTANTS.ENEMY_SIZE / 2 };
      case 'bottomLeft':
        return { x: -GAME_CONSTANTS.ENEMY_SIZE / 2, y: h + GAME_CONSTANTS.ENEMY_SIZE / 2 };
      case 'bottomRight':
        return { x: w + GAME_CONSTANTS.ENEMY_SIZE / 2, y: h + GAME_CONSTANTS.ENEMY_SIZE / 2 };
    }
  }
}

// Export the main function for backward compatibility
export const getRandomSpawnPosition = SpawnPositionManager.getRandomSpawnPosition; 