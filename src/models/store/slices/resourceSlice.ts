/**
 * 💰 Enhanced Resource System
 * Centralized resource management with source tracking and validation
 */

import { securityManager } from '../../../security/SecurityManager';
import type { StateCreator } from 'zustand';
import type { Store } from '../index';
import type { ResourceSource, ResourceTransaction } from '../../gameTypes';
import { Logger } from '../../../utils/Logger';

export interface ResourceSlice {
  // Enhanced resource functions with source tracking
  addResource: (amount: number, source: ResourceSource, metadata?: Record<string, unknown>) => void;
  spendResource: (amount: number, source: ResourceSource, metadata?: Record<string, unknown>) => boolean;
  setResource: (amount: number, source: ResourceSource, metadata?: Record<string, unknown>) => void;
  
  // Resource validation
  canAfford: (action: GameAction) => boolean;
  getResourceStats: () => ResourceStats;
  
  // Transaction history
  getTransactionHistory: (source?: ResourceSource) => ResourceTransaction[];
  clearTransactionHistory: () => void;
}

export interface GameAction {
  type: 'purchase' | 'upgrade' | 'unlock' | 'package' | 'mine' | 'tower' | 'energy' | 'action';
  cost: number;
  resourceType: 'gold' | 'energy' | 'actions';
  metadata?: Record<string, unknown>;
}

export interface ResourceStats {
  totalEarned: number;
  totalSpent: number;
  netChange: number;
  sourceBreakdown: Record<ResourceSource, number>;
  recentTransactions: ResourceTransaction[];
  averagePerSource: Record<ResourceSource, number>;
}

// Event system for resource updates
const resourceUpdateListeners = new Set<(gold: number) => void>();

export function onResourceUpdated(listener: (gold: number) => void) {
  resourceUpdateListeners.add(listener);
}

export function offResourceUpdated(listener: (gold: number) => void) {
  resourceUpdateListeners.delete(listener);
}

function emitResourceUpdated(gold: number) {
  resourceUpdateListeners.forEach((listener) => listener(gold));
}

export const createResourceSlice: StateCreator<Store, [], [], ResourceSlice> = (set, get, _api) => ({
  addResource: (amount, source, metadata) => {
    const validation = securityManager.validateStateChange('addResource', {}, { gold: amount });
    if (!validation.valid) {
      Logger.warn('🔒 Security: addResource blocked:', validation.reason);
      return;
    }

    const transaction: ResourceTransaction = {
      id: `resource_${Date.now()}_${Math.random()}`,
      amount,
      source,
      timestamp: performance.now(),
      metadata
    };

    set((state: Store) => ({
      gold: state.gold + amount,
      totalGoldEarned: (state.totalGoldEarned || 0) + amount,
      resourceTransactions: [...(state.resourceTransactions || []), transaction]
    }));
    emitResourceUpdated(get().gold + amount);
    Logger.log(`💰 Resource added: ${amount} from ${source}`, metadata);
  },

  spendResource: (amount, source, metadata) => {
    const validation = securityManager.validateStateChange('spendResource', {}, { gold: amount });
    if (!validation.valid) {
      Logger.warn('🔒 Security: spendResource blocked:', validation.reason);
      return false;
    }

    const currentGold = get().gold;
    if (currentGold < amount) {
      Logger.warn('❌ Insufficient resources for purchase:', { required: amount, available: currentGold });
      return false;
    }

    const transaction: ResourceTransaction = {
      id: `spend_${Date.now()}_${Math.random()}`,
      amount: -amount,
      source,
      timestamp: performance.now(),
      metadata
    };

    set((state: Store) => ({
      gold: state.gold - amount,
      totalGoldSpent: state.totalGoldSpent + amount,
      resourceTransactions: [...(state.resourceTransactions || []), transaction]
    }));
    emitResourceUpdated(get().gold - amount);
    Logger.log(`💸 Resource spent: ${amount} on ${source}`, metadata);
    return true;
  },

  setResource: (amount, source, metadata) => {
    const validation = securityManager.validateStateChange('setResource', {}, { gold: amount });
    if (!validation.valid) {
      Logger.warn('🔒 Security: setResource blocked:', validation.reason);
      return;
    }

    const transaction: ResourceTransaction = {
      id: `set_${Date.now()}_${Math.random()}`,
      amount,
      source,
      timestamp: performance.now(),
      metadata
    };

    set((state: Store) => ({
      gold: amount,
      resourceTransactions: [...(state.resourceTransactions || []), transaction]
    }));
    emitResourceUpdated(amount);
    Logger.log(`🔄 Resource set: ${amount} via ${source}`, metadata);
  },

  canAfford: (action) => {
    const state = get();
    
    switch (action.resourceType) {
      case 'gold':
        return state.gold >= action.cost;
      case 'energy':
        return state.energy >= action.cost;
      case 'actions':
        return state.actionsRemaining >= action.cost;
      default:
        return false;
    }
  },

  getResourceStats: () => {
    const state = get();
    const transactions = state.resourceTransactions || [];
    
    const totalEarned = transactions
      .filter((t: ResourceTransaction) => t.amount > 0)
      .reduce((sum: number, t: ResourceTransaction) => sum + t.amount, 0);
    
    const totalSpent = transactions
      .filter((t: ResourceTransaction) => t.amount < 0)
      .reduce((sum: number, t: ResourceTransaction) => sum + Math.abs(t.amount), 0);
    
    const sourceBreakdown = transactions.reduce((acc: Record<ResourceSource, number>, t: ResourceTransaction) => {
      acc[t.source] = (acc[t.source] || 0) + t.amount;
      return acc;
    }, {} as Record<ResourceSource, number>);
    
    const averagePerSource = Object.entries(sourceBreakdown).reduce((acc: Record<ResourceSource, number>, [source, total]) => {
      const sourceTransactions = transactions.filter((t: ResourceTransaction) => t.source === source);
      acc[source as ResourceSource] = sourceTransactions.length > 0 ? total / sourceTransactions.length : 0;
      return acc;
    }, {} as Record<ResourceSource, number>);
    
    return {
      totalEarned,
      totalSpent,
      netChange: totalEarned - totalSpent,
      sourceBreakdown,
      recentTransactions: transactions.slice(-10),
      averagePerSource
    };
  },

  getTransactionHistory: (source) => {
    const state = get();
    const transactions = state.resourceTransactions || [];
    
    if (source) {
      return transactions.filter(t => t.source === source);
    }
    
    return transactions;
  },

  clearTransactionHistory: () => {
    set({ resourceTransactions: [] });
  }
}); 