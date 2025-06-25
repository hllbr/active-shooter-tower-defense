import type { WaveEnemyConfig } from '../models/gameTypes';

// Complete wave compositions for all 100 waves - FULL GAME CONTENT
export const waveCompositions: Record<number, WaveEnemyConfig[]> = {
  // TUTORIAL PHASE (Waves 1-10)
  1: [{ type: 'Basic', count: 2 }],
  2: [{ type: 'Basic', count: 3 }],
  3: [{ type: 'Basic', count: 4 }],
  4: [{ type: 'Basic', count: 5 }],
  5: [{ type: 'Basic', count: 6 }],
  6: [{ type: 'Scout', count: 10 }, { type: 'Tank', count: 2 }],
  7: [{ type: 'Basic', count: 8 }, { type: 'Scout', count: 3 }],
  8: [{ type: 'Ghost', count: 5 }, { type: 'Scout', count: 5 }],
  9: [{ type: 'Basic', count: 6 }, { type: 'Scout', count: 4 }, { type: 'Tank', count: 2 }],
  10: [{ type: 'TankBoss', count: 1 }], // First Boss Wave

  // BEGINNER PHASE (Waves 11-20)
  11: [{ type: 'Scout', count: 12 }, { type: 'Ghost', count: 6 }],
  12: [{ type: 'Basic', count: 8 }, { type: 'Tank', count: 4 }, { type: 'Scout', count: 6 }],
  13: [{ type: 'Ghost', count: 8 }, { type: 'Tank', count: 3 }],
  14: [{ type: 'Assassin', count: 3 }, { type: 'Scout', count: 10 }], // Assassin Introduction
  15: [{ type: 'Scout', count: 15 }, { type: 'Tank', count: 5 }, { type: 'Ghost', count: 5 }],
  16: [{ type: 'Assassin', count: 5 }, { type: 'Ghost', count: 8 }],
  17: [{ type: 'Berserker', count: 2 }, { type: 'Tank', count: 6 }], // Berserker Introduction
  18: [{ type: 'Scout', count: 20 }, { type: 'Assassin', count: 4 }],
  19: [{ type: 'Shaman', count: 3 }, { type: 'Tank', count: 8 }], // Shaman Introduction
  20: [{ type: 'GhostBoss', count: 1 }], // Second Boss Wave

  // INTERMEDIATE PHASE (Waves 21-40)
  21: [{ type: 'Archer', count: 6 }, { type: 'Scout', count: 12 }], // Archer Introduction
  22: [{ type: 'Berserker', count: 4 }, { type: 'Assassin', count: 6 }],
  23: [{ type: 'Ghost', count: 12 }, { type: 'Shaman', count: 4 }],
  24: [{ type: 'Tank', count: 10 }, { type: 'Archer', count: 8 }],
  25: [{ type: 'Assassin', count: 8 }, { type: 'Berserker', count: 6 }, { type: 'Scout', count: 15 }],
  26: [{ type: 'Shaman', count: 6 }, { type: 'Ghost', count: 15 }],
  27: [{ type: 'Archer', count: 12 }, { type: 'Tank', count: 8 }],
  28: [{ type: 'Berserker', count: 8 }, { type: 'Assassin', count: 10 }],
  29: [{ type: 'Demon', count: 3 }, { type: 'Berserker', count: 8 }], // Demon Introduction
  30: [{ type: 'DemonLord', count: 1 }], // Third Boss Wave

  31: [{ type: 'Wraith', count: 8 }, { type: 'Demon', count: 4 }], // Wraith Introduction
  32: [{ type: 'Golem', count: 3 }, { type: 'Archer', count: 15 }], // Golem Introduction
  33: [{ type: 'Assassin', count: 12 }, { type: 'Demon', count: 6 }],
  34: [{ type: 'Shaman', count: 8 }, { type: 'Berserker', count: 10 }],
  35: [{ type: 'Phoenix', count: 4 }, { type: 'Demon', count: 8 }], // Phoenix Introduction
  36: [{ type: 'Wraith', count: 12 }, { type: 'Golem', count: 5 }],
  37: [{ type: 'Archer', count: 20 }, { type: 'Phoenix', count: 3 }],
  38: [{ type: 'Demon', count: 10 }, { type: 'Wraith', count: 8 }],
  39: [{ type: 'Golem', count: 6 }, { type: 'Phoenix', count: 6 }],
  40: [{ type: 'DragonKing', count: 1 }], // Fourth Boss Wave

  // ADVANCED PHASE (Waves 41-60)
  41: [{ type: 'Phoenix', count: 8 }, { type: 'Demon', count: 12 }],
  42: [{ type: 'Wraith', count: 15 }, { type: 'Golem', count: 8 }],
  43: [{ type: 'Demon', count: 15 }, { type: 'Phoenix', count: 6 }],
  44: [{ type: 'Golem', count: 10 }, { type: 'Wraith', count: 12 }],
  45: [{ type: 'Phoenix', count: 10 }, { type: 'Demon', count: 15 }],
  46: [{ type: 'Wraith', count: 20 }, { type: 'Golem', count: 8 }],
  47: [{ type: 'Demon', count: 18 }, { type: 'Phoenix', count: 8 }],
  48: [{ type: 'Golem', count: 12 }, { type: 'Wraith', count: 15 }],
  49: [{ type: 'Phoenix', count: 12 }, { type: 'Demon', count: 18 }],
  50: [{ type: 'LichKing', count: 1 }], // Fifth Boss Wave

  // NIGHTMARE PHASE (Waves 51-70)
  51: [{ type: 'Demon', count: 20 }, { type: 'Phoenix', count: 10 }],
  52: [{ type: 'Wraith', count: 25 }, { type: 'Golem', count: 10 }],
  53: [{ type: 'Phoenix', count: 15 }, { type: 'Demon', count: 20 }],
  54: [{ type: 'Golem', count: 15 }, { type: 'Wraith', count: 20 }],
  55: [{ type: 'Demon', count: 25 }, { type: 'Phoenix', count: 12 }],
  56: [{ type: 'Wraith', count: 30 }, { type: 'Golem', count: 12 }],
  57: [{ type: 'Phoenix', count: 18 }, { type: 'Demon', count: 25 }],
  58: [{ type: 'Golem', count: 18 }, { type: 'Wraith', count: 25 }],
  59: [{ type: 'Demon', count: 30 }, { type: 'Phoenix', count: 15 }],
  60: [{ type: 'TitanLord', count: 1 }], // Sixth Boss Wave

  // ULTIMATE PHASE (Waves 61-80)
  61: [{ type: 'Phoenix', count: 20 }, { type: 'Demon', count: 30 }],
  62: [{ type: 'Wraith', count: 35 }, { type: 'Golem', count: 20 }],
  63: [{ type: 'Demon', count: 35 }, { type: 'Phoenix', count: 18 }],
  64: [{ type: 'Golem', count: 25 }, { type: 'Wraith', count: 30 }],
  65: [{ type: 'Phoenix', count: 25 }, { type: 'Demon', count: 35 }],
  66: [{ type: 'Wraith', count: 40 }, { type: 'Golem', count: 25 }],
  67: [{ type: 'Demon', count: 40 }, { type: 'Phoenix', count: 20 }],
  68: [{ type: 'Golem', count: 30 }, { type: 'Wraith', count: 35 }],
  69: [{ type: 'Phoenix', count: 30 }, { type: 'Demon', count: 40 }],
  70: [{ type: 'VoidGod', count: 1 }], // Seventh Boss Wave

  // GOD TIER PHASE (Waves 71-90)
  71: [{ type: 'Demon', count: 45 }, { type: 'Phoenix', count: 25 }],
  72: [{ type: 'Wraith', count: 50 }, { type: 'Golem', count: 30 }],
  73: [{ type: 'Phoenix', count: 35 }, { type: 'Demon', count: 45 }],
  74: [{ type: 'Golem', count: 35 }, { type: 'Wraith', count: 40 }],
  75: [{ type: 'Demon', count: 50 }, { type: 'Phoenix', count: 30 }],
  76: [{ type: 'Wraith', count: 55 }, { type: 'Golem', count: 35 }],
  77: [{ type: 'Phoenix', count: 40 }, { type: 'Demon', count: 50 }],
  78: [{ type: 'Golem', count: 40 }, { type: 'Wraith', count: 45 }],
  79: [{ type: 'Demon', count: 55 }, { type: 'Phoenix', count: 35 }],
  80: [{ type: 'VoidGod', count: 1 }, { type: 'TitanLord', count: 1 }], // Dual Boss Wave

  // UNIVERSE ENDING PHASE (Waves 81-100)
  81: [{ type: 'Phoenix', count: 45 }, { type: 'Demon', count: 55 }],
  82: [{ type: 'Wraith', count: 60 }, { type: 'Golem', count: 40 }],
  83: [{ type: 'Demon', count: 60 }, { type: 'Phoenix', count: 40 }],
  84: [{ type: 'Golem', count: 45 }, { type: 'Wraith', count: 50 }],
  85: [{ type: 'Phoenix', count: 50 }, { type: 'Demon', count: 60 }],
  86: [{ type: 'Wraith', count: 65 }, { type: 'Golem', count: 45 }],
  87: [{ type: 'Demon', count: 65 }, { type: 'Phoenix', count: 45 }],
  88: [{ type: 'Golem', count: 50 }, { type: 'Wraith', count: 55 }],
  89: [{ type: 'Phoenix', count: 55 }, { type: 'Demon', count: 65 }],
  90: [{ type: 'UltimateGod', count: 1 }, { type: 'VoidGod', count: 1 }], // Pre-Final Boss

  // THE FINAL COUNTDOWN (Waves 91-100)
  91: [{ type: 'Demon', count: 70 }, { type: 'Phoenix', count: 50 }],
  92: [{ type: 'Wraith', count: 75 }, { type: 'Golem', count: 50 }],
  93: [{ type: 'Phoenix', count: 60 }, { type: 'Demon', count: 70 }],
  94: [{ type: 'Golem', count: 55 }, { type: 'Wraith', count: 60 }],
  95: [{ type: 'Demon', count: 75 }, { type: 'Phoenix', count: 55 }],
  96: [{ type: 'Wraith', count: 80 }, { type: 'Golem', count: 55 }],
  97: [{ type: 'Phoenix', count: 65 }, { type: 'Demon', count: 75 }],
  98: [{ type: 'Golem', count: 60 }, { type: 'Wraith', count: 65 }],
  99: [{ type: 'Demon', count: 80 }, { type: 'Phoenix', count: 60 }],
  100: [{ type: 'UltimateGod', count: 1 }], // THE FINAL BOSS
};

// Boss wave indicators
export const BOSS_WAVES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

// Helper function to check if a wave is a boss wave
export function isBossWave(wave: number): boolean {
  return BOSS_WAVES.includes(wave);
}

// Helper function to get wave difficulty
export function getWaveDifficulty(wave: number): string {
  if (wave <= 10) return 'Tutorial';
  if (wave <= 20) return 'Beginner';
  if (wave <= 40) return 'Intermediate';
  if (wave <= 60) return 'Advanced';
  if (wave <= 80) return 'Nightmare';
  if (wave <= 99) return 'God Tier';
  return 'Universe Ending';
}

// Helper function to get enemy count for wave
export function getWaveEnemyCount(wave: number): number {
  const composition = waveCompositions[wave];
  if (!composition) return 0;
  return composition.reduce((sum, enemy) => sum + enemy.count, 0);
} 