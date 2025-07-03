/**
 * 🔒 Security Enhancements
 * Simple security utilities that can be integrated into existing components
 * Addresses the main vulnerabilities identified in GitHub Issue #68
 */

import React from 'react';
import { securityManager } from './SecurityManager';

// Secure input sanitization
export const sanitizeInput = (input: string): string => {
  return securityManager.sanitizeInput(input);
};

// Secure CSS value sanitization
export const sanitizeCSSValue = (value: string): string => {
  return securityManager.sanitizeCSSValue(value);
};

// Secure state validation
export const validateStateChange = (
  action: string,
  oldState: Record<string, unknown>,
  newState: Record<string, unknown>
): { valid: boolean; reason?: string } => {
  return securityManager.validateStateChange(action, oldState, newState);
};

// Secure gold operations
export const secureAddGold = (amount: number): boolean => {
  if (amount <= 0 || amount > 1000) {
    securityManager.logSecurityEvent('suspicious_activity', {
      action: 'addGold',
      amount,
      reason: 'Invalid gold amount'
    }, 'high');
    return false;
  }

  securityManager.logSecurityEvent('gold_modification', {
    action: 'addGold',
    amount
  }, 'low');
  return true;
};

export const secureSpendGold = (amount: number): boolean => {
  if (amount <= 0 || amount > 10000) {
    securityManager.logSecurityEvent('suspicious_activity', {
      action: 'spendGold',
      amount,
      reason: 'Invalid gold amount'
    }, 'high');
    return false;
  }

  securityManager.logSecurityEvent('gold_modification', {
    action: 'spendGold',
    amount
  }, 'low');
  return true;
};

// Secure energy operations
export const secureAddEnergy = (amount: number): boolean => {
  if (amount <= 0 || amount > 100) {
    securityManager.logSecurityEvent('suspicious_activity', {
      action: 'addEnergy',
      amount,
      reason: 'Invalid energy amount'
    }, 'high');
    return false;
  }

  securityManager.logSecurityEvent('energy_modification', {
    action: 'addEnergy',
    amount
  }, 'low');
  return true;
};

// Secure package purchase validation
export const validatePackagePurchase = (
  packageId: string,
  cost: number,
  maxAllowed: number
): { valid: boolean; reason?: string } => {
  // Validate package ID
  if (!packageId || typeof packageId !== 'string') {
    return { valid: false, reason: 'Invalid package ID' };
  }

  // Sanitize package ID
  const sanitizedPackageId = sanitizeInput(packageId);
  if (sanitizedPackageId !== packageId) {
    securityManager.logSecurityEvent('invalid_input', {
      action: 'packagePurchase',
      packageId,
      reason: 'Package ID contains invalid characters'
    }, 'high');
    return { valid: false, reason: 'Package ID contains invalid characters' };
  }

  // Validate cost
  if (cost <= 0 || cost > 10000) {
    securityManager.logSecurityEvent('suspicious_activity', {
      action: 'packagePurchase',
      cost,
      reason: 'Invalid package cost'
    }, 'high');
    return { valid: false, reason: 'Invalid package cost' };
  }

  // Validate max allowed
  if (maxAllowed <= 0 || maxAllowed > 100) {
    return { valid: false, reason: 'Invalid max allowed value' };
  }

  return { valid: true };
};

// Secure component import validation
export const validateComponentImport = (componentPath: string): boolean => {
  return securityManager.validateComponentImport(componentPath);
};

// Security status monitoring
export const getSecurityStatus = () => {
  return securityManager.getSecurityStats();
};

export const isSecurityLocked = (): boolean => {
  const stats = securityManager.getSecurityStats();
  return stats.isLocked as boolean;
};

// Secure event handling
export const secureEventHandler = (
  handler: (event: Event) => void,
  action: string
) => {
  return (event: Event) => {
    // Validate event source
    if (!event || !event.target) {
      securityManager.logSecurityEvent('suspicious_activity', {
        action,
        reason: 'Invalid event object'
      }, 'medium');
      return;
    }

    // Log the event
    securityManager.logSecurityEvent('upgrade_purchase', {
      action,
      eventType: event.type,
      target: (event.target as HTMLElement)?.tagName || 'unknown'
    }, 'low');

    // Execute the handler
    try {
      handler(event);
    } catch (error) {
      securityManager.logSecurityEvent('state_manipulation_attempt', {
        action,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'high');
    }
  };
};

// Secure localStorage operations
export const secureLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return null;

      // Validate the stored value
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null) {
        // Check for suspicious patterns in stored data
        const suspiciousPatterns = ['script', 'javascript:', 'data:', 'vbscript:'];
        const valueString = JSON.stringify(parsed).toLowerCase();
        
        for (const pattern of suspiciousPatterns) {
          if (valueString.includes(pattern)) {
            securityManager.logSecurityEvent('suspicious_activity', {
              action: 'localStorageGet',
              key,
              reason: `Suspicious pattern detected: ${pattern}`
            }, 'high');
            return null;
          }
        }
      }

      return value;
    } catch (error) {
      securityManager.logSecurityEvent('state_manipulation_attempt', {
        action: 'localStorageGet',
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'medium');
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      // Validate the key
      if (!key || typeof key !== 'string') {
        return false;
      }

      // Validate the value
      if (typeof value !== 'string') {
        return false;
      }

      // Check for suspicious patterns
      const suspiciousPatterns = ['script', 'javascript:', 'data:', 'vbscript:'];
      const valueLower = value.toLowerCase();
      
      for (const pattern of suspiciousPatterns) {
        if (valueLower.includes(pattern)) {
          securityManager.logSecurityEvent('suspicious_activity', {
            action: 'localStorageSet',
            key,
            reason: `Suspicious pattern detected: ${pattern}`
          }, 'high');
          return false;
        }
      }

      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      securityManager.logSecurityEvent('state_manipulation_attempt', {
        action: 'localStorageSet',
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'medium');
      return false;
    }
  }
};

// Security monitoring hook for React components
export const useSecurityMonitoring = () => {
  const [securityStats, setSecurityStats] = React.useState(getSecurityStatus());
  const [isLocked, setIsLocked] = React.useState(isSecurityLocked());

  React.useEffect(() => {
    const interval = setInterval(() => {
      const stats = getSecurityStatus();
      setSecurityStats(stats);
      setIsLocked(stats.isLocked as boolean);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    securityStats,
    isLocked,
    suspiciousActivityCount: securityStats.suspiciousActivityCount as number,
    totalEvents: securityStats.totalEvents as number
  };
}; 