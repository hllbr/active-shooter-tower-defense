import { GAME_CONSTANTS } from '../../utils/constants';
import type { Position } from '../../models/gameTypes';
import { Logger } from '../../utils/Logger';

/**
 * Interface for defining spawn zones
 */
export interface SpawnZone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  weight: number; // Spawn frequency weight (higher = more likely)
  active: boolean;
  color?: string; // For debug visualization
}

/**
 * Manager class for handling predefined enemy spawn zones
 * This replaces random edge spawning with strategic area spawning
 */
export class SpawnZoneManager {
  private static instance: SpawnZoneManager | null = null;
  private spawnZones: SpawnZone[] = [];

  private constructor() {
    this.initializeSpawnZones();
  }

  public static getInstance(): SpawnZoneManager {
    if (!SpawnZoneManager.instance) {
      SpawnZoneManager.instance = new SpawnZoneManager();
    }
    return SpawnZoneManager.instance;
  }

  /**
   * Initialize predefined spawn zones based on strategic locations
   * These zones are distributed around the map to create interesting gameplay
   */
  private initializeSpawnZones(): void {
    const mapWidth = GAME_CONSTANTS.CANVAS_WIDTH;
    const mapHeight = GAME_CONSTANTS.CANVAS_HEIGHT;
    
    // Define spawn zones based on the red rectangles from user's image
    this.spawnZones = [
      // Top-left corner area
      {
        id: 'top_left',
        name: 'Kuzey-Batı Bölgesi',
        x: 50,
        y: 50,
        width: 200,
        height: 150,
        weight: 1.0,
        active: true,
        color: '#ff4444'
      },
      
      // Top-right corner area
      {
        id: 'top_right',
        name: 'Kuzey-Doğu Bölgesi',
        x: mapWidth - 250,
        y: 50,
        width: 200,
        height: 150,
        weight: 1.0,
        active: true,
        color: '#ff4444'
      },
      
      // Bottom-left corner area
      {
        id: 'bottom_left',
        name: 'Güney-Batı Bölgesi',
        x: 50,
        y: mapHeight - 200,
        width: 200,
        height: 150,
        weight: 1.0,
        active: true,
        color: '#ff4444'
      },
      
      // Bottom-right corner area
      {
        id: 'bottom_right',
        name: 'Güney-Doğu Bölgesi',
        x: mapWidth - 250,
        y: mapHeight - 200,
        width: 200,
        height: 150,
        weight: 1.0,
        active: true,
        color: '#ff4444'
      },
      
      // Left side middle areas
      {
        id: 'left_upper',
        name: 'Batı Üst Bölge',
        x: 50,
        y: mapHeight * 0.25,
        width: 180,
        height: 120,
        weight: 1.2,
        active: true,
        color: '#ff6666'
      },
      
      {
        id: 'left_lower',
        name: 'Batı Alt Bölge', 
        x: 50,
        y: mapHeight * 0.6,
        width: 180,
        height: 120,
        weight: 1.2,
        active: true,
        color: '#ff6666'
      },
      
      // Right side middle areas
      {
        id: 'right_upper',
        name: 'Doğu Üst Bölge',
        x: mapWidth - 230,
        y: mapHeight * 0.25,
        width: 180,
        height: 120,
        weight: 1.2,
        active: true,
        color: '#ff6666'
      },
      
      {
        id: 'right_lower',
        name: 'Doğu Alt Bölge',
        x: mapWidth - 230,
        y: mapHeight * 0.6,
        width: 180,
        height: 120,
        weight: 1.2,
        active: true,
        color: '#ff6666'
      },
      
      // Top middle areas
      {
        id: 'top_center_left',
        name: 'Kuzey Merkez-Sol',
        x: mapWidth * 0.25,
        y: 50,
        width: 160,
        height: 100,
        weight: 0.8,
        active: true,
        color: '#ff8888'
      },
      
      {
        id: 'top_center_right',
        name: 'Kuzey Merkez-Sağ',
        x: mapWidth * 0.6,
        y: 50,
        width: 160,
        height: 100,
        weight: 0.8,
        active: true,
        color: '#ff8888'
      },
      
      // Bottom middle areas
      {
        id: 'bottom_center_left',
        name: 'Güney Merkez-Sol',
        x: mapWidth * 0.25,
        y: mapHeight - 150,
        width: 160,
        height: 100,
        weight: 0.8,
        active: true,
        color: '#ff8888'
      },
      
      {
        id: 'bottom_center_right',
        name: 'Güney Merkez-Sağ',
        x: mapWidth * 0.6,
        y: mapHeight - 150,
        width: 160,
        height: 100,
        weight: 0.8,
        active: true,
        color: '#ff8888'
      }
    ];

  }

  /**
   * Get a random spawn position from active spawn zones
   */
  public getRandomSpawnPosition(): Position {
    const activeZones = this.spawnZones.filter(zone => zone.active);
    
    if (activeZones.length === 0) {
      Logger.warn('⚠️ No active spawn zones! Falling back to center spawn');
      return {
        x: GAME_CONSTANTS.CANVAS_WIDTH / 2,
        y: GAME_CONSTANTS.CANVAS_HEIGHT / 2
      };
    }

    // Weight-based zone selection
    const zone = this.selectZoneByWeight(activeZones);
    
    // Generate random position within the selected zone
    const x = zone.x + Math.random() * zone.width;
    const y = zone.y + Math.random() * zone.height;
    
    return { x, y };
  }

  /**
   * Get spawn position from a specific zone
   */
  public getSpawnPositionFromZone(zoneId: string): Position | null {
    const zone = this.spawnZones.find(z => z.id === zoneId && z.active);
    
    if (!zone) {
      Logger.warn(`⚠️ Zone ${zoneId} not found or inactive`);
      return null;
    }

    const x = zone.x + Math.random() * zone.width;
    const y = zone.y + Math.random() * zone.height;
    
    return { x, y };
  }

  /**
   * Select zone based on weights
   */
  private selectZoneByWeight(zones: SpawnZone[]): SpawnZone {
    const totalWeight = zones.reduce((sum, zone) => sum + zone.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const zone of zones) {
      random -= zone.weight;
      if (random <= 0) {
        return zone;
      }
    }
    
    // Fallback to first zone
    return zones[0];
  }

  /**
   * Get all active spawn zones
   */
  public getActiveZones(): SpawnZone[] {
    return this.spawnZones.filter(zone => zone.active);
  }

  /**
   * Toggle zone activation
   */
  public toggleZone(zoneId: string, active?: boolean): boolean {
    const zone = this.spawnZones.find(z => z.id === zoneId);
    if (!zone) return false;

    zone.active = active !== undefined ? active : !zone.active;
    return true;
  }

  /**
   * Update zone weight (affects spawn frequency)
   */
  public updateZoneWeight(zoneId: string, weight: number): boolean {
    const zone = this.spawnZones.find(z => z.id === zoneId);
    if (!zone) return false;

    zone.weight = Math.max(0, weight);
    return true;
  }

  /**
   * Get zones for debug visualization
   */
  public getZonesForDebug(): SpawnZone[] {
    return GAME_CONSTANTS.DEBUG_MODE ? this.spawnZones : [];
  }

  /**
   * Activate zones based on wave difficulty
   */
  public updateZonesForWave(wave: number): void {
    // Early waves: Use fewer zones
    if (wave <= 5) {
      this.spawnZones.forEach(zone => {
        zone.active = ['top_left', 'top_right', 'bottom_left', 'bottom_right'].includes(zone.id);
      });
    }
    // Mid waves: Add side zones
    else if (wave <= 15) {
      this.spawnZones.forEach(zone => {
        zone.active = !zone.id.includes('center');
      });
    }
    // Late waves: All zones active
    else {
      this.spawnZones.forEach(zone => {
        zone.active = true;
      });
    }

    const _activeCount = this.spawnZones.filter(z => z.active).length;
  }
}

// Export singleton instance getter
export const spawnZoneManager = SpawnZoneManager.getInstance(); 