import { useGameStore } from '../models/store';
import { 
  detectMineCollisions, 
  createMineExplosionEffects, 
  calculateMineDamage 
} from './mine';
import { advancedMineManager } from './mine/AdvancedMineManager';

export function updateMineCollisions() {
  const { mines, enemies, triggerMine, damageEnemy, addEffect, removeMine } = useGameStore.getState();

  if (mines.length === 0) return;

  // ✅ NEW: Update advanced mine effects
  advancedMineManager.updateMineEffects(16); // 16ms delta time

  // Detect all collisions
  const collisions = detectMineCollisions(mines, enemies);

  // Process each collision
  for (const collision of collisions) {
    const { mine } = collision;

    // ✅ NEW: Check if it's an advanced mine type
    if (mine.mineSubtype && ['emp', 'sticky', 'chainReaction'].includes(mine.mineSubtype)) {
      // Handle advanced mine explosion
      advancedMineManager.handleMineExplosion(mine, enemies, addEffect, damageEnemy, removeMine);
    } else {
      // Handle standard mine explosion
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
} 