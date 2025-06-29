/**
 * SYNERGY CALCULATOR
 * ==================
 * 
 * Handles all synergy-related calculations including:
 * - Adjacency bonuses
 * - Multiple extractor bonuses
 * - Economy efficiency bonuses
 * - Distance calculations
 */

import type { TowerSlot } from '../../models/gameTypes';
import { economyConfig } from './economyConfig.js';

export interface SynergyParams {
  extractorSlots: TowerSlot[];
  currentSlot: TowerSlot;
  totalExtractors: number;
}

export interface SynergyBreakdown {
  adjacencyCount: number;
  adjacencyBonus: number;
  multipleBonus: number;
  efficiencyBonus: number;
  totalSynergyBonus: number;
}

/**
 * Calculate adjacency count for a specific extractor
 */
export function getAdjacentExtractors(params: SynergyParams): number {
  const { extractorSlots, currentSlot } = params;
  
  return extractorSlots.filter(otherSlot => {
    if (otherSlot === currentSlot) return false;
    const distance = Math.hypot(
      currentSlot.x - otherSlot.x,
      currentSlot.y - otherSlot.y
    );
    return distance <= 150; // Adjacent threshold
  }).length;
}

/**
 * Calculate adjacency bonus multiplier
 */
export function getAdjacencyBonus(adjacentCount: number): number {
  const config = economyConfig.synergyBonuses;
  return Math.min(
    adjacentCount * config.adjacencyBonus,
    config.maxAdjacencyBonus
  );
}

/**
 * Calculate multiple extractor bonus multiplier
 */
export function getMultipleExtractorBonus(totalExtractors: number): number {
  const config = economyConfig.synergyBonuses;
  
  if (totalExtractors <= config.multipleExtractorBonus.length) {
    return config.multipleExtractorBonus[totalExtractors - 1];
  }
  
  return config.multipleExtractorBonus[config.multipleExtractorBonus.length - 1];
}

/**
 * Calculate economy efficiency bonus
 */
export function getEconomyEfficiencyBonus(totalExtractors: number): number {
  const config = economyConfig.synergyBonuses;
  return totalExtractors * config.economyEfficiencyPerExtractor;
}

/**
 * Get complete synergy breakdown for an extractor
 */
export function getSynergyBreakdown(params: SynergyParams): SynergyBreakdown {
  const { totalExtractors } = params;
  const adjacencyCount = getAdjacentExtractors(params);
  const adjacencyBonus = getAdjacencyBonus(adjacencyCount);
  const multipleBonus = getMultipleExtractorBonus(totalExtractors);
  const efficiencyBonus = getEconomyEfficiencyBonus(totalExtractors);
  
  return {
    adjacencyCount,
    adjacencyBonus,
    multipleBonus,
    efficiencyBonus,
    totalSynergyBonus: adjacencyBonus + efficiencyBonus
  };
}

/**
 * Get optimal extractor placement recommendations
 */
export function getOptimalPlacementRecommendations(
  extractorSlots: TowerSlot[],
  availableSlots: TowerSlot[]
): string[] {
  const recommendations: string[] = [];
  
  if (extractorSlots.length === 0) {
    recommendations.push("🏗️ Build your first extractor to start passive income");
    return recommendations;
  }
  
  // Check for adjacency opportunities
  const extractorPositions = extractorSlots.map(slot => ({ x: slot.x, y: slot.y }));
  const optimalAdjacentSlots = availableSlots.filter(slot => {
    return extractorPositions.some(pos => {
      const distance = Math.hypot(slot.x - pos.x, slot.y - pos.y);
      return distance <= 150;
    });
  });
  
  if (optimalAdjacentSlots.length > 0) {
    recommendations.push(`🤝 Place next extractor adjacent for +15% bonus (${optimalAdjacentSlots.length} optimal spots)`);
  }
  
  // Check for multiple extractor bonuses
  const currentBonus = getMultipleExtractorBonus(extractorSlots.length);
  const nextBonus = getMultipleExtractorBonus(extractorSlots.length + 1);
  
  if (nextBonus > currentBonus) {
    const bonusIncrease = ((nextBonus - currentBonus) / currentBonus * 100).toFixed(1);
    recommendations.push(`📈 Build ${extractorSlots.length + 1}th extractor for +${bonusIncrease}% multiple bonus`);
  }
  
  return recommendations;
}

/**
 * Calculate synergy efficiency score (0-100)
 */
export function getSynergyEfficiencyScore(extractorSlots: TowerSlot[]): number {
  if (extractorSlots.length === 0) return 0;
  
  let score = 0;
  
  // Adjacency efficiency (40 points max)
  const totalAdjacentPairs = extractorSlots.reduce((total, slot, _index) => {
    const adjacentCount = getAdjacentExtractors({
      extractorSlots,
      currentSlot: slot,
      totalExtractors: extractorSlots.length
    });
    return total + adjacentCount;
  }, 0) / 2; // Divide by 2 since each pair is counted twice
  
  const maxPossiblePairs = Math.floor(extractorSlots.length * 4 / 2); // Assume 4 adjacent slots per extractor
  const adjacencyEfficiency = maxPossiblePairs > 0 ? totalAdjacentPairs / maxPossiblePairs : 0;
  score += adjacencyEfficiency * 40;
  
  // Multiple extractor efficiency (30 points max)
  const multipleBonus = getMultipleExtractorBonus(extractorSlots.length);
  const maxMultipleBonus = economyConfig.synergyBonuses.multipleExtractorBonus[
    economyConfig.synergyBonuses.multipleExtractorBonus.length - 1
  ];
  score += (multipleBonus / maxMultipleBonus) * 30;
  
  // Economy efficiency (30 points max)
  const efficiencyBonus = getEconomyEfficiencyBonus(extractorSlots.length);
  const optimalEfficiency = 8 * economyConfig.synergyBonuses.economyEfficiencyPerExtractor; // Optimal around 8 extractors
  score += Math.min(efficiencyBonus / optimalEfficiency, 1) * 30;
  
  return Math.min(score, 100);
} 