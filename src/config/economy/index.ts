/**
 * ELITE ECONOMY SYSTEM v2.0 - MODULAR VERSION
 * ===========================================
 * 
 * Advanced economy balancing with modular architecture:
 * - ExtractorIncomeCalculator: Core income calculations
 * - SynergyCalculator: Adjacency and multiple bonuses
 * - BonusCalculator: Wave, mission, performance bonuses
 * - RiskRewardManager: Insurance and risk mechanics
 * - EconomyAnalyzer: ROI and strategy analysis
 * 
 * Target Metrics:
 * - ROI break-even: 8-12 waves
 * - Optimal economy ratio: 30-40%
 * - Late game viability: 100+ waves
 */

import type { TowerSlot } from '../../models/gameTypes';

// Import only the functions we actually use
import { economyConfig } from './economyConfig.js';
import { getExtractorIncome } from './ExtractorIncomeCalculator.js';
import { getAdjacentExtractors, getSynergyBreakdown } from './SynergyCalculator.js';
import { getBonusBreakdown, getPerformanceRecommendations } from './BonusCalculator.js';
import { getRiskRewardBreakdown, getInsuranceRecommendations } from './RiskRewardManager.js';
import {
  calculateROIBreakEven,
  getEfficiencyRating,
  getStrategicRecommendations,
  getEconomyHealthAssessment,
  type EconomyStats
} from './EconomyAnalyzer.js';

// Re-export all functions and types for external use
export { economyConfig } from './economyConfig';
export { 
  getExtractorIncome, 
  getExtractorIncomeBreakdown,
  getBaseIncomeByLevel,
  getCompoundScaling,
  getWaveScaling,
  hasLateGameBonus,
  type ExtractorIncomeParams,
  type ExtractorIncomeBreakdown
} from './ExtractorIncomeCalculator';

export {
  getAdjacentExtractors,
  getAdjacencyBonus,
  getMultipleExtractorBonus,
  getEconomyEfficiencyBonus,
  getSynergyBreakdown,
  getOptimalPlacementRecommendations,
  getSynergyEfficiencyScore,
  type SynergyParams,
  type SynergyBreakdown
} from './SynergyCalculator';

export {
  getWaveIncomeBonus,
  getMissionBonuses,
  getPerformanceBonuses,
  getBonusBreakdown,
  getUpcomingMissions,
  getPerformanceRecommendations,
  getBonusEfficiencyScore,
  type BonusParams,
  type BonusBreakdown,
  type MissionCondition
} from './BonusCalculator';

export {
  getInsuranceCost,
  getRiskBonus,
  getTargetingProbability,
  getExpectedDamage,
  getRiskRewardRatio,
  getRiskRewardBreakdown,
  getInsuranceRecommendations,
  getOptimalInsuranceStrategy,
  getRiskEfficiencyScore,
  type RiskRewardParams,
  type RiskRewardBreakdown
} from './RiskRewardManager';

export {
  calculateROIBreakEven,
  getEfficiencyRating,
  getEconomyEfficiencyScore,
  getStrategicRecommendations,
  getExtractorMetrics,
  analyzeEconomyTrends,
  getEconomyHealthAssessment,
  type EconomyStats,
  type ExtractorMetrics
} from './EconomyAnalyzer';

// =================== MAIN ECONOMY FUNCTIONS ===================

/**
 * Calculate total wave income including all sources
 * This is the main function that orchestrates all sub-components
 */
export function calculateTotalWaveIncome(
  extractors: Array<{level: number, hasInsurance?: boolean}>,
  currentWave: number,
  towerSlots: TowerSlot[],
  waveCompletionTime?: number,
  tookDamage: boolean = false,
  consecutiveSuccessfulWaves: number = 0
): EconomyStats {
  const totalExtractors = extractors.length;
  let extractorIncome = 0;
  
  // Calculate income from each extractor using ExtractorIncomeCalculator
  extractors.forEach((extractor, index) => {
    // Get extractor slots for synergy calculations
    const extractorSlots = towerSlots.filter(slot => 
      slot.tower && slot.tower.towerType === 'economy'
    );
    
    const currentSlot = extractorSlots[index];
    if (!currentSlot) return;
    
    // Calculate adjacent extractors using SynergyCalculator
    const adjacentCount = getAdjacentExtractors({
      extractorSlots,
      currentSlot,
      totalExtractors
    });
    
    // Calculate income using ExtractorIncomeCalculator
    const income = getExtractorIncome({
      extractorLevel: extractor.level,
      currentWave,
      totalExtractors,
      adjacentExtractors: adjacentCount,
      hasInsurance: extractor.hasInsurance || false
    });
    
    extractorIncome += income;
  });
  
  // Calculate bonuses using BonusCalculator
  const bonusBreakdown = getBonusBreakdown({
    currentWave,
    totalExtractors,
    waveCompletionTime,
    tookDamage,
    consecutiveSuccessfulWaves,
    extractorIncome
  });
  
  // Calculate risk bonus using RiskRewardManager
  const riskBreakdown = getRiskRewardBreakdown({
    extractors: extractors.map(e => ({ ...e, hasInsurance: e.hasInsurance || false })),
    extractorIncome,
    currentWave
  });
  
  // Calculate total income
  const totalIncome = economyConfig.baseIncome + extractorIncome + bonusBreakdown.totalBonus;
  
  // Calculate ROI using EconomyAnalyzer
  const roiBreakEven = calculateROIBreakEven(totalExtractors, extractorIncome);
  const efficiencyRating = getEfficiencyRating(roiBreakEven, totalExtractors);
  
  return {
    totalExtractors,
    totalIncome,
    extractorIncome,
    synergyBonus: 0, // Calculated per extractor and included in extractorIncome
    waveBonus: bonusBreakdown.waveBonus,
    missionBonus: bonusBreakdown.missionBonus,
    performanceBonus: bonusBreakdown.performanceBonus,
    riskBonus: riskBreakdown.riskBonus,
    roiBreakEven,
    efficiencyRating
  };
}

/**
 * Get comprehensive economy analysis
 */
export function getComprehensiveEconomyAnalysis(
  extractors: Array<{level: number, hasInsurance?: boolean}>,
  currentWave: number,
  towerSlots: TowerSlot[],
  waveCompletionTime?: number,
  tookDamage: boolean = false,
  consecutiveSuccessfulWaves: number = 0
): {
  stats: EconomyStats;
  recommendations: string[];
  health: ReturnType<typeof getEconomyHealthAssessment>;
  synergy: ReturnType<typeof getSynergyBreakdown>;
  risk: ReturnType<typeof getRiskRewardBreakdown>;
  bonus: ReturnType<typeof getBonusBreakdown>;
} {
  // Calculate main stats
  const stats = calculateTotalWaveIncome(
    extractors,
    currentWave,
    towerSlots,
    waveCompletionTime,
    tookDamage,
    consecutiveSuccessfulWaves
  );
  
  // Get extractor slots for analysis
  const extractorSlots = towerSlots.filter(slot => 
    slot.tower && slot.tower.towerType === 'economy'
  );
  
  // Get synergy analysis
  const synergy = extractorSlots.length > 0 ? getSynergyBreakdown({
    extractorSlots,
    currentSlot: extractorSlots[0], // Use first slot as reference
    totalExtractors: extractorSlots.length
  }) : {
    adjacencyCount: 0,
    adjacencyBonus: 0,
    multipleBonus: 1,
    efficiencyBonus: 0,
    totalSynergyBonus: 0
  };
  
  // Get risk analysis
  const risk = getRiskRewardBreakdown({
    extractors: extractors.map(e => ({ ...e, hasInsurance: e.hasInsurance || false })),
    extractorIncome: stats.extractorIncome,
    currentWave
  });
  
  // Get bonus analysis
  const bonus = getBonusBreakdown({
    currentWave,
    totalExtractors: extractors.length,
    waveCompletionTime,
    tookDamage,
    consecutiveSuccessfulWaves,
    extractorIncome: stats.extractorIncome
  });
  
  // Get health assessment
  const health = getEconomyHealthAssessment(stats);
  
  // Combine recommendations from all sources
  const recommendations = [
    ...getStrategicRecommendations(stats, currentWave),
    ...getInsuranceRecommendations({ 
      extractors: extractors.map(e => ({ ...e, hasInsurance: e.hasInsurance || false })), 
      extractorIncome: stats.extractorIncome, 
      currentWave 
    }),
    ...getPerformanceRecommendations({
      currentWave,
      totalExtractors: extractors.length,
      waveCompletionTime,
      tookDamage,
      consecutiveSuccessfulWaves,
      extractorIncome: stats.extractorIncome
    })
  ];
  
  return {
    stats,
    recommendations,
    health,
    synergy,
    risk,
    bonus
  };
} 