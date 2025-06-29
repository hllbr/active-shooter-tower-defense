/**
 * ELITE ECONOMY SYSTEM v2.0 - MODULAR VERSION
 * ===========================================
 * 
 * This file now serves as a compatibility layer for the new modular economy system.
 * All functionality has been moved to the /economy/ subdirectory for better organization.
 * 
 * For new code, import directly from the specific modules:
 * - import { getExtractorIncome } from './economy/ExtractorIncomeCalculator'
 * - import { getSynergyBreakdown } from './economy/SynergyCalculator'
 * - import { getBonusBreakdown } from './economy/BonusCalculator'
 * - import { getRiskRewardBreakdown } from './economy/RiskRewardManager'
 * - import { getEconomyEfficiencyScore } from './economy/EconomyAnalyzer'
 */

// Re-export everything from the new modular system
export * from './economy/index';

// Legacy compatibility exports (deprecated - use specific imports instead)
export { 
  calculateTotalWaveIncome,
  getComprehensiveEconomyAnalysis,
  economyConfig,
  type EconomyStats,
  type ExtractorMetrics,
  type MissionCondition
} from './economy/index';
