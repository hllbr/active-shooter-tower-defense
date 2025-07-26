import type { StateCreator } from 'zustand';
import type { Enemy, Bullet, Effect } from '../../gameTypes';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { EnemyFactory } from '../../../game-systems/enemy/EnemyFactory';
import type { Store } from '../index';

export interface EnemySlice {
  addEnemy: (enemy: Enemy) => void;
  removeEnemy: (enemyId: string) => void;
  damageEnemy: (enemyId: string, dmg: number) => void;
  addBullet: (bullet: Bullet) => void;
  removeBullet: (bulletId: string) => void;
  addEnemyBullet: (bullet: Bullet) => void;
  removeEnemyBullet: (bulletId: string) => void;
  addEffect: (effect: Effect) => void;
  removeEffect: (effectId: string) => void;
  clearAllEnemies: () => void;
  clearAllEffects: () => void;
}

export const createEnemySlice: StateCreator<Store, [], [], EnemySlice> = (set, get, _api) => ({
  addEnemy: (enemy) => set((state: Store) => ({
    enemies: [...state.enemies, enemy]
  })),

  addBullet: (bullet) => set((state: Store) => ({
    bullets: [...state.bullets, bullet]
  })),

  addEnemyBullet: (bullet) => set((state: Store) => ({
    enemyBullets: [...(state.enemyBullets || []), bullet]
  })),

  removeBullet: (bulletId) => set((state: Store) => ({
    bullets: state.bullets.filter((b) => b.id !== bulletId)
  })),

  removeEnemyBullet: (bulletId) => set((state: Store) => ({
    enemyBullets: (state.enemyBullets || []).filter((b) => b.id !== bulletId)
  })),

  addEffect: (effect) => set((state: Store) => ({
    effects: [...state.effects, effect]
  })),

  removeEffect: (effectId) => set((state: Store) => ({
    effects: state.effects.filter((e) => e.id !== effectId)
  })),

  // 🆕 UPGRADE SCREEN: Clear all enemies when entering upgrade
  clearAllEnemies: () => set((_state: Store) => ({
    enemies: []
  })),

  // 🆕 UPGRADE SCREEN: Clear all effects for clean slate
  clearAllEffects: () => set((_state: Store) => ({
    effects: [],
    bullets: [], // Also clear bullets for complete cleanup
    enemyBullets: []
  })),

  removeEnemy: (enemyId) => set((state: Store) => {
    const enemy = state.enemies.find((e) => e.id === enemyId);
    if (!enemy) return {};

    if (enemy.bossType) {
      setTimeout(() => {
        import('../../../game-systems/enemy/BossManager').then(({ default: BossManager }) => {
          BossManager.handleBossDefeat(enemy);
        });
      }, 0);
    }

    const newKillCount = state.enemiesKilled + 1;

    if (state.currentWave === 1) {
      // Wave 1 specific processing can be added here
    }

    setTimeout(() => {
      import('../../../game-systems/LootManager').then(({ default: LootManager }) => {
        LootManager.handleEnemyDeath(enemy);
      });
    }, 0);

    setTimeout(() => get().onEnemyKilled(enemy.isSpecial, enemy.type), 0);

    setTimeout(() => {
      import('../../../utils/sound').then(({ playContextualSound }) => {
        playContextualSound('death');
      });
    }, 50);

    return {
      enemies: state.enemies.filter((e) => e.id !== enemyId),
      gold: state.gold + enemy.goldValue,
      enemiesKilled: newKillCount,
      totalEnemiesKilled: state.totalEnemiesKilled + 1,
    };
  }),

  damageEnemy: (enemyId, dmg) => {
    const state = get();
    const { towerSlots } = state;
    const enemyObj = state.enemies.find((e) => e.id === enemyId);
    
    set((state: Store) => {
      const enemy = state.enemies.find((e) => e.id === enemyId);
      if (!enemy) return {};
      const newHealth = enemy.health - dmg;
      if (newHealth <= 0) {
        if (enemy.bossType) {
          setTimeout(() => {
            import('../../../game-systems/enemy/BossManager').then(({ default: BossManager }) => {
              BossManager.handleBossDefeat(enemy);
            });
          }, 0);
        }

        const newKillCount = state.enemiesKilled + 1;

        if (state.currentWave === 1) {
          // Wave 1 specific enemy processing can be added here
        }

        setTimeout(() => {
          import('../../../game-systems/LootManager').then(({ default: LootManager }) => {
            LootManager.handleEnemyDeath(enemy);
          });
        }, 0);

        setTimeout(() => get().onEnemyKilled(enemy.isSpecial, enemy.type), 0);

        setTimeout(() => {
          import('../../../utils/sound').then(({ playContextualSound }) => {
            playContextualSound('death');
          });
        }, 50);

        return {
          enemies: state.enemies.filter((e) => e.id !== enemyId),
          gold: state.gold + enemy.goldValue,
          enemiesKilled: newKillCount,
          totalEnemiesKilled: state.totalEnemiesKilled + 1,
        };
      }
      return {
        enemies: state.enemies.map((e) => e.id === enemyId ? { ...e, health: newHealth } : e),
      };
    });
    
    if (enemyObj && enemyObj.health - dmg <= 0 && enemyObj.behaviorTag === 'tank') {
      towerSlots.forEach((s, idx: number) => {
        if (!s.tower) return;
        const dx = s.x - enemyObj.position.x;
        const dy = s.y - enemyObj.position.y;
        if (Math.hypot(dx, dy) <= GAME_CONSTANTS.TANK_DEATH_RADIUS) {
          get().damageTower(idx, enemyObj.damage);
        }
      });
    }

    if (enemyObj && enemyObj.health - dmg <= 0 && enemyObj.behaviorTag === 'split') {
      const { addEnemy, currentWave } = get();
      for (let i = 0; i < 2; i++) {
        const newEnemy = EnemyFactory.createEnemy(currentWave, 'Basic');
        newEnemy.position = { ...enemyObj.position };
        newEnemy.size = Math.max(10, enemyObj.size * 0.7);
        newEnemy.health = enemyObj.maxHealth / 2;
        newEnemy.maxHealth = newEnemy.health;
        newEnemy.goldValue = Math.max(1, Math.floor(enemyObj.goldValue / 2));
        addEnemy(newEnemy);
      }
    }
  },
});
