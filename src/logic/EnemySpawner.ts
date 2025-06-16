import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/Constants';

let spawnInterval: number | null = null;

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

function getNearestSlot(pos) {
  const slots = useGameStore.getState().towerSlots.filter(s => s.unlocked);
  let minDist = Infinity;
  let nearest = slots[0];
  slots.forEach(slot => {
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

function createEnemy(wave: number) {
  const id = `${Date.now()}-${Math.random()}`;
  const health = GAME_CONSTANTS.ENEMY_HEALTH + (wave - 1) * GAME_CONSTANTS.ENEMY_HEALTH_INCREASE;
  const color = GAME_CONSTANTS.ENEMY_COLORS[(wave - 1) % GAME_CONSTANTS.ENEMY_COLORS.length];
  return {
    id,
    position: getRandomSpawnPosition(),
    size: GAME_CONSTANTS.ENEMY_SIZE,
    isActive: true,
    health,
    maxHealth: health,
    speed: GAME_CONSTANTS.ENEMY_SPEED + (wave - 1) * 5,
    goldValue: GAME_CONSTANTS.ENEMY_GOLD_DROP,
    color,
  };
}

export function startEnemyWave() {
  const { currentWave, addEnemy } = useGameStore.getState();
  let enemiesToSpawn = currentWave * GAME_CONSTANTS.ENEMY_WAVE_INCREASE + 3;
  if (spawnInterval) clearInterval(spawnInterval);
  spawnInterval = window.setInterval(() => {
    if (enemiesToSpawn <= 0) {
      clearInterval(spawnInterval!);
      return;
    }
    const enemy = createEnemy(currentWave);
    addEnemy(enemy);
    enemiesToSpawn--;
  }, GAME_CONSTANTS.ENEMY_SPAWN_RATE);
}

export function updateEnemyMovement() {
  const { enemies, towerSlots, damageTower, removeEnemy, addGold } =
    useGameStore.getState();
  enemies.forEach((enemy) => {
    const targetSlot = getNearestSlot(enemy.position);
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
        damageTower(slotIdx, 10);
      }
      addGold(enemy.goldValue);
      removeEnemy(enemy.id);
      return;
    }
    // Move toward slot
    const moveX = (dx / dist) * enemy.speed * 0.016;
    const moveY = (dy / dist) * enemy.speed * 0.016;
    enemy.position.x += moveX;
    enemy.position.y += moveY;
  });
} 