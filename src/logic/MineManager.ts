import { useGameStore } from '../models/store';

export function updateMineCollisions() {
  const { mines, enemies, triggerMine, damageEnemy, addEffect } = useGameStore.getState();

  if (mines.length === 0) return;

  for (const mine of mines) {
    for (const enemy of enemies) {
      const dx = enemy.position.x - mine.position.x;
      const dy = enemy.position.y - mine.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Collision detected
      if (dist < (enemy.size + mine.size) / 2) {
        // Trigger the mine immediately
        triggerMine(mine.id);

        // Create a layered visual explosion effect
        // 1. Core flash (white)
        addEffect({
          id: `explosion-core-${mine.id}`,
          position: mine.position,
          radius: mine.radius * 0.6,
          color: 'rgba(255, 255, 255, 1)',
          life: 150,
          maxLife: 150,
        });
        // 2. Main explosion (orange)
        addEffect({
          id: `explosion-main-${mine.id}`,
          position: mine.position,
          radius: mine.radius,
          color: 'rgba(255, 150, 0, 0.9)',
          life: 400,
          maxLife: 400,
        });
        // 3. Lingering smoke (dark grey)
        addEffect({
          id: `explosion-smoke-${mine.id}`,
          position: mine.position,
          radius: mine.radius * 0.8,
          color: 'rgba(80, 80, 80, 0.7)',
          life: 700,
          maxLife: 700,
        });

        // Find and damage all enemies within the blast radius
        for (const target of enemies) {
          const distToTarget = Math.sqrt(
            (target.position.x - mine.position.x) ** 2 +
            (target.position.y - mine.position.y) ** 2
          );
          if (distToTarget < mine.radius) {
            damageEnemy(target.id, mine.damage);
          }
        }
        
        // Since the mine is gone, we break from the inner loop to avoid checking it again.
        // The outer loop will continue with the next mine.
        break; 
      }
    }
  }
} 