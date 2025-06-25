/**
 * ELITE ECONOMY SYSTEM v2.0
 * ===========================
 * 
 * Advanced economy balancing with:
 * - Dynamic ROI optimization ✅
 * - Compound interest mechanics ✅  
 * - Risk/reward balancing ✅
 * - Late-game scaling ✅
 * - Synergy bonuses ✅
 * 
 * Target Metrics:
 * - ROI break-even: 8-12 waves
 * - Optimal economy ratio: 30-40%
 * - Late game viability: 100+ waves
 */

import type { TowerSlot } from '../models/gameTypes';

// =================== ECONOMY CONFIGURATION ===================

export const economyConfig = {
  // Base wave income (reduced to encourage economy buildings)
  baseIncome: 35,
  
  // ✅ BALANCED EXTRACTOR INCOME SYSTEM (Fixed economy disasters)
  extractorIncome: {
    // ✅ REBALANCED: Linear + milestone progression instead of exponential explosion
    baseByLevel: [
      60,   // Level 1: 60 gold/wave (early game viable!)
      90,   // Level 2: 90 gold/wave  
      125,  // Level 3: 125 gold/wave
      165,  // Level 4: 165 gold/wave
      210,  // Level 5: 210 gold/wave
      280,  // Level 6: 280 gold/wave (milestone +70)
      360,  // Level 7: 360 gold/wave
      450,  // Level 8: 450 gold/wave
      550,  // Level 9: 550 gold/wave
      675,  // Level 10: 675 gold/wave (milestone +125)
      825,  // Level 11+: 825 gold/wave (controlled late game)
    ],
    
    // ✅ FIXED: Reasonable compound multiplier (was 8% → 3%)
    compoundMultiplier: 1.03, // 3% compound growth per wave
    
    // ✅ FIXED: Controlled wave scaling (was 5% → 2%)
    waveScalingFactor: 0.02, // 2% per wave
    
    // ✅ FIXED: Reasonable scaling cap (was 300% → 150%)
    maxWaveScaling: 2.5, // 150% max scaling
    
    // Late game bonus threshold (unchanged)
    lateGameThreshold: 25,
    lateGameMultiplier: 1.5
  },
  
  // Synergy system for multiple extractors
  synergyBonuses: {
    // Adjacency bonus (extractors next to each other)
    adjacencyBonus: 0.15, // 15% per adjacent extractor
    maxAdjacencyBonus: 0.60, // Max 60% bonus (4 adjacent)
    
    // Multiple extractor bonus
    multipleExtractorBonus: [
      1.0,  // 1 extractor: no bonus
      1.1,  // 2 extractors: 10% bonus each
      1.25, // 3 extractors: 25% bonus each
      1.45, // 4 extractors: 45% bonus each
      1.7,  // 5+ extractors: 70% bonus each
    ],
    
    // Global economy efficiency
    economyEfficiencyPerExtractor: 0.05, // 5% efficiency per extractor
  },
  
  // Risk/Reward mechanics
  riskReward: {
    // Extractors can be targeted by enemies
    canBeTargeted: true,
    targetingProbability: 0.15, // 15% chance to be targeted
    
    // Insurance system
    insuranceCost: 25, // Gold per wave
    insuranceRefund: 0.8, // 80% refund if destroyed
    
    // Risk bonus (higher income for uninsured extractors)
    riskBonusMultiplier: 1.2, // 20% bonus income
  },
  
  // Wave-based income bonus (enhanced)
  waveIncomeBonus: (wave: number): number => {
    if (wave <= 5) return 0;
    if (wave <= 15) return Math.floor((wave - 5) * 15); // 15 gold per wave after 5
    if (wave <= 30) return 150 + Math.floor((wave - 15) * 25); // 25 gold per wave after 15
    return 525 + Math.floor((wave - 30) * 40); // 40 gold per wave after 30
  },
  
  // Mission bonuses (enhanced with economy focus)
  missionBonuses: [
    {
      wave: 5,
      condition: 'noLoss' as const,
      bonus: 150,
      economyBonus: 50, // Additional bonus for having extractors
    }, 
    {
      wave: 10,
      condition: 'under60' as const,
      bonus: 200,
      economyBonus: 75,
    },
    {
      wave: 15,
      condition: 'noLoss' as const,
      bonus: 300,
      economyBonus: 100,
    },
    {
      wave: 20,
      condition: 'under60' as const,
      bonus: 400,
      economyBonus: 150,
    },
    {
      wave: 25,
      condition: 'noLoss' as const,
      bonus: 500,
      economyBonus: 200,
    }
  ],
  
  // Performance-based bonuses
  performanceBonuses: {
    // Efficiency bonus (completing waves quickly)
    speedBonusThreshold: 45, // seconds
    speedBonusMultiplier: 1.3,
    
    // No-damage bonus
    noDamageBonusMultiplier: 1.4,
    
    // Combo bonus (consecutive successful waves)
    comboBonusPerWave: 0.05, // 5% per consecutive wave
    maxComboBonus: 0.5, // Max 50% combo bonus
  }
} as const;

// =================== INTERFACES ===================

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

export type MissionCondition = 'noLoss' | 'under60';

// =================== CORE FUNCTIONS ===================

/**
 * Calculate income for a single extractor with all bonuses
 */
export function getExtractorIncome(
  extractorLevel: number, 
  currentWave: number,
  totalExtractors: number = 1,
  adjacentExtractors: number = 0,
  hasInsurance: boolean = false
): number {
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
  
  return finalIncome;
}

/**
 * Calculate total wave income including all sources
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
  const synergyBonus = 0; // Will be calculated per extractor and included in extractorIncome
  
  // Calculate income from each extractor
  extractors.forEach((extractor, index) => {
    // Count adjacent extractors for synergy
    const extractorSlots = towerSlots.filter(slot => 
      slot.tower && slot.tower.towerType === 'economy'
    );
    
    const currentSlot = extractorSlots[index];
    if (!currentSlot) return;
    
    const adjacentCount = extractorSlots.filter(otherSlot => {
      if (otherSlot === currentSlot) return false;
      const distance = Math.hypot(
        currentSlot.x - otherSlot.x,
        currentSlot.y - otherSlot.y
      );
      return distance <= 150; // Adjacent threshold
    }).length;
    
    const income = getExtractorIncome(
      extractor.level,
      currentWave,
      totalExtractors,
      adjacentCount,
      extractor.hasInsurance || false
    );
    
    extractorIncome += income;
  });
  
  // Base wave income
  const baseIncome = economyConfig.baseIncome;
  
  // Wave bonus
  const waveBonus = economyConfig.waveIncomeBonus(currentWave);
  
  // Mission bonuses
  let missionBonus = 0;
  economyConfig.missionBonuses.forEach(mission => {
    if (mission.wave === currentWave) {
      missionBonus += mission.bonus;
      if (totalExtractors > 0) {
        missionBonus += mission.economyBonus;
      }
    }
  });
  
  // Performance bonuses
  let performanceBonus = 0;
  if (waveCompletionTime) {
    // Speed bonus
    if (waveCompletionTime < economyConfig.performanceBonuses.speedBonusThreshold * 1000) {
      performanceBonus += extractorIncome * (economyConfig.performanceBonuses.speedBonusMultiplier - 1);
    }
    
    // No damage bonus
    if (!tookDamage) {
      performanceBonus += extractorIncome * (economyConfig.performanceBonuses.noDamageBonusMultiplier - 1);
    }
    
    // Combo bonus
    const comboBonus = Math.min(
      consecutiveSuccessfulWaves * economyConfig.performanceBonuses.comboBonusPerWave,
      economyConfig.performanceBonuses.maxComboBonus
    );
    performanceBonus += extractorIncome * comboBonus;
  }
  
  // Risk bonus calculation
  const riskBonus = extractors.filter(e => !e.hasInsurance).length * 
    extractorIncome * (economyConfig.riskReward.riskBonusMultiplier - 1) / totalExtractors;
  
  const totalIncome = baseIncome + extractorIncome + waveBonus + missionBonus + performanceBonus;
  
  // ROI calculation (simplified)
  const averageExtractorCost = 50; // Tower cost
  const roiBreakEven = totalExtractors > 0 ? 
    Math.ceil((totalExtractors * averageExtractorCost) / (extractorIncome || 1)) : 0;
  
  // Efficiency rating
  const efficiencyRating = totalExtractors === 0 ? 'None' :
    roiBreakEven <= 6 ? 'Excellent' :
    roiBreakEven <= 10 ? 'Good' :
    roiBreakEven <= 15 ? 'Fair' : 'Poor';
  
  return {
    totalExtractors,
    totalIncome,
    extractorIncome,
    synergyBonus,
    waveBonus,
    missionBonus,
    performanceBonus,
    riskBonus,
    roiBreakEven,
    efficiencyRating
  };
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
  const baseIncome = getExtractorIncome(level, 1, 1, 0, false); // Base without bonuses
  const compoundIncome = getExtractorIncome(level, wave, 1, 0, false); // With compound only
  const synergyIncome = getExtractorIncome(level, wave, totalExtractors, adjacentCount, false); // With synergy
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
