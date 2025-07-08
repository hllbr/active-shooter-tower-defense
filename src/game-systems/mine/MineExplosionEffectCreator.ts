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
  
  // 🎆 FIXED: Reduced explosion sizes for better gameplay visibility
  const scaleFactor = 0.5; // Reduce mine explosions to 50% size
  const maxRadius = 40; // Maximum explosion radius to prevent screen coverage

  // 1. Core flash (white) - much smaller and shorter
  effects.push({
    id: `explosion-core-${mine.id}`,
    position: mine.position,
    radius: Math.min(mine.radius * 0.3 * scaleFactor, maxRadius * 0.5),
    color: 'rgba(255, 255, 255, 0.8)', // Reduced opacity
    life: 100, // Shorter duration
    maxLife: 100,
  });

  // 2. Main explosion (orange) - smaller
  effects.push({
    id: `explosion-main-${mine.id}`,
    position: mine.position,
    radius: Math.min(mine.radius * 0.6 * scaleFactor, maxRadius),
    color: 'rgba(255, 150, 0, 0.6)', // Reduced opacity
    life: 250, // Shorter duration
    maxLife: 250,
  });

  // 3. Lingering smoke (dark grey) - much smaller
  effects.push({
    id: `explosion-smoke-${mine.id}`,
    position: mine.position,
    radius: Math.min(mine.radius * 0.4 * scaleFactor, maxRadius * 0.7),
    color: 'rgba(80, 80, 80, 0.4)', // Much more transparent
    life: 400, // Shorter duration
    maxLife: 400,
  });

  return effects;
} 