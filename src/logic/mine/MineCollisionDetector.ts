import type { Mine, Enemy } from '../../models/gameTypes';

export interface CollisionResult {
  mine: Mine;
  enemy: Enemy;
  distance: number;
}

export function detectMineCollisions(mines: Mine[], enemies: Enemy[]): CollisionResult[] {
  const collisions: CollisionResult[] = [];

  for (const mine of mines) {
    for (const enemy of enemies) {
      const dx = enemy.position.x - mine.position.x;
      const dy = enemy.position.y - mine.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Collision detected
      if (dist < (enemy.size + mine.size) / 2) {
        collisions.push({
          mine,
          enemy,
          distance: dist
        });
      }
    }
  }

  return collisions;
} 