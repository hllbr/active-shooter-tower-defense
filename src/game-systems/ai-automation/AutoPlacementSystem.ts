import { useGameStore } from '../../models/store';
import type { TowerSlot, Enemy, Position, TowerClass } from '../../models/gameTypes';
import { GAME_CONSTANTS } from '../../utils/constants';
import { Logger } from '../../utils/Logger';

/**
 * Strategic placement analysis result
 */
interface PlacementAnalysis {
  slotIndex: number;
  towerClass: string;
  strategicValue: number;
  coverageScore: number;
  chokepointValue: number;
  synergyValue: number;
  reason: string;
}

/**
 * Enemy path analysis result
 */
interface PathAnalysis {
  pathSegments: Position[];
  trafficDensity: number;
  averageSpeed: number;
  enemyTypes: string[];
}

/**
 * Auto Placement System with strategic positioning
 * Places towers at optimal locations near enemy paths
 */
export class AutoPlacementSystem {
  private static instance: AutoPlacementSystem;
  private isActive: boolean = false;
  private lastManualIntervention: number = 0;
  private readonly MANUAL_INTERVENTION_COOLDOWN = 5000; // 5 seconds
  private readonly MIN_PLACEMENT_INTERVAL = 3000; // 3 seconds between placements
  private lastPlacementTime: number = 0;
  private enemyPathCache: Map<string, PathAnalysis> = new Map();
  private readonly PATH_CACHE_DURATION = 2000; // 2 seconds

  public static getInstance(): AutoPlacementSystem {
    if (!AutoPlacementSystem.instance) {
      AutoPlacementSystem.instance = new AutoPlacementSystem();
    }
    return AutoPlacementSystem.instance;
  }

  /**
   * Enable/disable auto placement system
   */
  public setActive(active: boolean): void {
    this.isActive = active;
    Logger.log(`🤖 Auto Placement ${active ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if auto placement is active
   */
  public isAutoPlacementActive(): boolean {
    return this.isActive;
  }

  /**
   * Handle manual intervention to temporarily disable automation
   */
  public handleManualIntervention(): void {
    this.lastManualIntervention = performance.now();
    if (this.isActive) {
      this.setActive(false);
      Logger.log('🤖 Auto placement temporarily disabled due to manual intervention');
      
      // Re-enable after cooldown
      setTimeout(() => {
        if (performance.now() - this.lastManualIntervention >= this.MANUAL_INTERVENTION_COOLDOWN) {
          this.setActive(true);
          Logger.log('🤖 Auto placement re-enabled after manual intervention cooldown');
        }
      }, this.MANUAL_INTERVENTION_COOLDOWN);
    }
  }

  /**
   * Analyze enemy paths and traffic patterns
   */
  public analyzeEnemyPaths(enemies: Enemy[]): PathAnalysis[] {
    const paths: PathAnalysis[] = [];
    const pathSegments = this.calculatePathSegments(enemies);
    
    // Group enemies by path segments
    for (const segment of pathSegments) {
      const enemiesInSegment = enemies.filter(enemy => 
        this.isEnemyInPathSegment(enemy, segment)
      );
      
      if (enemiesInSegment.length > 0) {
        const analysis = this.analyzePathSegment(segment, enemiesInSegment);
        paths.push(analysis);
      }
    }
    
    return paths;
  }

  /**
   * Calculate strategic placement recommendations
   */
  public getStrategicPlacements(
    towerSlots: TowerSlot[],
    enemies: Enemy[],
    availableGold: number
  ): PlacementAnalysis[] {
    const placements: PlacementAnalysis[] = [];
    const enemyPaths = this.analyzeEnemyPaths(enemies);
    
    // Find available slots
    const availableSlots = towerSlots.filter(slot => slot.unlocked && !slot.tower);
    
    for (const slot of availableSlots) {
      const slotIndex = towerSlots.indexOf(slot);
      const analysis = this.analyzeSlotStrategicValue(slot, slotIndex, enemyPaths, availableGold);
      
      if (analysis) {
        placements.push(analysis);
      }
    }
    
    // Sort by strategic value (highest first)
    return placements.sort((a, b) => b.strategicValue - a.strategicValue);
  }

  /**
   * Analyze strategic value of a slot
   */
  private analyzeSlotStrategicValue(
    slot: TowerSlot,
    slotIndex: number,
    enemyPaths: PathAnalysis[],
    availableGold: number
  ): PlacementAnalysis | null {
    const position = { x: slot.x, y: slot.y };
    
    // Calculate coverage score
    const coverageScore = this.calculateCoverageScore(position, enemyPaths);
    
    // Calculate chokepoint value
    const chokepointValue = this.calculateChokepointValue(position, enemyPaths);
    
    // Calculate synergy value
    const synergyValue = this.calculateSynergyValue(position, slotIndex);
    
    // Determine optimal tower class
    const towerClass = this.determineOptimalTowerClass(position, enemyPaths, availableGold);
    if (!towerClass) return null;
    
    // Calculate strategic value
    const strategicValue = this.calculateStrategicValue(
      coverageScore,
      chokepointValue,
      synergyValue,
      towerClass
    );
    
    const reason = this.generatePlacementReason(
      towerClass,
      coverageScore,
      chokepointValue,
      synergyValue
    );
    
    return {
      slotIndex,
      towerClass,
      strategicValue,
      coverageScore,
      chokepointValue,
      synergyValue,
      reason
    };
  }

  /**
   * Calculate path segments from enemy positions
   */
  private calculatePathSegments(enemies: Enemy[]): Position[][] {
    const segments: Position[][] = [];
    
    // Group enemies by proximity to create path segments
    const groupedEnemies = this.groupEnemiesByProximity(enemies);
    
    for (const group of groupedEnemies) {
      if (group.length >= 2) {
        const segment = group.map(enemy => enemy.position);
        segments.push(segment);
      }
    }
    
    return segments;
  }

  /**
   * Group enemies by proximity
   */
  private groupEnemiesByProximity(enemies: Enemy[]): Enemy[][] {
    const groups: Enemy[][] = [];
    const processed = new Set<string>();
    
    for (const enemy of enemies) {
      if (processed.has(enemy.id)) continue;
      
      const group = [enemy];
      processed.add(enemy.id);
      
      // Find nearby enemies
      for (const otherEnemy of enemies) {
        if (processed.has(otherEnemy.id)) continue;
        
        const distance = Math.hypot(
          enemy.position.x - otherEnemy.position.x,
          enemy.position.y - otherEnemy.position.y
        );
        
        if (distance <= 100) { // Grouping threshold
          group.push(otherEnemy);
          processed.add(otherEnemy.id);
        }
      }
      
      groups.push(group);
    }
    
    return groups;
  }

  /**
   * Check if enemy is in a path segment
   */
  private isEnemyInPathSegment(enemy: Enemy, segment: Position[]): boolean {
    return segment.some(point => {
      const distance = Math.hypot(
        enemy.position.x - point.x,
        enemy.position.y - point.y
      );
      return distance <= 50; // Path detection threshold
    });
  }

  /**
   * Analyze a path segment
   */
  private analyzePathSegment(segment: Position[], enemies: Enemy[]): PathAnalysis {
    const trafficDensity = enemies.length;
    const averageSpeed = enemies.reduce((sum, enemy) => sum + enemy.speed, 0) / enemies.length;
    const enemyTypes = [...new Set(enemies.map(e => e.type).filter(Boolean) as string[])];
    
    return {
      pathSegments: segment,
      trafficDensity,
      averageSpeed,
      enemyTypes
    };
  }

  /**
   * Calculate coverage score for a position
   */
  private calculateCoverageScore(position: Position, enemyPaths: PathAnalysis[]): number {
    let totalCoverage = 0;
    
    for (const path of enemyPaths) {
      const pathCoverage = path.pathSegments.reduce((sum, segmentPoint) => {
        const distance = Math.hypot(
          position.x - segmentPoint.x,
          position.y - segmentPoint.y
        );
        
        // Coverage decreases with distance
        const coverage = Math.max(0, 1 - distance / 300);
        return sum + coverage * path.trafficDensity;
      }, 0);
      
      totalCoverage += pathCoverage;
    }
    
    return Math.min(1.0, totalCoverage / 100);
  }

  /**
   * Calculate chokepoint value for a position
   */
  private calculateChokepointValue(position: Position, enemyPaths: PathAnalysis[]): number {
    let chokepointValue = 0;
    
    // Check if position is near multiple path intersections
    const nearbyPaths = enemyPaths.filter(path => 
      path.pathSegments.some(segmentPoint => {
        const distance = Math.hypot(
          position.x - segmentPoint.x,
          position.y - segmentPoint.y
        );
        return distance <= 150;
      })
    );
    
    if (nearbyPaths.length >= 2) {
      chokepointValue = 0.8; // High value for chokepoints
    } else if (nearbyPaths.length === 1) {
      chokepointValue = 0.4; // Medium value for single path
    }
    
    // Bonus for high traffic areas
    const totalTraffic = nearbyPaths.reduce((sum, path) => sum + path.trafficDensity, 0);
    chokepointValue += Math.min(0.2, totalTraffic / 50);
    
    return Math.min(1.0, chokepointValue);
  }

  /**
   * Calculate synergy value with existing towers
   */
  private calculateSynergyValue(position: Position, slotIndex: number): number {
    const { towerSlots } = useGameStore.getState();
    let synergyValue = 0;
    
    for (let i = 0; i < towerSlots.length; i++) {
      if (i === slotIndex || !towerSlots[i].tower) continue;
      
      const nearbyTower = towerSlots[i].tower!;
      const distance = Math.hypot(
        position.x - nearbyTower.position.x,
        position.y - nearbyTower.position.y
      );
      
      if (distance <= 200) { // Synergy range
        // Bonus for complementary tower types
        if (nearbyTower.towerClass) {
          synergyValue += 0.2;
        }
        
        // Bonus for different tower categories
        if (nearbyTower.towerType !== 'economy') {
          synergyValue += 0.1;
        }
      }
    }
    
    return Math.min(1.0, synergyValue);
  }

  /**
   * Determine optimal tower class for a position
   */
  private determineOptimalTowerClass(
    position: Position,
    enemyPaths: PathAnalysis[],
    availableGold: number
  ): string | null {
    const nearbyPaths = enemyPaths.filter(path => 
      path.pathSegments.some(segmentPoint => {
        const distance = Math.hypot(
          position.x - segmentPoint.x,
          position.y - segmentPoint.y
        );
        return distance <= 300;
      })
    );
    
    if (nearbyPaths.length === 0) return null;
    
    // Analyze enemy types in nearby paths
    const enemyTypes = new Set<string>();
    let totalTraffic = 0;
    let averageSpeed = 0;
    
    for (const path of nearbyPaths) {
      path.enemyTypes.forEach(type => enemyTypes.add(type));
      totalTraffic += path.trafficDensity;
      averageSpeed += path.averageSpeed;
    }
    
    averageSpeed /= nearbyPaths.length;
    
    // Determine optimal tower class based on enemy analysis
    return this.selectOptimalTowerClass(enemyTypes, totalTraffic, averageSpeed, availableGold);
  }

  /**
   * Select optimal tower class based on enemy analysis
   */
  private selectOptimalTowerClass(
    enemyTypes: Set<string>,
    totalTraffic: number,
    averageSpeed: number,
    availableGold: number
  ): string | null {
    // Check affordability first
    const affordableTowers = Object.entries(GAME_CONSTANTS.SPECIALIZED_TOWERS || {})
      .filter(([, config]) => config.cost <= availableGold)
      .map(([towerClass]) => towerClass);
    
    if (affordableTowers.length === 0) return null;
    
    // Analyze enemy composition
    const hasFastEnemies = averageSpeed > 2;
    const hasHighTraffic = totalTraffic > 10;
    const hasTankEnemies = enemyTypes.has('Tank') || enemyTypes.has('Boss');
    const hasFlyingEnemies = enemyTypes.has('Flying') || enemyTypes.has('Air');
    const hasStealthEnemies = enemyTypes.has('Ghost') || enemyTypes.has('Stealth');
    
    // Select tower class based on enemy composition
    if (hasFlyingEnemies && affordableTowers.includes('air_defense')) {
      return 'air_defense';
    }
    
    if (hasStealthEnemies && affordableTowers.includes('stealth_detector')) {
      return 'stealth_detector';
    }
    
    if (hasTankEnemies && affordableTowers.includes('sniper')) {
      return 'sniper';
    }
    
    if (hasFastEnemies && affordableTowers.includes('gatling')) {
      return 'gatling';
    }
    
    if (hasHighTraffic && affordableTowers.includes('mortar')) {
      return 'mortar';
    }
    
    // Default to most affordable tower
    return affordableTowers[0];
  }

  /**
   * Calculate strategic value
   */
  private calculateStrategicValue(
    coverageScore: number,
    chokepointValue: number,
    synergyValue: number,
    towerClass: string
  ): number {
    let strategicValue = 0;
    
    // Coverage is most important
    strategicValue += coverageScore * 0.5;
    
    // Chokepoint control is valuable
    strategicValue += chokepointValue * 0.3;
    
    // Synergy adds value
    strategicValue += synergyValue * 0.2;
    
    // Tower class specific bonuses
    strategicValue += this.calculateTowerClassBonus(towerClass);
    
    return Math.min(1.0, strategicValue);
  }

  /**
   * Calculate tower class specific bonus
   */
  private calculateTowerClassBonus(towerClass: string): number {
    switch (towerClass) {
      case 'sniper':
        return 0.1; // High value for precision
      case 'gatling':
        return 0.05; // Good for crowd control
      case 'mortar':
        return 0.08; // Good for area control
      case 'air_defense':
        return 0.15; // Essential for flying enemies
      case 'stealth_detector':
        return 0.12; // Essential for stealth enemies
      default:
        return 0.02;
    }
  }

  /**
   * Generate placement reason for UI
   */
  private generatePlacementReason(
    towerClass: string,
    coverageScore: number,
    chokepointValue: number,
    synergyValue: number
  ): string {
    const reasons: string[] = [];
    
    if (coverageScore > 0.7) {
      reasons.push('Excellent coverage');
    } else if (coverageScore > 0.4) {
      reasons.push('Good coverage');
    }
    
    if (chokepointValue > 0.6) {
      reasons.push('Strategic chokepoint');
    }
    
    if (synergyValue > 0.3) {
      reasons.push('Good synergy');
    }
    
    reasons.push(`${towerClass} specialization`);
    
    return reasons.join(', ');
  }

  /**
   * Execute auto placement for the highest priority slot
   */
  public executeAutoPlacement(): boolean {
    if (!this.isActive) return false;

    // Check cooldown
    if (performance.now() - this.lastPlacementTime < this.MIN_PLACEMENT_INTERVAL) {
      return false;
    }

    const { towerSlots, enemies, gold, buildTower } = useGameStore.getState();
    const placements = this.getStrategicPlacements(towerSlots, enemies, gold);

    if (placements.length === 0) return false;

    const topPlacement = placements[0];
    
    // Double-check affordability
    if (!this.canAffordTower(topPlacement.towerClass)) {
      return false;
    }

    // Execute placement
    buildTower(topPlacement.slotIndex, false, 'attack', topPlacement.towerClass as TowerClass);
    this.lastPlacementTime = performance.now();
    Logger.log(`🤖 Auto placed ${topPlacement.towerClass} (${topPlacement.reason})`);
    return true;

    return false;
  }

  /**
   * Check if we can afford to build a tower
   */
  private canAffordTower(towerClass: string): boolean {
    const { gold } = useGameStore.getState();
    const towerConfig = GAME_CONSTANTS.SPECIALIZED_TOWERS?.[towerClass as keyof typeof GAME_CONSTANTS.SPECIALIZED_TOWERS];
    return towerConfig ? gold >= towerConfig.cost : false;
  }

  /**
   * Get current placement recommendations for UI
   */
  public getPlacementRecommendations(): PlacementAnalysis[] {
    const { towerSlots, enemies, gold } = useGameStore.getState();
    return this.getStrategicPlacements(towerSlots, enemies, gold).slice(0, 3);
  }

  /**
   * Reset the auto placement system
   */
  public reset(): void {
    this.isActive = false;
    this.lastManualIntervention = 0;
    this.lastPlacementTime = 0;
    this.enemyPathCache.clear();
  }
}

// Export singleton instance
export const autoPlacementSystem = AutoPlacementSystem.getInstance(); 