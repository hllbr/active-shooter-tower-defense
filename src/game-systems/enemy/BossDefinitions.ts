import type { BossLootEntry, BossPhaseData } from '../../models/gameTypes';

/**
 * Boss definition interface for advanced boss system
 */
export interface BossDefinition {
  id: string;
  name: string;
  description: string;
  bossType: 'mini' | 'major' | 'legendary';
  baseStats: {
    health: number;
    damage: number;
    speed: number;
    size: number;
    color: string;
    goldValue: number;
  };
  spawnRequirements: {
    minWave: number;
    maxWave?: number;
    spawnChance: number;
    prerequisiteBosses?: string[];
  };
  phases: BossPhaseData[];
  lootTable: BossLootEntry[];
  cinematicData: {
    entranceDuration: number;
    phaseTransitionDuration: number;
    defeatDuration: number;
    entranceText: string;
    defeatText: string;
    bossMusic?: string;
  };
  specialMechanics: {
    canSpawnMinions: boolean;
    hasShield: boolean;
    hasRageMode: boolean;
    canFlee: boolean;
    environmentalEffects: string[];
  };
}

/**
 * Comprehensive boss definitions for the advanced enemy system
 */
export const BOSS_DEFINITIONS: Record<string, BossDefinition> = {
  // ========== MINI BOSSES (Wave 5, 10, 15, 20...) ==========
  steel_behemoth: {
    id: 'steel_behemoth',
    name: 'Steel Behemoth',
    description: 'A massive armored tank with devastating charge attacks',
    bossType: 'mini',
    baseStats: {
      health: 1500,
      damage: 45,
      speed: 40,
      size: 50,
      color: '#4a5568',
      goldValue: 300
    },
    spawnRequirements: {
      minWave: 5,
      maxWave: 20,
      spawnChance: 0.3,
    },
    phases: [
      {
        phase: 1,
        name: 'Armored Advance',
        healthThreshold: 1.0,
        abilities: ['charge_attack', 'armor_plating'],
        behaviorChanges: {
          speedMultiplier: 1.0,
          damageMultiplier: 1.0,
        },
        phaseTransitionEffect: 'armor_break',
      },
      {
        phase: 2,
        name: 'Exposed Core',
        healthThreshold: 0.5,
        abilities: ['desperate_charge', 'armor_repair'],
        behaviorChanges: {
          speedMultiplier: 1.3,
          damageMultiplier: 1.5,
          newBehaviorTag: 'berserker',
        },
        phaseTransitionEffect: 'rage_activation',
      }
    ],
    lootTable: [
      {
        itemType: 'gold',
        itemName: 'Scrap Metal',
        amount: 500,
        rarity: 'common',
        dropChance: 1.0,
        description: 'Valuable metal salvaged from the Steel Behemoth',
      },
      {
        itemType: 'upgrade_materials',
        itemName: 'Armor Plating',
        amount: 3,
        rarity: 'rare',
        dropChance: 0.8,
        description: 'Reinforced armor plating for tower upgrades',
        visualEffect: 'metallic_gleam',
      },
      {
        itemType: 'research_points',
        itemName: 'Heavy Weapon Research',
        amount: 50,
        rarity: 'uncommon',
        dropChance: 0.6,
        description: 'Research data for improved tower weaponry',
      }
    ],
    cinematicData: {
      entranceDuration: 3000,
      phaseTransitionDuration: 2000,
      defeatDuration: 4000,
      entranceText: 'Steel Behemoth emerges from the battlefield!',
      defeatText: 'The armored giant falls with a thunderous crash!',
      bossMusic: 'boss_theme_heavy',
    },
    specialMechanics: {
      canSpawnMinions: false,
      hasShield: false,
      hasRageMode: true,
      canFlee: false,
      environmentalEffects: ['screen_shake', 'dust_clouds'],
    }
  },

  sky_destroyer: {
    id: 'sky_destroyer',
    name: 'Sky Destroyer',
    description: 'A flying fortress that rains destruction from above',
    bossType: 'mini',
    baseStats: {
      health: 2000,
      damage: 35,
      speed: 90,
      size: 60,
      color: '#2d3748',
      goldValue: 450
    },
    spawnRequirements: {
      minWave: 15,
      maxWave: 35,
      spawnChance: 0.25,
    },
    phases: [
      {
        phase: 1,
        name: 'Aerial Assault',
        healthThreshold: 1.0,
        abilities: ['bombing_run', 'aerial_maneuvers'],
        behaviorChanges: {
          speedMultiplier: 1.0,
          damageMultiplier: 1.0,
        },
        environmentalEffects: ['storm_clouds'],
      },
      {
        phase: 2,
        name: 'Desperate Bombardment',
        healthThreshold: 0.4,
        abilities: ['carpet_bombing', 'shield_regeneration'],
        behaviorChanges: {
          speedMultiplier: 1.4,
          damageMultiplier: 1.8,
          newBehaviorTag: 'evasive',
        },
        phaseTransitionEffect: 'shield_activation',
        environmentalEffects: ['lightning_strikes', 'heavy_rain'],
      }
    ],
    lootTable: [
      {
        itemType: 'gold',
        itemName: 'Aerospace Components',
        amount: 750,
        rarity: 'common',
        dropChance: 1.0,
        description: 'Advanced aerospace technology components',
      },
      {
        itemType: 'upgrade_materials',
        itemName: 'Anti-Air Targeting System',
        amount: 2,
        rarity: 'epic',
        dropChance: 0.9,
        description: 'Sophisticated targeting system for aerial enemies',
        visualEffect: 'radar_pulse',
      },
      {
        itemType: 'rare_components',
        itemName: 'Flight Control Core',
        amount: 1,
        rarity: 'rare',
        dropChance: 0.7,
        description: 'Advanced flight control technology',
      }
    ],
    cinematicData: {
      entranceDuration: 4000,
      phaseTransitionDuration: 2500,
      defeatDuration: 5000,
      entranceText: 'Sky Destroyer descends from the storm clouds!',
      defeatText: 'The flying fortress crashes in a spectacular explosion!',
      bossMusic: 'boss_theme_aerial',
    },
    specialMechanics: {
      canSpawnMinions: true,
      hasShield: true,
      hasRageMode: false,
      canFlee: true,
      environmentalEffects: ['weather_control', 'aerial_dominance'],
    }
  },

  // ========== MAJOR BOSSES (Wave 25, 50, 75...) ==========
  iron_colossus: {
    id: 'iron_colossus',
    name: 'The Iron Colossus',
    description: 'A colossal mechanical titan with devastating area attacks',
    bossType: 'major',
    baseStats: {
      health: 8000,
      damage: 80,
      speed: 30,
      size: 80,
      color: '#1a202c',
      goldValue: 1500
    },
    spawnRequirements: {
      minWave: 25,
      spawnChance: 1.0, // Guaranteed spawn
      prerequisiteBosses: ['steel_behemoth'],
    },
    phases: [
      {
        phase: 1,
        name: 'Awakening',
        healthThreshold: 1.0,
        abilities: ['ground_slam', 'missile_barrage'],
        behaviorChanges: {
          speedMultiplier: 1.0,
          damageMultiplier: 1.0,
        },
        environmentalEffects: ['seismic_activity'],
      },
      {
        phase: 2,
        name: 'Berserker Protocol',
        healthThreshold: 0.6,
        abilities: ['berserker_mode', 'rapid_fire', 'target_override'],
        behaviorChanges: {
          speedMultiplier: 1.5,
          damageMultiplier: 2.0,
          specialAbilityCooldownMultiplier: 0.5,
          newBehaviorTag: 'unstoppable',
        },
        phaseTransitionEffect: 'system_overload',
        environmentalEffects: ['electrical_storm', 'system_warnings'],
      },
      {
        phase: 3,
        name: 'Critical Meltdown',
        healthThreshold: 0.2,
        abilities: ['meltdown_sequence', 'spawn_repair_drones', 'last_stand'],
        behaviorChanges: {
          speedMultiplier: 0.8,
          damageMultiplier: 3.0,
          newBehaviorTag: 'desperate',
        },
        phaseTransitionEffect: 'critical_warning',
        environmentalEffects: ['radiation_warning', 'system_failure'],
        spawnMinions: {
          enabled: true,
          minionTypes: ['repair_drone', 'defense_turret'],
          spawnRate: 5000,
          maxMinions: 6,
        }
      }
    ],
    lootTable: [
      {
        itemType: 'gold',
        itemName: 'Colossus Core',
        amount: 2000,
        rarity: 'common',
        dropChance: 1.0,
        description: 'The massive energy core of the Iron Colossus',
      },
      {
        itemType: 'legendary_items',
        itemName: 'Titan Slayer Upgrade',
        amount: 1,
        rarity: 'legendary',
        dropChance: 1.0,
        description: 'Legendary upgrade that grants massive damage against large enemies',
        visualEffect: 'legendary_aura',
      },
      {
        itemType: 'achievements',
        itemName: 'Colossus Slayer',
        amount: 1,
        rarity: 'epic',
        dropChance: 1.0,
        description: 'Achievement for defeating the Iron Colossus',
      },
      {
        itemType: 'research_points',
        itemName: 'Titan Technology',
        amount: 200,
        rarity: 'rare',
        dropChance: 1.0,
        description: 'Advanced research from colossus technology',
      }
    ],
    cinematicData: {
      entranceDuration: 6000,
      phaseTransitionDuration: 3000,
      defeatDuration: 8000,
      entranceText: 'The ground trembles as the Iron Colossus awakens!',
      defeatText: 'The mighty titan falls, shaking the very foundations!',
      bossMusic: 'boss_theme_epic',
    },
    specialMechanics: {
      canSpawnMinions: true,
      hasShield: false,
      hasRageMode: true,
      canFlee: false,
      environmentalEffects: ['seismic_events', 'mechanical_dominance'],
    }
  },

  // ========== LEGENDARY BOSSES (Wave 100+) ==========
  quantum_nightmare: {
    id: 'quantum_nightmare',
    name: 'Quantum Nightmare',
    description: 'A reality-bending entity that defies conventional physics',
    bossType: 'legendary',
    baseStats: {
      health: 15000,
      damage: 120,
      speed: 100,
      size: 70,
      color: '#6b46c1',
      goldValue: 5000
    },
    spawnRequirements: {
      minWave: 100,
      spawnChance: 1.0,
      prerequisiteBosses: ['iron_colossus'],
    },
    phases: [
      {
        phase: 1,
        name: 'Reality Distortion',
        healthThreshold: 1.0,
        abilities: ['phase_shift', 'reality_tear', 'quantum_tunneling'],
        behaviorChanges: {
          speedMultiplier: 1.0,
          damageMultiplier: 1.0,
        },
        environmentalEffects: ['reality_distortion'],
      },
      {
        phase: 2,
        name: 'Dimensional Chaos',
        healthThreshold: 0.7,
        abilities: ['dimensional_spawn', 'time_manipulation', 'void_blast'],
        behaviorChanges: {
          speedMultiplier: 1.3,
          damageMultiplier: 1.5,
          newBehaviorTag: 'quantum',
        },
        phaseTransitionEffect: 'dimensional_rift',
        environmentalEffects: ['temporal_anomalies', 'space_distortion'],
        spawnMinions: {
          enabled: true,
          minionTypes: ['shadow_clone', 'quantum_echo'],
          spawnRate: 8000,
          maxMinions: 4,
        }
      },
      {
        phase: 3,
        name: 'Quantum Collapse',
        healthThreshold: 0.4,
        abilities: ['quantum_collapse', 'reality_reset', 'final_paradox'],
        behaviorChanges: {
          speedMultiplier: 1.8,
          damageMultiplier: 2.5,
          newBehaviorTag: 'unstable',
        },
        phaseTransitionEffect: 'quantum_instability',
        environmentalEffects: ['reality_collapse', 'quantum_storms'],
      },
      {
        phase: 4,
        name: 'Paradox Protocol',
        healthThreshold: 0.1,
        abilities: ['paradox_resurrection', 'quantum_immunity', 'existence_erasure'],
        behaviorChanges: {
          speedMultiplier: 2.0,
          damageMultiplier: 4.0,
          newBehaviorTag: 'transcendent',
        },
        phaseTransitionEffect: 'reality_breakdown',
        environmentalEffects: ['existence_threat', 'quantum_apocalypse'],
        spawnMinions: {
          enabled: true,
          minionTypes: ['paradox_guardian', 'quantum_phantom'],
          spawnRate: 3000,
          maxMinions: 8,
        }
      }
    ],
    lootTable: [
      {
        itemType: 'gold',
        itemName: 'Quantum Essence',
        amount: 8000,
        rarity: 'legendary',
        dropChance: 1.0,
        description: 'Pure quantum energy crystallized into valuable essence',
      },
      {
        itemType: 'legendary_items',
        itemName: 'Reality Anchor',
        amount: 1,
        rarity: 'legendary',
        dropChance: 1.0,
        description: 'Legendary item that provides immunity to quantum effects',
        visualEffect: 'quantum_singularity',
      },
      {
        itemType: 'cosmetics',
        itemName: 'Quantum Warrior Title',
        amount: 1,
        rarity: 'legendary',
        dropChance: 1.0,
        description: 'Exclusive title for defeating the Quantum Nightmare',
      },
      {
        itemType: 'achievements',
        itemName: 'Reality Defender',
        amount: 1,
        rarity: 'legendary',
        dropChance: 1.0,
        description: 'Ultimate achievement for saving reality itself',
      }
    ],
    cinematicData: {
      entranceDuration: 10000,
      phaseTransitionDuration: 5000,
      defeatDuration: 12000,
      entranceText: 'Reality itself bends as the Quantum Nightmare emerges!',
      defeatText: 'The nightmare fades as reality stabilizes once more!',
      bossMusic: 'boss_theme_quantum',
    },
    specialMechanics: {
      canSpawnMinions: true,
      hasShield: true,
      hasRageMode: false,
      canFlee: false,
      environmentalEffects: ['quantum_effects', 'reality_manipulation'],
    }
  }
};

/**
 * Get boss definition by ID
 */
export function getBossDefinition(bossId: string): BossDefinition | null {
  return BOSS_DEFINITIONS[bossId] || null;
}

/**
 * Get available bosses for a given wave
 */
export function getAvailableBosses(wave: number): BossDefinition[] {
  return Object.values(BOSS_DEFINITIONS).filter(boss => {
    const meetsMinWave = wave >= boss.spawnRequirements.minWave;
    const meetsMaxWave = !boss.spawnRequirements.maxWave || wave <= boss.spawnRequirements.maxWave;
    return meetsMinWave && meetsMaxWave;
  });
}

/**
 * Select a boss for spawning based on wave and probability
 */
export function selectBossForWave(wave: number): BossDefinition | null {
  const availableBosses = getAvailableBosses(wave);
  if (availableBosses.length === 0) return null;

  // Filter by spawn chance
  const eligibleBosses = availableBosses.filter(boss => 
    Math.random() < boss.spawnRequirements.spawnChance
  );

  if (eligibleBosses.length === 0) return null;

  // Prioritize by boss type (legendary > major > mini)
  const legendary = eligibleBosses.filter(b => b.bossType === 'legendary');
  const major = eligibleBosses.filter(b => b.bossType === 'major');
  const mini = eligibleBosses.filter(b => b.bossType === 'mini');

  if (legendary.length > 0) return legendary[0];
  if (major.length > 0) return major[0];
  if (mini.length > 0) return mini[Math.floor(Math.random() * mini.length)];

  return null;
} 