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
  
  // ✅ NEW: Enhanced mine explosion effects with better visual impact
  const scaleFactor = 0.7; // Slightly larger for better visibility
  const maxRadius = 50; // Increased maximum radius

  // 1. Core flash (white) - bright initial flash
  effects.push({
    id: `explosion-core-${mine.id}`,
    position: mine.position,
    radius: Math.min(mine.radius * 0.4 * scaleFactor, maxRadius * 0.6),
    color: 'rgba(255, 255, 255, 0.9)', // Brighter flash
    life: 150, // Slightly longer for better visibility
    maxLife: 150,
  });

  // 2. Main explosion (orange/red) - more vibrant
  effects.push({
    id: `explosion-main-${mine.id}`,
    position: mine.position,
    radius: Math.min(mine.radius * 0.8 * scaleFactor, maxRadius),
    color: 'rgba(255, 100, 0, 0.8)', // More vibrant orange
    life: 300, // Longer duration
    maxLife: 300,
  });

  // 3. Lingering smoke (dark grey) - more visible
  effects.push({
    id: `explosion-smoke-${mine.id}`,
    position: mine.position,
    radius: Math.min(mine.radius * 0.5 * scaleFactor, maxRadius * 0.8),
    color: 'rgba(60, 60, 60, 0.6)', // More visible smoke
    life: 500, // Longer duration
    maxLife: 500,
  });

  // ✅ NEW: Add enhanced particle effects
  setTimeout(() => {
    import('../effects-system/EnhancedVisualEffectsManager').then(({ enhancedVisualEffectsManager }) => {
      enhancedVisualEffectsManager.createMineExplosionEffect(
        mine.position.x,
        mine.position.y,
        mine.mineSubtype || 'standard',
        mine.radius
      );
    });
  }, 0);

  return effects;
} 