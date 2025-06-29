/**
 * BONUS CALCULATOR
 * ================
 * 
 * Handles all bonus calculations including:
 * - Wave-based income bonuses
 * - Mission completion bonuses
 * - Performance-based bonuses (speed, no-damage, combo)
 */

import { economyConfig } from './economyConfig.js';

export interface BonusParams {
  currentWave: number;
  totalExtractors: number;
  waveCompletionTime?: number;
  tookDamage: boolean;
  consecutiveSuccessfulWaves: number;
  extractorIncome: number;
}

export interface BonusBreakdown {
  waveBonus: number;
  missionBonus: number;
  performanceBonus: number;
  speedBonus: number;
  noDamageBonus: number;
  comboBonus: number;
  totalBonus: number;
}

export type MissionCondition = 'noLoss' | 'under60';

/**
 * Calculate wave-based income bonus
 */
export function getWaveIncomeBonus(wave: number): number {
  return economyConfig.waveIncomeBonus(wave);
}

/**
 * Calculate mission bonuses for current wave
 */
export function getMissionBonuses(wave: number, totalExtractors: number): number {
  let missionBonus = 0;
  
  economyConfig.missionBonuses.forEach(mission => {
    if (mission.wave === wave) {
      missionBonus += mission.bonus;
      if (totalExtractors > 0) {
        missionBonus += mission.economyBonus;
      }
    }
  });
  
  return missionBonus;
}

/**
 * Calculate performance-based bonuses
 */
export function getPerformanceBonuses(params: BonusParams): {
  speedBonus: number;
  noDamageBonus: number;
  comboBonus: number;
  totalPerformanceBonus: number;
} {
  const { waveCompletionTime, tookDamage, consecutiveSuccessfulWaves, extractorIncome } = params;
  const config = economyConfig.performanceBonuses;
  
  let speedBonus = 0;
  let noDamageBonus = 0;
  let comboBonus = 0;
  
  if (waveCompletionTime) {
    // Speed bonus
    if (waveCompletionTime < config.speedBonusThreshold * 1000) {
      speedBonus = extractorIncome * (config.speedBonusMultiplier - 1);
    }
    
    // No damage bonus
    if (!tookDamage) {
      noDamageBonus = extractorIncome * (config.noDamageBonusMultiplier - 1);
    }
    
    // Combo bonus
    const comboMultiplier = Math.min(
      consecutiveSuccessfulWaves * config.comboBonusPerWave,
      config.maxComboBonus
    );
    comboBonus = extractorIncome * comboMultiplier;
  }
  
  const totalPerformanceBonus = speedBonus + noDamageBonus + comboBonus;
  
  return {
    speedBonus,
    noDamageBonus,
    comboBonus,
    totalPerformanceBonus
  };
}

/**
 * Get complete bonus breakdown
 */
export function getBonusBreakdown(params: BonusParams): BonusBreakdown {
  const { currentWave, totalExtractors } = params;
  
  const waveBonus = getWaveIncomeBonus(currentWave);
  const missionBonus = getMissionBonuses(currentWave, totalExtractors);
  const performanceBonuses = getPerformanceBonuses(params);
  
  const totalBonus = waveBonus + missionBonus + performanceBonuses.totalPerformanceBonus;
  
  return {
    waveBonus,
    missionBonus,
    performanceBonus: performanceBonuses.totalPerformanceBonus,
    speedBonus: performanceBonuses.speedBonus,
    noDamageBonus: performanceBonuses.noDamageBonus,
    comboBonus: performanceBonuses.comboBonus,
    totalBonus
  };
}

/**
 * Get upcoming mission information
 */
export function getUpcomingMissions(currentWave: number): Array<{
  wave: number;
  condition: MissionCondition;
  bonus: number;
  economyBonus: number;
  isUpcoming: boolean;
}> {
  return economyConfig.missionBonuses.map(mission => ({
    ...mission,
    isUpcoming: mission.wave > currentWave
  }));
}

/**
 * Get performance recommendations
 */
export function getPerformanceRecommendations(params: BonusParams): string[] {
  const recommendations: string[] = [];
  const { waveCompletionTime, tookDamage, consecutiveSuccessfulWaves } = params;
  const config = economyConfig.performanceBonuses;
  
  if (waveCompletionTime) {
    const completionTimeSeconds = waveCompletionTime / 1000;
    
    if (completionTimeSeconds > config.speedBonusThreshold) {
      recommendations.push(`⚡ Complete waves faster than ${config.speedBonusThreshold}s for speed bonus`);
    }
    
    if (tookDamage) {
      recommendations.push("🛡️ Avoid taking damage for no-damage bonus");
    }
    
    if (consecutiveSuccessfulWaves < 3) {
      recommendations.push("🔥 Build consecutive wave streak for combo bonus");
    }
  }
  
  return recommendations;
}

/**
 * Calculate bonus efficiency score (0-100)
 */
export function getBonusEfficiencyScore(params: BonusParams): number {
  const { extractorIncome } = params;
  const breakdown = getBonusBreakdown(params);
  
  if (extractorIncome === 0) return 0;
  
  let score = 0;
  
  // Performance bonus efficiency (60 points max)
  const performanceRatio = breakdown.performanceBonus / extractorIncome;
  score += Math.min(performanceRatio * 60, 60);
  
  // Mission bonus efficiency (25 points max)
  if (breakdown.missionBonus > 0) {
    score += 25;
  }
  
  // Wave bonus efficiency (15 points max)
  const waveBonusRatio = breakdown.waveBonus / (extractorIncome + breakdown.waveBonus);
  score += waveBonusRatio * 15;
  
  return Math.min(score, 100);
} 