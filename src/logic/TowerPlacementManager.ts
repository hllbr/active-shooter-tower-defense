import { GAME_CONSTANTS } from '../utils/Constants';
import type { TowerSlot } from '../models/gameTypes';

type TileType = 'fixed' | 'dynamic';

type Position = { x: number; y: number };

function distance(a: Position, b: Position) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function randomPosition(width: number, height: number) {
  const pad = GAME_CONSTANTS.ROAD_PADDING;
  return {
    x: Math.random() * (width - pad * 2) + pad,
    y: Math.random() * (height - pad * 2) + pad,
  };
}

function createDynamicTiles(count: number, existing: TowerSlot[]): TowerSlot[] {
  const width = GAME_CONSTANTS.CANVAS_WIDTH;
  const height = GAME_CONSTANTS.CANVAS_HEIGHT;
  const tiles: TowerSlot[] = [];

  while (tiles.length < count) {
    const pos = randomPosition(width, height);
    const tooClose = [...existing, ...tiles].some(
      t => distance(pos, { x: t.x, y: t.y }) < GAME_CONSTANTS.BUILD_TILE_DISTANCE,
    );
    if (tooClose) continue;
    tiles.push({ x: pos.x, y: pos.y, unlocked: true, type: 'dynamic', tower: undefined });
  }
  return tiles;
}

function createStaticTiles(count: number, existing: TowerSlot[]): TowerSlot[] {
  const used = new Set(existing.map(s => `${s.x},${s.y}`));
  const candidates = GAME_CONSTANTS.TOWER_SLOTS.filter(p => !used.has(`${p.x},${p.y}`));
  return candidates.slice(0, count).map(p => ({
    x: p.x,
    y: p.y,
    unlocked: true,
    type: 'fixed' as TileType,
    tower: undefined,
  }));
}

export function updateWaveTiles(wave: number, current: TowerSlot[]): TowerSlot[] {
  const persisted: TowerSlot[] = [];
  for (const slot of current) {
    if (slot.tower) {
      persisted.push({ ...slot, type: 'fixed' });
    } else if (slot.type === 'fixed') {
      persisted.push(slot);
    }
    // dynamic slots without towers are discarded
  }

  const TOTAL_NEW = 5;
  const newStatic = createStaticTiles(TOTAL_NEW, persisted);
  const remaining = TOTAL_NEW - newStatic.length;
  const newDynamic = remaining > 0 ? createDynamicTiles(remaining, [...persisted, ...newStatic]) : [];

  return [...persisted, ...newStatic, ...newDynamic];
}
