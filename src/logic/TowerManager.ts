import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/Constants';
import type { Effect, Bullet } from '../models/gameTypes';
import type { Enemy, Position, Tower } from '../models/gameTypes';
import { playSound } from '../utils/sound';
import { energyManager } from './EnergyManager';
import { collisionManager } from './CollisionDetection';
import { cleanupManager } from './Effects';
import { upgradeEffectsManager } from './UpgradeEffects';

// =================== BULLET POOL SYSTEM ===================

class BulletPool {
  private pool: Bullet[] = [];
  private active: Set<Bullet> = new Set();
  private maxPoolSize: number = 200;
  private created: number = 0;
  private reused: number = 0;
  
  /**
   * Get a bullet from the pool or create a new one
   */
  acquire(): Bullet {
    let bullet = this.pool.pop();
    
    if (!bullet) {
      bullet = {
        id: `bullet_${Date.now()}_${Math.random()}`,
        position: { x: 0, y: 0 },
        size: GAME_CONSTANTS.BULLET_SIZE,
        isActive: true,
        speed: GAME_CONSTANTS.BULLET_SPEED,
        damage: 0,
        direction: { x: 0, y: 0 },
        color: '#ffffff',
        typeIndex: 0,
        life: 3000
      };
      this.created++;
    } else {
      this.reused++;
    }
    
    this.active.add(bullet);
    return bullet;
  }
  
  /**
   * Return a bullet to the pool
   */
  release(bullet: Bullet): void {
    if (!this.active.has(bullet)) {
      console.warn('🚨 Attempting to release bullet not in active set');
      return;
    }
    
    this.active.delete(bullet);
    
    // Reset bullet properties
    bullet.position = { x: 0, y: 0 };
    bullet.direction = { x: 0, y: 0 };
    bullet.isActive = false;
    bullet.damage = 0;
    bullet.speed = GAME_CONSTANTS.BULLET_SPEED;
    bullet.life = 3000;
    bullet.targetId = undefined;
    
    if (this.pool.length < this.maxPoolSize) {
      this.pool.push(bullet);
    }
  }
  
  /**
   * Create a configured bullet
   */
  createBullet(
    position: Position,
    direction: Position,
    damage: number,
    speed: number,
    color: string,
    typeIndex: number,
    targetId?: string
  ): Bullet {
    const bullet = this.acquire();
    bullet.id = `bullet_${Date.now()}_${Math.random()}`;
    bullet.position = { ...position };
    bullet.direction = { ...direction };
    bullet.damage = damage;
    bullet.speed = speed;
    bullet.color = color;
    bullet.typeIndex = typeIndex;
    bullet.isActive = true;
    bullet.life = 3000;
    bullet.targetId = targetId;
    return bullet;
  }
  
  /**
   * Clear all pooled bullets
   */
  clear(): void {
    this.pool.length = 0;
    this.active.clear();
  }
  
  /**
   * Get pool statistics
   */
  getStats(): {
    poolSize: number;
    activeCount: number;
    created: number;
    reused: number;
    reuseRate: number;
  } {
    return {
      poolSize: this.pool.length,
      activeCount: this.active.size,
      created: this.created,
      reused: this.reused,
      reuseRate: this.created > 0 ? (this.reused / (this.created + this.reused)) * 100 : 0
    };
  }
}

// Global bullet pool instance
export const bulletPool = new BulletPool();

// =================== ELITE TARGETING SYSTEM v2.0 ===================

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
    const candidates = this.filterCandidates(enemies, tower, config);
    
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];

    // Apply targeting mode strategy
    switch (config.mode) {
      case TargetingMode.NEAREST:
        return this.selectNearest(candidates, tower);
      
      case TargetingMode.LOWEST_HP:
        return this.selectLowestHP(candidates);
      
      case TargetingMode.HIGHEST_HP:
        return this.selectHighestHP(candidates);
      
      case TargetingMode.FASTEST:
        return this.selectFastest(candidates);
      
      case TargetingMode.SLOWEST:
        return this.selectSlowest(candidates);
      
      case TargetingMode.HIGHEST_VALUE:
        return this.selectHighestValue(candidates);
      
      case TargetingMode.STRONGEST:
        return this.selectStrongest(candidates);
      
      case TargetingMode.FIRST:
        return this.selectFirst(candidates, tower);
      
      case TargetingMode.LAST:
        return this.selectLast(candidates, tower);
      
      case TargetingMode.THREAT_ASSESSMENT:
        return this.selectByThreat(candidates, tower);
      
      default:
        return this.selectNearest(candidates, tower);
    }
  }

  /**
   * Comprehensive threat assessment algorithm
   */
  assessThreat(enemy: Enemy, tower: Tower): ThreatAssessment {
    const distance = this.calculateDistance(enemy.position, tower.position);
    
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
    const towerSlots = useGameStore.getState().towerSlots;
    const nearestSlot = this.getNearestTowerSlot(enemy.position, towerSlots);
    
    if (!nearestSlot) return enemy.position;
    
    // Calculate movement direction
    const direction = this.getDirection(enemy.position, nearestSlot);
    
    // Predict future position
    const distance = enemy.speed * (timeOffset / 1000);
    
    return {
      x: enemy.position.x + direction.x * distance,
      y: enemy.position.y + direction.y * distance
    };
  }

  // =================== PRIVATE TARGETING METHODS ===================

  private filterCandidates(enemies: Enemy[], tower: Tower, config: TargetingOptions): Enemy[] {
    return enemies.filter(enemy => {
      // Range check
      const distance = this.calculateDistance(enemy.position, tower.position);
      if (distance > config.range) return false;
      
      // Type restrictions
      if (config.priorityTypes && enemy.type && !config.priorityTypes.includes(enemy.type as keyof typeof GAME_CONSTANTS.ENEMY_TYPES)) return false;
      if (config.excludeTypes && enemy.type && config.excludeTypes.includes(enemy.type as keyof typeof GAME_CONSTANTS.ENEMY_TYPES)) return false;
      
      // Health thresholds
      if (config.minHealthThreshold && enemy.health < config.minHealthThreshold) return false;
      if (config.maxHealthThreshold && enemy.health > config.maxHealthThreshold) return false;
      
      // Special targeting for ghost enemies
      if (enemy.behaviorTag === 'ghost' && tower.specialAbility !== 'psi') {
        return false; // Only psi towers can target ghosts
      }
      
      return enemy.isActive;
    });
  }

  private selectNearest(enemies: Enemy[], tower: Tower): Enemy | null {
    let minDistance = Infinity;
    let nearest: Enemy | null = null;
    
    enemies.forEach(enemy => {
      const distance = this.calculateDistance(enemy.position, tower.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = enemy;
      }
    });
    
    return nearest;
  }

  private selectLowestHP(enemies: Enemy[]): Enemy | null {
    return enemies.reduce((lowest, enemy) => 
      !lowest || enemy.health < lowest.health ? enemy : lowest, 
      null as Enemy | null
    );
  }

  private selectHighestHP(enemies: Enemy[]): Enemy | null {
    return enemies.reduce((highest, enemy) => 
      !highest || enemy.health > highest.health ? enemy : highest, 
      null as Enemy | null
    );
  }

  private selectFastest(enemies: Enemy[]): Enemy | null {
    return enemies.reduce((fastest, enemy) => 
      !fastest || enemy.speed > fastest.speed ? enemy : fastest, 
      null as Enemy | null
    );
  }

  private selectSlowest(enemies: Enemy[]): Enemy | null {
    return enemies.reduce((slowest, enemy) => 
      !slowest || enemy.speed < slowest.speed ? enemy : slowest, 
      null as Enemy | null
    );
  }

  private selectHighestValue(enemies: Enemy[]): Enemy | null {
    return enemies.reduce((valuable, enemy) => 
      !valuable || enemy.goldValue > valuable.goldValue ? enemy : valuable, 
      null as Enemy | null
    );
  }

  private selectStrongest(enemies: Enemy[]): Enemy | null {
    return enemies.reduce((strongest, enemy) => 
      !strongest || enemy.damage > strongest.damage ? enemy : strongest, 
      null as Enemy | null
    );
  }

  private selectFirst(enemies: Enemy[], _tower: Tower): Enemy | null {
    // Select enemy that appeared first (oldest ID)
    return enemies.reduce((first, enemy) => 
      !first || enemy.id < first.id ? enemy : first, 
      null as Enemy | null
    );
  }

  private selectLast(enemies: Enemy[], _tower: Tower): Enemy | null {
    // Select enemy that appeared last (newest ID)
    return enemies.reduce((last, enemy) => 
      !last || enemy.id > last.id ? enemy : last, 
      null as Enemy | null
    );
  }

  private selectByThreat(enemies: Enemy[], tower: Tower): Enemy | null {
    let highestThreat: ThreatAssessment | null = null;
    
    enemies.forEach(enemy => {
      const threat = this.assessThreat(enemy, tower);
      if (!highestThreat || threat.threatScore > highestThreat.threatScore) {
        highestThreat = threat;
      }
    });
    
    return highestThreat?.enemy || null;
  }

  // =================== UTILITY METHODS ===================

  private calculateDistance(pos1: Position, pos2: Position): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getDirection(from: Position, to: Position): { x: number, y: number } {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: dx / len, y: dy / len };
  }

  private getNearestTowerSlot(pos: Position, towerSlots: any[]): Position | null {
    const slotsWithTowers = towerSlots.filter(s => s.unlocked && s.tower);
    if (slotsWithTowers.length === 0) {
      return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }
    
    let nearest = slotsWithTowers[0];
    let minDist = this.calculateDistance(pos, nearest);
    
    slotsWithTowers.forEach(slot => {
      const dist = this.calculateDistance(pos, slot);
      if (dist < minDist) {
        minDist = dist;
        nearest = slot;
      }
    });
    
    return nearest;
  }
}

// =================== GLOBAL TARGETING INSTANCE ===================

export const eliteTargeting = new EliteTargetingStrategy();

// =================== ENHANCED PUBLIC FUNCTIONS ===================

export function getDirection(from: Position, to: Position) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: dx / len, y: dy / len };
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
  mode: TargetingMode = TargetingMode.THREAT_ASSESSMENT,
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

// =================== EXISTING FUNCTIONS (Enhanced) ===================

export function getEnemiesInRange(pos: Position, range: number, enemies: Enemy[]) {
  return enemies.filter(e => {
    const dx = e.position.x - pos.x;
    const dy = e.position.y - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist <= range;
  });
}

function fireTower(
  tower: Tower,
  enemy: Enemy,
  bulletType: { speedMultiplier: number; damageMultiplier: number; color: string },
) {
  const state = useGameStore.getState();
  
  // CRITICAL FIX: Apply upgrade effects to bullet damage and speed
  const baseDamage = tower.damage * bulletType.damageMultiplier;
  const baseSpeed = GAME_CONSTANTS.BULLET_SPEED * bulletType.speedMultiplier;
  
  const { damage, speed } = upgradeEffectsManager.applyUpgradeEffects(
    baseDamage,
    baseSpeed,
    state.bulletLevel
  );
  
  // Use bullet pool for memory efficiency
  const bullet = bulletPool.createBullet(
    { x: tower.position.x, y: tower.position.y },
    getDirection(tower.position, enemy.position),
    damage, // FIXED: Now uses upgraded damage
    speed,   // FIXED: Now uses upgraded speed
    bulletType.color,
    state.bulletLevel - 1,
    enemy.id
  );
  
  state.addBullet(bullet);
  playSound(tower.attackSound);
  tower.lastFired = performance.now();
  
  if (GAME_CONSTANTS.DEBUG_MODE) {
    console.log(`🔫 Tower ${tower.id} fired upgraded bullet (${damage} dmg) at ${enemy.id}`);
  }
}

// Special ability functions
function handleSpecialAbility(tower: Tower, enemies: Enemy[], addEffect: (effect: Effect) => void, damageEnemy: (id: string, damage: number) => void) {
  const now = performance.now();
  if (now - tower.lastSpecialUse < tower.specialCooldown) return;

  if (!energyManager.consume(GAME_CONSTANTS.ENERGY_COSTS.specialAbility, `ability_${tower.specialAbility}`)) {
    return;
  }

  const detectable = enemies.filter(e => {
    if (e.behaviorTag === 'ghost') {
      return tower.specialAbility === 'psi';
    }
    return true;
  });
  const enemiesInRange = getEnemiesInRange(tower.position, tower.range, detectable);
  if (enemiesInRange.length === 0) return;

  switch (tower.specialAbility) {
    case 'rapid_fire': {
      // Rapid fire: 3x faster shooting for 5 seconds
      tower.fireRate = tower.fireRate / 3;
      setTimeout(() => {
        const upgrade = GAME_CONSTANTS.TOWER_UPGRADES[tower.level - 1];
        tower.fireRate = upgrade.fireRate;
      }, 5000);
      break;
    }

    case 'multi_shot': {
      // Multi-shot: Shoot at multiple enemies using bullet pool
      const targets = enemiesInRange.slice(0, tower.multiShotCount);
      targets.forEach(enemy => {
        const bullet = bulletPool.createBullet(
          { x: tower.position.x, y: tower.position.y },
          getDirection(tower.position, enemy.position),
          tower.damage,
          GAME_CONSTANTS.BULLET_SPEED,
          '#FFD700',
          0,
          enemy.id
        );
        useGameStore.getState().addBullet(bullet);
      });
      break;
    }

    case 'chain_lightning': {
      // Chain lightning: Jump between enemies
      let currentEnemy: Enemy | null = enemiesInRange[0];
      let jumpsLeft = tower.chainLightningJumps;
      const hitEnemies = new Set<string>();

      while (currentEnemy && jumpsLeft > 0 && !hitEnemies.has(currentEnemy.id)) {
        hitEnemies.add(currentEnemy.id);
        damageEnemy(currentEnemy.id, tower.damage * 0.8);
        
        // Lightning effect
        addEffect({
          id: `${Date.now()}-${Math.random()}`,
          position: currentEnemy.position,
          radius: 30,
          color: '#00FFFF',
          life: 200,
          maxLife: 200,
        });

        // Find next target
        jumpsLeft--;
        if (jumpsLeft > 0 && currentEnemy) {
          const nextTarget = enemiesInRange.find(e => 
            !hitEnemies.has(e.id) && 
            Math.sqrt((e.position.x - currentEnemy!.position.x) ** 2 + (e.position.y - currentEnemy!.position.y) ** 2) <= 100
          );
          currentEnemy = nextTarget || null;
        }
      }
      break;
    }

    case 'freeze':
      // Freeze: Slow all enemies in range
      enemiesInRange.forEach(enemy => {
        const freezeTime = tower.freezeDuration || 2000;
        enemy.frozenUntil = now + freezeTime;
        addEffect({
          id: `${Date.now()}-${Math.random()}`,
          position: enemy.position,
          radius: enemy.size / 2,
          color: '#00CCFF',
          life: freezeTime,
          maxLife: freezeTime,
        });
      });
      break;

    case 'burn':
      // Burn: Apply damage over time
      enemiesInRange.forEach(enemy => {
        damageEnemy(enemy.id, tower.damage * 0.5);
        addEffect({
          id: `${Date.now()}-${Math.random()}`,
          position: enemy.position,
          radius: enemy.size / 2,
          color: '#FF6600',
          life: tower.burnDuration,
          maxLife: tower.burnDuration,
        });
      });
      break;

    case 'acid':
      // Acid: Stacking damage
      enemiesInRange.forEach(enemy => {
        tower.acidStack++;
        const acidDamage = tower.damage * (0.3 + tower.acidStack * 0.1);
        damageEnemy(enemy.id, acidDamage);
        addEffect({
          id: `${Date.now()}-${Math.random()}`,
          position: enemy.position,
          radius: enemy.size / 2,
          color: '#32CD32',
          life: 1000,
          maxLife: 1000,
        });
      });
      break;

    case 'quantum':
      // Quantum: Teleport and attack
      tower.quantumState = !tower.quantumState;
      if (tower.quantumState) {
        tower.damage *= 2;
        tower.fireRate /= 2;
      } else {
        const upgrade = GAME_CONSTANTS.TOWER_UPGRADES[tower.level - 1];
        tower.damage = upgrade.damage;
        tower.fireRate = upgrade.fireRate;
      }
      break;

    case 'nano':
      // Nano: Swarm attack
      for (let i = 0; i < tower.nanoSwarmCount; i++) {
        const randomEnemy = enemiesInRange[Math.floor(Math.random() * enemiesInRange.length)];
        if (randomEnemy) {
          damageEnemy(randomEnemy.id, tower.damage * 0.4);
          addEffect({
            id: `${Date.now()}-${Math.random()}`,
            position: randomEnemy.position,
            radius: 15,
            color: '#FF1493',
            life: 300,
            maxLife: 300,
          });
        }
      }
      break;

    case 'time_warp':
      // Time warp: Slow all enemies
      enemiesInRange.forEach(enemy => {
        enemy.speed *= (1 - tower.timeWarpSlow);
        addEffect({
          id: `${Date.now()}-${Math.random()}`,
          position: enemy.position,
          radius: 40,
          color: '#9932CC',
          life: 2000,
          maxLife: 2000,
        });
      });
      break;

    case 'god_mode':
      // God mode: Ultimate power
      tower.godModeActive = true;
      tower.damage *= 5;
      tower.fireRate /= 5;
      tower.health = tower.maxHealth;
      
      // Damage all enemies on screen
      useGameStore.getState().enemies.forEach(enemy => {
        damageEnemy(enemy.id, tower.damage * 2);
      });

      setTimeout(() => {
        const upgrade = GAME_CONSTANTS.TOWER_UPGRADES[tower.level - 1];
        tower.damage = upgrade.damage;
        tower.fireRate = upgrade.fireRate;
        tower.godModeActive = false;
      }, 10000);
      break;
  }

  tower.lastSpecialUse = now;
}

export function updateTowerFire() {
  const state = useGameStore.getState();
  const modifier = state.currentWaveModifier;
  const now = performance.now();
  
  // Sur yenileme kontrolü
  if (!state.globalWallActive && !state.wallRegenerationActive) {
    state.regenerateWalls();
  }
  
  state.towerSlots.forEach((slot) => {
    const tower = slot.tower;
    if (!tower) return;

    if (modifier?.disableTowerType && tower.specialAbility === modifier.disableTowerType) return;
    if (modifier?.disableArea) {
      const dx = tower.position.x - modifier.disableArea.x;
      const dy = tower.position.y - modifier.disableArea.y;
      if (Math.sqrt(dx * dx + dy * dy) <= modifier.disableArea.radius) return;
    }

    // Health regeneration
    if (tower.healthRegenRate > 0 && now - tower.lastHealthRegen > 1000) {
      tower.health = Math.min(tower.maxHealth, tower.health + tower.healthRegenRate);
      tower.lastHealthRegen = now;
    }

    // Special ability activation
    if (tower.specialAbility !== 'none') {
      handleSpecialAbility(tower, state.enemies, state.addEffect, state.damageEnemy);
    }

    const bulletType = GAME_CONSTANTS.BULLET_TYPES[state.bulletLevel - 1];
    
    // Sur durumuna göre ateş hızı ve hasar hesaplama
    let fireRateMultiplier = bulletType.fireRateMultiplier;
    const damageMultiplier = bulletType.damageMultiplier;
    
    if (state.wallLevel > 0) {
      // Sur seviyesine göre bonus
      const wallLevel = GAME_CONSTANTS.WALL_SYSTEM.WALL_LEVELS[state.wallLevel - 1];
      if (wallLevel) {
        fireRateMultiplier *= wallLevel.fireRateBonus;
      }
    }
    
    const finalFireRate = tower.fireRate * fireRateMultiplier;
    if (now - tower.lastFired < finalFireRate) return;

    const visibleEnemies = state.enemies.filter(e => {
      if (e.behaviorTag === 'ghost') {
        return state.towerSlots.some(s => s.tower && s.tower.specialAbility === 'psi' && Math.hypot(s.x - e.position.x, s.y - e.position.y) <= s.tower.psiRange);
      }
      return true;
    });
    
    // Enhanced targeting mode selection based on tower level and type
    let targetingMode = TargetingMode.NEAREST;
    const options: Partial<TargetingOptions> = {};
    
    // Advanced towers get smarter targeting
    if (tower.level >= 15) {
      targetingMode = TargetingMode.THREAT_ASSESSMENT; // Elite towers use AI
    } else if (tower.level >= 10) {
      targetingMode = TargetingMode.LOWEST_HP; // High level towers finish enemies
    } else if (tower.level >= 5) {
      targetingMode = TargetingMode.FASTEST; // Mid level towers focus on fast enemies
    }
    
    // Special targeting for economic towers
    if (tower.towerType === 'economy') {
      targetingMode = TargetingMode.HIGHEST_VALUE; // Economy towers target valuable enemies
    }
    
    // Special ability-based targeting preferences
    switch (tower.specialAbility) {
      case 'multi_shot':
        options.priorityTypes = ['Basic']; // Multi-shot works best on basic enemies
        break;
      case 'chain_lightning':
        options.priorityTypes = ['Scout', 'Tank']; // Chain lightning good for groups
        break;
      case 'freeze':
        targetingMode = TargetingMode.FASTEST; // Freeze fast enemies
        break;
      case 'burn':
        targetingMode = TargetingMode.HIGHEST_HP; // Burn tanks
        break;
      case 'psi':
        options.priorityTypes = ['Ghost']; // Psi towers target ghosts
        break;
    }
    
    const rangeMult = (modifier?.towerRangeReduced ? 0.5 : 1) * (tower.rangeMultiplier ?? 1);
    options.range = tower.range * rangeMult;
    
    // Use enhanced targeting system
    const { enemy, threatScore } = getTargetEnemy(tower, visibleEnemies, targetingMode, options);
    if (!enemy) return;
    
    // Debug targeting information
    if (GAME_CONSTANTS.DEBUG_MODE && threatScore) {
      console.log(`Tower ${tower.id} (L${tower.level}) targeting ${enemy.type} with threat score: ${threatScore.toFixed(1)}`);
    }

    fireTower(tower, enemy, {
      speedMultiplier: bulletType.speedMultiplier,
      damageMultiplier,
      color: bulletType.color,
    });
  });
}

export function updateBullets(deltaTime: number = 16) {
  const state = useGameStore.getState();
  const now = performance.now();
  const expiredBullets: string[] = [];
  
  // Update bullet positions using actual deltaTime (frame-rate independent)
  state.bullets.forEach((bullet) => {
    // Move bullet using actual deltaTime
    const deltaX = bullet.direction.x * bullet.speed * (deltaTime / 1000);
    const deltaY = bullet.direction.y * bullet.speed * (deltaTime / 1000);
    bullet.position.x += deltaX;
    bullet.position.y += deltaY;
    bullet.life -= deltaTime;
    
    if (bullet.life <= 0) {
      expiredBullets.push(bullet.id);
    }
  });
  
  // Batch remove expired bullets and return them to pool
  expiredBullets.forEach(bulletId => {
    const bullet = state.bullets.find(b => b.id === bulletId);
    if (bullet) {
      state.removeBullet(bulletId);
      // Return to pool for reuse
      try {
        bulletPool.release(bullet);
      } catch (error) {
        console.warn('🚨 Error releasing bullet to pool:', error);
      }
    }
  });

  // Process collisions using the new frame-rate independent system
  collisionManager.processBulletCollisions(
    state.bullets,
    state.enemies,
    deltaTime,
    (bullet, enemy, collisionResult) => {
      // Apply damage
      state.damageEnemy(enemy.id, bullet.damage);
      
      // Remove bullet and return to pool
      state.removeBullet(bullet.id);
      try {
        bulletPool.release(bullet);
      } catch (error) {
        console.warn('🚨 Error releasing bullet to pool after collision:', error);
      }
      
      // Apply bullet effects
      const bulletType = GAME_CONSTANTS.BULLET_TYPES[bullet.typeIndex];
      if ('freezeDuration' in bulletType && bulletType.freezeDuration) {
        enemy.frozenUntil = now + bulletType.freezeDuration;
      }
      
      // Optional: Add collision effect at the collision point
      if (collisionResult.collisionPoint) {
        state.addEffect({
          id: `collision-${Date.now()}-${Math.random()}`,
          position: collisionResult.collisionPoint,
          radius: 15,
          color: bullet.color,
          life: 200,
          maxLife: 200,
        });
      }
      
      if (GAME_CONSTANTS.DEBUG_MODE) {
        console.log(`Bullet ${bullet.id} hit enemy ${enemy.id} at collision time: ${collisionResult.collisionTime?.toFixed(3)}`);
      }
    }
  );
}
