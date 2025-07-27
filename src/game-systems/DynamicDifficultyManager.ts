/**
 * 🎯 Dynamic Difficulty Adjustment System
 * Implements adaptive AI & wave balancing based on player performance
 * 
 * Features:
 * - Adaptive wave difficulty based on player performance
 * - Boss HP and damage scaling proportional to player upgrades
 * - Balanced difficulty curves with no unfair spikes
 * - Performance tracking and analysis
 * - SOLID principles compliance
 */

import { useGameStore } from '../models/store';
import type { Enemy } from '../models/gameTypes';

// Performance tracking interfaces
export interface PerformanceMetrics {
  waveNumber: number;
  completionTime: number;
  towersUsed: number;
  averageTowerLevel: number;
  totalDamageDealt: number;
  damageTaken: number;
  goldEfficiency: number;
  waveClearSpeed: number;
  performanceScore: number;
}

export interface DifficultyAdjustment {
  enemyHealthMultiplier: number;
  enemySpeedMultiplier: number;
  enemyDamageMultiplier: number;
  spawnRateMultiplier: number;
  bossHealthMultiplier: number;
  bossDamageMultiplier: number;
  difficultyLevel: 'easy' | 'normal' | 'hard' | 'extreme';
  adjustmentReason: string;
}

export interface PlayerPowerLevel {
  averageTowerLevel: number;
  totalTowerDamage: number;
  totalTowerHealth: number;
  upgradeInvestment: number;
  powerScore: number;
}

/**
 * Performance Analyzer - Analyzes player performance patterns
 */
class PerformanceAnalyzer {
  private performanceHistory: PerformanceMetrics[] = [];
  private readonly MAX_HISTORY = 10;
  private readonly PERFORMANCE_WEIGHTS = {
    completionTime: 0.25,
    damageEfficiency: 0.20,
    goldEfficiency: 0.15,
    towerEfficiency: 0.20,
    waveClearSpeed: 0.20
  };

  /**
   * Record performance metrics for a wave
   */
  recordWavePerformance(metrics: PerformanceMetrics): void {
    this.performanceHistory.push(metrics);
    
    if (this.performanceHistory.length > this.MAX_HISTORY) {
      this.performanceHistory.shift();
    }
  }

  /**
   * Calculate overall performance score (0-1)
   */
  getPerformanceScore(): number {
    if (this.performanceHistory.length === 0) return 0.5;

    const recentMetrics = this.performanceHistory.slice(-5);
    const scores = recentMetrics.map(metrics => this.calculateIndividualScore(metrics));
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * Calculate individual wave performance score
   */
  private calculateIndividualScore(metrics: PerformanceMetrics): number {
    const timeScore = this.normalizeCompletionTime(metrics.completionTime, metrics.waveNumber);
    const damageScore = this.normalizeDamageEfficiency(metrics.totalDamageDealt, metrics.damageTaken);
    const goldScore = Math.min(1, metrics.goldEfficiency / 100);
    const towerScore = this.normalizeTowerEfficiency(metrics.towersUsed, metrics.averageTowerLevel);
    const speedScore = this.normalizeWaveClearSpeed(metrics.waveClearSpeed);

    return (
      timeScore * this.PERFORMANCE_WEIGHTS.completionTime +
      damageScore * this.PERFORMANCE_WEIGHTS.damageEfficiency +
      goldScore * this.PERFORMANCE_WEIGHTS.goldEfficiency +
      towerScore * this.PERFORMANCE_WEIGHTS.towerEfficiency +
      speedScore * this.PERFORMANCE_WEIGHTS.waveClearSpeed
    );
  }

  private normalizeCompletionTime(time: number, waveNumber: number): number {
    const expectedTime = 30000 + (waveNumber * 5000); // 30s base + 5s per wave
    return Math.max(0, Math.min(1, expectedTime / time));
  }

  private normalizeDamageEfficiency(damageDealt: number, damageTaken: number): number {
    if (damageTaken === 0) return 1;
    const ratio = damageDealt / damageTaken;
    return Math.max(0, Math.min(1, ratio / 10)); // Normalize to 0-1
  }

  private normalizeTowerEfficiency(towersUsed: number, averageLevel: number): number {
    const expectedTowers = Math.min(8, 2 + Math.floor(averageLevel / 3));
    const towerEfficiency = expectedTowers / Math.max(1, towersUsed);
    const levelEfficiency = Math.min(1, averageLevel / 10);
    return (towerEfficiency * 0.6) + (levelEfficiency * 0.4);
  }

  private normalizeWaveClearSpeed(speed: number): number {
    return Math.max(0, Math.min(1, speed / 100)); // Normalize to 0-1
  }

  /**
   * Get performance trend (improving, declining, stable)
   */
  getPerformanceTrend(): 'improving' | 'declining' | 'stable' {
    if (this.performanceHistory.length < 3) return 'stable';

    const recent = this.performanceHistory.slice(-3);
    const scores = recent.map(m => m.performanceScore);
    
    const trend = scores[2] - scores[0];
    if (trend > 0.1) return 'improving';
    if (trend < -0.1) return 'declining';
    return 'stable';
  }

  /**
   * Reset performance history
   */
  reset(): void {
    this.performanceHistory = [];
  }
}

/**
 * Player Power Analyzer - Analyzes player's current power level
 */
class PlayerPowerAnalyzer {
  /**
   * Calculate current player power level
   */
  calculatePlayerPowerLevel(): PlayerPowerLevel {
    const state = useGameStore.getState();
    const activeTowers = state.towerSlots
      .filter(slot => slot.tower)
      .map(slot => slot.tower!);

    if (activeTowers.length === 0) {
      return {
        averageTowerLevel: 1,
        totalTowerDamage: 0,
        totalTowerHealth: 0,
        upgradeInvestment: 0,
        powerScore: 0.1
      };
    }

    const averageTowerLevel = activeTowers.reduce((sum, tower) => sum + tower.level, 0) / activeTowers.length;
    const totalTowerDamage = activeTowers.reduce((sum, tower) => sum + tower.damage, 0);
    const totalTowerHealth = activeTowers.reduce((sum, tower) => sum + tower.maxHealth, 0);
    const upgradeInvestment = state.totalGoldSpent;

    // Calculate power score (0-1)
    const levelScore = Math.min(1, averageTowerLevel / 25);
    const damageScore = Math.min(1, totalTowerDamage / 10000);
    const healthScore = Math.min(1, totalTowerHealth / 50000);
    const investmentScore = Math.min(1, upgradeInvestment / 100000);

    const powerScore = (levelScore * 0.3) + (damageScore * 0.3) + (healthScore * 0.2) + (investmentScore * 0.2);

    return {
      averageTowerLevel,
      totalTowerDamage,
      totalTowerHealth,
      upgradeInvestment,
      powerScore
    };
  }

  /**
   * Get power level category
   */
  getPowerLevelCategory(powerLevel: PlayerPowerLevel): 'weak' | 'average' | 'strong' | 'overpowered' {
    if (powerLevel.powerScore < 0.3) return 'weak';
    if (powerLevel.powerScore < 0.6) return 'average';
    if (powerLevel.powerScore < 0.85) return 'strong';
    return 'overpowered';
  }
}

/**
 * Difficulty Balancer - Ensures balanced difficulty curves
 */
class DifficultyBalancer {
  private readonly MIN_MULTIPLIER = 0.5;
  private readonly MAX_MULTIPLIER = 2.5;
  private readonly SMOOTHING_FACTOR = 0.3;

  /**
   * Calculate balanced difficulty adjustment
   */
  calculateBalancedAdjustment(
    performanceScore: number,
    playerPower: PlayerPowerLevel,
    waveNumber: number,
    previousAdjustment?: DifficultyAdjustment
  ): DifficultyAdjustment {
    // Base difficulty based on wave number
    const baseDifficulty = this.calculateBaseDifficulty(waveNumber);
    
    // Performance-based adjustment
    const performanceAdjustment = this.calculatePerformanceAdjustment(performanceScore);
    
    // Power-based adjustment
    const powerAdjustment = this.calculatePowerAdjustment(playerPower);
    
    // Combine adjustments
    const rawAdjustment = baseDifficulty + performanceAdjustment + powerAdjustment;
    
    // Apply smoothing to prevent sudden spikes
    const smoothedAdjustment = this.applySmoothing(rawAdjustment, previousAdjustment);
    
    // Ensure balanced ranges
    const balancedAdjustment = this.balanceAdjustment(smoothedAdjustment, waveNumber);
    
    return this.createDifficultyAdjustment(balancedAdjustment, performanceScore, playerPower);
  }

  private calculateBaseDifficulty(waveNumber: number): number {
    if (waveNumber <= 10) return 0.1 + (waveNumber * 0.05);
    if (waveNumber <= 25) return 0.6 + ((waveNumber - 10) * 0.03);
    if (waveNumber <= 50) return 1.05 + ((waveNumber - 25) * 0.02);
    if (waveNumber <= 75) return 1.55 + ((waveNumber - 50) * 0.015);
    return 1.925 + ((waveNumber - 75) * 0.01);
  }

  private calculatePerformanceAdjustment(performanceScore: number): number {
    // High performance = harder difficulty
    if (performanceScore > 0.8) return 0.3;
    if (performanceScore > 0.6) return 0.1;
    if (performanceScore < 0.3) return -0.2;
    if (performanceScore < 0.5) return -0.1;
    return 0;
  }

  private calculatePowerAdjustment(playerPower: PlayerPowerLevel): number {
    const powerCategory = new PlayerPowerAnalyzer().getPowerLevelCategory(playerPower);
    
    switch (powerCategory) {
      case 'overpowered': return 0.4;
      case 'strong': return 0.2;
      case 'weak': return -0.15;
      default: return 0;
    }
  }

  private applySmoothing(
    currentAdjustment: number,
    previousAdjustment?: DifficultyAdjustment
  ): number {
    if (!previousAdjustment) return currentAdjustment;
    
    const previousLevel = this.adjustmentToLevel(previousAdjustment);
    const currentLevel = currentAdjustment;
    
    return previousLevel + (this.SMOOTHING_FACTOR * (currentLevel - previousLevel));
  }

  private adjustmentToLevel(adjustment: DifficultyAdjustment): number {
    return (adjustment.enemyHealthMultiplier + adjustment.enemySpeedMultiplier + adjustment.enemyDamageMultiplier) / 3;
  }

  private balanceAdjustment(adjustment: number, waveNumber: number): number {
    // Ensure minimum difficulty for early waves
    const minDifficulty = Math.max(0.5, 0.3 + (waveNumber * 0.02));
    
    // Ensure maximum difficulty cap
    const maxDifficulty = Math.min(2.5, 1.5 + (waveNumber * 0.01));
    
    return Math.max(minDifficulty, Math.min(maxDifficulty, adjustment));
  }

  private createDifficultyAdjustment(
    adjustmentLevel: number,
    performanceScore: number,
    playerPower: PlayerPowerLevel
  ): DifficultyAdjustment {
    const baseMultiplier = 1 + (adjustmentLevel - 1) * 0.5;
    
    return {
      enemyHealthMultiplier: Math.max(this.MIN_MULTIPLIER, Math.min(this.MAX_MULTIPLIER, baseMultiplier)),
      enemySpeedMultiplier: Math.max(this.MIN_MULTIPLIER, Math.min(this.MAX_MULTIPLIER, baseMultiplier * 0.8)),
      enemyDamageMultiplier: Math.max(this.MIN_MULTIPLIER, Math.min(this.MAX_MULTIPLIER, baseMultiplier * 0.9)),
      spawnRateMultiplier: Math.max(0.5, Math.min(2.0, 1 + (adjustmentLevel - 1) * 0.3)),
      bossHealthMultiplier: Math.max(this.MIN_MULTIPLIER, Math.min(this.MAX_MULTIPLIER, baseMultiplier * 1.2)),
      bossDamageMultiplier: Math.max(this.MIN_MULTIPLIER, Math.min(this.MAX_MULTIPLIER, baseMultiplier * 1.1)),
      difficultyLevel: this.getDifficultyLevel(adjustmentLevel),
      adjustmentReason: this.generateAdjustmentReason(performanceScore, playerPower)
    };
  }

  private getDifficultyLevel(adjustmentLevel: number): 'easy' | 'normal' | 'hard' | 'extreme' {
    if (adjustmentLevel < 0.8) return 'easy';
    if (adjustmentLevel < 1.2) return 'normal';
    if (adjustmentLevel < 1.6) return 'hard';
    return 'extreme';
  }

  private generateAdjustmentReason(performanceScore: number, playerPower: PlayerPowerLevel): string {
    const reasons: string[] = [];
    
    if (performanceScore > 0.8) reasons.push('excellent performance');
    if (performanceScore < 0.3) reasons.push('struggling player');
    
    const powerCategory = new PlayerPowerAnalyzer().getPowerLevelCategory(playerPower);
    if (powerCategory === 'overpowered') reasons.push('high player power');
    if (powerCategory === 'weak') reasons.push('low player power');
    
    return reasons.length > 0 ? reasons.join(', ') : 'balanced difficulty';
  }
}

/**
 * Main Dynamic Difficulty Manager
 */
export class DynamicDifficultyManager {
  private static instance: DynamicDifficultyManager;
  private performanceAnalyzer: PerformanceAnalyzer;
  private playerPowerAnalyzer: PlayerPowerAnalyzer;
  private difficultyBalancer: DifficultyBalancer;
  private currentAdjustment: DifficultyAdjustment | null = null;
  private waveStartTime: number = 0;
  private waveMetrics: Partial<PerformanceMetrics> = {};

  private constructor() {
    this.performanceAnalyzer = new PerformanceAnalyzer();
    this.playerPowerAnalyzer = new PlayerPowerAnalyzer();
    this.difficultyBalancer = new DifficultyBalancer();
  }

  static getInstance(): DynamicDifficultyManager {
    if (!DynamicDifficultyManager.instance) {
      DynamicDifficultyManager.instance = new DynamicDifficultyManager();
    }
    return DynamicDifficultyManager.instance;
  }

  /**
   * Start tracking a new wave
   */
  startWave(waveNumber: number): void {
    this.waveStartTime = performance.now();
    this.waveMetrics = {
      waveNumber,
      totalDamageDealt: 0,
      damageTaken: 0,
      towersUsed: 0
    };
  }

  /**
   * Record damage dealt by player
   */
  recordDamageDealt(damage: number): void {
    this.waveMetrics.totalDamageDealt = (this.waveMetrics.totalDamageDealt || 0) + damage;
  }

  /**
   * Record damage taken by player
   */
  recordDamageTaken(damage: number): void {
    this.waveMetrics.damageTaken = (this.waveMetrics.damageTaken || 0) + damage;
  }

  /**
   * Complete wave and calculate performance
   */
  completeWave(): void {
    const completionTime = performance.now() - this.waveStartTime;
    const state = useGameStore.getState();
    
    const metrics: PerformanceMetrics = {
      waveNumber: this.waveMetrics.waveNumber!,
      completionTime,
      towersUsed: state.towerSlots.filter(slot => slot.tower).length,
      averageTowerLevel: this.calculateAverageTowerLevel(),
      totalDamageDealt: this.waveMetrics.totalDamageDealt || 0,
      damageTaken: this.waveMetrics.damageTaken || 0,
      goldEfficiency: this.calculateGoldEfficiency(),
      waveClearSpeed: this.calculateWaveClearSpeed(completionTime),
      performanceScore: 0 // Will be calculated by analyzer
    };

    this.performanceAnalyzer.recordWavePerformance(metrics);
  }

  /**
   * Get current difficulty adjustment
   */
  getCurrentDifficultyAdjustment(): DifficultyAdjustment {
    if (!this.currentAdjustment) {
      this.currentAdjustment = this.calculateNewAdjustment();
    }
    return this.currentAdjustment;
  }

  /**
   * Calculate new difficulty adjustment
   */
  private calculateNewAdjustment(): DifficultyAdjustment {
    const performanceScore = this.performanceAnalyzer.getPerformanceScore();
    const playerPower = this.playerPowerAnalyzer.calculatePlayerPowerLevel();
    const state = useGameStore.getState();
    
    return this.difficultyBalancer.calculateBalancedAdjustment(
      performanceScore,
      playerPower,
      state.currentWave,
      this.currentAdjustment
    );
  }

  /**
   * Apply difficulty adjustment to enemy
   */
  applyEnemyAdjustment(enemy: Enemy, isBoss: boolean = false): Enemy {
    const adjustment = this.getCurrentDifficultyAdjustment();
    
    if (isBoss) {
      return {
        ...enemy,
        health: Math.floor(enemy.health * adjustment.bossHealthMultiplier),
        maxHealth: Math.floor(enemy.maxHealth * adjustment.bossHealthMultiplier),
        damage: Math.floor(enemy.damage * adjustment.bossDamageMultiplier),
        speed: Math.floor(enemy.speed * adjustment.enemySpeedMultiplier)
      };
    }

    return {
      ...enemy,
      health: Math.floor(enemy.health * adjustment.enemyHealthMultiplier),
      maxHealth: Math.floor(enemy.maxHealth * adjustment.enemyHealthMultiplier),
      damage: Math.floor(enemy.damage * adjustment.enemyDamageMultiplier),
      speed: Math.floor(enemy.speed * adjustment.enemySpeedMultiplier)
    };
  }

  /**
   * Get spawn rate adjustment
   */
  getSpawnRateAdjustment(): number {
    return this.getCurrentDifficultyAdjustment().spawnRateMultiplier;
  }

  /**
   * Get performance trend
   */
  getPerformanceTrend(): 'improving' | 'declining' | 'stable' {
    return this.performanceAnalyzer.getPerformanceTrend();
  }

  /**
   * Get current player power level
   */
  getPlayerPowerLevel(): PlayerPowerLevel {
    return this.playerPowerAnalyzer.calculatePlayerPowerLevel();
  }

  /**
   * Reset difficulty system
   */
  reset(): void {
    this.performanceAnalyzer.reset();
    this.currentAdjustment = null;
    this.waveStartTime = 0;
    this.waveMetrics = {};
  }

  // Helper methods
  private calculateAverageTowerLevel(): number {
    const state = useGameStore.getState();
    const activeTowers = state.towerSlots.filter(slot => slot.tower);
    
    if (activeTowers.length === 0) return 1;
    
    const totalLevel = activeTowers.reduce((sum, slot) => sum + slot.tower!.level, 0);
    return totalLevel / activeTowers.length;
  }

  private calculateGoldEfficiency(): number {
    const state = useGameStore.getState();
    const goldGained = state.gold;
    const goldSpent = state.totalGoldSpent;
    
    if (goldSpent === 0) return 100;
    return (goldGained / goldSpent) * 100;
  }

  private calculateWaveClearSpeed(completionTime: number): number {
    const state = useGameStore.getState();
    const enemiesKilled = state.enemiesKilled;
    
    if (completionTime === 0) return 0;
    return (enemiesKilled / completionTime) * 1000; // Enemies per second
  }
}

// Export singleton instance
export const dynamicDifficultyManager = DynamicDifficultyManager.getInstance(); 