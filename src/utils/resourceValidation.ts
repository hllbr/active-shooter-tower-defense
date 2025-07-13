/**
 * 💰 Centralized Resource Validation System
 * Moves resource validation logic out of UI components for better maintainability
 */

import type { GameAction } from '../models/store/slices/resourceSlice';
import type { Store } from '../models/store';

export interface ValidationResult {
  canAfford: boolean;
  reason?: string;
  missingAmount?: number;
  suggestions?: string[];
}

export interface ResourceRequirements {
  gold?: number;
  energy?: number;
  actions?: number;
  researchPoints?: number;
}

/**
 * Centralized validation for any game action
 */
export function canAfford(action: GameAction, state: Store): ValidationResult {
  const { cost, resourceType } = action;
  
  switch (resourceType) {
    case 'gold':
      if (state.gold < cost) {
        return {
          canAfford: false,
          reason: 'Insufficient gold',
          missingAmount: cost - state.gold,
          suggestions: [
            'Complete more waves to earn gold',
            'Build economy towers for passive income',
            'Focus on enemy kills for gold drops'
          ]
        };
      }
      break;
      
    case 'energy':
      if (state.energy < cost) {
        return {
          canAfford: false,
          reason: 'Insufficient energy',
          missingAmount: cost - state.energy,
          suggestions: [
            'Wait for energy regeneration',
            'Upgrade energy capacity',
            'Use energy more efficiently'
          ]
        };
      }
      break;
      
    case 'actions':
      if (state.actionsRemaining < cost) {
        return {
          canAfford: false,
          reason: 'Insufficient actions',
          missingAmount: cost - state.actionsRemaining,
          suggestions: [
            'Wait for action regeneration',
            'Upgrade action capacity',
            'Use actions more strategically'
          ]
        };
      }
      break;
      
    default:
      return {
        canAfford: false,
        reason: 'Unknown resource type',
        suggestions: ['Contact support if this error persists']
      };
  }
  
  return { canAfford: true };
}

/**
 * Validate multiple resource requirements at once
 */
export function canAffordMultiple(requirements: ResourceRequirements, state: Store): ValidationResult {
  const missing: string[] = [];
  const suggestions: string[] = [];
  
  if (requirements.gold && state.gold < requirements.gold) {
    missing.push(`Gold: ${requirements.gold - state.gold} more needed`);
    suggestions.push('Complete waves or build economy towers');
  }
  
  if (requirements.energy && state.energy < requirements.energy) {
    missing.push(`Energy: ${requirements.energy - state.energy} more needed`);
    suggestions.push('Wait for regeneration or upgrade capacity');
  }
  
  if (requirements.actions && state.actionsRemaining < requirements.actions) {
    missing.push(`Actions: ${requirements.actions - state.actionsRemaining} more needed`);
    suggestions.push('Wait for regeneration or upgrade capacity');
  }
  
  if (requirements.researchPoints && state.playerProfile.researchPoints < requirements.researchPoints) {
    missing.push(`Research Points: ${requirements.researchPoints - state.playerProfile.researchPoints} more needed`);
    suggestions.push('Complete achievements or daily missions');
  }
  
  if (missing.length > 0) {
    return {
      canAfford: false,
      reason: `Missing resources: ${missing.join(', ')}`,
      suggestions
    };
  }
  
  return { canAfford: true };
}

/**
 * Get resource efficiency recommendations
 */
export function getResourceEfficiencyTips(state: Store): string[] {
  const tips: string[] = [];
  
  // Gold efficiency
  if (state.totalGoldSpent > state.totalGoldEarned * 0.8) {
    tips.push('Consider building more economy towers for sustainable income');
  }
  
  // Energy efficiency
  if (state.energy < state.maxEnergy * 0.3) {
    tips.push('Upgrade energy capacity to avoid running out during waves');
  }
  
  // Action efficiency
  if (state.actionsRemaining < state.maxActions * 0.5) {
    tips.push('Upgrade action capacity for more strategic flexibility');
  }
  
  // Wave completion efficiency
  if (state.currentWave > 10 && state.totalEnemiesKilled < state.currentWave * 50) {
    tips.push('Focus on tower placement to kill more enemies per wave');
  }
  
  return tips;
}

/**
 * Calculate optimal resource allocation
 */
export function calculateOptimalAllocation(
  availableGold: number,
  priorities: ('defense' | 'economy' | 'upgrades')[]
): { defense: number; economy: number; upgrades: number } {
  const total = availableGold;
  const allocation = { defense: 0, economy: 0, upgrades: 0 };
  
  // Simple priority-based allocation
  let remaining = total;
  
  for (const priority of priorities) {
    const allocationAmount = Math.floor(remaining * 0.4); // 40% to each priority
    allocation[priority] = allocationAmount;
    remaining -= allocationAmount;
  }
  
  return allocation;
}

/**
 * Validate purchase with discount calculations
 */
export function canAffordWithDiscount(
  baseCost: number,
  discountMultiplier: number,
  resourceType: 'gold' | 'energy' | 'actions',
  state: Store
): ValidationResult {
  const finalCost = Math.floor(baseCost * discountMultiplier);
  return canAfford({
    type: 'purchase',
    cost: finalCost,
    resourceType,
    metadata: { baseCost, discountMultiplier }
  }, state);
}

/**
 * Get resource status summary
 */
export function getResourceStatus(state: Store): {
  goldStatus: 'low' | 'medium' | 'high';
  energyStatus: 'low' | 'medium' | 'high';
  actionStatus: 'low' | 'medium' | 'high';
  recommendations: string[];
} {
  const goldPercentage = state.gold / Math.max(state.totalGoldEarned, 1000);
  const energyPercentage = state.energy / state.maxEnergy;
  const actionPercentage = state.actionsRemaining / state.maxActions;
  
  const goldStatus = goldPercentage < 0.3 ? 'low' : goldPercentage < 0.7 ? 'medium' : 'high';
  const energyStatus = energyPercentage < 0.3 ? 'low' : energyPercentage < 0.7 ? 'medium' : 'high';
  const actionStatus = actionPercentage < 0.3 ? 'low' : actionPercentage < 0.7 ? 'medium' : 'high';
  
  const recommendations = getResourceEfficiencyTips(state);
  
  return {
    goldStatus,
    energyStatus,
    actionStatus,
    recommendations
  };
} 