import { GAME_CONSTANTS } from '../../utils/constants';
import type { Enemy, Position, Tower } from '../../models/gameTypes';
import {
  filterCandidates,
  selectNearest,
  selectLowestHP,
  selectHighestHP,
  selectFastest,
  selectSlowest,
  selectHighestValue,
  selectStrongest,
  selectFirst,
  selectLast,
  selectByThreat,
  calculateDistance,
  getDirection as utilGetDirection
} from './helpers/selection';

/**
 * Advanced targeting modes for strategic gameplay
 */
export enum TargetingMode {
  NEAREST = 'nearest',           // Default: Closest enemy
  LOWEST_HP = 'lowest_hp',       // Finish off weak enemies
  HIGHEST_HP = 'highest_hp',     // Focus on tanks
  FASTEST = 'fastest',           // Target fast enemies first
  SLOWEST = 'slowest',           // Target slow enemies
  HIGHEST_VALUE = 'highest_value', // Most gold reward
  STRONGEST = 'strongest',       // Highest damage enemies
  FIRST = 'first',               // First enemy in wave
  LAST = 'last',                 // Last enemy in wave
  THREAT_ASSESSMENT = 'threat',  // AI-based threat scoring
}

/**
 * Targeting configuration interface
 */
export interface TargetingOptions {
  mode: TargetingMode;
  range: number;
  priorityTypes?: Array<keyof typeof GAME_CONSTANTS.ENEMY_TYPES>;
  excludeTypes?: Array<keyof typeof GAME_CONSTANTS.ENEMY_TYPES>;
  minHealthThreshold?: number;
  maxHealthThreshold?: number;
  considerMovement?: boolean;
  predictiveAiming?: boolean;
}

/**
 * Enemy threat assessment interface
 */
export interface ThreatAssessment {
  enemy: Enemy;
  threatScore: number;
  distance: number;
  timeToReach: number;
  damageCapacity: number;
  survivalTime: number;
}

/**
 * Enhanced tower targeting interface
 */
export interface ITargetingStrategy {
  selectTarget(tower: Tower, enemies: Enemy[], options?: Partial<TargetingOptions>): Enemy | null;
  assessThreat(enemy: Enemy, tower: Tower): ThreatAssessment;
  predictPosition(enemy: Enemy, timeOffset: number): Position;
}

/**
 * Advanced targeting strategy implementation
 */
export class EliteTargetingStrategy implements ITargetingStrategy {
  /**
   * Main target selection method with multiple strategies
   */
  selectTarget(tower: Tower, enemies: Enemy[], options: Partial<TargetingOptions> = {}): Enemy | null {
    const config: TargetingOptions = {
      mode: TargetingMode.NEAREST,
      range: tower.range * (tower.rangeMultiplier ?? 1),
      considerMovement: true,
      predictiveAiming: true,
      ...options
    };

    // Filter enemies by range and type restrictions
    const candidates = filterCandidates(enemies, tower, config);
    
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];

    // Apply targeting mode strategy
    switch (config.mode) {
      case TargetingMode.NEAREST:
        return selectNearest(candidates, tower);
      
      case TargetingMode.LOWEST_HP:
        return selectLowestHP(candidates);
      
      case TargetingMode.HIGHEST_HP:
        return selectHighestHP(candidates);
      
      case TargetingMode.FASTEST:
        return selectFastest(candidates);
      
      case TargetingMode.SLOWEST:
        return selectSlowest(candidates);
      
      case TargetingMode.HIGHEST_VALUE:
        return selectHighestValue(candidates);
      
      case TargetingMode.STRONGEST:
        return selectStrongest(candidates);
      
      case TargetingMode.FIRST:
        return selectFirst(candidates);
      
      case TargetingMode.LAST:
        return selectLast(candidates);
      
      case TargetingMode.THREAT_ASSESSMENT:
        return selectByThreat(candidates, tower, this.assessThreat.bind(this));
      
      default:
        return selectNearest(candidates, tower);
    }
  }

  /**
   * Comprehensive threat assessment algorithm
   */
  assessThreat(enemy: Enemy, tower: Tower): ThreatAssessment {
    const distance = calculateDistance(enemy.position, tower.position);
    
    // Calculate time to reach tower (accounting for movement)
    const timeToReach = enemy.speed > 0 ? (distance / enemy.speed) * 1000 : Infinity;
    
    // Damage capacity (how much damage enemy can deal)
    const damageCapacity = enemy.damage * (enemy.health / enemy.maxHealth);
    
    // Survival time (how long enemy will live under fire)
    const survivalTime = tower.damage > 0 ? (enemy.health / tower.damage) * tower.fireRate : Infinity;
    
    // Composite threat score (higher = more threatening)
    let threatScore = 0;
    
    // Distance factor (closer = more threatening)
    threatScore += Math.max(0, 100 - (distance / 10));
    
    // Health factor (more health = more threatening if close)
    threatScore += (enemy.health / enemy.maxHealth) * 30;
    
    // Speed factor (faster = more threatening)
    threatScore += (enemy.speed / 100) * 20;
    
    // Damage factor (higher damage = more threatening)
    threatScore += (enemy.damage / 20) * 25;
    
    // Special enemy bonus
    if (enemy.isSpecial) threatScore += 40;
    
    // Type-specific threat adjustments
    switch (enemy.type) {
      case 'Tank':
        threatScore += 35; // Tanks are high priority
        break;
      case 'Scout':
        threatScore += 20; // Fast enemies are threatening
        break;
      case 'Ghost':
        threatScore += 30; // Ghosts are special threats
        break;
    }
    
    // Time pressure factor
    if (timeToReach < 5000) threatScore += 50; // Very close
    else if (timeToReach < 10000) threatScore += 25; // Close
    
    return {
      enemy,
      threatScore,
      distance,
      timeToReach,
      damageCapacity,
      survivalTime
    };
  }

  /**
   * Predictive position calculation for moving enemies
   */
  predictPosition(enemy: Enemy, timeOffset: number): Position {
    if (!enemy.isActive || enemy.speed === 0) return enemy.position;
    
    // Get nearest tower slot to predict movement direction
    // Note: This will need to be passed from the calling context
    const nearestSlot = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    // Calculate movement direction
    const direction = utilGetDirection(enemy.position, nearestSlot);
    
    // Predict future position
    const distance = enemy.speed * (timeOffset / 1000);
    
    return {
      x: enemy.position.x + direction.x * distance,
      y: enemy.position.y + direction.y * distance
    };
  }

  // =================== PRIVATE TARGETING METHODS ===================

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: dx / len, y: dy / len };
  }
}

// =================== GLOBAL TARGETING INSTANCE ===================

export const eliteTargeting = new EliteTargetingStrategy();

// =================== PUBLIC UTILITY FUNCTIONS ===================

export function getDirection(from: Position, to: Position) {
  return utilGetDirection(from, to);
}

/**
 * Enhanced enemy selection with targeting modes
 * @deprecated Use eliteTargeting.selectTarget() for new implementations
 */
export function getNearestEnemy(pos: Position, enemies: Enemy[]) {
  let min = Infinity;
  let nearest: Enemy | null = null;
  enemies.forEach((e) => {
    const dx = e.position.x - pos.x;
    const dy = e.position.y - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < min) {
      min = dist;
      nearest = e;
    }
  });
  return { enemy: nearest, distance: min };
}

/**
 * Enhanced enemy targeting with strategic options
 */
export function getTargetEnemy(
  tower: Tower, 
  enemies: Enemy[], 
  mode: TargetingMode = TargetingMode.NEAREST,
  options?: Partial<TargetingOptions>
): { enemy: Enemy | null, distance: number, threatScore?: number } {
  const targetingOptions: Partial<TargetingOptions> = {
    mode,
    range: tower.range * (tower.rangeMultiplier ?? 1),
    ...options
  };
  
  const selectedEnemy = eliteTargeting.selectTarget(tower, enemies, targetingOptions);
  
  if (!selectedEnemy) {
    return { enemy: null, distance: Infinity };
  }
  
  const distance = Math.hypot(
    selectedEnemy.position.x - tower.position.x,
    selectedEnemy.position.y - tower.position.y
  );
  
  let threatScore: number | undefined;
  if (mode === TargetingMode.THREAT_ASSESSMENT) {
    const threat = eliteTargeting.assessThreat(selectedEnemy, tower);
    threatScore = threat.threatScore;
  }
  
  return { enemy: selectedEnemy, distance, threatScore };
}

/**
 * Get multiple enemies for AOE or multi-target abilities
 */
export function getTargetEnemies(
  tower: Tower,
  enemies: Enemy[],
  _mode: TargetingMode = TargetingMode.THREAT_ASSESSMENT,
  maxTargets: number = 5
): Enemy[] {
  const enemiesInRange = getEnemiesInRange(tower.position, tower.range * (tower.rangeMultiplier ?? 1), enemies);
  
  if (enemiesInRange.length <= maxTargets) return enemiesInRange;
  
  // Sort by targeting priority
  const sortedEnemies = enemiesInRange.map(enemy => ({
    enemy,
    threat: eliteTargeting.assessThreat(enemy, tower)
  })).sort((a, b) => b.threat.threatScore - a.threat.threatScore);
  
  return sortedEnemies.slice(0, maxTargets).map(item => item.enemy);
}

/**
 * Get enemies within a specific range
 */
export function getEnemiesInRange(pos: Position, range: number, enemies: Enemy[]) {
  return enemies.filter(e => {
    const dx = e.position.x - pos.x;
    const dy = e.position.y - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist <= range;
  });
} 