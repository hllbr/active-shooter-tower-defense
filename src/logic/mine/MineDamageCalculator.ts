import type { Mine, Enemy } from '../../models/gameTypes';

export interface DamageTarget {
  enemyId: string;
  damage: number;
}

export function calculateMineDamage(mine: Mine, enemies: Enemy[]): DamageTarget[] {
  const targets: DamageTarget[] = [];

  for (const enemy of enemies) {
    const distToTarget = Math.sqrt(
      (enemy.position.x - mine.position.x) ** 2 +
      (enemy.position.y - mine.position.y) ** 2
    );
    
    if (distToTarget < mine.radius) {
      targets.push({
        enemyId: enemy.id,
        damage: mine.damage
      });
    }
  }

  return targets;
} 