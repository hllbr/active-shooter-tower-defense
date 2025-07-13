import type { Tower, Enemy } from '../../models/gameTypes';
import { Logger } from '../../utils/Logger';

/**
 * Targeting strategy types
 */
export type TargetingStrategy = 
  | 'closest_to_exit'
  | 'highest_hp'
  | 'fastest'
  | 'lowest_hp'
  | 'highest_value'
  | 'threat_assessment'
  | 'nearest'
  | 'furthest';

/**
 * Target selection result
 */
interface TargetSelection {
  enemy: Enemy;
  strategy: TargetingStrategy;
  priority: number;
  reason: string;
}

/**
 * Auto Targeting System with smart strategies
 * Implements intelligent enemy targeting based on multiple strategies
 */
export class AutoTargeting {
  private static instance: AutoTargeting;
  private isActive: boolean = false;
  private lastManualIntervention: number = 0;
  private readonly MANUAL_INTERVENTION_COOLDOWN = 5000; // 5 seconds
  private targetCache: Map<string, { target: Enemy | null; timestamp: number }> = new Map();
  private readonly TARGET_CACHE_DURATION = 500; // 500ms cache

  public static getInstance(): AutoTargeting {
    if (!AutoTargeting.instance) {
      AutoTargeting.instance = new AutoTargeting();
    }
    return AutoTargeting.instance;
  }

  /**
   * Enable/disable auto targeting system
   */
  public setActive(active: boolean): void {
    this.isActive = active;
    Logger.log(`🤖 Auto Targeting ${active ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if auto targeting is active
   */
  public isAutoTargetingActive(): boolean {
    return this.isActive;
  }

  /**
   * Handle manual intervention to temporarily disable automation
   */
  public handleManualIntervention(): void {
    this.lastManualIntervention = performance.now();
    if (this.isActive) {
      this.setActive(false);
      Logger.log('🤖 Auto targeting temporarily disabled due to manual intervention');
      
      // Re-enable after cooldown
      setTimeout(() => {
        if (performance.now() - this.lastManualIntervention >= this.MANUAL_INTERVENTION_COOLDOWN) {
          this.setActive(true);
          Logger.log('🤖 Auto targeting re-enabled after manual intervention cooldown');
        }
      }, this.MANUAL_INTERVENTION_COOLDOWN);
    }
  }

  /**
   * Select optimal target for a tower using smart strategies
   */
  public selectOptimalTarget(
    tower: Tower,
    enemies: Enemy[],
    strategy?: TargetingStrategy
  ): Enemy | null {
    if (!this.isActive || enemies.length === 0) return null;

    // Use cached result if available
    const cacheKey = `${tower.id}_${strategy || 'auto'}`;
    const cached = this.targetCache.get(cacheKey);
    if (cached && performance.now() - cached.timestamp < this.TARGET_CACHE_DURATION) {
      return cached.target;
    }

    // Determine optimal strategy for this tower
    const optimalStrategy = strategy || this.determineOptimalStrategy(tower, enemies);
    
    // Get enemies in range
    const enemiesInRange = this.getEnemiesInRange(tower, enemies);
    if (enemiesInRange.length === 0) return null;

    // Apply targeting strategy
    const target = this.applyTargetingStrategy(enemiesInRange, optimalStrategy, tower);
    
    // Cache result
    this.targetCache.set(cacheKey, {
      target,
      timestamp: performance.now()
    });

    return target;
  }

  /**
   * Determine optimal targeting strategy for a tower
   */
  private determineOptimalStrategy(tower: Tower, enemies: Enemy[]): TargetingStrategy {
    // Analyze enemy composition
    const enemyAnalysis = this.analyzeEnemyComposition(enemies);
    
    // Tower class specific strategies
    if (tower.towerClass) {
      switch (tower.towerClass) {
        case 'sniper':
          return 'highest_hp'; // Snipers target high-value enemies
        case 'gatling':
          return 'fastest'; // Gatling targets fast enemies
        case 'mortar':
          return 'lowest_hp'; // Mortar finishes off weakened enemies
        case 'laser':
          return 'threat_assessment'; // Laser uses smart targeting
        case 'flamethrower':
          return 'nearest'; // Flamethrower targets nearest due to short range
        case 'emp':
          return 'threat_assessment'; // EMP targets based on threat
        case 'air_defense':
          return 'closest_to_exit'; // Air defense prioritizes exit proximity
        default:
          break;
      }
    }

    // Default strategies based on enemy composition
    if (enemyAnalysis.hasHighValueEnemies) {
      return 'highest_value';
    }
    
    if (enemyAnalysis.hasFastEnemies) {
      return 'fastest';
    }
    
    if (enemyAnalysis.hasLowHealthEnemies) {
      return 'lowest_hp';
    }

    return 'nearest'; // Default to nearest
  }

  /**
   * Analyze enemy composition for strategy selection
   */
  private analyzeEnemyComposition(enemies: Enemy[]): {
    hasHighValueEnemies: boolean;
    hasFastEnemies: boolean;
    hasLowHealthEnemies: boolean;
    averageHealth: number;
    averageSpeed: number;
    averageValue: number;
  } {
    if (enemies.length === 0) {
      return {
        hasHighValueEnemies: false,
        hasFastEnemies: false,
        hasLowHealthEnemies: false,
        averageHealth: 0,
        averageSpeed: 0,
        averageValue: 0
      };
    }

    const totalHealth = enemies.reduce((sum, enemy) => sum + enemy.health, 0);
    const totalSpeed = enemies.reduce((sum, enemy) => sum + enemy.speed, 0);
    const totalValue = enemies.reduce((sum, enemy) => sum + enemy.goldValue, 0);
    
    const averageHealth = totalHealth / enemies.length;
    const averageSpeed = totalSpeed / enemies.length;
    const averageValue = totalValue / enemies.length;

    const hasHighValueEnemies = enemies.some(e => e.goldValue > averageValue * 1.5);
    const hasFastEnemies = enemies.some(e => e.speed > averageSpeed * 1.3);
    const hasLowHealthEnemies = enemies.some(e => e.health < averageHealth * 0.7);

    return {
      hasHighValueEnemies,
      hasFastEnemies,
      hasLowHealthEnemies,
      averageHealth,
      averageSpeed,
      averageValue
    };
  }

  /**
   * Get enemies within tower range
   */
  private getEnemiesInRange(tower: Tower, enemies: Enemy[]): Enemy[] {
    const range = tower.range * (tower.rangeMultiplier || 1);
    
    return enemies.filter(enemy => {
      const distance = Math.hypot(
        tower.position.x - enemy.position.x,
        tower.position.y - enemy.position.y
      );
      return distance <= range;
    });
  }

  /**
   * Apply targeting strategy to select best enemy
   */
  private applyTargetingStrategy(
    enemies: Enemy[],
    strategy: TargetingStrategy,
    tower: Tower
  ): Enemy | null {
    if (enemies.length === 0) return null;
    if (enemies.length === 1) return enemies[0];

    switch (strategy) {
      case 'closest_to_exit':
        return this.selectClosestToExit(enemies);
      case 'highest_hp':
        return this.selectHighestHP(enemies);
      case 'fastest':
        return this.selectFastest(enemies);
      case 'lowest_hp':
        return this.selectLowestHP(enemies);
      case 'highest_value':
        return this.selectHighestValue(enemies);
      case 'threat_assessment':
        return this.selectByThreatAssessment(enemies, tower);
      case 'nearest':
        return this.selectNearest(enemies, tower);
      case 'furthest':
        return this.selectFurthest(enemies, tower);
      default:
        return this.selectNearest(enemies, tower);
    }
  }

  /**
   * Select enemy closest to exit
   */
  private selectClosestToExit(enemies: Enemy[]): Enemy {
    // Calculate exit position (center of screen)
    const exitX = window.innerWidth / 2;
    const exitY = window.innerHeight / 2;
    
    return enemies.reduce((closest, enemy) => {
      const closestDistance = Math.hypot(
        exitX - closest.position.x,
        exitY - closest.position.y
      );
      const enemyDistance = Math.hypot(
        exitX - enemy.position.x,
        exitY - enemy.position.y
      );
      return enemyDistance < closestDistance ? enemy : closest;
    });
  }

  /**
   * Select enemy with highest HP
   */
  private selectHighestHP(enemies: Enemy[]): Enemy {
    return enemies.reduce((highest, enemy) => 
      enemy.health > highest.health ? enemy : highest
    );
  }

  /**
   * Select fastest enemy
   */
  private selectFastest(enemies: Enemy[]): Enemy {
    return enemies.reduce((fastest, enemy) => 
      enemy.speed > fastest.speed ? enemy : fastest
    );
  }

  /**
   * Select enemy with lowest HP
   */
  private selectLowestHP(enemies: Enemy[]): Enemy {
    return enemies.reduce((lowest, enemy) => 
      enemy.health < lowest.health ? enemy : lowest
    );
  }

  /**
   * Select enemy with highest gold value
   */
  private selectHighestValue(enemies: Enemy[]): Enemy {
    return enemies.reduce((highest, enemy) => 
      enemy.goldValue > highest.goldValue ? enemy : highest
    );
  }

  /**
   * Select enemy by threat assessment
   */
  private selectByThreatAssessment(enemies: Enemy[], tower: Tower): Enemy {
    return enemies.reduce((highestThreat, enemy) => {
      const currentThreat = this.calculateThreatScore(enemy, tower);
      const highestThreatScore = this.calculateThreatScore(highestThreat, tower);
      return currentThreat > highestThreatScore ? enemy : highestThreat;
    });
  }

  /**
   * Calculate threat score for an enemy
   */
  private calculateThreatScore(enemy: Enemy, tower: Tower): number {
    let threatScore = 0;
    
    // Base threat from health and speed
    threatScore += enemy.health * 0.1;
    threatScore += enemy.speed * 5;
    
    // Bonus for high-value enemies
    threatScore += enemy.goldValue * 0.5;
    
    // Bonus for boss enemies
    if (enemy.bossType) {
      threatScore += 50;
    }
    
    // Bonus for special enemies
    if (enemy.isSpecial) {
      threatScore += 20;
    }
    
    // Distance penalty (closer enemies are more threatening)
    const distance = Math.hypot(
      tower.position.x - enemy.position.x,
      tower.position.y - enemy.position.y
    );
    threatScore += Math.max(0, 100 - distance) * 0.1;
    
    return threatScore;
  }

  /**
   * Select nearest enemy
   */
  private selectNearest(enemies: Enemy[], tower: Tower): Enemy {
    return enemies.reduce((nearest, enemy) => {
      const nearestDistance = Math.hypot(
        tower.position.x - nearest.position.x,
        tower.position.y - nearest.position.y
      );
      const enemyDistance = Math.hypot(
        tower.position.x - enemy.position.x,
        tower.position.y - enemy.position.y
      );
      return enemyDistance < nearestDistance ? enemy : nearest;
    });
  }

  /**
   * Select furthest enemy
   */
  private selectFurthest(enemies: Enemy[], tower: Tower): Enemy {
    return enemies.reduce((furthest, enemy) => {
      const furthestDistance = Math.hypot(
        tower.position.x - furthest.position.x,
        tower.position.y - furthest.position.y
      );
      const enemyDistance = Math.hypot(
        tower.position.x - enemy.position.x,
        tower.position.y - enemy.position.y
      );
      return enemyDistance > furthestDistance ? enemy : furthest;
    });
  }

  /**
   * Get targeting recommendations for UI
   */
  public getTargetingRecommendations(
    tower: Tower,
    enemies: Enemy[]
  ): TargetSelection[] {
    const enemiesInRange = this.getEnemiesInRange(tower, enemies);
    if (enemiesInRange.length === 0) return [];

    const strategies: TargetingStrategy[] = [
      'closest_to_exit',
      'highest_hp',
      'fastest',
      'lowest_hp',
      'highest_value',
      'threat_assessment'
    ];

    return strategies.map(strategy => {
      const target = this.applyTargetingStrategy(enemiesInRange, strategy, tower);
      if (!target) return null;

      const priority = this.calculateTargetPriority(target, strategy, tower);
      const reason = this.generateTargetReason(target, strategy);

      return {
        enemy: target,
        strategy,
        priority,
        reason
      };
    }).filter(Boolean) as TargetSelection[];
  }

  /**
   * Calculate target priority for recommendations
   */
  private calculateTargetPriority(
    enemy: Enemy,
    strategy: TargetingStrategy,
    tower: Tower
  ): number {
    let priority = 0;
    
    // Base priority from strategy effectiveness
    switch (strategy) {
      case 'closest_to_exit':
        priority += 50;
        break;
      case 'highest_hp':
        priority += enemy.health * 0.1;
        break;
      case 'fastest':
        priority += enemy.speed * 10;
        break;
      case 'lowest_hp':
        priority += Math.max(0, 100 - enemy.health);
        break;
      case 'highest_value':
        priority += enemy.goldValue * 2;
        break;
      case 'threat_assessment':
        priority += this.calculateThreatScore(enemy, tower);
        break;
    }
    
    // Bonus for boss enemies
    if (enemy.bossType) {
      priority += 100;
    }
    
    // Bonus for special enemies
    if (enemy.isSpecial) {
      priority += 50;
    }
    
    return priority;
  }

  /**
   * Generate target reason for UI
   */
  private generateTargetReason(enemy: Enemy, strategy: TargetingStrategy): string {
    const reasons: string[] = [];
    
    switch (strategy) {
      case 'closest_to_exit':
        reasons.push('Closest to exit');
        break;
      case 'highest_hp':
        reasons.push(`High HP (${enemy.health})`);
        break;
      case 'fastest':
        reasons.push(`Fast speed (${enemy.speed.toFixed(1)})`);
        break;
      case 'lowest_hp':
        reasons.push(`Low HP (${enemy.health})`);
        break;
      case 'highest_value':
        reasons.push(`High value (${enemy.goldValue} gold)`);
        break;
      case 'threat_assessment':
        reasons.push('High threat level');
        break;
    }
    
    if (enemy.bossType) {
      reasons.push('Boss enemy');
    }
    
    if (enemy.isSpecial) {
      reasons.push('Special enemy');
    }
    
    return reasons.join(', ');
  }

  /**
   * Clear target cache
   */
  public clearCache(): void {
    this.targetCache.clear();
  }

  /**
   * Reset the auto targeting system
   */
  public reset(): void {
    this.isActive = false;
    this.lastManualIntervention = 0;
    this.clearCache();
  }
}

// Export singleton instance
export const autoTargeting = AutoTargeting.getInstance(); 