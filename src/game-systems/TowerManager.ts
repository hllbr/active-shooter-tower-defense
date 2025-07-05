import { useGameStore } from '../models/store';
import type { Effect } from '../models/gameTypes';
import type { Enemy, Position, Tower } from '../models/gameTypes';

// Import new modular systems
import { bulletUpdateSystem } from './bullet-system';
import { 
  getNearestEnemy as targetingGetNearestEnemy, 
  getTargetEnemy as targetingGetTargetEnemy, 
  getTargetEnemies as targetingGetTargetEnemies, 
  getEnemiesInRange as targetingGetEnemiesInRange,
  TargetingMode 
} from './targeting-system';
import { specialAbilitiesManager } from './tower-system';
import { towerFiringSystem } from './tower-system';

// =================== ENHANCED PUBLIC FUNCTIONS ===================

/**
 * Enhanced enemy selection with targeting modes
 * @deprecated Use eliteTargeting.selectTarget() for new implementations
 */
export function getNearestEnemy(pos: Position, enemies: Enemy[]) {
  return targetingGetNearestEnemy(pos, enemies);
}

/**
 * Enhanced enemy targeting with strategic options
 */
export function getTargetEnemy(
  tower: Tower, 
  enemies: Enemy[], 
  mode: TargetingMode = TargetingMode.NEAREST,
  options?: Record<string, unknown>
): { enemy: Enemy | null, distance: number, threatScore?: number } {
  return targetingGetTargetEnemy(tower, enemies, mode, options);
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
  return targetingGetTargetEnemies(tower, enemies, mode, maxTargets);
}

// =================== EXISTING FUNCTIONS (Enhanced) ===================

export function getEnemiesInRange(pos: Position, range: number, enemies: Enemy[]) {
  return targetingGetEnemiesInRange(pos, range, enemies);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _fireTower(
  tower: Tower,
  enemy: Enemy,
  bulletType: { speedMultiplier: number; damageMultiplier: number; color: string },
) {
  const state = useGameStore.getState();
  
  // Use the new tower firing system
  towerFiringSystem.fireTower(
    tower,
    enemy,
    bulletType,
    state.addBullet
  );
}

// Special ability functions
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _handleSpecialAbility(tower: Tower, enemies: Enemy[], addEffect: (effect: Effect) => void, damageEnemy: (id: string, damage: number) => void) {
  // Use the new special abilities system
  return specialAbilitiesManager.handleSpecialAbility(tower, enemies, addEffect, damageEnemy);
}

export function updateTowerFire() {
  const state = useGameStore.getState();
  
  // Use the new tower firing system
  towerFiringSystem.updateTowerFire(
    state.towerSlots,
    state.enemies,
    state.currentWaveModifier || null,
    state.bulletLevel,
    state.wallLevel,
    state.isGameOver,
    state.addBullet,
    state.addEffect,
    state.damageEnemy,
    state.regenerateWalls,
    state.globalWallActive,
    state.wallRegenerationActive
  );
}

export function updateBullets(deltaTime: number = 16) {
  const state = useGameStore.getState();
  
  // Use the new bullet update system
  bulletUpdateSystem.updateBullets(
    state.bullets,
    state.enemies,
    deltaTime,
    state.removeBullet,
    state.addEffect,
    state.damageEnemy
  );
}

// =================== EXPORT NEW SYSTEMS ===================

// Re-export the new systems for backward compatibility
export { bulletUpdateSystem } from './bullet-system';
export { 
  getNearestEnemy as targetingGetNearestEnemy, 
  getTargetEnemy as targetingGetTargetEnemy, 
  getTargetEnemies as targetingGetTargetEnemies, 
  getEnemiesInRange as targetingGetEnemiesInRange,
  TargetingMode 
} from './targeting-system';
export { specialAbilitiesManager, towerFiringSystem } from './tower-system';
