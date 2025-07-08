/**
 * 🗂️ Spatial Partitioning System
 * High-performance collision detection optimization using spatial grid
 */

import type { Position } from '../../models/gameTypes';


export interface SpatialObject {
  id: string;
  position: Position;
  radius?: number;
  size?: number;
}

export interface SpatialBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Grid-based spatial partitioning for fast collision queries
 */
export class SpatialGrid<T extends SpatialObject> {
  private cellSize: number;
  private bounds: SpatialBounds;
  private grid: Map<string, Set<T>> = new Map();
  private objectCells: Map<string, Set<string>> = new Map(); // Track which cells each object is in
  private cols: number;
  private rows: number;
  
  // Performance tracking
  private stats = {
    totalObjects: 0,
    totalQueries: 0,
    averageObjectsPerCell: 0,
    maxObjectsInCell: 0,
    cellsUsed: 0
  };
  
  constructor(bounds: SpatialBounds, cellSize: number = 100) {
    this.bounds = bounds;
    this.cellSize = cellSize;
    this.cols = Math.ceil(bounds.width / cellSize);
    this.rows = Math.ceil(bounds.height / cellSize);
    

  }
  
  /**
   * Get grid cell key for position
   */
  private getCellKey(x: number, y: number): string {
    const col = Math.floor((x - this.bounds.x) / this.cellSize);
    const row = Math.floor((y - this.bounds.y) / this.cellSize);
    
    // Clamp to grid bounds
    const clampedCol = Math.max(0, Math.min(col, this.cols - 1));
    const clampedRow = Math.max(0, Math.min(row, this.rows - 1));
    
    return `${clampedCol},${clampedRow}`;
  }
  
  /**
   * Get all cells that an object spans (for large objects)
   */
  private getObjectCells(obj: T): string[] {
    const radius = obj.radius || obj.size || 10;
    const minX = obj.position.x - radius;
    const maxX = obj.position.x + radius;
    const minY = obj.position.y - radius;
    const maxY = obj.position.y + radius;
    
    const minCol = Math.max(0, Math.floor((minX - this.bounds.x) / this.cellSize));
    const maxCol = Math.min(this.cols - 1, Math.floor((maxX - this.bounds.x) / this.cellSize));
    const minRow = Math.max(0, Math.floor((minY - this.bounds.y) / this.cellSize));
    const maxRow = Math.min(this.rows - 1, Math.floor((maxY - this.bounds.y) / this.cellSize));
    
    const cells: string[] = [];
    for (let col = minCol; col <= maxCol; col++) {
      for (let row = minRow; row <= maxRow; row++) {
        cells.push(`${col},${row}`);
      }
    }
    
    return cells;
  }
  
  /**
   * Insert object into the spatial grid
   */
  insert(obj: T): void {
    this.remove(obj); // Remove if already exists
    
    const cells = this.getObjectCells(obj);
    this.objectCells.set(obj.id, new Set(cells));
    
    for (const cellKey of cells) {
      if (!this.grid.has(cellKey)) {
        this.grid.set(cellKey, new Set());
      }
      this.grid.get(cellKey)!.add(obj);
    }
    
    this.updateStats();
  }
  
  /**
   * Remove object from the spatial grid
   */
  remove(obj: T): void {
    const cells = this.objectCells.get(obj.id);
    if (!cells) return;
    
    for (const cellKey of cells) {
      const cell = this.grid.get(cellKey);
      if (cell) {
        cell.delete(obj);
        if (cell.size === 0) {
          this.grid.delete(cellKey);
        }
      }
    }
    
    this.objectCells.delete(obj.id);
    this.updateStats();
  }
  
  /**
   * Update object position in the grid
   */
  update(obj: T): void {
    this.insert(obj); // Remove and re-insert is simpler and fast enough
  }
  
  /**
   * Query objects near a position within a radius
   */
  queryRadius(position: Position, radius: number): T[] {
    this.stats.totalQueries++;
    
    const candidates = new Set<T>();
    const minX = position.x - radius;
    const maxX = position.x + radius;
    const minY = position.y - radius;
    const maxY = position.y + radius;
    
    const minCol = Math.max(0, Math.floor((minX - this.bounds.x) / this.cellSize));
    const maxCol = Math.min(this.cols - 1, Math.floor((maxX - this.bounds.x) / this.cellSize));
    const minRow = Math.max(0, Math.floor((minY - this.bounds.y) / this.cellSize));
    const maxRow = Math.min(this.rows - 1, Math.floor((maxY - this.bounds.y) / this.cellSize));
    
    for (let col = minCol; col <= maxCol; col++) {
      for (let row = minRow; row <= maxRow; row++) {
        const cell = this.grid.get(`${col},${row}`);
        if (cell) {
          for (const obj of cell) {
            candidates.add(obj);
          }
        }
      }
    }
    
    // Filter by actual distance (squared for performance)
    const radiusSquared = radius * radius;
    return Array.from(candidates).filter(obj => {
      const dx = obj.position.x - position.x;
      const dy = obj.position.y - position.y;
      return dx * dx + dy * dy <= radiusSquared;
    });
  }
  
  /**
   * Query objects in a rectangular area
   */
  queryBounds(bounds: SpatialBounds): T[] {
    this.stats.totalQueries++;
    
    const candidates = new Set<T>();
    const minCol = Math.max(0, Math.floor((bounds.x - this.bounds.x) / this.cellSize));
    const maxCol = Math.min(this.cols - 1, Math.floor((bounds.x + bounds.width - this.bounds.x) / this.cellSize));
    const minRow = Math.max(0, Math.floor((bounds.y - this.bounds.y) / this.cellSize));
    const maxRow = Math.min(this.rows - 1, Math.floor((bounds.y + bounds.height - this.bounds.y) / this.cellSize));
    
    for (let col = minCol; col <= maxCol; col++) {
      for (let row = minRow; row <= maxRow; row++) {
        const cell = this.grid.get(`${col},${row}`);
        if (cell) {
          for (const obj of cell) {
            candidates.add(obj);
          }
        }
      }
    }
    
    // Filter by actual bounds intersection
    return Array.from(candidates).filter(obj => {
      const objRadius = obj.radius || obj.size || 10;
      return obj.position.x + objRadius >= bounds.x &&
             obj.position.x - objRadius <= bounds.x + bounds.width &&
             obj.position.y + objRadius >= bounds.y &&
             obj.position.y - objRadius <= bounds.y + bounds.height;
    });
  }
  
  /**
   * Get all objects in the grid
   */
  getAllObjects(): T[] {
    const allObjects = new Set<T>();
    for (const cell of this.grid.values()) {
      for (const obj of cell) {
        allObjects.add(obj);
      }
    }
    return Array.from(allObjects);
  }
  
  /**
   * Clear the entire grid
   */
  clear(): void {
    this.grid.clear();
    this.objectCells.clear();
    this.updateStats();
  }
  
  /**
   * Update performance statistics
   */
  private updateStats(): void {
    this.stats.totalObjects = this.objectCells.size;
    this.stats.cellsUsed = this.grid.size;
    
    let totalInCells = 0;
    let maxInCell = 0;
    
    for (const cell of this.grid.values()) {
      const size = cell.size;
      totalInCells += size;
      maxInCell = Math.max(maxInCell, size);
    }
    
    this.stats.averageObjectsPerCell = this.stats.cellsUsed > 0 ? totalInCells / this.stats.cellsUsed : 0;
    this.stats.maxObjectsInCell = maxInCell;
  }
  
  /**
   * Get performance statistics
   */
  getStats(): {
    totalObjects: number;
    totalQueries: number;
    cellsUsed: number;
    totalCells: number;
    averageObjectsPerCell: number;
    maxObjectsInCell: number;
    gridEfficiency: number;
  } {
    const totalCells = this.cols * this.rows;
    const gridEfficiency = totalCells > 0 ? (this.stats.cellsUsed / totalCells) * 100 : 0;
    
    return {
      ...this.stats,
      totalCells,
      gridEfficiency
    };
  }
  
  /**
   * Debug visualization of grid state
   */
  debugVisualize(): string {
    const stats = this.getStats();
    return `
🗂️ Spatial Grid Debug:
- Grid Size: ${this.cols}x${this.rows} (${stats.totalCells} cells)
- Objects: ${stats.totalObjects}
- Used Cells: ${stats.cellsUsed} (${stats.gridEfficiency.toFixed(1)}% efficiency)
- Avg Objects/Cell: ${stats.averageObjectsPerCell.toFixed(1)}
- Max Objects/Cell: ${stats.maxObjectsInCell}
- Total Queries: ${stats.totalQueries}
    `.trim();
  }
}

/**
 * Optimized collision detection manager using spatial partitioning
 */
export class OptimizedCollisionDetector {
  private enemyGrid: SpatialGrid<SpatialObject>;
  private bulletGrid: SpatialGrid<SpatialObject>;
  private bounds: SpatialBounds;
  
  constructor(bounds: SpatialBounds, cellSize: number = 100) {
    this.bounds = bounds;
    this.enemyGrid = new SpatialGrid(bounds, cellSize);
    this.bulletGrid = new SpatialGrid(bounds, cellSize);
  }
  
  /**
   * Update enemy positions in spatial grid
   */
  updateEnemies(enemies: SpatialObject[]): void {
    this.enemyGrid.clear();
    for (const enemy of enemies) {
      this.enemyGrid.insert(enemy);
    }
  }
  
  /**
   * Update bullet positions in spatial grid
   */
  updateBullets(bullets: SpatialObject[]): void {
    this.bulletGrid.clear();
    for (const bullet of bullets) {
      this.bulletGrid.insert(bullet);
    }
  }
  
  /**
   * Find all bullet-enemy collisions efficiently
   */
  findBulletCollisions(bullets: SpatialObject[], _enemies: SpatialObject[]): Array<{bullet: SpatialObject, enemy: SpatialObject}> {
    const collisions: Array<{bullet: SpatialObject, enemy: SpatialObject}> = [];
    
    for (const bullet of bullets) {
      const bulletRadius = bullet.radius || bullet.size || 5;
      const nearbyEnemies = this.enemyGrid.queryRadius(bullet.position, bulletRadius + 50); // Extra margin
      
      for (const enemy of nearbyEnemies) {
        const enemyRadius = enemy.radius || enemy.size || 20;
        const dx = bullet.position.x - enemy.position.x;
        const dy = bullet.position.y - enemy.position.y;
        const distanceSquared = dx * dx + dy * dy;
        const collisionDistanceSquared = (bulletRadius + enemyRadius) * (bulletRadius + enemyRadius);
        
        if (distanceSquared <= collisionDistanceSquared) {
          collisions.push({ bullet, enemy });
        }
      }
    }
    
    return collisions;
  }
  
  /**
   * Find enemies in tower range efficiently
   */
  findEnemiesInRange(towerPosition: Position, range: number): SpatialObject[] {
    return this.enemyGrid.queryRadius(towerPosition, range);
  }
  
  /**
   * Find objects in viewport efficiently
   */
  findObjectsInViewport(viewport: SpatialBounds): {
    enemies: SpatialObject[];
    bullets: SpatialObject[];
  } {
    return {
      enemies: this.enemyGrid.queryBounds(viewport),
      bullets: this.bulletGrid.queryBounds(viewport)
    };
  }
  
  /**
   * Get comprehensive performance statistics
   */
  getPerformanceStats(): {
    enemy: ReturnType<SpatialGrid<SpatialObject>['getStats']>;
    bullet: ReturnType<SpatialGrid<SpatialObject>['getStats']>;
  } {
    return {
      enemy: this.enemyGrid.getStats(),
      bullet: this.bulletGrid.getStats()
    };
  }
} 