import type { WaveModifier } from '../models/gameTypes';

export const waveRules: Record<number, WaveModifier> = {
  5: { speedMultiplier: 1.5 },
  8: { disableTowerType: 'sniper' },
  10: { bonusEnemies: true, towerRangeReduced: true },
};
