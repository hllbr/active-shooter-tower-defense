import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/Constants';
import type { Position } from '../models/gameTypes';

let spawnInterval: number | null = null;

function getRandomSpawnPosition() {
  // Spawn enemies randomly along the bottom edge
  const x = Math.random() * (window.innerWidth - GAME_CONSTANTS.ENEMY_SIZE) + GAME_CONSTANTS.ENEMY_SIZE / 2;
  const y = window.innerHeight - GAME_CONSTANTS.ENEMY_SIZE / 2;
  return { x, y };
}

function getNearestSlot(pos: Position) {
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

// ... rest of the file ... 