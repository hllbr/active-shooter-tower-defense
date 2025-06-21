import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/Constants';
import type { Effect } from '../models/gameTypes';
import type { Enemy, Position, Tower } from '../models/gameTypes';
import { playSound } from '../utils/sound';

function getDirection(from: Position, to: Position) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: dx / len, y: dy / len };
}

function getNearestEnemy(pos: Position, enemies: Enemy[]) {
  let min = Infinity;
  let nearest: Enemy | null = null;
  enemies.forEach((e) => {
    const dx = e.position.x - pos.x;
    const dy = e.position.y - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < min) {
      min = dist;
      nearest = e;
    }
  });
  return { enemy: nearest, distance: min };
}

function getEnemiesInRange(pos: Position, range: number, enemies: Enemy[]) {
  return enemies.filter(e => {
    const dx = e.position.x - pos.x;
    const dy = e.position.y - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist <= range;
  });
}

// Special ability functions
function handleSpecialAbility(tower: Tower, enemies: Enemy[], addEffect: (effect: Effect) => void, damageEnemy: (id: string, damage: number) => void) {
  const now = performance.now();
  if (now - tower.lastSpecialUse < tower.specialCooldown) return;

  const enemiesInRange = getEnemiesInRange(tower.position, tower.range, enemies);
  if (enemiesInRange.length === 0) return;

  switch (tower.specialAbility) {
    case 'rapid_fire': {
      // Rapid fire: 3x faster shooting for 5 seconds
      tower.fireRate = tower.fireRate / 3;
      setTimeout(() => {
        const upgrade = GAME_CONSTANTS.TOWER_UPGRADES[tower.level - 1];
        tower.fireRate = upgrade.fireRate;
      }, 5000);
      break;
    }

    case 'multi_shot': {
      // Multi-shot: Shoot at multiple enemies
      const targets = enemiesInRange.slice(0, tower.multiShotCount);
      targets.forEach(enemy => {
        const dir = getDirection(tower.position, enemy.position);
        const bullet = {
          id: `${Date.now()}-${Math.random()}`,
          position: { x: tower.position.x, y: tower.position.y },
          size: GAME_CONSTANTS.BULLET_SIZE,
          isActive: true,
          speed: GAME_CONSTANTS.BULLET_SPEED,
          damage: tower.damage,
          direction: dir,
          color: '#FFD700',
          typeIndex: 0,
        };
        useGameStore.getState().addBullet(bullet);
      });
      break;
    }

    case 'chain_lightning': {
      // Chain lightning: Jump between enemies
      let currentEnemy = enemiesInRange[0];
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
      break;
    }

    case 'freeze':
      // Freeze: Slow all enemies in range
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
      break;

    case 'burn':
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
      break;

    case 'acid':
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
      break;

    case 'quantum':
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
      break;

    case 'nano':
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
      break;

    case 'time_warp':
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
      break;

    case 'god_mode':
      // God mode: Ultimate power
      tower.godModeActive = true;
      tower.damage *= 5;
      tower.fireRate /= 5;
      tower.health = tower.maxHealth;
      
      // Damage all enemies on screen
      useGameStore.getState().enemies.forEach(enemy => {
        damageEnemy(enemy.id, tower.damage * 2);
      });

      setTimeout(() => {
        const upgrade = GAME_CONSTANTS.TOWER_UPGRADES[tower.level - 1];
        tower.damage = upgrade.damage;
        tower.fireRate = upgrade.fireRate;
        tower.godModeActive = false;
      }, 10000);
      break;
  }

  tower.lastSpecialUse = now;
}

export function updateTowerFire() {
  const state = useGameStore.getState();
  const modifier = state.currentWaveModifier;
  const now = performance.now();
  
  // Sur yenileme kontrolü
  if (!state.globalWallActive && !state.wallRegenerationActive) {
    state.regenerateWalls();
  }
  
  state.towerSlots.forEach((slot) => {
    const tower = slot.tower;
    if (!tower) return;

    if (modifier?.disableTowerType && tower.specialAbility === modifier.disableTowerType) return;
    if (modifier?.disableArea) {
      const dx = tower.position.x - modifier.disableArea.x;
      const dy = tower.position.y - modifier.disableArea.y;
      if (Math.sqrt(dx * dx + dy * dy) <= modifier.disableArea.radius) return;
    }

    // Health regeneration
    if (tower.healthRegenRate > 0 && now - tower.lastHealthRegen > 1000) {
      tower.health = Math.min(tower.maxHealth, tower.health + tower.healthRegenRate);
      tower.lastHealthRegen = now;
    }

    // Special ability activation
    if (tower.specialAbility !== 'none') {
      handleSpecialAbility(tower, state.enemies, state.addEffect, state.damageEnemy);
    }

    const bulletType = GAME_CONSTANTS.BULLET_TYPES[state.bulletLevel - 1];
    
    // Sur durumuna göre ateş hızı ve hasar hesaplama
    let fireRateMultiplier = bulletType.fireRateMultiplier;
    let damageMultiplier = bulletType.damageMultiplier;
    
    if (!state.globalWallActive) {
      // Sur yokken ateş hızı ve hasar azalır
      fireRateMultiplier *= GAME_CONSTANTS.WALL_SYSTEM.GLOBAL_EFFECTS.NO_WALL_FIRE_RATE_MULTIPLIER;
      damageMultiplier *= GAME_CONSTANTS.WALL_SYSTEM.GLOBAL_EFFECTS.NO_WALL_DAMAGE_MULTIPLIER;
    } else if (state.wallLevel > 0) {
      // Sur seviyesine göre bonus
      const wallLevel = GAME_CONSTANTS.WALL_SYSTEM.WALL_LEVELS[state.wallLevel - 1];
      if (wallLevel) {
        fireRateMultiplier *= wallLevel.fireRateBonus;
      }
    }
    
    if (now - tower.lastFired < tower.fireRate * fireRateMultiplier) return;
    
    const { enemy, distance } = getNearestEnemy(tower.position, state.enemies);
    const rangeMult = (modifier?.towerRangeReduced ? 0.5 : 1) * (tower.rangeMultiplier ?? 1);
    if (!enemy || distance > tower.range * rangeMult) return;
    
    // Create bullet(s)
    const bullet = {
      id: `${Date.now()}-${Math.random()}`,
      position: { x: tower.position.x, y: tower.position.y },
      size: GAME_CONSTANTS.BULLET_SIZE,
      isActive: true,
      speed: GAME_CONSTANTS.BULLET_SPEED * bulletType.speedMultiplier,
      damage: tower.damage * damageMultiplier,
      direction: getDirection(tower.position, enemy.position),
      color: bulletType.color,
      typeIndex: state.bulletLevel - 1,
    };
    
    useGameStore.getState().addBullet(bullet);
    playSound(tower.attackSound);
    tower.lastFired = now;
  });
}

export function updateBullets() {
  const {
    bullets,
    removeBullet,
    enemies,
    damageEnemy,
    addEffect,
  } = useGameStore.getState();
  bullets.forEach((b) => {
    b.position.x += b.direction.x * b.speed * 0.016;
    b.position.y += b.direction.y * b.speed * 0.016;

    if (
      b.position.x < 0 ||
      b.position.x > window.innerWidth ||
      b.position.y < 0 ||
      b.position.y > window.innerHeight
    ) {
      removeBullet(b.id);
      return;
    }

    for (const e of enemies) {
      const dx = e.position.x - b.position.x;
      const dy = e.position.y - b.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < (e.size + b.size) / 2) {
        damageEnemy(e.id, b.damage);
        const type = GAME_CONSTANTS.BULLET_TYPES[b.typeIndex];
        if (type.freezeDuration) {
          e.frozenUntil = performance.now() + type.freezeDuration;
        }
        const effect: Effect = {
          id: `${Date.now()}-${Math.random()}`,
          position: { x: b.position.x, y: b.position.y },
          radius: 20,
          color: '#ff6600',
          life: 300,
          maxLife: 300,
        };
        addEffect(effect);
        removeBullet(b.id);
        break;
      }
    }
  });
}
