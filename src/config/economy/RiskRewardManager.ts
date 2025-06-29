/**
 * RISK/REWARD MANAGER
 * ===================
 * 
 * Handles all risk/reward mechanics including:
 * - Insurance system
 * - Risk bonus calculations
 * - Targeting probability
 * - Damage assessment
 */

import { economyConfig } from './economyConfig.js';

export interface RiskRewardParams {
  extractors: Array<{level: number, hasInsurance: boolean}>;
  extractorIncome: number;
  currentWave: number;
}

export interface RiskRewardBreakdown {
  insuredExtractors: number;
  uninsuredExtractors: number;
  insuranceCost: number;
  riskBonus: number;
  targetingProbability: number;
  expectedDamage: number;
  riskRewardRatio: number;
}

/**
 * Calculate insurance cost for all extractors
 */
export function getInsuranceCost(extractors: Array<{hasInsurance: boolean}>): number {
  const uninsuredCount = extractors.filter(e => !e.hasInsurance).length;
  return uninsuredCount * economyConfig.riskReward.insuranceCost;
}

/**
 * Calculate risk bonus for uninsured extractors
 */
export function getRiskBonus(extractors: Array<{hasInsurance: boolean}>, extractorIncome: number): number {
  const uninsuredCount = extractors.filter(e => !e.hasInsurance).length;
  const totalExtractors = extractors.length;
  
  if (totalExtractors === 0) return 0;
  
  return uninsuredCount * 
    extractorIncome * 
    (economyConfig.riskReward.riskBonusMultiplier - 1) / 
    totalExtractors;
}

/**
 * Calculate targeting probability for extractors
 */
export function getTargetingProbability(extractors: Array<{hasInsurance: boolean}>): number {
  const uninsuredCount = extractors.filter(e => !e.hasInsurance).length;
  const config = economyConfig.riskReward;
  
  if (!config.canBeTargeted) return 0;
  
  // Higher probability with more uninsured extractors
  return Math.min(
    uninsuredCount * config.targetingProbability,
    0.8 // Max 80% targeting probability
  );
}

/**
 * Calculate expected damage from enemy targeting
 */
export function getExpectedDamage(extractors: Array<{level: number, hasInsurance: boolean}>): number {
  const targetingProb = getTargetingProbability(extractors);
  const uninsuredExtractors = extractors.filter(e => !e.hasInsurance);
  
  if (uninsuredExtractors.length === 0) return 0;
  
  // Calculate average extractor value
  const averageLevel = uninsuredExtractors.reduce((sum, e) => sum + e.level, 0) / uninsuredExtractors.length;
  const averageValue = averageLevel * 50; // Rough estimate of extractor value
  
  return targetingProb * averageValue * (1 - economyConfig.riskReward.insuranceRefund);
}

/**
 * Calculate risk/reward ratio
 */
export function getRiskRewardRatio(riskBonus: number, expectedDamage: number): number {
  if (expectedDamage === 0) return riskBonus > 0 ? 10 : 0; // High ratio if no risk
  return riskBonus / expectedDamage;
}

/**
 * Get complete risk/reward breakdown
 */
export function getRiskRewardBreakdown(params: RiskRewardParams): RiskRewardBreakdown {
  const { extractors, extractorIncome } = params;
  
  const insuredExtractors = extractors.filter(e => e.hasInsurance).length;
  const uninsuredExtractors = extractors.filter(e => !e.hasInsurance).length;
  const insuranceCost = getInsuranceCost(extractors);
  const riskBonus = getRiskBonus(extractors, extractorIncome);
  const targetingProbability = getTargetingProbability(extractors);
  const expectedDamage = getExpectedDamage(extractors);
  const riskRewardRatio = getRiskRewardRatio(riskBonus, expectedDamage);
  
  return {
    insuredExtractors,
    uninsuredExtractors,
    insuranceCost,
    riskBonus,
    targetingProbability,
    expectedDamage,
    riskRewardRatio
  };
}

/**
 * Get insurance recommendations
 */
export function getInsuranceRecommendations(params: RiskRewardParams): string[] {
  const recommendations: string[] = [];
  const { currentWave } = params;
  const breakdown = getRiskRewardBreakdown(params);
  
  if (breakdown.uninsuredExtractors === 0) {
    recommendations.push("🛡️ All extractors are insured - no risk");
    return recommendations;
  }
  
  if (breakdown.riskRewardRatio < 1) {
    recommendations.push("⚠️ High risk detected - consider insuring extractors");
  }
  
  if (breakdown.targetingProbability > 0.3) {
    recommendations.push(`🎯 ${(breakdown.targetingProbability * 100).toFixed(1)}% chance of being targeted`);
  }
  
  if (currentWave >= 20 && breakdown.uninsuredExtractors >= 3) {
    recommendations.push("🛡️ Late game: Insure high-value extractors");
  }
  
  if (breakdown.insuranceCost > 100) {
    recommendations.push(`💰 Insurance cost: ${breakdown.insuranceCost} gold/wave`);
  }
  
  return recommendations;
}

/**
 * Calculate optimal insurance strategy
 */
export function getOptimalInsuranceStrategy(extractors: Array<{level: number, hasInsurance: boolean}>): {
  shouldInsure: boolean[];
  expectedValue: number;
  reasoning: string;
} {
  const shouldInsure = extractors.map(extractor => {
    // Insure high-level extractors (level 5+)
    if (extractor.level >= 5) return true;
    
    // Insure if already insured (keep existing)
    if (extractor.hasInsurance) return true;
    
    // Don't insure low-level extractors
    return false;
  });
  
  const insuredCount = shouldInsure.filter(Boolean).length;
  const insuranceCost = insuredCount * economyConfig.riskReward.insuranceCost;
  
  const reasoning = insuredCount > 0 
    ? `Insure ${insuredCount} high-value extractors for ${insuranceCost} gold/wave`
    : "No insurance needed for current setup";
  
  return {
    shouldInsure,
    expectedValue: -insuranceCost,
    reasoning
  };
}

/**
 * Calculate risk efficiency score (0-100)
 */
export function getRiskEfficiencyScore(params: RiskRewardParams): number {
  const breakdown = getRiskRewardBreakdown(params);
  
  let score = 0;
  
  // Risk/reward ratio (40 points max)
  const ratioScore = Math.min(breakdown.riskRewardRatio * 20, 40);
  score += ratioScore;
  
  // Insurance efficiency (30 points max)
  if (breakdown.uninsuredExtractors === 0) {
    score += 30; // Full insurance
  } else {
    const insuranceEfficiency = breakdown.insuredExtractors / (breakdown.insuredExtractors + breakdown.uninsuredExtractors);
    score += insuranceEfficiency * 30;
  }
  
  // Damage mitigation (30 points max)
  const damageScore = Math.max(0, 30 - breakdown.expectedDamage / 10);
  score += damageScore;
  
  return Math.min(score, 100);
} 