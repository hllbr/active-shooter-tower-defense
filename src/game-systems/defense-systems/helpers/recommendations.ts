import type { Tower, TowerSlot, Position, Enemy } from '../../../models/gameTypes';

function getDistance(pos1: Position, pos2: Position): number {
  return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
}

function findNearbyTowers(centerTower: Tower, allTowers: Tower[], radius: number): Tower[] {
  return allTowers.filter(tower => {
    const distance = getDistance(centerTower.position, tower.position);
    return distance <= radius;
  });
}

function calculateClusterCenter(towers: Tower[]): Position {
  const sumX = towers.reduce((sum, tower) => sum + tower.position.x, 0);
  const sumY = towers.reduce((sum, tower) => sum + tower.position.y, 0);
  return { x: sumX / towers.length, y: sumY / towers.length };
}

function findTowerClusters(towerSlots: TowerSlot[]): Array<{ towers: Tower[]; center: Position }> {
  const clusters: Array<{ towers: Tower[]; center: Position }> = [];
  const towers = towerSlots.filter(slot => slot.tower).map(slot => slot.tower!);
  const visited = new Set<string>();

  for (const tower of towers) {
    if (visited.has(tower.id)) continue;
    const cluster = findNearbyTowers(tower, towers, 150);
    if (cluster.length >= 2) {
      cluster.forEach(t => visited.add(t.id));
      clusters.push({ towers: cluster, center: calculateClusterCenter(cluster) });
    }
  }

  return clusters;
}

export function getDefenseRecommendations(
  towerSlots: TowerSlot[],
  _enemies: Enemy[]
): Array<{
  type: 'shield' | 'repair';
  position: Position;
  reason: string;
  priority: number;
}> {
  const recommendations: Array<{
    type: 'shield' | 'repair';
    position: Position;
    reason: string;
    priority: number;
  }> = [];

  const towerClusters = findTowerClusters(towerSlots);
  for (const cluster of towerClusters) {
    if (cluster.towers.length >= 3) {
      const centerPosition = calculateClusterCenter(cluster.towers);
      recommendations.push({
        type: 'shield',
        position: centerPosition,
        reason: `Protect ${cluster.towers.length} clustered towers`,
        priority: cluster.towers.length * 10
      });
    }
  }

  const damagedTowers = towerSlots.filter(
    slot => slot.tower && slot.tower.health < slot.tower.maxHealth * 0.8
  );

  if (damagedTowers.length >= 2) {
    const centerPosition = calculateClusterCenter(damagedTowers.map(s => s.tower!));
    recommendations.push({
      type: 'repair',
      position: centerPosition,
      reason: `Repair ${damagedTowers.length} damaged towers`,
      priority: damagedTowers.length * 15
    });
  }

  return recommendations.sort((a, b) => b.priority - a.priority);
}

