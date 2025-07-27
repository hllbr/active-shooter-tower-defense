import type { WaveModifier } from '../models/gameTypes';

export const waveRules: Record<number, WaveModifier> = {
  5: { speedMultiplier: 1.3 },
  8: { disableTowerType: 'sniper' },
  10: { bonusEnemies: true },
  15: { speedMultiplier: 1.4 },
  20: { bonusEnemies: true },
  25: { towerRangeReduced: true },
  30: { speedMultiplier: 1.5 },
  40: { bonusEnemies: true },
  50: { speedMultiplier: 1.6 },
} as const;

/**
 * Strategic counter-play for each wave modifier:
 * - speedMultiplier: Upgrade fire rate, use slowing effects
 * - bonusEnemies: Focus on damage upgrades, area effects  
 * - towerRangeReduced: Build more towers, strategic positioning
 * - disableTowerType: Adapt tower strategy, use other types
 */
