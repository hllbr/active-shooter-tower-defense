export interface EnemySlice {
  addEnemy: (enemy: import('../../gameTypes').Enemy) => void;
  removeEnemy: (enemyId: string) => void;
  damageEnemy: (enemyId: string, dmg: number) => void;
  addBullet: (bullet: import('../../gameTypes').Bullet) => void;
  removeBullet: (bulletId: string) => void;
  addEffect: (effect: import('../../gameTypes').Effect) => void;
  removeEffect: (effectId: string) => void;
}

export const createEnemySlice = (set: any, get: any): EnemySlice => ({
  addEnemy: (enemy) => set((state: any) => ({
    enemies: [...state.enemies, enemy]
  })),

  addBullet: (bullet) => set((state: any) => ({
    bullets: [...state.bullets, bullet]
  })),

  removeBullet: (bulletId) => set((state: any) => ({
    bullets: state.bullets.filter((b: any) => b.id !== bulletId)
  })),

  addEffect: (effect) => set((state: any) => ({
    effects: [...state.effects, effect]
  })),

  removeEffect: (effectId) => set((state: any) => ({
    effects: state.effects.filter((e: any) => e.id !== effectId)
  })),

  removeEnemy: (enemyId) => set((state: any) => {
    const enemy = state.enemies.find((e: any) => e.id === enemyId);
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
      console.log(`\uD83D\uDC80 Enemy killed! Wave ${state.currentWave}: ${newKillCount}/${state.enemiesRequired} (${enemy.type}, special: ${enemy.isSpecial})`);
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
      enemies: state.enemies.filter((e: any) => e.id !== enemyId),
      gold: state.gold + enemy.goldValue,
      enemiesKilled: newKillCount,
      totalEnemiesKilled: state.totalEnemiesKilled + 1,
    };
  }),

  damageEnemy: (enemyId, dmg) => {
    const { towerSlots } = get();
    const enemyObj = get().enemies.find((e: any) => e.id === enemyId);
    set((state: any) => {
      const enemy = state.enemies.find((e: any) => e.id === enemyId);
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
          console.log(`\uD83D\uDC80 Enemy killed! Wave ${state.currentWave}: ${newKillCount}/${state.enemiesRequired} (${enemy.type}, special: ${enemy.isSpecial})`);
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
          enemies: state.enemies.filter((e: any) => e.id !== enemyId),
          gold: state.gold + enemy.goldValue,
          enemiesKilled: newKillCount,
          totalEnemiesKilled: state.totalEnemiesKilled + 1,
        };
      }
      return {
        enemies: state.enemies.map((e: any) => e.id === enemyId ? { ...e, health: newHealth } : e),
      };
    });
    if (enemyObj && enemyObj.health - dmg <= 0 && enemyObj.behaviorTag === 'tank') {
      towerSlots.forEach((s: any, idx: number) => {
        if (!s.tower) return;
        const dx = s.x - enemyObj.position.x;
        const dy = s.y - enemyObj.position.y;
        if (Math.hypot(dx, dy) <= (import('../../utils/constants').GAME_CONSTANTS.TANK_DEATH_RADIUS)) {
          get().damageTower(idx, enemyObj.damage);
        }
      });
    }
  },
});
