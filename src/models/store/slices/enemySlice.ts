import type { StateCreator } from 'zustand';
import type { Enemy, Bullet, Effect } from '../../gameTypes';
import { GAME_CONSTANTS } from '../../../utils/constants';
import type { Store } from '../index';
import { dynamicDifficultyManager } from '../../../game-systems/DynamicDifficultyManager';

export interface EnemySlice {
  addEnemy: (enemy: Enemy) => void;
  removeEnemy: (enemyId: string) => void;
  damageEnemy: (enemyId: string, dmg: number) => void;
  addBullet: (bullet: Bullet) => void;
  removeBullet: (bulletId: string) => void;
  addEffect: (effect: Effect) => void;
  removeEffect: (effectId: string) => void;
  clearAllEnemies: () => void;
  clearAllEffects: () => void;
  // ✅ NEW: Centralized kill tracking function
  addEnemyKill: (enemy: Enemy) => void;
}

export const createEnemySlice: StateCreator<Store, [], [], EnemySlice> = (set, get, _api) => ({
  addEnemy: (enemy) => set((state: Store) => ({
    enemies: [...state.enemies, enemy]
  })),

  addBullet: (bullet) => set((state: Store) => ({
    bullets: [...state.bullets, bullet]
  })),

  removeBullet: (bulletId) => set((state: Store) => ({
    bullets: state.bullets.filter((b) => b.id !== bulletId)
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
    bullets: [] // Also clear bullets for complete cleanup
  })),

  // ✅ NEW: Centralized kill tracking function
  addEnemyKill: (enemy: Enemy) => set((state: Store) => {
    const newKillCount = state.enemiesKilled + 1;
    const newTotalKillCount = state.totalEnemiesKilled + 1;
    
    // Calculate gold reward with proper scaling
    let goldReward = enemy.goldValue;
    
    // Wave scaling bonus
    if (state.currentWave > 10) {
      goldReward *= 1 + (state.currentWave - 10) * 0.05; // 5% increase per wave after 10
    }
    
    // Special enemy bonus
    if (enemy.isSpecial) {
      goldReward *= 1.5; // 50% bonus for special enemies
    }
    
    // Boss bonus
    if (enemy.bossType) {
      goldReward *= 2.0; // 100% bonus for bosses
    }
    
    const finalGoldReward = Math.floor(goldReward);
    
    // ✅ NEW: Trigger mission progress tracking
    setTimeout(() => {
      // Import and trigger mission manager
      import('../../../game-systems/MissionManager').then(({ missionManager }) => {
        missionManager.updateMissionProgress('enemy_killed');
      });
      
      // Import and trigger analytics
      import('../../../game-systems/analytics/GameAnalyticsManager').then(({ gameAnalytics }) => {
        gameAnalytics.trackEvent('enemy_killed', {
          enemyType: enemy.type,
          isSpecial: enemy.isSpecial,
          bossType: enemy.bossType,
          wave: state.currentWave,
          totalKills: newTotalKillCount
        });
      });
    }, 0);
    
    // ✅ NEW: Trigger energy system
    setTimeout(() => {
      get().onEnemyKilled(enemy.isSpecial, enemy.type);
    }, 0);
    
    // ✅ NEW: Trigger loot system
    setTimeout(() => {
      import('../../../game-systems/LootManager').then(({ default: LootManager }) => {
        LootManager.handleEnemyDeath(enemy);
      });
    }, 0);
    
    // ✅ NEW: Handle boss defeat
    if (enemy.bossType) {
      setTimeout(() => {
        import('../../../game-systems/enemy/BossManager').then(({ default: BossManager }) => {
          BossManager.handleBossDefeat(enemy);
        });
      }, 0);
    }
    
    // ✅ NEW: Play death sound
    setTimeout(() => {
      import('../../../utils/sound').then(({ playContextualSound }) => {
        playContextualSound('death');
      });
    }, 50);
    
    return {
      enemies: state.enemies.filter((e) => e.id !== enemy.id),
      gold: state.gold + finalGoldReward,
      enemiesKilled: newKillCount,
      totalEnemiesKilled: newTotalKillCount,
      totalGoldEarned: state.totalGoldEarned + finalGoldReward,
    };
  }),

  removeEnemy: (enemyId) => set((state: Store) => {
    const enemy = state.enemies.find((e) => e.id === enemyId);
    if (!enemy) return {};

    // Direct removal without calling addEnemyKill to avoid recursion
    return {
      enemies: state.enemies.filter((e) => e.id !== enemyId),
    };
  }),

  damageEnemy: (enemyId, dmg) => {
    const state = get();
    const { towerSlots } = state;
    const enemyObj = state.enemies.find((e) => e.id === enemyId);
    
    // Record damage dealt for dynamic difficulty tracking
    dynamicDifficultyManager.recordDamageDealt(dmg);
    
    // ✅ NEW: Create enhanced visual effects for enemy damage
    if (enemyObj) {
      setTimeout(() => {
        import('../../../game-systems/effects-system/EnhancedVisualEffectsManager').then(({ enhancedVisualEffectsManager }) => {
          enhancedVisualEffectsManager.createEnemyDamageEffect(
            enemyObj.position.x,
            enemyObj.position.y,
            dmg,
            enemyObj.type
          );
        });
      }, 0);
    }
    
    set((state: Store) => {
      const enemy = state.enemies.find((e) => e.id === enemyId);
      if (!enemy) return {};
      const newHealth = enemy.health - dmg;
      
      if (newHealth <= 0) {
        // ✅ FIXED: Use centralized kill tracking directly in set
        const newKillCount = state.enemiesKilled + 1;
        const newTotalKillCount = state.totalEnemiesKilled + 1;
        
        // Calculate gold reward with proper scaling
        let goldReward = enemy.goldValue;
        
        // Wave scaling bonus
        if (state.currentWave > 10) {
          goldReward *= 1 + (state.currentWave - 10) * 0.05; // 5% increase per wave after 10
        }
        
        // Special enemy bonus
        if (enemy.isSpecial) {
          goldReward *= 1.5; // 50% bonus for special enemies
        }
        
        // Boss bonus
        if (enemy.bossType) {
          goldReward *= 2.0; // 100% bonus for bosses
        }
        
        const finalGoldReward = Math.floor(goldReward);
        
        // Trigger side effects asynchronously
        setTimeout(() => {
          // Import and trigger mission manager
          import('../../../game-systems/MissionManager').then(({ missionManager }) => {
            missionManager.updateMissionProgress('enemy_killed');
          });
          
          // Import and trigger analytics
          import('../../../game-systems/analytics/GameAnalyticsManager').then(({ gameAnalytics }) => {
            gameAnalytics.trackEvent('enemy_killed', {
              enemyType: enemy.type,
              isSpecial: enemy.isSpecial,
              bossType: enemy.bossType,
              wave: state.currentWave,
              totalKills: newTotalKillCount
            });
          });
          
          // Trigger energy system
          get().onEnemyKilled(enemy.isSpecial, enemy.type);
          
          // Trigger loot system
          import('../../../game-systems/LootManager').then(({ default: LootManager }) => {
            LootManager.handleEnemyDeath(enemy);
          });
          
          // Handle boss defeat
          if (enemy.bossType) {
            import('../../../game-systems/enemy/BossManager').then(({ default: BossManager }) => {
              BossManager.handleBossDefeat(enemy);
            });
          }
          
          // Play death sound
          import('../../../utils/sound').then(({ playContextualSound }) => {
            playContextualSound('death');
          });
        }, 0);
        
        return {
          enemies: state.enemies.filter((e) => e.id !== enemyId),
          gold: state.gold + finalGoldReward,
          enemiesKilled: newKillCount,
          totalEnemiesKilled: newTotalKillCount,
          totalGoldEarned: state.totalGoldEarned + finalGoldReward,
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
  },
});
