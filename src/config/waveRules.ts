import type { WaveModifier } from '../models/gameTypes';

// ✅ ENHANCED: Wave Rules with Mini-Event Modifiers and Smoother Progression
export const waveRules: Record<number, WaveModifier> = {
  // TUTORIAL PHASE (Waves 1-10) - Gentle introduction
  3: { speedMultiplier: 1.1 }, // Very gentle speed increase
  5: { speedMultiplier: 1.15 }, // Reduced from 1.3 for smoother progression
  7: { bonusEnemies: true }, // Introduce variety early
  8: { disableTowerType: 'sniper' }, // Strategic challenge
  10: { bonusEnemies: true }, // Boss wave preparation

  // BEGINNER PHASE (Waves 11-20) - Gradual difficulty increase
  12: { speedMultiplier: 1.2 }, // Smoother progression
  15: { speedMultiplier: 1.25 }, // Reduced from 1.4
  17: { bonusEnemies: true }, // More variety
  18: { towerRangeReduced: true }, // Strategic positioning challenge
  20: { bonusEnemies: true }, // Boss wave preparation

  // INTERMEDIATE PHASE (Waves 21-40) - Steady challenge
  22: { speedMultiplier: 1.3 }, // Reduced from 1.4
  25: { towerRangeReduced: true }, // Strategic challenge
  27: { bonusEnemies: true }, // Variety
  30: { speedMultiplier: 1.35 }, // Reduced from 1.5
  32: { disableTowerType: 'gatling' }, // Different tower restriction
  35: { bonusEnemies: true }, // More variety
  37: { speedMultiplier: 1.4 }, // Reduced from 1.5
  40: { bonusEnemies: true }, // Boss wave preparation

  // ADVANCED PHASE (Waves 41-60) - Challenging but fair
  42: { speedMultiplier: 1.45 }, // Reduced from 1.6
  45: { towerRangeReduced: true }, // Strategic challenge
  47: { bonusEnemies: true }, // Variety
  50: { speedMultiplier: 1.5 }, // Reduced from 1.6
  52: { disableTowerType: 'laser' }, // Different tower restriction
  55: { bonusEnemies: true }, // More variety
  57: { speedMultiplier: 1.55 }, // Reduced from 1.6
  60: { bonusEnemies: true }, // Boss wave preparation

  // NIGHTMARE PHASE (Waves 61-80) - High difficulty but manageable
  62: { speedMultiplier: 1.6 }, // Reduced from 1.7
  65: { towerRangeReduced: true }, // Strategic challenge
  67: { bonusEnemies: true }, // Variety
  70: { speedMultiplier: 1.65 }, // Reduced from 1.7
  72: { disableTowerType: 'sniper' }, // Rotating restrictions
  75: { bonusEnemies: true }, // More variety
  77: { speedMultiplier: 1.7 }, // Reduced from 1.8
  80: { bonusEnemies: true }, // Boss wave preparation

  // GOD TIER PHASE (Waves 81-99) - Ultimate challenge
  82: { speedMultiplier: 1.75 }, // Reduced from 1.8
  85: { towerRangeReduced: true }, // Strategic challenge
  87: { bonusEnemies: true }, // Variety
  90: { speedMultiplier: 1.8 }, // Reduced from 1.9
  92: { disableTowerType: 'gatling' }, // Rotating restrictions
  95: { bonusEnemies: true }, // More variety
  97: { speedMultiplier: 1.85 }, // Reduced from 1.9
  99: { bonusEnemies: true }, // Final boss preparation

  // THE FINAL WAVE (Wave 100) - Ultimate challenge
  100: { speedMultiplier: 1.9, bonusEnemies: true }, // Combined modifiers for final challenge
} as const;

// ✅ NEW: Mini-Event Wave Triggers for Special Events
export const miniEventWaves: Record<number, {
  eventType: string;
  description: string;
  guaranteed: boolean;
}> = {
  // Early game events (waves 5-20)
  7: { eventType: 'speed_rush', description: 'First speed challenge!', guaranteed: true },
  13: { eventType: 'swarm_attack', description: 'Massive enemy swarm!', guaranteed: true },
  17: { eventType: 'double_spawn', description: 'Rapid enemy spawning!', guaranteed: true },

  // Mid game events (waves 21-50)
  23: { eventType: 'elite_invasion', description: 'Elite enemies appear!', guaranteed: true },
  29: { eventType: 'stealth_mission', description: 'Invisible enemies!', guaranteed: true },
  33: { eventType: 'boss_minions', description: 'Boss-like enemies!', guaranteed: true },
  37: { eventType: 'elemental_storm', description: 'Fire-enhanced enemies!', guaranteed: true },
  41: { eventType: 'time_pressure', description: 'Speed completion challenge!', guaranteed: true },
  47: { eventType: 'elite_invasion', description: 'Major elite invasion!', guaranteed: true },

  // Late game events (waves 51-80)
  53: { eventType: 'stealth_mission', description: 'Advanced stealth challenge!', guaranteed: true },
  59: { eventType: 'boss_minions', description: 'Multiple boss-like enemies!', guaranteed: true },
  63: { eventType: 'elemental_storm', description: 'Intense elemental storm!', guaranteed: true },
  67: { eventType: 'time_pressure', description: 'Extreme time pressure!', guaranteed: true },
  71: { eventType: 'elite_invasion', description: 'Massive elite invasion!', guaranteed: true },
  77: { eventType: 'double_spawn', description: 'Ultra-rapid spawning!', guaranteed: true },

  // End game events (waves 81-99)
  83: { eventType: 'stealth_mission', description: 'Master stealth challenge!', guaranteed: true },
  87: { eventType: 'boss_minions', description: 'Legendary boss minions!', guaranteed: true },
  91: { eventType: 'elemental_storm', description: 'Apocalyptic storm!', guaranteed: true },
  95: { eventType: 'time_pressure', description: 'Ultimate time challenge!', guaranteed: true },
  99: { eventType: 'elite_invasion', description: 'Final elite invasion!', guaranteed: true },
};

// ✅ NEW: Difficulty Spike Prevention Rules
export const difficultySpikePrevention: Record<number, {
  maxSpeedMultiplier: number;
  maxEnemyCount: number;
  minPrepTime: number;
}> = {
  // Tutorial phase - Very gentle
  1: { maxSpeedMultiplier: 1.0, maxEnemyCount: 3, minPrepTime: 45000 },
  2: { maxSpeedMultiplier: 1.0, maxEnemyCount: 4, minPrepTime: 40000 },
  3: { maxSpeedMultiplier: 1.1, maxEnemyCount: 5, minPrepTime: 35000 },
  4: { maxSpeedMultiplier: 1.1, maxEnemyCount: 6, minPrepTime: 35000 },
  5: { maxSpeedMultiplier: 1.15, maxEnemyCount: 7, minPrepTime: 30000 },

  // Beginner phase - Gentle progression
  10: { maxSpeedMultiplier: 1.2, maxEnemyCount: 12, minPrepTime: 30000 },
  15: { maxSpeedMultiplier: 1.25, maxEnemyCount: 18, minPrepTime: 25000 },
  20: { maxSpeedMultiplier: 1.3, maxEnemyCount: 25, minPrepTime: 25000 },

  // Intermediate phase - Steady increase
  30: { maxSpeedMultiplier: 1.4, maxEnemyCount: 35, minPrepTime: 20000 },
  40: { maxSpeedMultiplier: 1.5, maxEnemyCount: 45, minPrepTime: 20000 },

  // Advanced phase - Challenging but fair
  50: { maxSpeedMultiplier: 1.6, maxEnemyCount: 55, minPrepTime: 15000 },
  60: { maxSpeedMultiplier: 1.7, maxEnemyCount: 65, minPrepTime: 15000 },

  // Nightmare phase - High difficulty
  70: { maxSpeedMultiplier: 1.8, maxEnemyCount: 75, minPrepTime: 10000 },
  80: { maxSpeedMultiplier: 1.9, maxEnemyCount: 85, minPrepTime: 10000 },

  // God tier phase - Ultimate challenge
  90: { maxSpeedMultiplier: 2.0, maxEnemyCount: 95, minPrepTime: 8000 },
  99: { maxSpeedMultiplier: 2.1, maxEnemyCount: 100, minPrepTime: 8000 },
  100: { maxSpeedMultiplier: 2.2, maxEnemyCount: 120, minPrepTime: 10000 }, // Final boss gets extra prep time
};

/**
 * Strategic counter-play for each wave modifier:
 * - speedMultiplier: Upgrade fire rate, use slowing effects, build more towers
 * - bonusEnemies: Focus on damage upgrades, area effects, efficient tower placement
 * - towerRangeReduced: Build more towers, strategic positioning, upgrade range
 * - disableTowerType: Adapt tower strategy, use other types, upgrade remaining towers
 * 
 * ✅ NEW: Mini-Event Counter-Strategies:
 * - speed_rush: Prioritize slowing towers, upgrade fire rate, use mines
 * - double_spawn: Focus on area damage, upgrade damage, efficient targeting
 * - elite_invasion: Use armor-piercing towers, focus fire, upgrade damage
 * - swarm_attack: Area of effect towers, rapid fire, efficient positioning
 * - stealth_mission: Detection towers, area damage, upgrade detection range
 * - boss_minions: High damage towers, focus fire, upgrade damage and range
 * - elemental_storm: Fire resistance, high damage, efficient targeting
 * - time_pressure: Rapid deployment, efficient upgrades, focus on speed
 */

/**
 * ✅ NEW: Helper function to get difficulty spike prevention rules for a wave
 */
export function getDifficultySpikePrevention(wave: number) {
  // Find the closest defined wave rule
  const definedWaves = Object.keys(difficultySpikePrevention).map(Number).sort((a, b) => a - b);
  let closestWave = definedWaves[0];
  
  for (const definedWave of definedWaves) {
    if (wave <= definedWave) {
      closestWave = definedWave;
      break;
    }
  }
  
  return difficultySpikePrevention[closestWave] || difficultySpikePrevention[1];
}

/**
 * ✅ NEW: Helper function to check if a wave has a guaranteed mini-event
 */
export function hasGuaranteedMiniEvent(wave: number): boolean {
  return miniEventWaves[wave]?.guaranteed || false;
}

/**
 * ✅ NEW: Helper function to get mini-event info for a wave
 */
export function getMiniEventInfo(wave: number) {
  return miniEventWaves[wave] || null;
}
