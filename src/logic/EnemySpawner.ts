import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/Constants';
import type { Position, Enemy } from '../models/gameTypes';
import { waveCompositions } from '../config/waves';
import { waveManager } from "./WaveManager";

let spawnInterval: number | null = null;
let spawnQueue: string[] = [];
let spawnIndex = 0;

export function stopEnemyWave() {
  if (spawnInterval) {
    clearInterval(spawnInterval);
    spawnInterval = null;
  }
}

function getRandomSpawnPosition() {
  // Spawn enemies from random screen edges
  const edge = Math.floor(Math.random() * 4);
  const w = window.innerWidth;
  const h = window.innerHeight;
  switch (edge) {
    case 0: // top
      return { x: Math.random() * w, y: -GAME_CONSTANTS.ENEMY_SIZE / 2 };
    case 1: // right
      return { x: w + GAME_CONSTANTS.ENEMY_SIZE / 2, y: Math.random() * h };
    case 2: // bottom
      return { x: Math.random() * w, y: h + GAME_CONSTANTS.ENEMY_SIZE / 2 };
    default: // left
      return { x: -GAME_CONSTANTS.ENEMY_SIZE / 2, y: Math.random() * h };
  }
}

function getNearestSlot(pos: Position) {
  const slotsWithTowers = useGameStore.getState().towerSlots.filter((s) => s.unlocked && s.tower);

  if (slotsWithTowers.length === 0) {
    return null;
  }

  let minDist = Infinity;
  let nearest = slotsWithTowers[0];
  slotsWithTowers.forEach((slot) => {
    const dx = slot.x - pos.x;
    const dy = slot.y - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) {
      minDist = dist;
      nearest = slot;
    }
  });
  return nearest;
}

function createEnemy(wave: number, type: string = 'Basic'): Enemy {
  const { currentWaveModifier } = useGameStore.getState();
  const id = `${Date.now()}-${Math.random()}`;
  
  // Special enemy spawn logic for waves 10+
  let isSpecial = false;
  if (wave >= 10) {
    // Base chance increases with wave level
    const baseChance = GAME_CONSTANTS.MICROBE_ENEMY.spawnChance;
    const waveBonus = Math.min(0.25, (wave - 10) * 0.002); // Max 25% chance at wave 100
    const totalChance = baseChance + waveBonus;
    isSpecial = Math.random() < totalChance;
  }
  
  if (isSpecial && type === 'Basic') {
    // Create special microbe enemy
    const healthScaling = Math.min(200, 40 + (wave - 10) * 3); // Cap health at 200
    const speedScaling = Math.min(120, 60 + (wave - 10) * 1.5); // Cap speed at 120
    const goldScaling = Math.min(20, 5 + Math.floor((wave - 10) / 10)); // Increase gold every 10 waves
    
    return {
      id,
      position: getRandomSpawnPosition(),
      size: GAME_CONSTANTS.MICROBE_ENEMY.size,
      isActive: true,
      health: healthScaling,
      maxHealth: healthScaling,
      speed: speedScaling * (currentWaveModifier?.speedMultiplier ?? 1),
      goldValue: goldScaling,
      color: GAME_CONSTANTS.MICROBE_ENEMY.color,
      frozenUntil: 0,
      isSpecial: true,
      lastGoldDrop: performance.now(),
      damage: GAME_CONSTANTS.ENEMY_TYPES.Basic.damage,
      behaviorTag: 'microbe',
      type: 'Microbe',
    } as Enemy;
  } else {
    const def = GAME_CONSTANTS.ENEMY_TYPES[type] || GAME_CONSTANTS.ENEMY_TYPES.Basic;
    const health = def.hp + (type === 'Basic' ? (wave - 1) * GAME_CONSTANTS.ENEMY_HEALTH_INCREASE : 0);
    return {
      id,
      position: getRandomSpawnPosition(),
      size: GAME_CONSTANTS.ENEMY_SIZE,
      isActive: true,
      health,
      maxHealth: health,
      speed: def.speed * (currentWaveModifier?.speedMultiplier ?? 1),
      goldValue: GAME_CONSTANTS.ENEMY_GOLD_DROP,
      color: def.color,
      frozenUntil: 0,
      isSpecial: false,
      damage: def.damage,
      behaviorTag: def.behaviorTag,
      type,
    } as Enemy;
  }
}

export function startEnemyWave(wave: number) {
  const { addEnemy, towers, towerSlots, buildTower, currentWaveModifier } = useGameStore.getState();

  if (towers.length === 0) {
    const firstEmptySlotIndex = towerSlots.findIndex((s) => s.unlocked && !s.tower);
    if (firstEmptySlotIndex !== -1) {
      buildTower(firstEmptySlotIndex, true);
    }
  }

  // Clear any existing interval. This is important when the upgrade screen
  // temporarily stops waves to ensure spawning resumes correctly.
  if (spawnInterval) clearInterval(spawnInterval);

  spawnQueue = [];
  spawnIndex = 0;
  const composition = waveCompositions[wave];
  if (composition) {
    composition.forEach(cfg => {
      for (let i = 0; i < cfg.count; i++) spawnQueue.push(cfg.type);
    });
  } else {
    if (GAME_CONSTANTS.DEBUG_MODE) {
      console.error(`[WaveManager] No spawn config found for wave ${wave}`);
    }
    const count = GAME_CONSTANTS.getWaveEnemiesRequired(wave);
    for (let i = 0; i < count; i++) spawnQueue.push('Basic');
  }

  spawnInterval = window.setInterval(() => {
    if (spawnIndex >= spawnQueue.length) {
      stopEnemyWave();
      return;
    }
    const type = spawnQueue[spawnIndex++];
    const enemy = createEnemy(wave, type);
    addEnemy(enemy);
    if (currentWaveModifier?.bonusEnemies) {
      addEnemy(createEnemy(wave, type));
    }
  }, GAME_CONSTANTS.ENEMY_SPAWN_RATE);
}

export function updateEnemyMovement() {
  const { enemies, towerSlots, damageTower, removeEnemy, addGold, hitWall } =
    useGameStore.getState();
  
  enemies.forEach((enemy) => {
    if (enemy.frozenUntil && enemy.frozenUntil > performance.now()) {
      return;
    }

    // Handle continuous gold drops for special enemies
    if (enemy.isSpecial && enemy.lastGoldDrop) {
      const now = performance.now();
      if (now - enemy.lastGoldDrop >= GAME_CONSTANTS.MICROBE_ENEMY.goldDropInterval) {
        addGold(enemy.goldValue);
        enemy.lastGoldDrop = now;
      }
    }

    const targetSlot = getNearestSlot(enemy.position);
    if (!targetSlot) return;
    if (targetSlot.modifier) {
      const mod = targetSlot.modifier;
      if (mod.expiresAt && mod.expiresAt < performance.now()) {
        targetSlot.modifier = undefined;
      } else if (mod.type === 'wall') {
        return; // Block enemy
      }
    }
    const dx = targetSlot.x - enemy.position.x;
    const dy = targetSlot.y - enemy.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (enemy.behaviorTag === 'avoid') {
      const nearby = towerSlots.filter(s => s.tower && Math.hypot(s.x - enemy.position.x, s.y - enemy.position.y) < 150).length;
      if (nearby > 3) {
        enemy.position.x += (Math.random() - 0.5) * enemy.speed * 0.016;
        enemy.position.y += (Math.random() - 0.5) * enemy.speed * 0.016;
        return;
      }
    }
    if (dist < (enemy.size + GAME_CONSTANTS.TOWER_SIZE) / 2) {
      if (targetSlot.tower) {
        const slotIdx = towerSlots.findIndex(
          (s) => s.x === targetSlot.x && s.y === targetSlot.y,
        );
        if (targetSlot.tower.wallStrength > 0) {
          // Wall exists: Knockback and stun the enemy
          hitWall(slotIdx);

          // Apply knockback
          const knockbackVector = { x: -dx / dist, y: -dy / dist };
          enemy.position.x += knockbackVector.x * GAME_CONSTANTS.KNOCKBACK_DISTANCE;
          enemy.position.y += knockbackVector.y * GAME_CONSTANTS.KNOCKBACK_DISTANCE;

          // Apply stun
          enemy.frozenUntil = performance.now() + GAME_CONSTANTS.KNOCKBACK_STUN_DURATION;
          return; // Skip the rest of the logic for this enemy
        } else {
          // No wall: Damage tower, and the enemy is destroyed
          damageTower(slotIdx, enemy.damage);
        }
      }
      // This part runs if there's no wall or no tower (fallback)
      addGold(enemy.goldValue);
      removeEnemy(enemy.id);
      return;
    }
    // Move toward slot
    let speedMult = 1;
    if (targetSlot.modifier && targetSlot.modifier.type === 'trench') {
      speedMult = GAME_CONSTANTS.TRENCH_SLOW_MULTIPLIER;
    }
    const moveX = (dx / dist) * enemy.speed * speedMult * 0.016;
    const moveY = (dy / dist) * enemy.speed * speedMult * 0.016;
    enemy.position.x += moveX;
    enemy.position.y += moveY;
  });
  const { currentWave, enemiesKilled, enemiesRequired } = useGameStore.getState();
  const pending = spawnInterval !== null && spawnIndex < spawnQueue.length;
  waveManager.checkComplete(currentWave, enemies.length, pending, enemiesKilled, enemiesRequired);
}
