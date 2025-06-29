/**
 * ECONOMY ANALYZER
 * ================
 * 
 * Handles economy analysis including:
 * - ROI calculations
 * - Efficiency scoring
 * - Strategic recommendations
 * - Performance metrics
 */

import { getExtractorIncome } from './ExtractorIncomeCalculator';

export interface EconomyStats {
  totalExtractors: number;
  totalIncome: number;
  extractorIncome: number;
  synergyBonus: number;
  waveBonus: number;
  missionBonus: number;
  performanceBonus: number;
  riskBonus: number;
  roiBreakEven: number;
  efficiencyRating: string;
}

export interface ExtractorMetrics {
  level: number;
  baseIncome: number;
  compoundIncome: number;
  synergyIncome: number;
  totalIncome: number;
  roiWaves: number;
}

/**
 * Calculate ROI break-even point
 */
export function calculateROIBreakEven(
  totalExtractors: number, 
  extractorIncome: number
): number {
  if (totalExtractors === 0 || extractorIncome === 0) return 0;
  
  const averageExtractorCost = 50; // Base tower cost
  const totalCost = totalExtractors * averageExtractorCost;
  
  return Math.ceil(totalCost / extractorIncome);
}

/**
 * Get efficiency rating based on ROI
 */
export function getEfficiencyRating(roiBreakEven: number, totalExtractors: number): string {
  if (totalExtractors === 0) return 'None';
  
  if (roiBreakEven <= 6) return 'Excellent';
  if (roiBreakEven <= 10) return 'Good';
  if (roiBreakEven <= 15) return 'Fair';
  return 'Poor';
}

/**
 * Calculate economy efficiency score for strategy recommendations
 */
export function getEconomyEfficiencyScore(stats: EconomyStats): number {
  // Score based on multiple factors (0-100)
  let score = 0;
  
  // ROI efficiency (40 points max)
  if (stats.roiBreakEven <= 6) score += 40;
  else if (stats.roiBreakEven <= 10) score += 30;
  else if (stats.roiBreakEven <= 15) score += 20;
  else score += 10;
  
  // Extractor count (30 points max)
  const extractorRatio = Math.min(stats.totalExtractors / 8, 1); // Optimal around 8 extractors
  score += extractorRatio * 30;
  
  // Income diversity (20 points max)
  if (stats.extractorIncome > stats.waveBonus) score += 20;
  else score += 10;
  
  // Performance bonuses (10 points max)
  score += Math.min(stats.performanceBonus / stats.extractorIncome * 10, 10);
  
  return Math.min(score, 100);
}

/**
 * Get strategic recommendations based on current economy state
 */
export function getStrategicRecommendations(stats: EconomyStats, currentWave: number): string[] {
  const recommendations: string[] = [];
  
  if (stats.totalExtractors === 0) {
    recommendations.push("🏗️ Build your first extractor to start passive income");
  } else if (stats.totalExtractors < 3 && currentWave < 10) {
    recommendations.push("📈 Build 2-3 extractors for early game economy");
  } else if (stats.roiBreakEven > 12) {
    recommendations.push("🔧 Upgrade existing extractors for better ROI");
  }
  
  if (stats.totalExtractors >= 2 && stats.synergyBonus === 0) {
    recommendations.push("🤝 Place extractors adjacent for synergy bonuses");
  }
  
  if (stats.totalExtractors >= 4 && currentWave >= 15) {
    recommendations.push("🛡️ Consider insurance for high-value extractors");
  }
  
  if (currentWave >= 20 && stats.extractorIncome < 1000) {
    recommendations.push("🚀 Scale up economy for late game viability");
  }
  
  return recommendations;
}

/**
 * Get detailed metrics for a specific extractor
 */
export function getExtractorMetrics(
  level: number,
  wave: number,
  totalExtractors: number = 1,
  adjacentCount: number = 0
): ExtractorMetrics {
  const baseIncome = getExtractorIncome({
    extractorLevel: level,
    currentWave: 1,
    totalExtractors: 1,
    adjacentExtractors: 0,
    hasInsurance: false
  });
  
  const compoundIncome = getExtractorIncome({
    extractorLevel: level,
    currentWave: wave,
    totalExtractors: 1,
    adjacentExtractors: 0,
    hasInsurance: false
  });
  
  const synergyIncome = getExtractorIncome({
    extractorLevel: level,
    currentWave: wave,
    totalExtractors,
    adjacentExtractors: adjacentCount,
    hasInsurance: false
  });
  
  const totalIncome = synergyIncome; // Final income
  
  const towerCost = 50; // Base tower cost + upgrades estimate
  const upgradesCost = (level - 1) * 60; // Rough upgrade cost
  const totalCost = towerCost + upgradesCost;
  
  const roiWaves = Math.ceil(totalCost / totalIncome);
  
  return {
    level,
    baseIncome,
    compoundIncome,
    synergyIncome,
    totalIncome,
    roiWaves
  };
}

/**
 * Analyze economy performance trends
 */
export function analyzeEconomyTrends(
  currentStats: EconomyStats,
  previousStats?: EconomyStats
): {
  growthRate: number;
  efficiencyChange: number;
  trend: 'improving' | 'declining' | 'stable';
  insights: string[];
} {
  const insights: string[] = [];
  
  if (!previousStats) {
    return {
      growthRate: 0,
      efficiencyChange: 0,
      trend: 'stable',
      insights: ['No previous data for comparison']
    };
  }
  
  // Calculate growth rate
  const incomeGrowth = currentStats.totalIncome - previousStats.totalIncome;
  const growthRate = previousStats.totalIncome > 0 
    ? (incomeGrowth / previousStats.totalIncome) * 100 
    : 0;
  
  // Calculate efficiency change
  const currentEfficiency = getEconomyEfficiencyScore(currentStats);
  const previousEfficiency = getEconomyEfficiencyScore(previousStats);
  const efficiencyChange = currentEfficiency - previousEfficiency;
  
  // Determine trend
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (growthRate > 5 && efficiencyChange > 5) {
    trend = 'improving';
  } else if (growthRate < -5 || efficiencyChange < -5) {
    trend = 'declining';
  }
  
  // Generate insights
  if (growthRate > 10) {
    insights.push(`📈 Strong income growth: +${growthRate.toFixed(1)}%`);
  } else if (growthRate < -10) {
    insights.push(`📉 Income declining: ${growthRate.toFixed(1)}%`);
  }
  
  if (efficiencyChange > 10) {
    insights.push(`✅ Efficiency improved: +${efficiencyChange.toFixed(1)} points`);
  } else if (efficiencyChange < -10) {
    insights.push(`❌ Efficiency declined: ${efficiencyChange.toFixed(1)} points`);
  }
  
  if (currentStats.totalExtractors > previousStats.totalExtractors) {
    insights.push(`🏗️ Added ${currentStats.totalExtractors - previousStats.totalExtractors} extractors`);
  }
  
  return {
    growthRate,
    efficiencyChange,
    trend,
    insights
  };
}

/**
 * Get economy health assessment
 */
export function getEconomyHealthAssessment(stats: EconomyStats): {
  health: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  score: number;
  issues: string[];
  strengths: string[];
} {
  const score = getEconomyEfficiencyScore(stats);
  const issues: string[] = [];
  const strengths: string[] = [];
  
  // Assess health based on score
  let health: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  if (score >= 80) health = 'excellent';
  else if (score >= 60) health = 'good';
  else if (score >= 40) health = 'fair';
  else if (score >= 20) health = 'poor';
  else health = 'critical';
  
  // Identify issues
  if (stats.totalExtractors === 0) {
    issues.push("No economy infrastructure");
  }
  
  if (stats.roiBreakEven > 15) {
    issues.push("Poor return on investment");
  }
  
  if (stats.extractorIncome < stats.waveBonus) {
    issues.push("Over-reliant on wave bonuses");
  }
  
  if (stats.totalExtractors > 0 && stats.synergyBonus === 0) {
    issues.push("Missing synergy bonuses");
  }
  
  // Identify strengths
  if (stats.roiBreakEven <= 6) {
    strengths.push("Excellent ROI");
  }
  
  if (stats.performanceBonus > 0) {
    strengths.push("Good performance bonuses");
  }
  
  if (stats.totalExtractors >= 6) {
    strengths.push("Strong economy scale");
  }
  
  return {
    health,
    score,
    issues,
    strengths
  };
} 