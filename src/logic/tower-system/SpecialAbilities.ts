import { GAME_CONSTANTS } from '../../utils/constants';
import type { Effect, Enemy, Tower } from '../../models/gameTypes';
import { energyManager } from '../EnergyManager';
import { getEnemiesInRange, getDirection } from '../targeting-system/TargetingSystem';
import { bulletPool } from '../bullet-system/BulletPool';

/**
 * Special ability handler for towers
 * Manages all tower special abilities and their effects
 */
export class SpecialAbilitiesManager {
  /**
   * Handle special ability activation for a tower
   */
  handleSpecialAbility(
    tower: Tower, 
    enemies: Enemy[], 
    addEffect: (effect: Effect) => void, 
    damageEnemy: (id: string, damage: number) => void
  ): boolean {
    const now = performance.now();
    if (now - tower.lastSpecialUse < tower.specialCooldown) return false;

    if (!energyManager.consume(GAME_CONSTANTS.ENERGY_COSTS.specialAbility, `ability_${tower.specialAbility}`)) {
      return false;
    }

    const detectable = enemies.filter(e => {
      if (e.behaviorTag === 'ghost') {
        return tower.specialAbility === 'psi';
      }
      return true;
    });
    
    const enemiesInRange = getEnemiesInRange(tower.position, tower.range, detectable);
    if (enemiesInRange.length === 0) return false;

    switch (tower.specialAbility) {
      case 'rapid_fire':
        this.handleRapidFire(tower);
        break;

      case 'multi_shot':
        this.handleMultiShot(tower, enemiesInRange);
        break;

      case 'chain_lightning':
        this.handleChainLightning(tower, enemiesInRange, damageEnemy, addEffect);
        break;

      case 'freeze':
        this.handleFreeze(tower, enemiesInRange, addEffect);
        break;

      case 'burn':
        this.handleBurn(tower, enemiesInRange, damageEnemy, addEffect);
        break;

      case 'acid':
        this.handleAcid(tower, enemiesInRange, damageEnemy, addEffect);
        break;

      case 'quantum':
        this.handleQuantum(tower);
        break;

      case 'nano':
        this.handleNano(tower, enemiesInRange, damageEnemy, addEffect);
        break;

      case 'time_warp':
        this.handleTimeWarp(tower, enemiesInRange, addEffect);
        break;

      case 'god_mode':
        this.handleGodMode(tower, damageEnemy);
        break;

      default:
        return false;
    }

    tower.lastSpecialUse = now;
    return true;
  }

  private handleRapidFire(tower: Tower): void {
    // Rapid fire: 3x faster shooting for 5 seconds
    tower.fireRate = tower.fireRate / 3;
    setTimeout(() => {
      const upgrade = GAME_CONSTANTS.TOWER_UPGRADES[tower.level - 1];
      tower.fireRate = upgrade.fireRate;
    }, 5000);
  }

  private handleMultiShot(tower: Tower, enemiesInRange: Enemy[]): void {
    // Multi-shot: Shoot at multiple enemies using bullet pool
    const targets = enemiesInRange.slice(0, tower.multiShotCount);
    targets.forEach(enemy => {
      const _bullet = bulletPool.createBullet(
        { x: tower.position.x, y: tower.position.y },
        getDirection(tower.position, enemy.position),
        tower.damage,
        GAME_CONSTANTS.BULLET_SPEED,
        '#FFD700',
        0,
        enemy.id
      );
      // Note: This will need to be passed from the calling context
      // useGameStore.getState().addBullet(bullet);
    });
  }

  private handleChainLightning(
    tower: Tower, 
    enemiesInRange: Enemy[], 
    damageEnemy: (id: string, damage: number) => void,
    addEffect: (effect: Effect) => void
  ): void {
    // Chain lightning: Jump between enemies
    let currentEnemy: Enemy | null = enemiesInRange[0];
    let jumpsLeft = tower.chainLightningJumps;
    const hitEnemies = new Set<string>();

    while (currentEnemy && jumpsLeft > 0 && !hitEnemies.has(currentEnemy.id)) {
      hitEnemies.add(currentEnemy.id);
      damageEnemy(currentEnemy.id, tower.damage * 0.8);
      
      // Lightning effect
      addEffect({
        id: `${Date.now()}-${Math.random()}`,
        position: currentEnemy.position,
        radius: 30,
        color: '#00FFFF',
        life: 200,
        maxLife: 200,
      });

      // Find next target
      jumpsLeft--;
      if (jumpsLeft > 0 && currentEnemy) {
        const nextTarget = enemiesInRange.find(e => 
          !hitEnemies.has(e.id) && 
          Math.sqrt((e.position.x - currentEnemy!.position.x) ** 2 + (e.position.y - currentEnemy!.position.y) ** 2) <= 100
        );
        currentEnemy = nextTarget || null;
      }
    }
  }

  private handleFreeze(tower: Tower, enemiesInRange: Enemy[], addEffect: (effect: Effect) => void): void {
    // Freeze: Slow all enemies in range
    const now = performance.now();
    enemiesInRange.forEach(enemy => {
      const freezeTime = tower.freezeDuration || 2000;
      enemy.frozenUntil = now + freezeTime;
      addEffect({
        id: `${Date.now()}-${Math.random()}`,
        position: enemy.position,
        radius: enemy.size / 2,
        color: '#00CCFF',
        life: freezeTime,
        maxLife: freezeTime,
      });
    });
  }

  private handleBurn(tower: Tower, enemiesInRange: Enemy[], damageEnemy: (id: string, damage: number) => void, addEffect: (effect: Effect) => void): void {
    // Burn: Apply damage over time
    enemiesInRange.forEach(enemy => {
      damageEnemy(enemy.id, tower.damage * 0.5);
      addEffect({
        id: `${Date.now()}-${Math.random()}`,
        position: enemy.position,
        radius: enemy.size / 2,
        color: '#FF6600',
        life: tower.burnDuration,
        maxLife: tower.burnDuration,
      });
    });
  }

  private handleAcid(tower: Tower, enemiesInRange: Enemy[], damageEnemy: (id: string, damage: number) => void, addEffect: (effect: Effect) => void): void {
    // Acid: Stacking damage
    enemiesInRange.forEach(enemy => {
      tower.acidStack++;
      const acidDamage = tower.damage * (0.3 + tower.acidStack * 0.1);
      damageEnemy(enemy.id, acidDamage);
      addEffect({
        id: `${Date.now()}-${Math.random()}`,
        position: enemy.position,
        radius: enemy.size / 2,
        color: '#32CD32',
        life: 1000,
        maxLife: 1000,
      });
    });
  }

  private handleQuantum(tower: Tower): void {
    // Quantum: Teleport and attack
    tower.quantumState = !tower.quantumState;
    if (tower.quantumState) {
      tower.damage *= 2;
      tower.fireRate /= 2;
    } else {
      const upgrade = GAME_CONSTANTS.TOWER_UPGRADES[tower.level - 1];
      tower.damage = upgrade.damage;
      tower.fireRate = upgrade.fireRate;
    }
  }

  private handleNano(tower: Tower, enemiesInRange: Enemy[], damageEnemy: (id: string, damage: number) => void, addEffect: (effect: Effect) => void): void {
    // Nano: Swarm attack
    for (let i = 0; i < tower.nanoSwarmCount; i++) {
      const randomEnemy = enemiesInRange[Math.floor(Math.random() * enemiesInRange.length)];
      if (randomEnemy) {
        damageEnemy(randomEnemy.id, tower.damage * 0.4);
        addEffect({
          id: `${Date.now()}-${Math.random()}`,
          position: randomEnemy.position,
          radius: 15,
          color: '#FF1493',
          life: 300,
          maxLife: 300,
        });
      }
    }
  }

  private handleTimeWarp(tower: Tower, enemiesInRange: Enemy[], addEffect: (effect: Effect) => void): void {
    // Time warp: Slow all enemies
    enemiesInRange.forEach(enemy => {
      enemy.speed *= (1 - tower.timeWarpSlow);
      addEffect({
        id: `${Date.now()}-${Math.random()}`,
        position: enemy.position,
        radius: 40,
        color: '#9932CC',
        life: 2000,
        maxLife: 2000,
      });
    });
  }

  private handleGodMode(tower: Tower, _damageEnemy: (id: string, damage: number) => void): void {
    // God mode: Ultimate power
    tower.godModeActive = true;
    tower.damage *= 5;
    tower.fireRate /= 5;
    tower.health = tower.maxHealth;
    
    // Damage all enemies on screen
    // Note: This will need to be passed from the calling context
    // useGameStore.getState().enemies.forEach(enemy => {
    //   damageEnemy(enemy.id, tower.damage * 2);
    // });

    setTimeout(() => {
      const upgrade = GAME_CONSTANTS.TOWER_UPGRADES[tower.level - 1];
      tower.damage = upgrade.damage;
      tower.fireRate = upgrade.fireRate;
      tower.godModeActive = false;
    }, 10000);
  }
}

// Global special abilities manager instance
export const specialAbilitiesManager = new SpecialAbilitiesManager(); 