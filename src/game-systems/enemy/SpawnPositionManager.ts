import { GAME_CONSTANTS } from '../../utils/constants';
import type { Position } from '../../models/gameTypes';
import { spawnZoneManager } from './SpawnZoneManager';

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