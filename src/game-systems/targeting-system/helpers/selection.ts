import { GAME_CONSTANTS } from '../../../utils/constants';
import type { Enemy, Position, Tower } from '../../../models/gameTypes';
import type { TargetingOptions, ThreatAssessment } from '../TargetingSystem';

export function calculateDistance(pos1: Position, pos2: Position): number {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function getDirection(from: Position, to: Position): { x: number; y: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: dx / len, y: dy / len };
}

export function filterCandidates(enemies: Enemy[], tower: Tower, config: TargetingOptions): Enemy[] {
  return enemies.filter(enemy => {
    const distance = calculateDistance(enemy.position, tower.position);
    if (distance > config.range) return false;
    if (config.priorityTypes && enemy.type && !config.priorityTypes.includes(enemy.type as keyof typeof GAME_CONSTANTS.ENEMY_TYPES)) return false;
    if (config.excludeTypes && enemy.type && config.excludeTypes.includes(enemy.type as keyof typeof GAME_CONSTANTS.ENEMY_TYPES)) return false;
    if (config.minHealthThreshold && enemy.health < config.minHealthThreshold) return false;
    if (config.maxHealthThreshold && enemy.health > config.maxHealthThreshold) return false;
    if (enemy.behaviorTag === 'ghost' && tower.specialAbility !== 'psi') {
      return false;
    }
    return enemy.isActive;
  });
}

export function selectNearest(enemies: Enemy[], tower: Tower): Enemy | null {
  let minDistance = Infinity;
  let nearest: Enemy | null = null;
  enemies.forEach(enemy => {
    const distance = calculateDistance(enemy.position, tower.position);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = enemy;
    }
  });
  return nearest;
}

export const selectLowestHP = (enemies: Enemy[]): Enemy | null =>
  enemies.reduce((lowest, enemy) => !lowest || enemy.health < lowest.health ? enemy : lowest, null as Enemy | null);

export const selectHighestHP = (enemies: Enemy[]): Enemy | null =>
  enemies.reduce((highest, enemy) => !highest || enemy.health > highest.health ? enemy : highest, null as Enemy | null);

export const selectFastest = (enemies: Enemy[]): Enemy | null =>
  enemies.reduce((fastest, enemy) => !fastest || enemy.speed > fastest.speed ? enemy : fastest, null as Enemy | null);

export const selectSlowest = (enemies: Enemy[]): Enemy | null =>
  enemies.reduce((slowest, enemy) => !slowest || enemy.speed < slowest.speed ? enemy : slowest, null as Enemy | null);

export const selectHighestValue = (enemies: Enemy[]): Enemy | null =>
  enemies.reduce((valuable, enemy) => !valuable || enemy.goldValue > valuable.goldValue ? enemy : valuable, null as Enemy | null);

export const selectStrongest = (enemies: Enemy[]): Enemy | null =>
  enemies.reduce((strongest, enemy) => !strongest || enemy.damage > strongest.damage ? enemy : strongest, null as Enemy | null);

export const selectFirst = (enemies: Enemy[]): Enemy | null =>
  enemies.reduce((first, enemy) => !first || enemy.id < first.id ? enemy : first, null as Enemy | null);

export const selectLast = (enemies: Enemy[]): Enemy | null =>
  enemies.reduce((last, enemy) => !last || enemy.id > last.id ? enemy : last, null as Enemy | null);

export function selectByThreat(enemies: Enemy[], tower: Tower, assess: (enemy: Enemy, tower: Tower) => ThreatAssessment): Enemy | null {
  if (enemies.length === 0) return null;
  let highestThreat: ThreatAssessment | null = null;
  for (const enemy of enemies) {
    const threat = assess(enemy, tower);
    if (!highestThreat || threat.threatScore > highestThreat.threatScore) {
      highestThreat = threat;
    }
  }
  return highestThreat ? highestThreat.enemy : null;
}
