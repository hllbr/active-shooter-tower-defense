import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/Constants';
import type { Position, Enemy } from '../models/gameTypes';
import { waveCompositions } from '../config/waves';
import { waveManager } from "./WaveManager";
import { spawnStrategy, performanceTracker, dynamicSpawnController } from './DynamicSpawnSystem';

let spawnInterval: number | null = null;
let spawnQueue: string[] = [];
let spawnIndex = 0;
let continuousSpawnInterval: number | null = null;

export function stopEnemyWave() {
  if (spawnInterval) {
    clearInterval(spawnInterval);
    spawnInterval = null;
  }
  // Also stop dynamic spawning
  dynamicSpawnController.stopWaveSpawning();
}

export function startContinuousSpawning() {
  if (continuousSpawnInterval) {
    clearInterval(continuousSpawnInterval);
  }
  
  continuousSpawnInterval = window.setInterval(() => {
    const state = useGameStore.getState();
    
    // Sadece oyun başlatılmışsa ve yükseltme ekranında değilse düşman yarat
    if (state.isStarted && !state.isRefreshing) {
      const enemy = createEnemy(state.currentWave, 'Basic');
      state.addEnemy(enemy);
    }
  }, GAME_CONSTANTS.ENEMY_SPAWN_RATE);
}

export function stopContinuousSpawning() {
  if (continuousSpawnInterval) {
    clearInterval(continuousSpawnInterval);
    continuousSpawnInterval = null;
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

  // Eğer hiç kule yoksa, merkezi hedef al
  if (slotsWithTowers.length === 0) {
    const centerX = GAME_CONSTANTS.CANVAS_WIDTH / 2;
    const centerY = GAME_CONSTANTS.CANVAS_HEIGHT / 2;
    return {
      x: centerX,
      y: centerY,
      unlocked: true,
      tower: null,
      type: 'fixed' as const,
      wasDestroyed: false,
      modifier: undefined
    };
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

/**
 * Enhanced enemy creation with dynamic spawning integration
 */
function createEnemy(wave: number, type: keyof typeof GAME_CONSTANTS.ENEMY_TYPES = 'Basic'): Enemy {
  const { currentWaveModifier, enemies } = useGameStore.getState();
  const id = `${Date.now()}-${Math.random()}`;
  
  // Use dynamic spawn system for intelligent enemy type selection
  const dynamicType = spawnStrategy.selectEnemyType(wave, enemies);
  const finalType = type === 'Basic' ? dynamicType : type;
  
  // Check for boss spawn
  const shouldBeBoss = spawnStrategy.shouldSpawnBoss(wave, enemies.length);
  
  // Special enemy spawn logic for waves 10+
  let isSpecial = false;
  if (wave >= 10) {
    // Base chance increases with wave level
    const baseChance = GAME_CONSTANTS.MICROBE_ENEMY.spawnChance;
    const waveBonus = Math.min(0.25, (wave - 10) * 0.002); // Max 25% chance at wave 100
    const totalChance = baseChance + waveBonus;
    isSpecial = Math.random() < totalChance;
  }
  
  if (isSpecial && finalType === 'Basic') {
    // Create special microbe enemy
    const healthScaling = Math.min(200, 40 + (wave - 10) * 3); // Cap health at 200
    const speedScaling = Math.min(120, 60 + (wave - 10) * 1.5); // Cap speed at 120
    const goldScaling = Math.min(20, 5 + Math.floor((wave - 10) / 10)); // Increase gold every 10 waves
    
    let enemy: Enemy = {
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
    
    // Apply dynamic difficulty scaling
    enemy = spawnStrategy.applyDifficultyScaling(enemy, wave);
    return enemy;
    
  } else {
    const def = GAME_CONSTANTS.ENEMY_TYPES[finalType];
    const health = def.hp + (finalType === 'Basic' ? (wave - 1) * GAME_CONSTANTS.ENEMY_HEALTH_INCREASE : 0);
    
    let enemy: Enemy = {
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
      type: finalType,
    } as Enemy;
    
    // Apply boss modifications if needed
    if (shouldBeBoss) {
      enemy.health = Math.floor(enemy.health * 2.5); // Boss health multiplier
      enemy.maxHealth = enemy.health;
      enemy.goldValue = Math.floor(enemy.goldValue * 3.0); // Boss gold multiplier
      enemy.isSpecial = true;
      enemy.size = enemy.size * 1.3; // Slightly larger boss
      // Add boss visual indicator (darker color)
      enemy.color = enemy.color.replace('#', '#2d'); // Make darker
    }
    
    // Apply dynamic difficulty scaling
    enemy = spawnStrategy.applyDifficultyScaling(enemy, wave);
    return enemy;
  }
}

/**
 * Enhanced wave spawning with KILL-BASED completion system
 * CRITICAL FIX: Düşman spawn etmeye killsRequired'a ulaşana kadar devam eder
 */
export function startEnemyWave(wave: number) {
  const { addEnemy, towers, towerSlots, buildTower, currentWaveModifier } = useGameStore.getState();

  if (towers.length === 0) {
    const firstEmptySlotIndex = towerSlots.findIndex((s) => s.unlocked && !s.tower);
    if (firstEmptySlotIndex !== -1) {
      buildTower(firstEmptySlotIndex, true);
    }
  }

  // Start dynamic spawning system
  dynamicSpawnController.startWaveSpawning(wave);

  // Clear any existing interval
  if (spawnInterval) clearInterval(spawnInterval);

  spawnQueue = [];
  spawnIndex = 0;
  const composition = waveCompositions[wave];
  
  // CRITICAL FIX: Build initial spawn queue
  if (composition) {
    composition.forEach(cfg => {
      for (let i = 0; i < cfg.count; i++) spawnQueue.push(cfg.type);
    });
  } else {
    const count = GAME_CONSTANTS.getWaveEnemiesRequired(wave);
    for (let i = 0; i < count; i++) spawnQueue.push('Basic');
  }

  // KILL-BASED SPAWN LOGIC: Continue spawning until required kills achieved
  let spawnCount = 0;
  let totalSpawned = 0;
  
  const spawnNext = () => {
    const state = useGameStore.getState();
    const enemiesRequired = GAME_CONSTANTS.getWaveEnemiesRequired(wave);
    const enemiesKilled = state.enemiesKilled;
    
    // CRITICAL: Check if we need more enemies to be spawnable
    const totalAvailableToKill = totalSpawned - enemiesKilled;
    
    // If player could potentially finish wave with existing enemies, don't spam spawn
    if (totalAvailableToKill >= enemiesRequired) {
      // Schedule next check in 2 seconds
      spawnInterval = window.setTimeout(spawnNext, 2000);
      return;
    }
    
    // Determine what type to spawn
    let enemyType: keyof typeof GAME_CONSTANTS.ENEMY_TYPES = 'Basic';
    
    if (spawnIndex < spawnQueue.length) {
      // Use composition if available
      enemyType = spawnQueue[spawnIndex++] as keyof typeof GAME_CONSTANTS.ENEMY_TYPES;
    } else {
      // After composition, spawn additional enemies based on wave pattern
      const wavePattern = wave % 3;
      if (wavePattern === 0) enemyType = 'Tank';
      else if (wavePattern === 1) enemyType = 'Scout';
      else enemyType = 'Basic';
    }
    
    const enemy = createEnemy(wave, enemyType);
    addEnemy(enemy);
    totalSpawned++;
    
    if (currentWaveModifier?.bonusEnemies) {
      const bonusEnemy = createEnemy(wave, enemyType);
      addEnemy(bonusEnemy);
      totalSpawned++;
    }
    
    spawnCount++;
    
    // Calculate next spawn delay (slower after initial composition)
    let nextDelay = spawnStrategy.calculateNextSpawnDelay(wave, spawnCount);
    if (spawnIndex >= spawnQueue.length) {
      // Slower spawning for additional enemies
      nextDelay = Math.max(3000, nextDelay * 2);
    }
    
    // Continue spawning
    spawnInterval = window.setTimeout(spawnNext, nextDelay);
  };

  // Start the first spawn
  spawnNext();
}

export function updateEnemyMovement() {
  const { enemies, towerSlots, damageTower, removeEnemy, addGold, hitWall, damageEnemy, wallLevel } =
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

          // Apply wall collision damage
          const wallDamage = GAME_CONSTANTS.WALL_SYSTEM.WALL_COLLISION_DAMAGE[wallLevel] ?? 0;
          if (wallDamage > 0) {
            damageEnemy(enemy.id, wallDamage);
          }

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
  
  const { currentWave, enemiesKilled, enemiesRequired, towers } = useGameStore.getState();
  
  // CRITICAL FIX: Pending should be true if spawning is still active OR if we haven't reached required kills
  const pending = spawnInterval !== null || enemiesKilled < enemiesRequired;
  
  // Track performance for dynamic difficulty adjustment
  if (!pending && enemies.length === 0) {
    performanceTracker.trackPlayerPerformance(currentWave, performance.now(), towers.length);
    dynamicSpawnController.onWaveComplete(currentWave, towers.length);
  }
  
  waveManager.checkComplete(currentWave, enemies.length, pending, enemiesKilled, enemiesRequired);
}
