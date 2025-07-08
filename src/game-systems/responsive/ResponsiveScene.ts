import type { Enemy, Tower } from '../../models/gameTypes';
import { throttle } from '../../utils/performance';

export interface SpawnPoint {
  x: number;
  y: number;
}

/**
 * Responsive game scene that recalculates spawn points and
 * tower scaling based on screen size.
 * Engine-independent implementation in TypeScript.
 */
export class ResponsiveScene {
  private spawnPoints: SpawnPoint[] = [];
  private scale = 1;
  private towers: Tower[] = [];
  private enemies: Enemy[] = [];

  /** Minimum tower size in pixels to keep gameplay readable */
  private readonly minTowerSize = 16;

  constructor(private baseWidth = 1920, private baseHeight = 1080) {
    if (typeof window !== 'undefined') {
      this.updateForScreenSize(window.innerWidth, window.innerHeight);
      const handler = throttle(() => {
        this.updateForScreenSize(window.innerWidth, window.innerHeight);
        this.updateTowerPositions(window.innerWidth, window.innerHeight);
      }, 100);
      window.addEventListener('resize', handler, { passive: true });
    }
  }

  /** Update stored tower list */
  setTowers(towers: Tower[]): void {
    this.towers = towers;
  }

  /** Update stored enemy list */
  setEnemies(enemies: Enemy[]): void {
    this.enemies = enemies;
  }

  /**
   * Update internal scale and regenerate spawn points when
   * screen size changes.
   */
  updateForScreenSize(width: number, height: number): void {
    this.scale = Math.min(width / this.baseWidth, height / this.baseHeight);
    this.spawnPoints = this.generateSpawnPoints(width, height);
  }

  /**
   * Normalize all tower positions when the screen size changes
   */
  updateTowerPositions(width: number, height: number): void {
    this.towers = this.towers.map((tower) => {
      const size = this.getTowerSize(tower.size);
      const pos = this.constrainTowerPosition(
        tower.position.x,
        tower.position.y,
        size,
        tower.range,
        width,
        height
      );
      return { ...tower, position: pos };
    });
  }

  /**
   * Get scaled tower size ensuring a minimum for playability
   */
  getTowerSize(baseSize: number): number {
    return Math.max(this.scaleValue(baseSize), this.minTowerSize);
  }

  /**
   * Ensure a tower and its range circle stay fully on-screen
   */
  constrainTowerPosition(x: number, y: number, towerSize: number, range: number,
    screenWidth: number, screenHeight: number): { x: number; y: number } {
    const halfSize = towerSize / 2;
    const margin = range + halfSize;

    const clampedX = Math.min(Math.max(x, margin), screenWidth - margin);
    const clampedY = Math.min(Math.max(y, margin), screenHeight - margin);

    return { x: clampedX, y: clampedY };
  }

  /**
   * Spawn points are always kept within the visible area.
   */
  private generateSpawnPoints(width: number, height: number): SpawnPoint[] {
    const margin = 50 * this.scale;
    return [
      { x: margin, y: margin },
      { x: width - margin, y: margin },
      { x: margin, y: height - margin },
      { x: width - margin, y: height - margin }
    ];
  }

  getSpawnPoints(): SpawnPoint[] {
    return this.spawnPoints;
  }

  /**
   * Calculate a spawn point that does not collide with towers or enemies
   */
  getValidSpawnPoint(screenWidth: number, screenHeight: number, enemySize: number): SpawnPoint {
    const maxAttempts = 20;
    for (let i = 0; i < maxAttempts; i++) {
      const candidate = this.randomPointWithinScreen(screenWidth, screenHeight, enemySize);
      if (this.isPositionFree(candidate, enemySize)) {
        return candidate;
      }
    }
    // Fallback to center if no free point found
    return { x: screenWidth / 2, y: screenHeight / 2 };
  }

  private randomPointWithinScreen(width: number, height: number, size: number): SpawnPoint {
    const margin = size / 2;
    return {
      x: margin + Math.random() * (width - 2 * margin),
      y: margin + Math.random() * (height - 2 * margin)
    };
  }

  private isPositionFree(point: SpawnPoint, size: number): boolean {
    const radius = size / 2;
    for (const tower of this.towers) {
      const dx = point.x - tower.position.x;
      const dy = point.y - tower.position.y;
      if (Math.hypot(dx, dy) < radius + tower.size / 2) {
        return false;
      }
    }
    for (const enemy of this.enemies) {
      const dx = point.x - enemy.position.x;
      const dy = point.y - enemy.position.y;
      if (Math.hypot(dx, dy) < radius + enemy.size / 2) {
        return false;
      }
    }
    return true;
  }

  /** Scale any value according to the current screen size */
  scaleValue(value: number): number {
    return value * this.scale;
  }
}
