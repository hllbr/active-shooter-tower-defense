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

  /** Minimum tower size in pixels to keep gameplay readable */
  private readonly minTowerSize = 16;

  constructor(private baseWidth = 1920, private baseHeight = 1080) {
    this.updateForScreenSize(window.innerWidth, window.innerHeight);
    // Recalculate when the window size changes
    window.addEventListener('resize', () => {
      this.updateForScreenSize(window.innerWidth, window.innerHeight);
    }, { passive: true });
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

  /** Scale any value according to the current screen size */
  scaleValue(value: number): number {
    return value * this.scale;
  }
}
