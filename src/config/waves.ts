import type { WaveEnemyConfig } from '../models/gameTypes';

export const waveCompositions: Record<number, WaveEnemyConfig[]> = {
  6: [ { type: 'Scout', count: 10 }, { type: 'Tank', count: 2 } ],
  8: [ { type: 'Ghost', count: 5 }, { type: 'Scout', count: 5 } ],
};
