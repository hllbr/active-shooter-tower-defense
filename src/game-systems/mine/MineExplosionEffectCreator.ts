import type { Mine } from '../../models/gameTypes';

export interface ExplosionEffect {
  id: string;
  position: { x: number; y: number };
  radius: number;
  color: string;
  life: number;
  maxLife: number;
}

export function createMineExplosionEffects(mine: Mine): ExplosionEffect[] {
  const effects: ExplosionEffect[] = [];

  // 1. Core flash (white)
  effects.push({
    id: `explosion-core-${mine.id}`,
    position: mine.position,
    radius: mine.radius * 0.6,
    color: 'rgba(255, 255, 255, 1)',
    life: 150,
    maxLife: 150,
  });

  // 2. Main explosion (orange)
  effects.push({
    id: `explosion-main-${mine.id}`,
    position: mine.position,
    radius: mine.radius,
    color: 'rgba(255, 150, 0, 0.9)',
    life: 400,
    maxLife: 400,
  });

  // 3. Lingering smoke (dark grey)
  effects.push({
    id: `explosion-smoke-${mine.id}`,
    position: mine.position,
    radius: mine.radius * 0.8,
    color: 'rgba(80, 80, 80, 0.7)',
    life: 700,
    maxLife: 700,
  });

  return effects;
} 