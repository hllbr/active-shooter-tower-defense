import { useGameStore } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/constants';
import type { Bullet } from '../../models/gameTypes';

export class EnemyProjectileSystem {
  updateEnemyProjectiles(deltaTime: number = 16) {
    const { enemyBullets, removeEnemyBullet, towerSlots, damageTower, addEffect } = useGameStore.getState();
    const expired: string[] = [];
    enemyBullets.forEach((bullet) => {
      bullet.position.x += bullet.direction.x * bullet.speed * (deltaTime / 1000);
      bullet.position.y += bullet.direction.y * bullet.speed * (deltaTime / 1000);
      bullet.life -= deltaTime;
      if (bullet.life <= 0) {
        expired.push(bullet.id);
        return;
      }
      if (
        bullet.position.x < 0 ||
        bullet.position.x > GAME_CONSTANTS.CANVAS_WIDTH ||
        bullet.position.y < 0 ||
        bullet.position.y > GAME_CONSTANTS.CANVAS_HEIGHT
      ) {
        expired.push(bullet.id);
        return;
      }
      towerSlots.forEach((slot, idx) => {
        if (!slot.tower) return;
        const dx = slot.x - bullet.position.x;
        const dy = slot.y - bullet.position.y;
        const dist = Math.hypot(dx, dy);
        if (dist < (slot.tower.size + bullet.size) / 2) {
          damageTower(idx, bullet.damage);
          expired.push(bullet.id);
          addEffect({
            id: `enemy-hit-${Date.now()}-${Math.random()}`,
            position: { x: bullet.position.x, y: bullet.position.y },
            radius: 12,
            color: bullet.color,
            life: 200,
            maxLife: 200,
          });
        }
      });
    });
    expired.forEach(id => removeEnemyBullet(id));
  }
}

export const enemyProjectileSystem = new EnemyProjectileSystem();
