/**
 * EXTRACTOR INCOME CALCULATOR
 * ===========================
 * 
 * Handles all extractor income calculations including:
 * - Base income by level
 * - Compound interest scaling
 * - Wave scaling
 * - Late game bonuses
 * - Level scaling for high levels
 */

import { economyConfig } from './economyConfig.js';

export interface ExtractorIncomeParams {
  extractorLevel: number;
  currentWave: number;
  totalExtractors: number;
  adjacentExtractors: number;
  hasInsurance: boolean;
}

export interface ExtractorIncomeBreakdown {
  baseIncome: number;
  compoundScaling: number;
  waveScaling: number;
  lateGameBonus: number;
  multipleBonus: number;
  adjacencyBonus: number;
  riskBonus: number;
  finalIncome: number;
}

/**
 * Calculate income for a single extractor with all bonuses
 */
export function getExtractorIncome(params: ExtractorIncomeParams): number {
  const breakdown = getExtractorIncomeBreakdown(params);
  return breakdown.finalIncome;
}

/**
 * Get detailed breakdown of extractor income calculation
 */
export function getExtractorIncomeBreakdown(params: ExtractorIncomeParams): ExtractorIncomeBreakdown {
  const { extractorLevel, currentWave, totalExtractors, adjacentExtractors, hasInsurance } = params;
  const config = economyConfig.extractorIncome;
  
  // Base income by level
  const levelIndex = Math.min(extractorLevel - 1, config.baseByLevel.length - 1);
  let baseIncome = config.baseByLevel[levelIndex];
  
  // Level scaling for very high levels
  if (extractorLevel > config.baseByLevel.length) {
    const extraLevels = extractorLevel - config.baseByLevel.length;
    baseIncome = config.baseByLevel[config.baseByLevel.length - 1] * Math.pow(1.4, extraLevels);
  }
  
  // Compound interest scaling
  const compoundScaling = Math.pow(config.compoundMultiplier, Math.min(currentWave - 1, 20));
  
  // Wave scaling (gets better over time)
  const waveScaling = Math.min(
    1 + (currentWave * config.waveScalingFactor),
    config.maxWaveScaling
  );
  
  // Late game bonus
  const lateGameBonus = currentWave >= config.lateGameThreshold ? config.lateGameMultiplier : 1.0;
  
  // Synergy bonuses
  const multipleBonus = totalExtractors <= economyConfig.synergyBonuses.multipleExtractorBonus.length
    ? economyConfig.synergyBonuses.multipleExtractorBonus[totalExtractors - 1]
    : economyConfig.synergyBonuses.multipleExtractorBonus[economyConfig.synergyBonuses.multipleExtractorBonus.length - 1];
  
  const adjacencyBonus = Math.min(
    adjacentExtractors * economyConfig.synergyBonuses.adjacencyBonus,
    economyConfig.synergyBonuses.maxAdjacencyBonus
  );
  
  // Risk bonus (if no insurance)
  const riskBonus = !hasInsurance ? economyConfig.riskReward.riskBonusMultiplier : 1.0;
  
  // Calculate final income
  const finalIncome = Math.floor(
    baseIncome * 
    compoundScaling * 
    waveScaling * 
    lateGameBonus * 
    multipleBonus * 
    (1 + adjacencyBonus) * 
    riskBonus
  );
  
  return {
    baseIncome,
    compoundScaling,
    waveScaling,
    lateGameBonus,
    multipleBonus,
    adjacencyBonus,
    riskBonus,
    finalIncome
  };
}

/**
 * Get base income for a specific extractor level
 */
export function getBaseIncomeByLevel(level: number): number {
  const config = economyConfig.extractorIncome;
  const levelIndex = Math.min(level - 1, config.baseByLevel.length - 1);
  let baseIncome = config.baseByLevel[levelIndex];
  
  // Level scaling for very high levels
  if (level > config.baseByLevel.length) {
    const extraLevels = level - config.baseByLevel.length;
    baseIncome = config.baseByLevel[config.baseByLevel.length - 1] * Math.pow(1.4, extraLevels);
  }
  
  return baseIncome;
}

/**
 * Calculate compound scaling for a given wave
 */
export function getCompoundScaling(wave: number): number {
  const config = economyConfig.extractorIncome;
  return Math.pow(config.compoundMultiplier, Math.min(wave - 1, 20));
}

/**
 * Calculate wave scaling factor
 */
export function getWaveScaling(wave: number): number {
  const config = economyConfig.extractorIncome;
  return Math.min(
    1 + (wave * config.waveScalingFactor),
    config.maxWaveScaling
  );
}

/**
 * Check if late game bonus applies
 */
export function hasLateGameBonus(wave: number): boolean {
  const config = economyConfig.extractorIncome;
  return wave >= config.lateGameThreshold;
} 