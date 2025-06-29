import type { Bullet, Enemy, Position } from '../../../models/gameTypes';
import type { CollisionResult } from '../types';
import { FrameIndependentCollisionDetector } from './FrameIndependentDetector';

/**
 * Optimized Collision Detector with Spatial Partitioning
 * Open/Closed Principle: Extends base functionality
 * Single Responsibility: Handles spatial optimization for collision detection
 */
export class OptimizedCollisionDetector extends FrameIndependentCollisionDetector {
  private spatialGrid = new Map<string, Enemy[]>();
  private readonly gridSize = 100; // Grid cell size for spatial partitioning
  
  /**
   * Check collision with spatial optimization for multiple enemies
   */
  public checkCollisionWithSpatialOptimization(
    bullet: Bullet, 
    enemies: Enemy[], 
    deltaTime: number
  ): { enemy: Enemy; result: CollisionResult } | null {
    // Update spatial grid
    this.updateSpatialGrid(enemies);
    
    // Get nearby enemies using spatial partitioning
    const nearbyEnemies = this.getNearbyEnemies(bullet.position);
    
    // Check collision only with nearby enemies
    for (const enemy of nearbyEnemies) {
      const result = this.checkCollision(bullet, enemy, deltaTime);
      if (result.hasCollision) {
        return { enemy, result };
      }
    }
    
    return null;
  }
  
  /**
   * Update spatial partitioning grid
   */
  private updateSpatialGrid(enemies: Enemy[]): void {
    this.spatialGrid.clear();
    
    for (const enemy of enemies) {
      if (!enemy.isActive) continue;
      
      const gridKey = this.getGridKey(enemy.position);
      if (!this.spatialGrid.has(gridKey)) {
        this.spatialGrid.set(gridKey, []);
      }
      this.spatialGrid.get(gridKey)!.push(enemy);
    }
  }
  
  /**
   * Get enemies in nearby grid cells
   */
  private getNearbyEnemies(position: Position): Enemy[] {
    const nearbyEnemies: Enemy[] = [];
    const centerGridKey = this.getGridKey(position);
    const [centerX, centerY] = centerGridKey.split(',').map(Number);
    
    // Check 3x3 grid around bullet position
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const gridKey = `${centerX + dx},${centerY + dy}`;
        const cellEnemies = this.spatialGrid.get(gridKey) || [];
        nearbyEnemies.push(...cellEnemies);
      }
    }
    
    return nearbyEnemies;
  }
  
  /**
   * Generate grid key from position
   */
  private getGridKey(position: Position): string {
    const gridX = Math.floor(position.x / this.gridSize);
    const gridY = Math.floor(position.y / this.gridSize);
    return `${gridX},${gridY}`;
  }
  
  /**
   * Get grid statistics for debugging
   */
  public getGridStats(): { totalCells: number; totalEnemies: number; averageEnemiesPerCell: number } {
    let totalEnemies = 0;
    let nonEmptyCells = 0;
    
    for (const cell of this.spatialGrid.values()) {
      if (cell.length > 0) {
        totalEnemies += cell.length;
        nonEmptyCells++;
      }
    }
    
    return {
      totalCells: this.spatialGrid.size,
      totalEnemies,
      averageEnemiesPerCell: nonEmptyCells > 0 ? totalEnemies / nonEmptyCells : 0
    };
  }
  
  /**
   * Clear spatial grid (for memory management)
   */
  public clearGrid(): void {
    this.spatialGrid.clear();
  }
} 