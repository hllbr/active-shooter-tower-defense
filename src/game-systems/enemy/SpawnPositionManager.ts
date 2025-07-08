import { GAME_CONSTANTS } from '../../utils/constants';
import type { Position } from '../../models/gameTypes';
import { spawnZoneManager } from './SpawnZoneManager';
import { Logger } from '../../utils/Logger';

/**
 * Manager class responsible for calculating spawn positions for enemies
 * Now uses predefined spawn zones instead of random screen edges for better performance
 */
export class SpawnPositionManager {
  /**
   * Gets a random spawn position from predefined spawn zones
   * This replaces the old edge-based spawning system
   */
  static getRandomSpawnPosition(): Position {
    if (GAME_CONSTANTS.SPAWN_ZONES.PERFORMANCE_LOGGING) {
      const _startTime = performance.now();
      const position = spawnZoneManager.getRandomSpawnPosition();
      const _endTime = performance.now();
      
      // Log performance occasionally (every 100th call)
      if (Math.random() < 0.01) {
        // Performance logging can be added here
      }
      
      return position;
    }
    
    // Use the new zone-based spawning system
    return spawnZoneManager.getRandomSpawnPosition();
  }

  /**
   * LEGACY: Gets a random spawn position from screen edges
   * Kept for backward compatibility but not recommended for performance
   */
  static getLegacyRandomSpawnPosition(): Position {
    Logger.warn('🚨 Using legacy edge spawning - consider migrating to zone-based spawning');
    
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
   * Gets spawn position from a specific zone
   * This replaces edge-based spawning with zone-based spawning
   */
  static getSpawnPositionFromZone(zoneId: string): Position | null {
    return spawnZoneManager.getSpawnPositionFromZone(zoneId);
  }

  /**
   * Gets spawn position from a zone matching a direction preference
   */
  static getSpawnPositionFromDirection(direction: 'top' | 'right' | 'bottom' | 'left'): Position {
    let preferredZones: string[] = [];
    
    switch (direction) {
      case 'top':
        preferredZones = ['top_left', 'top_right', 'top_center_left', 'top_center_right'];
        break;
      case 'right':
        preferredZones = ['top_right', 'bottom_right', 'right_upper', 'right_lower'];
        break;
      case 'bottom':
        preferredZones = ['bottom_left', 'bottom_right', 'bottom_center_left', 'bottom_center_right'];
        break;
      case 'left':
        preferredZones = ['top_left', 'bottom_left', 'left_upper', 'left_lower'];
        break;
    }

    // Try to spawn from preferred zones
    for (const zoneId of preferredZones) {
      const position = spawnZoneManager.getSpawnPositionFromZone(zoneId);
      if (position) return position;
    }

    // Fallback to any available zone
    return spawnZoneManager.getRandomSpawnPosition();
  }

  /**
   * Gets spawn position from corner zones
   */
  static getSpawnPositionFromCorner(corner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'): Position {
    const zoneMap = {
      topLeft: 'top_left',
      topRight: 'top_right',
      bottomLeft: 'bottom_left',
      bottomRight: 'bottom_right'
    };

    const position = spawnZoneManager.getSpawnPositionFromZone(zoneMap[corner]);
    return position || spawnZoneManager.getRandomSpawnPosition();
  }

  /**
   * LEGACY: Gets spawn position from a specific edge
   * Kept for backward compatibility but not recommended for performance
   */
  static getLegacySpawnPositionFromEdge(edge: 'top' | 'right' | 'bottom' | 'left'): Position {
    Logger.warn('🚨 Using legacy edge spawning - consider using getSpawnPositionFromDirection()');
    
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
   * LEGACY: Gets spawn position from a specific corner
   * Kept for backward compatibility but not recommended for performance
   */
  static getLegacySpawnPositionFromCorner(corner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'): Position {
    Logger.warn('🚨 Using legacy corner spawning - consider using getSpawnPositionFromCorner()');
    
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

  /**
   * Update spawn zones based on current wave
   */
  static updateSpawnZonesForWave(wave: number): void {
    spawnZoneManager.updateZonesForWave(wave);
  }

  /**
   * Get active spawn zones for debugging
   */
  static getActiveSpawnZones() {
    return spawnZoneManager.getActiveZones();
  }
}

// Export the main function for backward compatibility
export const getRandomSpawnPosition = SpawnPositionManager.getRandomSpawnPosition; 