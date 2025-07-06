export interface ThreatAnalysis {
  threatLevel: number;
  primaryThreats: string[];
  recommendedCounters: string[];
  weakestPoint: import('../../../models/gameTypes').Position;
}

import type { Position, Enemy, TowerSlot } from '../../../models/gameTypes';

function countEnemyTypes(enemyTypes: string[]): Record<string, number> {
  return enemyTypes.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function findWeakestDefensePoint(enemies: Enemy[]): Position {
  const centerX = enemies.reduce((sum, e) => sum + e.position.x, 0) / enemies.length || 0;
  const centerY = enemies.reduce((sum, e) => sum + e.position.y, 0) / enemies.length || 0;
  return { x: centerX, y: centerY };
}

function getCounterStrategies(primaryThreats: string[]): string[] {
  const counters: string[] = [];
  for (const threat of primaryThreats) {
    switch (threat) {
      case 'Tank':
        counters.push('sniper', 'laser');
        break;
      case 'Scout':
        counters.push('gatling', 'flamethrower');
        break;
      case 'Flying':
        counters.push('air_defense');
        break;
      case 'Group':
        counters.push('mortar', 'flamethrower');
        break;
      default:
        counters.push('gatling');
    }
  }
  return [...new Set(counters)];
}

export function analyzeThreatLevel(enemies: Enemy[], currentWave: number): ThreatAnalysis {
  const enemyTypes = enemies.map(e => e.type).filter(t => t !== undefined);
  const enemyCounts = countEnemyTypes(enemyTypes);
  const primaryThreats = Object.entries(enemyCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type);
  const threatLevel = Math.min(1.0, enemies.length / (currentWave * 5) + currentWave / 50);
  const weakestPoint = findWeakestDefensePoint(enemies);
  const recommendedCounters = getCounterStrategies(primaryThreats);
  return { threatLevel, primaryThreats, recommendedCounters, weakestPoint };
}

export function calculateCoverageScore(position: Position, allSlots: TowerSlot[]): number {
  const nearbyTowers = allSlots.filter(s => s.tower).length;
  const avgDistance = allSlots
    .filter(s => s.tower)
    .reduce((sum, slot) => {
      const distance = Math.hypot(position.x - slot.x, position.y - slot.y);
      return sum + distance;
    }, 0) / (nearbyTowers || 1);
  return Math.max(0, 1 - avgDistance / 300);
}

export function calculateDefensiveValue(position: Position, allSlots: TowerSlot[]): number {
  const nearbyDefenses = allSlots.filter(slot => {
    if (!slot.tower) return false;
    const distance = Math.hypot(position.x - slot.x, position.y - slot.y);
    return distance <= 150 &&
      (slot.tower.towerClass === 'shield_generator' || slot.tower.towerClass === 'repair_station');
  });
  return Math.min(1.0, nearbyDefenses.length * 0.3);
}

export function generatePlacementReason(
  towerClass: string,
  effectiveness: number,
  synergyAnalysis: { synergyScore: number },
  strategicValue: { isChokepoint: boolean; isHighGround: boolean; coverageScore: number; defensiveValue: number }
): string {
  const reasons: string[] = [];
  if (effectiveness > 0.8) {
    reasons.push('Highly effective placement');
  }
  if (synergyAnalysis.synergyScore > 0.3) {
    reasons.push('Good synergy with nearby towers');
  }
  if (strategicValue.isChokepoint) {
    reasons.push('Strategic chokepoint control');
  }
  if (strategicValue.isHighGround) {
    reasons.push('Advantageous high ground position');
  }
  return reasons.join(', ') || 'Recommended placement';
}

export function calculatePriority(
  towerClass: string,
  threatAnalysis: ThreatAnalysis,
  effectiveness: number
): number {
  let priority = effectiveness * 10;
  if (threatAnalysis.recommendedCounters.includes(towerClass)) {
    priority += 5;
  }
  if (threatAnalysis.threatLevel > 0.7) {
    priority += 3;
  }
  return Math.round(priority);
}

