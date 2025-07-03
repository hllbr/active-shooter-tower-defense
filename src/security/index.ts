/**
 * 🔒 Security Module Index
 * Exports all security components for easy importing
 */

// Core Security Manager
export { securityManager, SecurityManager } from './SecurityManager';
export type { SecurityEventType, SecurityEvent } from './SecurityManager';

// Security Enhancements
export {
  sanitizeInput,
  sanitizeCSSValue,
  validateStateChange,
  secureAddGold,
  secureSpendGold,
  secureAddEnergy,
  validatePackagePurchase,
  validateComponentImport,
  getSecurityStatus,
  isSecurityLocked,
  secureEventHandler,
  secureLocalStorage,
  useSecurityMonitoring
} from './SecurityEnhancements';

// Secure Components
export { SecureUpgradeScreen, useSecurityMonitoring as useSecureMonitoring } from './SecureUpgradeScreen';

// Security Tests
export { SecurityTests, securityTests } from './SecurityTests';

// Security Configuration
export const SECURITY_CONFIG = {
  MAX_ACTIONS_PER_MINUTE: 60,
  MAX_GOLD_CHANGES_PER_MINUTE: 10,
  MAX_UPGRADES_PER_MINUTE: 20,
  MAX_GOLD_AMOUNT: 999999,
  MAX_ENERGY_AMOUNT: 1000,
  MAX_ACTIONS_AMOUNT: 50,
  AUDIT_ENABLED: true,
  AUDIT_RETENTION_DAYS: 30,
} as const;

// Security Status Types
export interface SecurityStatus {
  totalEvents: number;
  suspiciousActivityCount: number;
  isLocked: boolean;
  lastStateChecksum: string;
  rateLimitersCount: number;
}

// Security Validation Result
export interface SecurityValidationResult {
  valid: boolean;
  reason?: string;
}

// Security Event Severity
export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

// UI Security Components
export { SecurityStatusIndicator, MiniSecurityIndicator } from '../ui/common/SecurityStatusIndicator';

// Complete security system
export const SECURITY_SYSTEM = {
  version: '1.0.0',
  status: 'ACTIVE',
  features: [
    'State Manipulation Protection',
    'CSS Injection Prevention', 
    'Component Import Security',
    'Event Handler Protection',
    'Data Persistence Security',
    'Store Method Security',
    'Package Purchase Validation',
    'Rate Limiting',
    'Input Sanitization',
    'Security Monitoring',
    'Audit Logging',
    'UI Security Indicators'
  ],
  protectionLevel: 'COMPLETE',
  vulnerabilitiesAddressed: 5,
  securityEventsLogged: 0,
  isLocked: false
}; 