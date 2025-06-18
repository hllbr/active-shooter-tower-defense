import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/Constants';
import { Enemy } from '../models/gameTypes';
import type { Position, TowerSlot } from '../models/gameTypes';

let spawnInterval: number | null = null;
let spawnTimeout: number | null = null;

function getRandomSpawnPosition(): Position {
  // Spawn from left side of screen
  return {
    x: -GAME_CONSTANTS.ENEMY_SIZE,
    y: Math.random() * (GAME_CONSTANTS.CANVAS_HEIGHT - GAME_CONSTANTS.ENEMY_SIZE)
  };
}

function getNearestTowerSlot(pos: Position): TowerSlot | null {
  const state = useGameStore.getState();
  let nearest: TowerSlot | null = null;
  let minDist = Infinity;

  state.towerSlots.forEach((slot) => {
    if (!slot.unlocked || !slot.tower) return; // Only consider active towers

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

function moveTowardsTarget(enemy: Enemy) {
  if (!enemy.isActive) return;

  const target = getNearestTowerSlot(enemy.position);
  if (!target) return;

  // Calculate direction to target
  const dx = target.x - enemy.position.x;
  const dy = target.y - enemy.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < 1) {
    // Enemy reached the tower
    enemy.isActive = false;
    const store = useGameStore.getState();
    // TODO: Implement damage to tower
    return;
  }

  // Normalize direction and apply speed (scaled for smoother movement)
  const step = enemy.speed * 0.5; // smoother movement
  enemy.position.x += (dx / distance) * step;
  enemy.position.y += (dy / distance) * step;
}

function createEnemy(wave: number): Enemy {
  const currentWave = Math.max(1, wave);
  
  const typeIndex = Math.min(
    Math.floor((currentWave - 1) / 2),
    GAME_CONSTANTS.ENEMY_TYPES.length - 1
  );
  const enemyType = GAME_CONSTANTS.ENEMY_TYPES[typeIndex];
  
  const baseHealth = GAME_CONSTANTS.ENEMY_HEALTH + (currentWave - 1) * GAME_CONSTANTS.ENEMY_HEALTH_INCREASE;
  const health = Math.floor(baseHealth * enemyType.healthMult);

  const colorIndex = Math.min(currentWave - 1, GAME_CONSTANTS.ENEMY_COLORS.length - 1);
  const color = GAME_CONSTANTS.ENEMY_COLORS[colorIndex];
  
  const baseSpeed = GAME_CONSTANTS.ENEMY_SPEED + (currentWave - 1) * 0.2; // Reduced speed scaling
  const speed = baseSpeed * enemyType.speedMult;
  
  const goldValue = Math.floor(GAME_CONSTANTS.ENEMY_GOLD_DROP * enemyType.goldMult);
  const shieldStrength = Math.floor((currentWave * 2) * enemyType.shieldMult);

  const enemy = new Enemy(
    Date.now().toString(),
    getRandomSpawnPosition(),
    GAME_CONSTANTS.ENEMY_SIZE,
    health,
    speed,
    goldValue,
    color,
    enemyType.name,
    shieldStrength
  );

  // Override the default update method with pathfinding
  enemy.update = function() {
    moveTowardsTarget(this);
  };

  return enemy;
}

export function startEnemyWave() {
  stopEnemyWave();
  
  const store = useGameStore.getState();
  const currentWave = Math.max(1, store.currentWave);
  let enemiesToSpawn = currentWave * GAME_CONSTANTS.ENEMY_WAVE_INCREASE + 3;
  
  console.log(`Starting wave ${currentWave} with ${enemiesToSpawn} enemies`);
  
  const spawnEnemy = () => {
    if (enemiesToSpawn <= 0) {
      console.log('Wave completed, stopping spawn');
      stopEnemyWave();
      return;
    }
    const enemy = createEnemy(currentWave);
    store.addEnemy(enemy);
    console.log(`Spawned enemy ${enemy.id}, ${enemiesToSpawn - 1} remaining`);
    enemiesToSpawn--;
  };

  spawnEnemy();
  spawnInterval = window.setInterval(spawnEnemy, GAME_CONSTANTS.ENEMY_SPAWN_RATE);
}

export function stopEnemyWave() {
  if (spawnInterval) {
    clearInterval(spawnInterval);
    spawnInterval = null;
  }
  if (spawnTimeout) {
    clearTimeout(spawnTimeout);
    spawnTimeout = null;
  }
}

export function updateEnemyMovement() {
  const { enemies, towerSlots, damageTower, removeEnemy, addGold, hitWall, isGameOver, isStarted } =
    useGameStore.getState();
  // If there are no towers, end the game and stop enemy movement
  const hasAnyTower = towerSlots.some(s => s.tower);
  if (!hasAnyTower && isStarted && !isGameOver) {
    // End the game
    setTimeout(() => useGameStore.getState().setStarted(false), 0);
    setTimeout(() => useGameStore.getState().resetGame(), 0);
    return;
  }
  enemies.forEach((enemy) => {
    if (enemy.frozenUntil && enemy.frozenUntil > performance.now()) {
      return;
    }
    const targetSlot = getNearestTowerSlot(enemy.position);
    if (!targetSlot) return;
    const dx = targetSlot.x - enemy.position.x;
    const dy = targetSlot.y - enemy.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < (enemy.size + GAME_CONSTANTS.TOWER_SIZE) / 2) {
      // Damage tower if present
      if (targetSlot.tower) {
        const slotIdx = towerSlots.findIndex(
          (s) => s.x === targetSlot.x && s.y === targetSlot.y,
        );
        if (targetSlot.tower.wallStrength > 0) {
          hitWall(slotIdx);
        } else {
          damageTower(slotIdx, 10);
        }
        addGold(enemy.goldValue);
      }
      removeEnemy(enemy.id);
      return;
    }
    // Move toward slot
    const step = enemy.speed * 0.5;
    const moveX = (dx / dist) * step;
    const moveY = (dy / dist) * step;
    enemy.position.x += moveX;
    enemy.position.y += moveY;
  });
}

// Add update method to Enemy prototype
(Enemy as any).prototype.update = function() {
  if (!this.isActive) return;
  
  // Update position based on path and speed
  const step = this.speed * 0.5;
  this.position.x += step;
  this.position.y += step;

  // Check if enemy reached end of path
  if (this.position.x > GAME_CONSTANTS.CANVAS_WIDTH || 
      this.position.y > GAME_CONSTANTS.CANVAS_HEIGHT) {
    this.isActive = false;
    // Handle player damage
  }
}; 