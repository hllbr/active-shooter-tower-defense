export type TileType = 'fixed' | 'dynamic' | 'temporary';

import { GAME_CONSTANTS } from '../utils/Constants';
import type { TowerSlot } from '../models/gameTypes';

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function randomPosition(width: number, height: number) {
  const padding = GAME_CONSTANTS.BUILD_TILE_DISTANCE;
  return {
    x: Math.random() * (width - padding * 2) + padding,
    y: Math.random() * (height - padding * 2) + padding,
  };
}

function createTiles(count: number, type: TileType, existing: TowerSlot[]): TowerSlot[] {
  const tiles: TowerSlot[] = [];
  const width = window.innerWidth;
  const height = window.innerHeight;

  while (tiles.length < count) {
    const pos = randomPosition(width, height);
    const tooClose = [...existing, ...tiles].some(t =>
      distance(pos, { x: t.x, y: t.y }) < GAME_CONSTANTS.BUILD_TILE_DISTANCE
    );
    if (tooClose) continue;
    tiles.push({ x: pos.x, y: pos.y, unlocked: true, type, tower: undefined });
  }
  return tiles;
}

export function updateWaveTiles(wave: number, current: TowerSlot[]): TowerSlot[] {
  // Persist existing towers and any fixed slots. Dynamic/temporary slots without
  // towers are removed each wave so they can be regenerated.
  const persisted: TowerSlot[] = [];
  for (const slot of current) {
    if (slot.tower) {
      // Once a tower is built the slot effectively becomes fixed
      persisted.push({ ...slot, type: 'fixed' });
    } else if (slot.type === 'fixed') {
      persisted.push(slot);
    }
  }

  const baseCount = wave >= 21 ? 3 : 5;
  let newTiles: TowerSlot[] = [];

  if (wave <= 5) {
    newTiles = createTiles(baseCount, 'fixed', persisted);
  } else if (wave <= 10) {
    newTiles = [
      ...createTiles(3, 'fixed', persisted),
      ...createTiles(baseCount - 3, 'dynamic', persisted),
    ];
  } else if (wave <= 15) {
    newTiles = [
      ...createTiles(3, 'fixed', persisted),
      ...createTiles(baseCount - 3, 'dynamic', persisted),
    ];
  } else if (wave <= 20) {
    newTiles = [
      ...createTiles(2, 'fixed', persisted),
      ...createTiles(baseCount - 2, 'temporary', persisted),
    ];
  } else {
    newTiles = [
      ...createTiles(1, 'fixed', persisted),
      ...createTiles(baseCount - 1, 'dynamic', persisted),
    ];
  }

  return [...persisted, ...newTiles];
}
