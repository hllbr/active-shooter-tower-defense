/**
 * ECONOMY CONFIGURATION
 * ====================
 * 
 * Central configuration for all economy-related settings
 */

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