import { useGameStore } from '../models/store';
import { 
  detectMineCollisions, 
  createMineExplosionEffects, 
  calculateMineDamage 
} from './mine';

export function updateMineCollisions() {
  const { mines, enemies, triggerMine, damageEnemy, addEffect } = useGameStore.getState();

  if (mines.length === 0) return;

  // Detect all collisions
  const collisions = detectMineCollisions(mines, enemies);

  // Process each collision
  for (const collision of collisions) {
    const { mine } = collision;

    // Trigger the mine immediately
    triggerMine(mine.id);

    // Create explosion effects
    const explosionEffects = createMineExplosionEffects(mine);
    explosionEffects.forEach(effect => addEffect(effect));

    // Calculate and apply damage to all enemies in blast radius
    const damageTargets = calculateMineDamage(mine, enemies);
    damageTargets.forEach(target => {
      damageEnemy(target.enemyId, target.damage);
    });
  }
} 