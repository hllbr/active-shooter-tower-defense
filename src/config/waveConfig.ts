import type { WaveEnemyConfig, WaveModifier } from '../models/gameTypes';

// ✅ NEW: Enhanced Wave Configuration System with Mini-Events
export interface DynamicWaveConfig {
  waveNumber: number;
  enemyComposition: WaveEnemyConfig[];
  modifier?: WaveModifier;
  spawnRate: number;
  adaptiveTiming: {
    basePrepTime: number;
    performanceMultiplier: number;
    minPrepTime: number;
    maxPrepTime: number;
  };
  inWaveScaling: {
    enemySpeedMultiplier: number;
    enemyHealthMultiplier: number;
    spawnRateAcceleration: number;
  };
  difficulty: {
    baseDifficulty: number;
    playerPerformanceAdjustment: number;
    randomizationFactor: number;
  };
  // ✅ NEW: Mini-Event System
  miniEvent?: MiniEventConfig;
}

// ✅ NEW: Mini-Event Configuration for Wave Variety
export interface MiniEventConfig {
  type: 'speed_rush' | 'double_spawn' | 'elite_invasion' | 'swarm_attack' | 'stealth_mission' | 'boss_minions' | 'elemental_storm' | 'time_pressure';
  name: string;
  description: string;
  duration: number; // Duration in milliseconds
  effects: {
    speedMultiplier?: number;
    spawnRateMultiplier?: number;
    enemyHealthMultiplier?: number;
    enemyDamageMultiplier?: number;
    specialEnemyTypes?: string[];
    environmentalEffects?: string[];
    playerRestrictions?: string[];
  };
  rewards: {
    bonusGold: number;
    bonusExperience: number;
    specialDrops?: string[];
  };
  warningTime: number; // Warning time before event starts
}

// ✅ NEW: Enhanced Procedural Wave Generator with Mini-Events
export class ProceduralWaveGenerator {
  private static readonly BASE_ENEMY_TYPES = ['Basic', 'Scout', 'Tank', 'Ghost'];
  private static readonly ADVANCED_ENEMY_TYPES = ['Assassin', 'Berserker', 'Shaman', 'Archer'];
  private static readonly ELITE_ENEMY_TYPES = ['Demon', 'Wraith', 'Golem', 'Phoenix'];
  private static readonly BOSS_TYPES = ['TankBoss', 'GhostBoss', 'DemonLord', 'DragonKing', 'LichKing', 'VoidGod', 'UltimateGod'];

  // ✅ NEW: Mini-Event Definitions
  private static readonly MINI_EVENTS: Record<string, MiniEventConfig> = {
    speed_rush: {
      type: 'speed_rush',
      name: 'Speed Rush',
      description: 'Enemies move 50% faster for 30 seconds!',
      duration: 30000,
      effects: {
        speedMultiplier: 1.5,
        spawnRateMultiplier: 1.2
      },
      rewards: {
        bonusGold: 25,
        bonusExperience: 10
      },
      warningTime: 5000
    },
    double_spawn: {
      type: 'double_spawn',
      name: 'Double Spawn',
      description: 'Enemies spawn twice as fast for 45 seconds!',
      duration: 45000,
      effects: {
        spawnRateMultiplier: 2.0,
        enemyHealthMultiplier: 0.8 // Slightly weaker to compensate
      },
      rewards: {
        bonusGold: 35,
        bonusExperience: 15
      },
      warningTime: 3000
    },
    elite_invasion: {
      type: 'elite_invasion',
      name: 'Elite Invasion',
      description: 'Elite enemies appear more frequently!',
      duration: 40000,
      effects: {
        specialEnemyTypes: ['Demon', 'Wraith', 'Golem'],
        enemyHealthMultiplier: 1.3,
        enemyDamageMultiplier: 1.2
      },
      rewards: {
        bonusGold: 40,
        bonusExperience: 20,
        specialDrops: ['rare_component']
      },
      warningTime: 4000
    },
    swarm_attack: {
      type: 'swarm_attack',
      name: 'Swarm Attack',
      description: 'Massive waves of weaker enemies!',
      duration: 35000,
      effects: {
        spawnRateMultiplier: 1.8,
        enemyHealthMultiplier: 0.6,
        speedMultiplier: 1.3
      },
      rewards: {
        bonusGold: 30,
        bonusExperience: 12
      },
      warningTime: 3000
    },
    stealth_mission: {
      type: 'stealth_mission',
      name: 'Stealth Mission',
      description: 'Ghost enemies are invisible until they attack!',
      duration: 25000,
      effects: {
        specialEnemyTypes: ['Ghost', 'Wraith'],
        speedMultiplier: 1.4,
        enemyDamageMultiplier: 1.5
      },
      rewards: {
        bonusGold: 45,
        bonusExperience: 25,
        specialDrops: ['stealth_detector']
      },
      warningTime: 5000
    },
    boss_minions: {
      type: 'boss_minions',
      name: 'Boss Minions',
      description: 'Boss-like enemies with minion spawning!',
      duration: 50000,
      effects: {
        specialEnemyTypes: ['Demon', 'Golem'],
        enemyHealthMultiplier: 1.4,
        enemyDamageMultiplier: 1.3
      },
      rewards: {
        bonusGold: 50,
        bonusExperience: 30,
        specialDrops: ['boss_essence']
      },
      warningTime: 6000
    },
    elemental_storm: {
      type: 'elemental_storm',
      name: 'Elemental Storm',
      description: 'Phoenix enemies with enhanced fire abilities!',
      duration: 30000,
      effects: {
        specialEnemyTypes: ['Phoenix'],
        enemyDamageMultiplier: 1.6,
        environmentalEffects: ['fire_damage']
      },
      rewards: {
        bonusGold: 40,
        bonusExperience: 20,
        specialDrops: ['fire_resistance']
      },
      warningTime: 4000
    },
    time_pressure: {
      type: 'time_pressure',
      name: 'Time Pressure',
      description: 'Complete the wave quickly for bonus rewards!',
      duration: 20000,
      effects: {
        speedMultiplier: 1.2,
        spawnRateMultiplier: 1.3
      },
      rewards: {
        bonusGold: 60,
        bonusExperience: 40,
        specialDrops: ['time_crystal']
      },
      warningTime: 3000
    }
  };

  /**
   * Generates a dynamic wave configuration with procedural elements and mini-events
   */
  static generateWaveConfig(waveNumber: number, playerPerformance: number): DynamicWaveConfig {
    const baseDifficulty = this.calculateBaseDifficulty(waveNumber);
    const performanceAdjustment = this.calculatePerformanceAdjustment(playerPerformance);
    const randomizationFactor = this.generateRandomizationFactor(waveNumber);

    const finalDifficulty = Math.max(0.1, Math.min(2.0, 
      baseDifficulty + performanceAdjustment + randomizationFactor
    ));

    // ✅ NEW: Determine if this wave should have a mini-event
    const miniEvent = this.shouldTriggerMiniEvent(waveNumber, finalDifficulty);

    return {
      waveNumber,
      enemyComposition: this.generateEnemyComposition(waveNumber, finalDifficulty, miniEvent),
      modifier: this.generateWaveModifier(waveNumber, finalDifficulty),
      spawnRate: this.calculateSpawnRate(waveNumber, finalDifficulty, miniEvent),
      adaptiveTiming: this.calculateAdaptiveTiming(waveNumber, playerPerformance),
      inWaveScaling: this.calculateInWaveScaling(waveNumber, finalDifficulty),
      difficulty: {
        baseDifficulty,
        playerPerformanceAdjustment: performanceAdjustment,
        randomizationFactor
      },
      miniEvent
    };
  }

  /**
   * ✅ NEW: Determines if a mini-event should trigger based on wave and difficulty
   */
  private static shouldTriggerMiniEvent(waveNumber: number, difficulty: number): MiniEventConfig | undefined {
    // Don't trigger mini-events on boss waves or very early waves
    if (this.isBossWave(waveNumber) || waveNumber < 5) {
      return undefined;
    }

    // Base chance increases with difficulty and wave number
    const baseChance = Math.min(0.4, 0.05 + (difficulty * 0.1) + (waveNumber * 0.002));
    
    // Special waves have higher chance
    const specialWaveChance = this.isSpecialWave(waveNumber) ? 0.3 : 0;
    
    const totalChance = Math.min(0.8, baseChance + specialWaveChance);
    
    if (Math.random() < totalChance) {
      return this.selectMiniEvent(waveNumber, difficulty);
    }
    
    return undefined;
  }

  /**
   * ✅ NEW: Selects an appropriate mini-event based on wave and difficulty
   */
  private static selectMiniEvent(waveNumber: number, difficulty: number): MiniEventConfig {
    const availableEvents = Object.values(this.MINI_EVENTS);
    
    // Filter events based on wave progression
    const filteredEvents = availableEvents.filter(event => {
      switch (event.type) {
        case 'elite_invasion':
          return waveNumber >= 15; // Need elite enemies unlocked
        case 'boss_minions':
          return waveNumber >= 25; // Need boss mechanics
        case 'elemental_storm':
          return waveNumber >= 20; // Need Phoenix enemies
        default:
          return true;
      }
    });

    // Weight selection based on difficulty
    const weights = filteredEvents.map(event => {
      let weight = 1;
      
      // Higher difficulty waves get more challenging events
      if (difficulty > 1.5) {
        if (event.type === 'elite_invasion' || event.type === 'boss_minions') weight *= 2;
      }
      
      // Lower difficulty waves get easier events
      if (difficulty < 0.8) {
        if (event.type === 'swarm_attack' || event.type === 'speed_rush') weight *= 2;
      }
      
      return weight;
    });

    // Select event based on weights
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < filteredEvents.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return filteredEvents[i];
      }
    }
    
    return filteredEvents[0]; // Fallback
  }

  /**
   * ✅ NEW: Checks if this is a special wave that should have higher mini-event chance
   */
  private static isSpecialWave(waveNumber: number): boolean {
    // Prime numbers, multiples of 7, and other special patterns
    return waveNumber % 7 === 0 || 
           waveNumber % 13 === 0 || 
           waveNumber % 17 === 0 ||
           this.isPrime(waveNumber);
  }

  /**
   * ✅ NEW: Simple prime number check
   */
  private static isPrime(num: number): boolean {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  }

  /**
   * Calculates base difficulty based on wave number with smoother progression
   */
  private static calculateBaseDifficulty(waveNumber: number): number {
    // ✅ ENHANCED: Smoother difficulty curve to prevent unfair spikes
    if (waveNumber <= 10) return 0.1 + (waveNumber * 0.04); // Gentler tutorial
    if (waveNumber <= 25) return 0.5 + ((waveNumber - 10) * 0.025); // Smoother early game
    if (waveNumber <= 50) return 0.875 + ((waveNumber - 25) * 0.015); // Gradual mid-game
    if (waveNumber <= 75) return 1.25 + ((waveNumber - 50) * 0.012); // Steady late game
    return 1.55 + ((waveNumber - 75) * 0.008); // Very gradual end game
  }

  /**
   * Adjusts difficulty based on player performance with smoother transitions
   */
  private static calculatePerformanceAdjustment(performance: number): number {
    // ✅ ENHANCED: Smoother performance adjustment to prevent sudden difficulty changes
    if (performance > 0.8) return 0.15; // Reduced from 0.2
    if (performance < 0.3) return -0.1; // Reduced from -0.15
    return 0; // No adjustment for average performance
  }

  /**
   * Adds randomization to prevent predictable patterns with reduced impact
   */
  private static generateRandomizationFactor(waveNumber: number): number {
    const seed = waveNumber * 12345; // Simple deterministic seed
    const random = Math.sin(seed) * 0.05; // Reduced from 0.1 for smoother progression
    return random;
  }

  /**
   * Generates enemy composition based on wave difficulty with enhanced variety
   */
  private static generateEnemyComposition(waveNumber: number, difficulty: number, miniEvent?: MiniEventConfig): WaveEnemyConfig[] {
    const composition: WaveEnemyConfig[] = [];
    
    // ✅ ENHANCED: More enemies per wave for better variety
    const baseEnemyCount = Math.floor(8 + (difficulty * 20)); // Increased from 5 + (difficulty * 15)
    const totalEnemies = miniEvent?.type === 'double_spawn' ? baseEnemyCount * 1.5 : baseEnemyCount;

    // Determine available enemy types based on wave progression
    const availableTypes = this.getAvailableEnemyTypes(waveNumber);
    
    // Distribute enemies across types with better variety
    let remainingEnemies = totalEnemies;
    
    // Always include some basic enemies (reduced percentage for more variety)
    const basicCount = Math.max(2, Math.floor(remainingEnemies * 0.2)); // Reduced from 0.3
    composition.push({ type: 'Basic', count: basicCount });
    remainingEnemies -= basicCount;

    // ✅ ENHANCED: Better enemy type distribution for more variety
    const typeDistribution = this.calculateTypeDistribution(waveNumber, difficulty, miniEvent);
    
    for (const [type, percentage] of Object.entries(typeDistribution)) {
      if (remainingEnemies <= 0) break;
      
      const count = Math.max(1, Math.floor(remainingEnemies * percentage));
      if (count > 0 && availableTypes.includes(type)) {
        composition.push({ type, count });
        remainingEnemies -= count;
      }
    }

    // Add boss for milestone waves
    if (this.isBossWave(waveNumber)) {
      const bossType = this.getBossType(waveNumber);
      composition.push({ type: bossType, count: 1 });
    }

    return composition;
  }

  /**
   * ✅ NEW: Calculates enemy type distribution for better variety
   */
  private static calculateTypeDistribution(waveNumber: number, difficulty: number, miniEvent?: MiniEventConfig): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    // Base distribution
    if (waveNumber <= 10) {
      distribution['Scout'] = 0.4;
      distribution['Tank'] = 0.3;
      distribution['Ghost'] = 0.1;
    } else if (waveNumber <= 25) {
      distribution['Scout'] = 0.3;
      distribution['Tank'] = 0.25;
      distribution['Ghost'] = 0.2;
      distribution['Assassin'] = 0.15;
      distribution['Berserker'] = 0.1;
    } else if (waveNumber <= 50) {
      distribution['Scout'] = 0.2;
      distribution['Tank'] = 0.2;
      distribution['Ghost'] = 0.15;
      distribution['Assassin'] = 0.15;
      distribution['Berserker'] = 0.1;
      distribution['Shaman'] = 0.1;
      distribution['Archer'] = 0.1;
    } else {
      distribution['Demon'] = 0.25;
      distribution['Wraith'] = 0.2;
      distribution['Golem'] = 0.15;
      distribution['Phoenix'] = 0.15;
      distribution['Assassin'] = 0.1;
      distribution['Berserker'] = 0.1;
      distribution['Shaman'] = 0.05;
    }

    // Adjust for mini-events
    if (miniEvent) {
      if (miniEvent.effects.specialEnemyTypes) {
        // Boost special enemy types for the event
        miniEvent.effects.specialEnemyTypes.forEach(type => {
          if (distribution[type]) {
            distribution[type] *= 2; // Double the chance
          }
        });
      }
    }

    return distribution;
  }

  /**
   * Gets available enemy types based on wave progression
   */
  private static getAvailableEnemyTypes(waveNumber: number): string[] {
    const types = [...this.BASE_ENEMY_TYPES];
    
    if (waveNumber >= 5) types.push(...this.ADVANCED_ENEMY_TYPES);
    if (waveNumber >= 15) types.push(...this.ELITE_ENEMY_TYPES);
    
    return types;
  }

  /**
   * Determines if this is a boss wave
   */
  private static isBossWave(waveNumber: number): boolean {
    return waveNumber % 10 === 0 || waveNumber === 50 || waveNumber === 80 || waveNumber === 100;
  }

  /**
   * Gets appropriate boss type for wave
   */
  private static getBossType(waveNumber: number): string {
    if (waveNumber <= 10) return 'TankBoss';
    if (waveNumber <= 20) return 'GhostBoss';
    if (waveNumber <= 30) return 'DemonLord';
    if (waveNumber <= 40) return 'DragonKing';
    if (waveNumber <= 60) return 'LichKing';
    if (waveNumber <= 80) return 'VoidGod';
    return 'UltimateGod';
  }

  /**
   * Generates wave modifier based on difficulty
   */
  private static generateWaveModifier(waveNumber: number, difficulty: number): WaveModifier | undefined {
    const modifiers: WaveModifier[] = [];
    
    // Speed modifier for high difficulty
    if (difficulty > 1.2) {
      modifiers.push({ speedMultiplier: 1.15 + (difficulty - 1.2) * 0.2 }); // Reduced multiplier
    }
    
    // Bonus enemies for variety (reduced frequency)
    if (Math.random() < 0.2) { // Reduced from 0.3
      modifiers.push({ bonusEnemies: true });
    }
    
    // Tower restrictions for strategic challenge (reduced frequency)
    if (difficulty > 1.5 && Math.random() < 0.1) { // Reduced from 0.2
      const disabledTypes = ['sniper', 'gatling', 'laser'];
      modifiers.push({ disableTowerType: disabledTypes[Math.floor(Math.random() * disabledTypes.length)] });
    }
    
    return modifiers.length > 0 ? modifiers[0] : undefined;
  }

  /**
   * Calculates spawn rate based on wave difficulty and mini-events
   */
  private static calculateSpawnRate(_waveNumber: number, difficulty: number, miniEvent?: MiniEventConfig): number {
    const baseRate = 2000; // 2 seconds base
    const difficultyMultiplier = 1 - (difficulty * 0.15); // Reduced from 0.2 for smoother progression
    
    let finalRate = Math.max(500, baseRate * difficultyMultiplier);
    
    // Apply mini-event spawn rate multiplier
    if (miniEvent?.effects.spawnRateMultiplier) {
      finalRate /= miniEvent.effects.spawnRateMultiplier;
    }
    
    return finalRate;
  }

  /**
   * Calculates adaptive timing based on player performance
   */
  private static calculateAdaptiveTiming(_waveNumber: number, playerPerformance: number): DynamicWaveConfig['adaptiveTiming'] {
    const basePrepTime = 30000; // 30 seconds base
    const performanceMultiplier = 1 - (playerPerformance * 0.2); // Reduced from 0.3 for smoother progression
    const minPrepTime = 15000; // Increased from 10000 for more preparation time
    const maxPrepTime = 60000; // 60 seconds maximum
    
    return {
      basePrepTime,
      performanceMultiplier,
      minPrepTime,
      maxPrepTime
    };
  }

  /**
   * Calculates in-wave scaling for increasing difficulty within a wave
   */
  private static calculateInWaveScaling(_waveNumber: number, difficulty: number): DynamicWaveConfig['inWaveScaling'] {
    return {
      enemySpeedMultiplier: 1 + (difficulty * 0.08), // Reduced from 0.1
      enemyHealthMultiplier: 1 + (difficulty * 0.12), // Reduced from 0.15
      spawnRateAcceleration: 0.97 - (difficulty * 0.015) // Reduced acceleration
    };
  }
}

// ✅ NEW: Wave Performance Tracker for adaptive timing
export class WavePerformanceTracker {
  private static waveCompletionTimes: number[] = [];
  private static playerPerformance: number = 0.5; // Default to average

  /**
   * Records wave completion time and updates performance metrics
   */
  static recordWaveCompletion(waveNumber: number, completionTime: number): void {
    this.waveCompletionTimes[waveNumber] = completionTime;
    this.updatePlayerPerformance();
  }

  /**
   * Gets current player performance rating (0-1)
   */
  static getPlayerPerformance(): number {
    return this.playerPerformance;
  }

  /**
   * Updates player performance based on recent wave completion times
   */
  private static updatePlayerPerformance(): void {
    const recentTimes = this.waveCompletionTimes.slice(-5); // Last 5 waves
    if (recentTimes.length === 0) return;

    const averageTime = recentTimes.reduce((sum, time) => sum + time, 0) / recentTimes.length;
    const expectedTime = 60000; // 60 seconds expected
    
    // Normalize performance: faster = better performance
    this.playerPerformance = Math.max(0, Math.min(1, 1 - (averageTime / expectedTime)));
  }

  /**
   * Resets performance tracking
   */
  static reset(): void {
    this.waveCompletionTimes = [];
    this.playerPerformance = 0.5;
  }
}

// ✅ NEW: In-Wave Scaling Manager
export class InWaveScalingManager {
  private static currentWaveStartTime: number = 0;
  private static enemySpawnCount: number = 0;

  /**
   * Starts tracking for a new wave
   */
  static startWave(_waveNumber: number): void {
    this.currentWaveStartTime = performance.now();
    this.enemySpawnCount = 0;
  }

  /**
   * Gets current scaling factors based on wave progress
   */
  static getCurrentScalingFactors(_waveNumber: number, config: DynamicWaveConfig): {
    speedMultiplier: number;
    healthMultiplier: number;
    spawnRateMultiplier: number;
  } {
    const waveProgress = this.enemySpawnCount / 10; // Normalize to 0-1
    const timeProgress = (performance.now() - this.currentWaveStartTime) / 60000; // 60 seconds max
    
    const progressFactor = Math.max(waveProgress, timeProgress);
    
    return {
      speedMultiplier: 1 + (config.inWaveScaling.enemySpeedMultiplier - 1) * progressFactor,
      healthMultiplier: 1 + (config.inWaveScaling.enemyHealthMultiplier - 1) * progressFactor,
      spawnRateMultiplier: 1 + (1 - config.inWaveScaling.spawnRateAcceleration) * progressFactor
    };
  }

  /**
   * Records enemy spawn for scaling calculations
   */
  static recordEnemySpawn(): void {
    this.enemySpawnCount++;
  }

  /**
   * Resets scaling for new wave
   */
  static reset(): void {
    this.currentWaveStartTime = 0;
    this.enemySpawnCount = 0;
  }
}

// ✅ NEW: Mini-Event Manager for handling wave events
export class MiniEventManager {
  private static activeEvent: MiniEventConfig | null = null;
  private static eventStartTime: number = 0;
  private static eventEndTime: number = 0;
  private static isWarningPhase: boolean = false;
  private static warningStartTime: number = 0;

  /**
   * Starts a mini-event for the current wave
   */
  static startMiniEvent(event: MiniEventConfig): void {
    this.activeEvent = event;
    this.isWarningPhase = true;
    this.warningStartTime = performance.now();
    this.eventStartTime = this.warningStartTime + event.warningTime;
    this.eventEndTime = this.eventStartTime + event.duration;
  }

  /**
   * Gets current mini-event state
   */
  static getCurrentEventState(): {
    activeEvent: MiniEventConfig | null;
    isWarningPhase: boolean;
    timeRemaining: number;
    warningTimeRemaining: number;
  } {
    const now = performance.now();
    
    if (!this.activeEvent) {
      return {
        activeEvent: null,
        isWarningPhase: false,
        timeRemaining: 0,
        warningTimeRemaining: 0
      };
    }

    // Check if warning phase should end
    if (this.isWarningPhase && now >= this.eventStartTime) {
      this.isWarningPhase = false;
    }

    // Check if event should end
    if (now >= this.eventEndTime) {
      this.activeEvent = null;
      return {
        activeEvent: null,
        isWarningPhase: false,
        timeRemaining: 0,
        warningTimeRemaining: 0
      };
    }

    return {
      activeEvent: this.activeEvent,
      isWarningPhase: this.isWarningPhase,
      timeRemaining: Math.max(0, this.eventEndTime - now),
      warningTimeRemaining: Math.max(0, this.eventStartTime - now)
    };
  }

  /**
   * Gets current event effects to apply to enemies
   */
  static getCurrentEventEffects(): {
    speedMultiplier: number;
    healthMultiplier: number;
    damageMultiplier: number;
    spawnRateMultiplier: number;
  } {
    const state = this.getCurrentEventState();
    
    if (!state.activeEvent || state.isWarningPhase) {
      return {
        speedMultiplier: 1,
        healthMultiplier: 1,
        damageMultiplier: 1,
        spawnRateMultiplier: 1
      };
    }

    return {
      speedMultiplier: state.activeEvent.effects.speedMultiplier || 1,
      healthMultiplier: state.activeEvent.effects.enemyHealthMultiplier || 1,
      damageMultiplier: state.activeEvent.effects.enemyDamageMultiplier || 1,
      spawnRateMultiplier: state.activeEvent.effects.spawnRateMultiplier || 1
    };
  }

  /**
   * Resets mini-event state
   */
  static reset(): void {
    this.activeEvent = null;
    this.eventStartTime = 0;
    this.eventEndTime = 0;
    this.isWarningPhase = false;
    this.warningStartTime = 0;
  }
} 