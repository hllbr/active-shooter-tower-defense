/**
 * 🔒 Secure Store Wrapper
 * Provides security validation for all store operations
 * Prevents client-side state manipulation and unauthorized changes
 */

import { securityManager } from './SecurityManager';
import type { Store } from '../models/store';

// Secure Store Interface
export interface SecureStore extends Store {
  // Security-aware methods
  secureAddGold: (amount: number) => void;
  secureSpendGold: (amount: number) => void;
  secureSetGold: (amount: number) => void;
  secureAddEnergy: (amount: number, action?: string) => void;
  secureConsumeEnergy: (amount: number, action: string) => boolean;
  secureAddAction: (amount: number) => void;
  securePurchasePackage: (packageId: string, cost: number, maxAllowed: number) => boolean;
  
  // Security monitoring
  getSecurityStats: () => Record<string, unknown>;
  isSecurityLocked: () => boolean;
}

// Security validation helper (removed - was unused)

// Create secure store wrapper
export function createSecureStore(originalStore: Store): SecureStore {
  const secureStore = { ...originalStore } as SecureStore;

  // Wrap gold-related methods
  secureStore.secureAddGold = (amount: number) => {
    const validation = securityManager.validateStateChange('addGold', {}, { gold: amount });
    if (!validation.valid) {
      console.warn('🔒 Security: secureAddGold blocked:', validation.reason);
      return;
    }
    originalStore.addGold(amount);
  };

  secureStore.secureSpendGold = (amount: number) => {
    const validation = securityManager.validateStateChange('spendGold', {}, { gold: amount });
    if (!validation.valid) {
      console.warn('🔒 Security: secureSpendGold blocked:', validation.reason);
      return;
    }
    originalStore.spendGold(amount);
  };

  secureStore.secureSetGold = (amount: number) => {
    const validation = securityManager.validateStateChange('setGold', {}, { gold: amount });
    if (!validation.valid) {
      console.warn('🔒 Security: secureSetGold blocked:', validation.reason);
      return;
    }
    originalStore.setGold(amount);
  };

  // Wrap energy-related methods
  secureStore.secureAddEnergy = (amount: number, action?: string) => {
    const validation = securityManager.validateStateChange('addEnergy', {}, { energy: amount });
    if (!validation.valid) {
      console.warn('🔒 Security: secureAddEnergy blocked:', validation.reason);
      return;
    }
    originalStore.addEnergy(amount, action);
  };

  secureStore.secureConsumeEnergy = (amount: number, action: string): boolean => {
    const oldState = { ...originalStore };
    const validation = securityManager.validateStateChange('consumeEnergy', oldState, {});
    
    if (!validation.valid) {
      console.warn('🔒 Security validation failed for consumeEnergy:', validation.reason);
      return false;
    }

    return originalStore.consumeEnergy(amount, action);
  };

  // Wrap action-related methods
  secureStore.secureAddAction = (amount: number) => {
    const validation = securityManager.validateStateChange('addAction', {}, { actions: amount });
    if (!validation.valid) {
      console.warn('🔒 Security: secureAddAction blocked:', validation.reason);
      return;
    }
    originalStore.addAction(amount);
  };

  // Wrap package purchase method
  secureStore.securePurchasePackage = (packageId: string, cost: number, maxAllowed: number): boolean => {
    const oldState = { ...originalStore };
    const validation = securityManager.validateStateChange('purchasePackage', oldState, {});
    
    if (!validation.valid) {
      console.warn('🔒 Security validation failed for purchasePackage:', validation.reason);
      return false;
    }

    // Additional validation for package purchases
    if (cost > 10000) {
      console.warn('🔒 Security: Package cost exceeds maximum allowed:', cost);
      return false;
    }

    return originalStore.purchasePackage(packageId, cost, maxAllowed);
  };

  // Security monitoring methods
  secureStore.getSecurityStats = () => securityManager.getSecurityStats();
  
  secureStore.isSecurityLocked = () => {
    const stats = securityManager.getSecurityStats();
    return stats.isLocked as boolean;
  };

  return secureStore;
}

// Secure store hook
export function useSecureStore() {
  // This would be used in components to access the secure store
  // For now, we'll return a placeholder that can be enhanced later
  return {
    getSecurityStats: () => securityManager.getSecurityStats(),
    isSecurityLocked: () => {
      const stats = securityManager.getSecurityStats();
      return stats.isLocked as boolean;
    }
  };
} 