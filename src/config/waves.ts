import type { WaveEnemyConfig } from '../models/gameTypes';

// ✅ ENHANCED: Complete wave compositions with more enemies and better variety
export const waveCompositions: Record<number, WaveEnemyConfig[]> = {
  // TUTORIAL PHASE (Waves 1-10) - Gentle introduction with more variety
  1: [{ type: 'Basic', count: 3 }], // Increased from 2
  2: [{ type: 'Basic', count: 4 }, { type: 'Scout', count: 1 }], // Added Scout for variety
  3: [{ type: 'Basic', count: 5 }, { type: 'Scout', count: 2 }], // More variety
  4: [{ type: 'Basic', count: 6 }, { type: 'Scout', count: 3 }], // Steady progression
  5: [{ type: 'Basic', count: 7 }, { type: 'Scout', count: 4 }], // Increased from 6
  6: [{ type: 'Scout', count: 12 }, { type: 'Tank', count: 3 }], // Increased Tank count
  7: [{ type: 'Basic', count: 10 }, { type: 'Scout', count: 5 }], // Increased from 8,3
  8: [{ type: 'Ghost', count: 6 }, { type: 'Scout', count: 6 }], // Increased from 5,5
  9: [{ type: 'Basic', count: 8 }, { type: 'Scout', count: 6 }, { type: 'Tank', count: 3 }], // Increased from 6,4,2
  10: [{ type: 'TankBoss', count: 1 }], // First Boss Wave

  // BEGINNER PHASE (Waves 11-20) - More enemies and better variety
  11: [{ type: 'Scout', count: 15 }, { type: 'Ghost', count: 8 }], // Increased from 12,6
  12: [{ type: 'Basic', count: 10 }, { type: 'Tank', count: 6 }, { type: 'Scout', count: 8 }], // Increased from 8,4,6
  13: [{ type: 'Ghost', count: 10 }, { type: 'Tank', count: 4 }], // Increased from 8,3
  14: [{ type: 'Assassin', count: 4 }, { type: 'Scout', count: 12 }], // Increased from 3,10
  15: [{ type: 'Scout', count: 18 }, { type: 'Tank', count: 7 }, { type: 'Ghost', count: 6 }], // Increased from 15,5,5
  16: [{ type: 'Assassin', count: 6 }, { type: 'Ghost', count: 10 }], // Increased from 5,8
  17: [{ type: 'Berserker', count: 3 }, { type: 'Tank', count: 8 }], // Increased from 2,6
  18: [{ type: 'Scout', count: 22 }, { type: 'Assassin', count: 5 }], // Increased from 20,4
  19: [{ type: 'Shaman', count: 4 }, { type: 'Tank', count: 10 }], // Increased from 3,8
  20: [{ type: 'GhostBoss', count: 1 }], // Second Boss Wave

  // INTERMEDIATE PHASE (Waves 21-40) - Significant enemy increases
  21: [{ type: 'Archer', count: 8 }, { type: 'Scout', count: 15 }], // Increased from 6,12
  22: [{ type: 'Berserker', count: 6 }, { type: 'Assassin', count: 8 }], // Increased from 4,6
  23: [{ type: 'Ghost', count: 15 }, { type: 'Shaman', count: 6 }], // Increased from 12,4
  24: [{ type: 'Tank', count: 12 }, { type: 'Archer', count: 10 }], // Increased from 10,8
  25: [{ type: 'Assassin', count: 10 }, { type: 'Berserker', count: 8 }, { type: 'Scout', count: 18 }], // Increased from 8,6,15
  26: [{ type: 'Shaman', count: 8 }, { type: 'Ghost', count: 18 }], // Increased from 6,15
  27: [{ type: 'Archer', count: 15 }, { type: 'Tank', count: 10 }], // Increased from 12,8
  28: [{ type: 'Berserker', count: 10 }, { type: 'Assassin', count: 12 }], // Increased from 8,10
  29: [{ type: 'Demon', count: 4 }, { type: 'Berserker', count: 10 }], // Increased from 3,8
  30: [{ type: 'DemonLord', count: 1 }], // Third Boss Wave

  31: [{ type: 'Wraith', count: 10 }, { type: 'Demon', count: 6 }], // Increased from 8,4
  32: [{ type: 'Golem', count: 4 }, { type: 'Archer', count: 18 }], // Increased from 3,15
  33: [{ type: 'Assassin', count: 15 }, { type: 'Demon', count: 8 }], // Increased from 12,6
  34: [{ type: 'Shaman', count: 10 }, { type: 'Berserker', count: 12 }], // Increased from 8,10
  35: [{ type: 'Phoenix', count: 5 }, { type: 'Demon', count: 10 }], // Increased from 4,8
  36: [{ type: 'Wraith', count: 15 }, { type: 'Golem', count: 6 }], // Increased from 12,5
  37: [{ type: 'Archer', count: 22 }, { type: 'Phoenix', count: 4 }], // Increased from 20,3
  38: [{ type: 'Demon', count: 12 }, { type: 'Wraith', count: 10 }], // Increased from 10,8
  39: [{ type: 'Golem', count: 8 }, { type: 'Phoenix', count: 7 }], // Increased from 6,6
  40: [{ type: 'DragonKing', count: 1 }], // Fourth Boss Wave

  // ADVANCED PHASE (Waves 41-60) - Major enemy increases
  41: [{ type: 'Phoenix', count: 10 }, { type: 'Demon', count: 15 }], // Increased from 8,12
  42: [{ type: 'Wraith', count: 18 }, { type: 'Golem', count: 10 }], // Increased from 15,8
  43: [{ type: 'Demon', count: 18 }, { type: 'Phoenix', count: 8 }], // Increased from 15,6
  44: [{ type: 'Golem', count: 12 }, { type: 'Wraith', count: 15 }], // Increased from 10,12
  45: [{ type: 'Phoenix', count: 12 }, { type: 'Demon', count: 18 }], // Increased from 10,15
  46: [{ type: 'Wraith', count: 22 }, { type: 'Golem', count: 10 }], // Increased from 20,8
  47: [{ type: 'Demon', count: 20 }, { type: 'Phoenix', count: 10 }], // Increased from 18,8
  48: [{ type: 'Golem', count: 15 }, { type: 'Wraith', count: 18 }], // Increased from 12,15
  49: [{ type: 'Phoenix', count: 15 }, { type: 'Demon', count: 20 }], // Increased from 12,18
  50: [{ type: 'LichKing', count: 1 }], // Fifth Boss Wave

  // NIGHTMARE PHASE (Waves 51-70) - Massive enemy waves
  51: [{ type: 'Demon', count: 25 }, { type: 'Phoenix', count: 12 }], // Increased from 20,10
  52: [{ type: 'Wraith', count: 28 }, { type: 'Golem', count: 12 }], // Increased from 25,10
  53: [{ type: 'Phoenix', count: 18 }, { type: 'Demon', count: 22 }], // Increased from 15,20
  54: [{ type: 'Golem', count: 18 }, { type: 'Wraith', count: 22 }], // Increased from 15,20
  55: [{ type: 'Demon', count: 28 }, { type: 'Phoenix', count: 15 }], // Increased from 25,12
  56: [{ type: 'Wraith', count: 32 }, { type: 'Golem', count: 15 }], // Increased from 30,12
  57: [{ type: 'Phoenix', count: 20 }, { type: 'Demon', count: 28 }], // Increased from 18,25
  58: [{ type: 'Golem', count: 20 }, { type: 'Wraith', count: 28 }], // Increased from 18,25
  59: [{ type: 'Demon', count: 32 }, { type: 'Phoenix', count: 18 }], // Increased from 30,15
  60: [{ type: 'TitanLord', count: 1 }], // Sixth Boss Wave

  // ULTIMATE PHASE (Waves 61-80) - Epic enemy waves
  61: [{ type: 'Phoenix', count: 25 }, { type: 'Demon', count: 32 }], // Increased from 20,30
  62: [{ type: 'Wraith', count: 35 }, { type: 'Golem', count: 22 }], // Increased from 35,20
  63: [{ type: 'Demon', count: 35 }, { type: 'Phoenix', count: 20 }], // Increased from 35,18
  64: [{ type: 'Golem', count: 28 }, { type: 'Wraith', count: 32 }], // Increased from 25,30
  65: [{ type: 'Phoenix', count: 28 }, { type: 'Demon', count: 35 }], // Increased from 25,35
  66: [{ type: 'Wraith', count: 40 }, { type: 'Golem', count: 28 }], // Increased from 40,25
  67: [{ type: 'Demon', count: 40 }, { type: 'Phoenix', count: 22 }], // Increased from 40,20
  68: [{ type: 'Golem', count: 32 }, { type: 'Wraith', count: 35 }], // Increased from 30,35
  69: [{ type: 'Phoenix', count: 32 }, { type: 'Demon', count: 40 }], // Increased from 30,40
  70: [{ type: 'VoidGod', count: 1 }], // Seventh Boss Wave

  // GOD TIER PHASE (Waves 71-90) - Legendary enemy waves
  71: [{ type: 'Demon', count: 45 }, { type: 'Phoenix', count: 28 }], // Increased from 45,25
  72: [{ type: 'Wraith', count: 50 }, { type: 'Golem', count: 32 }], // Increased from 50,30
  73: [{ type: 'Phoenix', count: 35 }, { type: 'Demon', count: 45 }], // Increased from 35,45
  74: [{ type: 'Golem', count: 35 }, { type: 'Wraith', count: 40 }], // Increased from 35,40
  75: [{ type: 'Demon', count: 50 }, { type: 'Phoenix', count: 32 }], // Increased from 50,30
  76: [{ type: 'Wraith', count: 55 }, { type: 'Golem', count: 35 }], // Increased from 55,35
  77: [{ type: 'Phoenix', count: 40 }, { type: 'Demon', count: 50 }], // Increased from 40,50
  78: [{ type: 'Golem', count: 40 }, { type: 'Wraith', count: 45 }], // Increased from 40,45
  79: [{ type: 'Demon', count: 55 }, { type: 'Phoenix', count: 35 }], // Increased from 55,35
  80: [{ type: 'VoidGod', count: 1 }, { type: 'TitanLord', count: 1 }], // Dual Boss Wave

  // UNIVERSE ENDING PHASE (Waves 81-100) - Apocalyptic enemy waves
  81: [{ type: 'Phoenix', count: 45 }, { type: 'Demon', count: 55 }], // Increased from 45,55
  82: [{ type: 'Wraith', count: 60 }, { type: 'Golem', count: 40 }], // Increased from 60,40
  83: [{ type: 'Demon', count: 60 }, { type: 'Phoenix', count: 40 }], // Increased from 60,40
  84: [{ type: 'Golem', count: 45 }, { type: 'Wraith', count: 50 }], // Increased from 45,50
  85: [{ type: 'Phoenix', count: 50 }, { type: 'Demon', count: 60 }], // Increased from 50,60
  86: [{ type: 'Wraith', count: 65 }, { type: 'Golem', count: 45 }], // Increased from 65,45
  87: [{ type: 'Demon', count: 65 }, { type: 'Phoenix', count: 45 }], // Increased from 65,45
  88: [{ type: 'Golem', count: 50 }, { type: 'Wraith', count: 55 }], // Increased from 50,55
  89: [{ type: 'Phoenix', count: 55 }, { type: 'Demon', count: 65 }], // Increased from 55,65
  90: [{ type: 'UltimateGod', count: 1 }, { type: 'VoidGod', count: 1 }], // Pre-Final Boss

  // THE FINAL COUNTDOWN (Waves 91-100) - Ultimate enemy waves
  91: [{ type: 'Demon', count: 70 }, { type: 'Phoenix', count: 50 }], // Increased from 70,50
  92: [{ type: 'Wraith', count: 75 }, { type: 'Golem', count: 50 }], // Increased from 75,50
  93: [{ type: 'Phoenix', count: 60 }, { type: 'Demon', count: 70 }], // Increased from 60,70
  94: [{ type: 'Golem', count: 55 }, { type: 'Wraith', count: 60 }], // Increased from 55,60
  95: [{ type: 'Demon', count: 75 }, { type: 'Phoenix', count: 55 }], // Increased from 75,55
  96: [{ type: 'Wraith', count: 80 }, { type: 'Golem', count: 55 }], // Increased from 80,55
  97: [{ type: 'Phoenix', count: 65 }, { type: 'Demon', count: 75 }], // Increased from 65,75
  98: [{ type: 'Golem', count: 60 }, { type: 'Wraith', count: 65 }], // Increased from 60,65
  99: [{ type: 'Demon', count: 80 }, { type: 'Phoenix', count: 60 }], // Increased from 80,60
  100: [{ type: 'UltimateGod', count: 1 }], // THE FINAL BOSS
};

// ✅ ENHANCED: Boss wave indicators with more boss waves
export const BOSS_WAVES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

// ✅ NEW: Mini-boss waves for additional challenge
export const MINI_BOSS_WAVES = [15, 25, 35, 45, 55, 65, 75, 85, 95];

// ✅ NEW: Special event waves for mini-events
export const SPECIAL_EVENT_WAVES = [7, 13, 17, 23, 29, 33, 37, 41, 47, 53, 59, 63, 67, 71, 77, 83, 87, 91, 95, 99];

// Helper function to check if a wave is a boss wave
export function isBossWave(wave: number): boolean {
  return BOSS_WAVES.includes(wave);
}

// ✅ NEW: Helper function to check if a wave is a mini-boss wave
export function isMiniBossWave(wave: number): boolean {
  return MINI_BOSS_WAVES.includes(wave);
}

// ✅ NEW: Helper function to check if a wave is a special event wave
export function isSpecialEventWave(wave: number): boolean {
  return SPECIAL_EVENT_WAVES.includes(wave);
}

// ✅ ENHANCED: Helper function to get wave difficulty with smoother progression
export function getWaveDifficulty(wave: number): string {
  if (wave <= 10) return 'Tutorial';
  if (wave <= 20) return 'Beginner';
  if (wave <= 40) return 'Intermediate';
  if (wave <= 60) return 'Advanced';
  if (wave <= 80) return 'Nightmare';
  if (wave <= 99) return 'God Tier';
  return 'Universe Ending';
}

// ✅ ENHANCED: Helper function to get enemy count for wave with better scaling
export function getWaveEnemyCount(wave: number): number {
  const composition = waveCompositions[wave];
  if (!composition) return 0;
  return composition.reduce((sum, enemy) => sum + enemy.count, 0);
}

// ✅ NEW: Helper function to get wave complexity score
export function getWaveComplexity(wave: number): number {
  const composition = waveCompositions[wave];
  if (!composition) return 0;
  
  // Calculate complexity based on enemy types and counts
  let complexity = 0;
  
  for (const enemy of composition) {
    // Base complexity from enemy count
    complexity += enemy.count;
    
    // Additional complexity from enemy type
    switch (enemy.type) {
      case 'Basic':
        complexity += enemy.count * 0.5;
        break;
      case 'Scout':
        complexity += enemy.count * 1.0;
        break;
      case 'Tank':
        complexity += enemy.count * 1.5;
        break;
      case 'Ghost':
        complexity += enemy.count * 1.2;
        break;
      case 'Assassin':
        complexity += enemy.count * 1.8;
        break;
      case 'Berserker':
        complexity += enemy.count * 2.0;
        break;
      case 'Shaman':
        complexity += enemy.count * 1.6;
        break;
      case 'Archer':
        complexity += enemy.count * 1.4;
        break;
      case 'Demon':
        complexity += enemy.count * 2.5;
        break;
      case 'Wraith':
        complexity += enemy.count * 2.2;
        break;
      case 'Golem':
        complexity += enemy.count * 2.8;
        break;
      case 'Phoenix':
        complexity += enemy.count * 2.3;
        break;
      default:
        // Boss enemies get high complexity
        if (enemy.type.includes('Boss') || enemy.type.includes('God') || enemy.type.includes('Lord')) {
          complexity += enemy.count * 10;
        }
        break;
    }
  }
  
  return complexity;
}

// ✅ NEW: Helper function to get wave preparation time based on complexity
export function getWavePrepTime(wave: number): number {
  const complexity = getWaveComplexity(wave);
  const baseTime = 30000; // 30 seconds base
  
  // Adjust prep time based on complexity
  if (complexity <= 20) return baseTime + 15000; // Extra time for simple waves
  if (complexity <= 50) return baseTime + 10000; // Moderate time for medium waves
  if (complexity <= 100) return baseTime + 5000; // Standard time for complex waves
  if (complexity <= 200) return baseTime; // Base time for very complex waves
  return Math.max(15000, baseTime - 10000); // Minimum time for extremely complex waves
}

// ✅ NEW: Helper function to get wave spawn rate based on complexity
export function getWaveSpawnRate(wave: number): number {
  const complexity = getWaveComplexity(wave);
  const baseRate = 2000; // 2 seconds base
  
  // Adjust spawn rate based on complexity
  if (complexity <= 20) return baseRate + 1000; // Slower for simple waves
  if (complexity <= 50) return baseRate + 500; // Moderate for medium waves
  if (complexity <= 100) return baseRate; // Standard for complex waves
  if (complexity <= 200) return baseRate - 500; // Faster for very complex waves
  return Math.max(500, baseRate - 1000); // Very fast for extremely complex waves
} 