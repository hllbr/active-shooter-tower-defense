/**
 * 🏗️ Tower Durability Balancing System
 * Rebalances tower HP to prevent unfair quick destruction
 */

import { useGameStore } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/constants/gameConstants';

export interface TowerDurabilityConfig {
  level: number;
  baseHealth: number;
  earlyGameMultiplier: number; // Waves 1-10
  midGameMultiplier: number;   // Waves 11-25
  lateGameMultiplier: number;  // Waves 26+
  specialEnemyDamageMultiplier: number;
  repairCostMultiplier: number;
  description: string;
}

export interface EnemyDamageConfig {
  enemyType: string;
  baseDamage: number;
  earlyGameDamage: number;
  midGameDamage: number;
  lateGameDamage: number;
  isSpecialEnemy: boolean;
  specialAbilities: string[];
}

export class TowerDurabilityBalancer {
  private static instance: TowerDurabilityBalancer;

  // Tower durability configurations by level
  private readonly TOWER_DURABILITY_CONFIGS: TowerDurabilityConfig[] = [
    // Level 1-5: Early Game Focus (High durability for new players)
    {
      level: 1,
      baseHealth: 150, // Increased from 100
      earlyGameMultiplier: 2.0, // 300 HP in early game
      midGameMultiplier: 1.5,   // 225 HP in mid game
      lateGameMultiplier: 1.0,  // 150 HP in late game
      specialEnemyDamageMultiplier: 1.5,
      repairCostMultiplier: 0.8,
      description: 'High early game durability'
    },
    {
      level: 2,
      baseHealth: 200, // Increased from 150
      earlyGameMultiplier: 1.8,
      midGameMultiplier: 1.4,
      lateGameMultiplier: 1.0,
      specialEnemyDamageMultiplier: 1.4,
      repairCostMultiplier: 0.85,
      description: 'Balanced early-mid game durability'
    },
    {
      level: 3,
      baseHealth: 250, // Increased from 200
      earlyGameMultiplier: 1.6,
      midGameMultiplier: 1.3,
      lateGameMultiplier: 1.0,
      specialEnemyDamageMultiplier: 1.3,
      repairCostMultiplier: 0.9,
      description: 'Good early game protection'
    },
    {
      level: 4,
      baseHealth: 350, // Increased from 300
      earlyGameMultiplier: 1.5,
      midGameMultiplier: 1.25,
      lateGameMultiplier: 1.0,
      specialEnemyDamageMultiplier: 1.25,
      repairCostMultiplier: 0.95,
      description: 'Solid mid-game durability'
    },
    {
      level: 5,
      baseHealth: 500, // Increased from 450
      earlyGameMultiplier: 1.4,
      midGameMultiplier: 1.2,
      lateGameMultiplier: 1.0,
      specialEnemyDamageMultiplier: 1.2,
      repairCostMultiplier: 1.0,
      description: 'Strong early game foundation'
    },
    
    // Level 6-10: Mid Game Transition (Balanced durability)
    {
      level: 6,
      baseHealth: 700, // Increased from 600
      earlyGameMultiplier: 1.3,
      midGameMultiplier: 1.15,
      lateGameMultiplier: 1.0,
      specialEnemyDamageMultiplier: 1.15,
      repairCostMultiplier: 1.05,
      description: 'Mid-game balanced durability'
    },
    {
      level: 7,
      baseHealth: 900, // Increased from 750
      earlyGameMultiplier: 1.25,
      midGameMultiplier: 1.1,
      lateGameMultiplier: 1.0,
      specialEnemyDamageMultiplier: 1.1,
      repairCostMultiplier: 1.1,
      description: 'Reliable mid-game protection'
    },
    {
      level: 8,
      baseHealth: 1100, // Increased from 900
      earlyGameMultiplier: 1.2,
      midGameMultiplier: 1.05,
      lateGameMultiplier: 1.0,
      specialEnemyDamageMultiplier: 1.05,
      repairCostMultiplier: 1.15,
      description: 'Advanced mid-game durability'
    },
    {
      level: 9,
      baseHealth: 1300, // Increased from 1100
      earlyGameMultiplier: 1.15,
      midGameMultiplier: 1.0,
      lateGameMultiplier: 0.95,
      specialEnemyDamageMultiplier: 1.0,
      repairCostMultiplier: 1.2,
      description: 'Late mid-game protection'
    },
    {
      level: 10,
      baseHealth: 1500, // Increased from 1300
      earlyGameMultiplier: 1.1,
      midGameMultiplier: 0.95,
      lateGameMultiplier: 0.9,
      specialEnemyDamageMultiplier: 0.95,
      repairCostMultiplier: 1.25,
      description: 'Transition to late game'
    },
    
    // Level 11-15: Late Game (Specialized durability)
    {
      level: 11,
      baseHealth: 1800, // Increased from 1500
      earlyGameMultiplier: 1.05,
      midGameMultiplier: 0.9,
      lateGameMultiplier: 0.85,
      specialEnemyDamageMultiplier: 0.9,
      repairCostMultiplier: 1.3,
      description: 'Late game specialized durability'
    },
    {
      level: 12,
      baseHealth: 2100, // Increased from 1700
      earlyGameMultiplier: 1.0,
      midGameMultiplier: 0.85,
      lateGameMultiplier: 0.8,
      specialEnemyDamageMultiplier: 0.85,
      repairCostMultiplier: 1.35,
      description: 'Advanced late game protection'
    },
    {
      level: 13,
      baseHealth: 2400, // Increased from 1900
      earlyGameMultiplier: 0.95,
      midGameMultiplier: 0.8,
      lateGameMultiplier: 0.75,
      specialEnemyDamageMultiplier: 0.8,
      repairCostMultiplier: 1.4,
      description: 'Expert level durability'
    },
    {
      level: 14,
      baseHealth: 2700, // Increased from 2100
      earlyGameMultiplier: 0.9,
      midGameMultiplier: 0.75,
      lateGameMultiplier: 0.7,
      specialEnemyDamageMultiplier: 0.75,
      repairCostMultiplier: 1.45,
      description: 'Master level protection'
    },
    {
      level: 15,
      baseHealth: 3000, // Increased from 2300
      earlyGameMultiplier: 0.85,
      midGameMultiplier: 0.7,
      lateGameMultiplier: 0.65,
      specialEnemyDamageMultiplier: 0.7,
      repairCostMultiplier: 1.5,
      description: 'Elite level durability'
    },
    
    // Level 16-20: Expert Game (High risk, high reward)
    {
      level: 16,
      baseHealth: 3300,
      earlyGameMultiplier: 0.8,
      midGameMultiplier: 0.65,
      lateGameMultiplier: 0.6,
      specialEnemyDamageMultiplier: 0.65,
      repairCostMultiplier: 1.6,
      description: 'Expert level risk/reward'
    },
    {
      level: 17,
      baseHealth: 3600,
      earlyGameMultiplier: 0.75,
      midGameMultiplier: 0.6,
      lateGameMultiplier: 0.55,
      specialEnemyDamageMultiplier: 0.6,
      repairCostMultiplier: 1.7,
      description: 'Master level risk/reward'
    },
    {
      level: 18,
      baseHealth: 3900,
      earlyGameMultiplier: 0.7,
      midGameMultiplier: 0.55,
      lateGameMultiplier: 0.5,
      specialEnemyDamageMultiplier: 0.55,
      repairCostMultiplier: 1.8,
      description: 'Elite level risk/reward'
    },
    {
      level: 19,
      baseHealth: 4200,
      earlyGameMultiplier: 0.65,
      midGameMultiplier: 0.5,
      lateGameMultiplier: 0.45,
      specialEnemyDamageMultiplier: 0.5,
      repairCostMultiplier: 1.9,
      description: 'Legendary level risk/reward'
    },
    {
      level: 20,
      baseHealth: 4500,
      earlyGameMultiplier: 0.6,
      midGameMultiplier: 0.45,
      lateGameMultiplier: 0.4,
      specialEnemyDamageMultiplier: 0.45,
      repairCostMultiplier: 2.0,
      description: 'Mythic level risk/reward'
    },
    
    // Level 21-25: Legendary Game (Ultimate challenge)
    {
      level: 21,
      baseHealth: 4800,
      earlyGameMultiplier: 0.55,
      midGameMultiplier: 0.4,
      lateGameMultiplier: 0.35,
      specialEnemyDamageMultiplier: 0.4,
      repairCostMultiplier: 2.2,
      description: 'Legendary challenge level'
    },
    {
      level: 22,
      baseHealth: 5100,
      earlyGameMultiplier: 0.5,
      midGameMultiplier: 0.35,
      lateGameMultiplier: 0.3,
      specialEnemyDamageMultiplier: 0.35,
      repairCostMultiplier: 2.4,
      description: 'Mythic challenge level'
    },
    {
      level: 23,
      baseHealth: 5400,
      earlyGameMultiplier: 0.45,
      midGameMultiplier: 0.3,
      lateGameMultiplier: 0.25,
      specialEnemyDamageMultiplier: 0.3,
      repairCostMultiplier: 2.6,
      description: 'Divine challenge level'
    },
    {
      level: 24,
      baseHealth: 5700,
      earlyGameMultiplier: 0.4,
      midGameMultiplier: 0.25,
      lateGameMultiplier: 0.2,
      specialEnemyDamageMultiplier: 0.25,
      repairCostMultiplier: 2.8,
      description: 'Cosmic challenge level'
    },
    {
      level: 25,
      baseHealth: 6000,
      earlyGameMultiplier: 0.35,
      midGameMultiplier: 0.2,
      lateGameMultiplier: 0.15,
      specialEnemyDamageMultiplier: 0.2,
      repairCostMultiplier: 3.0,
      description: 'Ultimate challenge level'
    }
  ];

  // Enemy damage configurations
  private readonly ENEMY_DAMAGE_CONFIGS: EnemyDamageConfig[] = [
    // Basic enemies (low damage, no special abilities)
    {
      enemyType: 'Basic',
      baseDamage: 15,
      earlyGameDamage: 10,
      midGameDamage: 20,
      lateGameDamage: 35,
      isSpecialEnemy: false,
      specialAbilities: []
    },
    {
      enemyType: 'Fast',
      baseDamage: 12,
      earlyGameDamage: 8,
      midGameDamage: 15,
      lateGameDamage: 25,
      isSpecialEnemy: false,
      specialAbilities: ['speed_boost']
    },
    {
      enemyType: 'Strong',
      baseDamage: 25,
      earlyGameDamage: 20,
      midGameDamage: 35,
      lateGameDamage: 50,
      isSpecialEnemy: false,
      specialAbilities: ['armor']
    },
    
    // Special enemies (high damage, special abilities)
    {
      enemyType: 'Tank',
      baseDamage: 40,
      earlyGameDamage: 30,
      midGameDamage: 50,
      lateGameDamage: 80,
      isSpecialEnemy: true,
      specialAbilities: ['heavy_armor', 'knockback_resistance']
    },
    {
      enemyType: 'Golem',
      baseDamage: 60,
      earlyGameDamage: 45,
      midGameDamage: 75,
      lateGameDamage: 120,
      isSpecialEnemy: true,
      specialAbilities: ['stone_armor', 'earthquake']
    },
    {
      enemyType: 'Demon',
      baseDamage: 50,
      earlyGameDamage: 35,
      midGameDamage: 65,
      lateGameDamage: 100,
      isSpecialEnemy: true,
      specialAbilities: ['fire_aura', 'teleport']
    },
    {
      enemyType: 'Phoenix',
      baseDamage: 45,
      earlyGameDamage: 30,
      midGameDamage: 60,
      lateGameDamage: 90,
      isSpecialEnemy: true,
      specialAbilities: ['fire_immunity', 'rebirth']
    },
    
    // Boss enemies (very high damage, multiple abilities)
    {
      enemyType: 'DemonLord',
      baseDamage: 100,
      earlyGameDamage: 80,
      midGameDamage: 120,
      lateGameDamage: 200,
      isSpecialEnemy: true,
      specialAbilities: ['fire_mastery', 'summon_minions', 'teleport', 'shield']
    },
    {
      enemyType: 'DragonKing',
      baseDamage: 120,
      earlyGameDamage: 100,
      midGameDamage: 150,
      lateGameDamage: 250,
      isSpecialEnemy: true,
      specialAbilities: ['dragon_breath', 'wing_gust', 'scale_armor', 'flight']
    },
    {
      enemyType: 'LichKing',
      baseDamage: 90,
      earlyGameDamage: 70,
      midGameDamage: 110,
      lateGameDamage: 180,
      isSpecialEnemy: true,
      specialAbilities: ['death_aura', 'raise_dead', 'ice_magic', 'ethereal']
    }
  ];

  private constructor() {}

  public static getInstance(): TowerDurabilityBalancer {
    if (!TowerDurabilityBalancer.instance) {
      TowerDurabilityBalancer.instance = new TowerDurabilityBalancer();
    }
    return TowerDurabilityBalancer.instance;
  }

  /**
   * Calculate tower health based on level and current wave
   */
  calculateTowerHealth(towerLevel: number, currentWave: number): number {
    const config = this.TOWER_DURABILITY_CONFIGS[towerLevel - 1];
    if (!config) return 100; // Fallback

    const gamePhase = this.getGamePhase(currentWave);
    const multiplier = this.getHealthMultiplier(config, gamePhase);
    
    return Math.round(config.baseHealth * multiplier);
  }

  /**
   * Calculate enemy damage based on enemy type and current wave
   */
  calculateEnemyDamage(enemyType: string, currentWave: number): number {
    const config = this.ENEMY_DAMAGE_CONFIGS.find(c => c.enemyType === enemyType);
    if (!config) return 15; // Default damage

    const gamePhase = this.getGamePhase(currentWave);
    const damage = this.getEnemyDamage(config, gamePhase);
    
    return Math.round(damage);
  }

  /**
   * Check if enemy is special (gets damage multipliers)
   */
  isSpecialEnemy(enemyType: string): boolean {
    const config = this.ENEMY_DAMAGE_CONFIGS.find(c => c.enemyType === enemyType);
    return config?.isSpecialEnemy || false;
  }

  /**
   * Get special enemy damage multiplier for a tower level
   */
  getSpecialEnemyDamageMultiplier(towerLevel: number): number {
    const config = this.TOWER_DURABILITY_CONFIGS[towerLevel - 1];
    return config?.specialEnemyDamageMultiplier || 1.0;
  }

  /**
   * Calculate repair cost based on tower level and damage percentage
   */
  calculateRepairCost(towerLevel: number, damagePercentage: number): number {
    const config = this.TOWER_DURABILITY_CONFIGS[towerLevel - 1];
    if (!config) return GAME_CONSTANTS.TOWER_REPAIR_BASE_COST;

    const baseCost = GAME_CONSTANTS.TOWER_REPAIR_BASE_COST;
    const costMultiplier = config.repairCostMultiplier;
    
    return Math.ceil(baseCost * damagePercentage * costMultiplier);
  }

  /**
   * Get game phase based on current wave
   */
  private getGamePhase(currentWave: number): 'early' | 'mid' | 'late' {
    if (currentWave <= 10) return 'early';
    if (currentWave <= 25) return 'mid';
    return 'late';
  }

  /**
   * Get health multiplier based on game phase
   */
  private getHealthMultiplier(config: TowerDurabilityConfig, gamePhase: 'early' | 'mid' | 'late'): number {
    switch (gamePhase) {
      case 'early':
        return config.earlyGameMultiplier;
      case 'mid':
        return config.midGameMultiplier;
      case 'late':
        return config.lateGameMultiplier;
      default:
        return 1.0;
    }
  }

  /**
   * Get enemy damage based on game phase
   */
  private getEnemyDamage(config: EnemyDamageConfig, gamePhase: 'early' | 'mid' | 'late'): number {
    switch (gamePhase) {
      case 'early':
        return config.earlyGameDamage;
      case 'mid':
        return config.midGameDamage;
      case 'late':
        return config.lateGameDamage;
      default:
        return config.baseDamage;
    }
  }

  /**
   * Get durability configuration for a tower level
   */
  getDurabilityConfig(towerLevel: number): TowerDurabilityConfig | null {
    return this.TOWER_DURABILITY_CONFIGS[towerLevel - 1] || null;
  }

  /**
   * Get enemy damage configuration
   */
  getEnemyDamageConfig(enemyType: string): EnemyDamageConfig | null {
    return this.ENEMY_DAMAGE_CONFIGS.find(c => c.enemyType === enemyType) || null;
  }

  /**
   * Get all durability configurations
   */
  getAllDurabilityConfigs(): TowerDurabilityConfig[] {
    return [...this.TOWER_DURABILITY_CONFIGS];
  }

  /**
   * Get all enemy damage configurations
   */
  getAllEnemyDamageConfigs(): EnemyDamageConfig[] {
    return [...this.ENEMY_DAMAGE_CONFIGS];
  }

  /**
   * Apply durability balancing to existing towers
   */
  applyDurabilityBalancing(): void {
    const state = useGameStore.getState();
    const currentWave = state.currentWave;
    
    const updatedSlots = state.towerSlots.map(slot => {
      if (!slot.tower) return slot;
      
      const newHealth = this.calculateTowerHealth(slot.tower.level, currentWave);
      
      return {
        ...slot,
        tower: {
          ...slot.tower,
          health: Math.min(slot.tower.health, newHealth), // Don't increase health if tower is damaged
          maxHealth: newHealth
        }
      };
    });

    useGameStore.setState({ towerSlots: updatedSlots });
  }

  /**
   * Get durability analysis for a specific tower level and wave
   */
  getDurabilityAnalysis(towerLevel: number, currentWave: number): {
    health: number;
    gamePhase: string;
    multiplier: number;
    description: string;
    recommendedUpgrades: string[];
  } {
    const config = this.getDurabilityConfig(towerLevel);
    if (!config) {
      return {
        health: 100,
        gamePhase: 'unknown',
        multiplier: 1.0,
        description: 'Unknown tower level',
        recommendedUpgrades: []
      };
    }

    const gamePhase = this.getGamePhase(currentWave);
    const multiplier = this.getHealthMultiplier(config, gamePhase);
    const health = Math.round(config.baseHealth * multiplier);

    const recommendedUpgrades = this.getRecommendedUpgrades(towerLevel, currentWave);

    return {
      health,
      gamePhase,
      multiplier,
      description: config.description,
      recommendedUpgrades
    };
  }

  /**
   * Get recommended upgrades for a tower level and wave
   */
  private getRecommendedUpgrades(towerLevel: number, currentWave: number): string[] {
    const recommendations: string[] = [];
    const gamePhase = this.getGamePhase(currentWave);

    if (gamePhase === 'early' && towerLevel < 5) {
      recommendations.push('Upgrade to level 5 for better early game durability');
    }

    if (gamePhase === 'mid' && towerLevel < 10) {
      recommendations.push('Upgrade to level 10 for mid-game protection');
    }

    if (gamePhase === 'late' && towerLevel < 15) {
      recommendations.push('Upgrade to level 15+ for late game survival');
    }

    if (towerLevel >= 15) {
      recommendations.push('Consider defensive upgrades (walls, trenches)');
      recommendations.push('Focus on positioning and synergy bonuses');
    }

    return recommendations;
  }

  /**
   * Validate durability balance for a specific scenario
   */
  validateDurabilityBalance(
    towerLevel: number,
    enemyType: string,
    currentWave: number
  ): {
    isValid: boolean;
    towerHealth: number;
    enemyDamage: number;
    hitsToDestroy: number;
    recommendations: string[];
  } {
    const towerHealth = this.calculateTowerHealth(towerLevel, currentWave);
    const enemyDamage = this.calculateEnemyDamage(enemyType, currentWave);
    const isSpecial = this.isSpecialEnemy(enemyType);
    
    let effectiveDamage = enemyDamage;
    if (isSpecial) {
      const specialMultiplier = this.getSpecialEnemyDamageMultiplier(towerLevel);
      effectiveDamage = Math.round(enemyDamage * specialMultiplier);
    }

    const hitsToDestroy = Math.ceil(towerHealth / effectiveDamage);
    
    // Determine if balance is valid
    let isValid = true;
    const recommendations: string[] = [];

    if (hitsToDestroy < 3) {
      isValid = false;
      recommendations.push('Tower dies too quickly - consider upgrading or adding defenses');
    } else if (hitsToDestroy > 20) {
      isValid = false;
      recommendations.push('Tower is too durable - may need enemy damage buff');
    } else if (hitsToDestroy < 5 && isSpecial) {
      recommendations.push('Special enemy deals high damage - consider defensive upgrades');
    }

    return {
      isValid,
      towerHealth,
      enemyDamage: effectiveDamage,
      hitsToDestroy,
      recommendations
    };
  }
}

export const towerDurabilityBalancer = TowerDurabilityBalancer.getInstance(); 