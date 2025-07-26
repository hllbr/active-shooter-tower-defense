/**
 * 🔒 Security Manager - Comprehensive Security Implementation
 * Addresses all vulnerabilities identified in GitHub Issue #68
 * 
 * Security Features:
 * - State integrity validation
 * - Rate limiting
 * - Input sanitization
 * - Audit logging
 * - Checksum verification
 * - XSS prevention
 */

// Security Configuration
const SECURITY_CONFIG = {
  // Rate limiting
  MAX_ACTIONS_PER_MINUTE: 60,
  MAX_GOLD_CHANGES_PER_MINUTE: 10,
  MAX_UPGRADES_PER_MINUTE: 20,
  
  // Validation limits
  MAX_GOLD_AMOUNT: 999999,
  MAX_ENERGY_AMOUNT: 1000,
  MAX_ACTIONS_AMOUNT: 50,
  
  // Checksum settings
  CHECKSUM_SALT: 'active-shooter-tower-defense-2025',
  
  // Audit settings
  AUDIT_ENABLED: true,
  AUDIT_RETENTION_DAYS: 30,
} as const;

import {
  sanitizeInput,
  sanitizeCSSValue,
  validateComponentImport,
  generateStateChecksum,
  sanitizeState,
  isExpectedStateChange,
  isExpectedGoldIncrease
} from './helpers/securityUtils';
// Logger import removed for production

// Security Event Types
export type SecurityEventType = 
  | 'state_manipulation_attempt'
  | 'rate_limit_exceeded'
  | 'invalid_input'
  | 'checksum_mismatch'
  | 'suspicious_activity'
  | 'upgrade_purchase'
  | 'gold_modification'
  | 'energy_modification';

// Security Event Interface
export interface SecurityEvent {
  timestamp: number;
  type: SecurityEventType;
  userId?: string;
  action: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Rate Limiter Interface
interface RateLimiter {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Security Manager Class
export class SecurityManager {
  private static instance: SecurityManager;
  private auditLog: SecurityEvent[] = [];
  private rateLimiters: RateLimiter = {};
  private lastStateChecksum: string = '';
  private suspiciousActivityCount: number = 0;
  private isLocked: boolean = false;

  private constructor() {
    this.initializeSecurity();
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Initialize security systems
   */
  private initializeSecurity(): void {
    
    // Set up periodic security checks
    setInterval(() => {
      this.performSecurityAudit();
    }, 30000); // Every 30 seconds
    
    // Set up rate limiter cleanup
    setInterval(() => {
      this.cleanupRateLimiters();
    }, 60000); // Every minute
  }

  /**
   * Validate state changes and prevent manipulation
   */
  public validateStateChange(
    action: string,
    oldState: Record<string, unknown>,
    newState: Record<string, unknown>
  ): { valid: boolean; reason?: string } {
    try {
      // Check if system is locked due to suspicious activity
      if (this.isLocked) {
        this.logSecurityEvent('state_manipulation_attempt', {
          action,
          reason: 'System locked due to suspicious activity',
          oldState: sanitizeState(oldState),
          newState: sanitizeState(newState)
        }, 'critical');
        return { valid: false, reason: 'System temporarily locked' };
      }

      // Rate limiting check
      if (!this.checkRateLimit(action)) {
        this.logSecurityEvent('rate_limit_exceeded', {
          action,
          limit: SECURITY_CONFIG.MAX_ACTIONS_PER_MINUTE
        }, 'high');
        return { valid: false, reason: 'Rate limit exceeded' };
      }

      // Validate specific state changes
      const validation = this.validateSpecificChanges(action, oldState, newState);
      if (!validation.valid) {
        return validation;
      }

      // Generate and verify checksum
      const newChecksum = generateStateChecksum(newState, SECURITY_CONFIG.CHECKSUM_SALT);
      if (this.lastStateChecksum && newChecksum !== this.lastStateChecksum) {
        // Check if this is an expected change
        if (!isExpectedStateChange(action)) {
          this.logSecurityEvent('checksum_mismatch', {
            action,
            expectedChecksum: this.lastStateChecksum,
            actualChecksum: newChecksum
          }, 'critical');
          return { valid: false, reason: 'State integrity violation' };
        }
      }

      this.lastStateChecksum = newChecksum;
      return { valid: true };

    } catch (error) {
      this.logSecurityEvent('state_manipulation_attempt', {
        action,
        error: error instanceof Error ? error.message : 'Unknown error',
        oldState: sanitizeState(oldState),
        newState: sanitizeState(newState)
      }, 'critical');
      return { valid: false, reason: 'Security validation error' };
    }
  }

  /**
   * Validate specific state changes based on action type
   */
  private validateSpecificChanges(
    action: string,
    oldState: Record<string, unknown>,
    newState: Record<string, unknown>
  ): { valid: boolean; reason?: string } {
    // Gold validation
    if (action.includes('gold') || action.includes('addGold') || action.includes('spendGold')) {
      const oldGold = Number(oldState.gold) || 0;
      const newGold = Number(newState.gold) || 0;
      
      if (newGold > SECURITY_CONFIG.MAX_GOLD_AMOUNT) {
        this.logSecurityEvent('suspicious_activity', {
          action,
          oldGold,
          newGold,
          maxAllowed: SECURITY_CONFIG.MAX_GOLD_AMOUNT
        }, 'critical');
        return { valid: false, reason: 'Gold amount exceeds maximum allowed' };
      }

      // Check for unrealistic gold increases
      const goldIncrease = newGold - oldGold;
      if (goldIncrease > 1000 && !isExpectedGoldIncrease(action)) {
        this.logSecurityEvent('suspicious_activity', {
          action,
          goldIncrease,
          oldGold,
          newGold
        }, 'high');
        return { valid: false, reason: 'Unrealistic gold increase detected' };
      }
    }

    // Energy validation
    if (action.includes('energy') || action.includes('addEnergy')) {
      const newEnergy = Number(newState.energy) || 0;
      if (newEnergy > SECURITY_CONFIG.MAX_ENERGY_AMOUNT) {
        return { valid: false, reason: 'Energy amount exceeds maximum allowed' };
      }
    }

    // Actions validation
    if (action.includes('action') || action.includes('addAction')) {
      const newActions = Number(newState.actionsRemaining) || 0;
      if (newActions > SECURITY_CONFIG.MAX_ACTIONS_AMOUNT) {
        return { valid: false, reason: 'Actions amount exceeds maximum allowed' };
      }
    }

    return { valid: true };
  }

  /**
   * Sanitize input to prevent XSS and injection attacks
   */
  public sanitizeInput(input: string): string {
    return sanitizeInput(input);
  }

  /**
   * Sanitize CSS values to prevent injection
   */
  public sanitizeCSSValue(value: string): string {
    return sanitizeCSSValue(value, () => this.logSecurityEvent('invalid_input', { type: 'css_injection_attempt', value: sanitizeInput(value) }, 'high'));
  }

  /**
   * Validate component imports to prevent malicious code injection
   */
  public validateComponentImport(componentPath: string): boolean {
    return validateComponentImport(componentPath, msg => this.logSecurityEvent('suspicious_activity', { type: msg, componentPath: sanitizeInput(componentPath) }, 'critical'));
  }
  /**
   * Rate limiting implementation
   */
  private checkRateLimit(action: string): boolean {
    const now = Date.now();
    const key = `rate_limit_${action}`;
    
    if (!this.rateLimiters[key] || now > this.rateLimiters[key].resetTime) {
      this.rateLimiters[key] = {
        count: 1,
        resetTime: now + 60000 // 1 minute
      };
      return true;
    }

    const limit = this.getRateLimitForAction(action);
    if (this.rateLimiters[key].count >= limit) {
      return false;
    }

    this.rateLimiters[key].count++;
    return true;
  }

  /**
   * Get rate limit for specific action
   */
  private getRateLimitForAction(action: string): number {
    if (action.includes('gold')) {
      return SECURITY_CONFIG.MAX_GOLD_CHANGES_PER_MINUTE;
    }
    if (action.includes('upgrade') || action.includes('purchase')) {
      return SECURITY_CONFIG.MAX_UPGRADES_PER_MINUTE;
    }
    return SECURITY_CONFIG.MAX_ACTIONS_PER_MINUTE;
  }

  /**
   * Generate checksum for state integrity
   */
  private generateStateChecksum(state: Record<string, unknown>): string {
    const sanitizedState = sanitizeState(state);
    return generateStateChecksum(sanitizedState, SECURITY_CONFIG.CHECKSUM_SALT);
  }

  /**
   * Sanitize state for logging (remove sensitive data)
   */
  private sanitizeState(state: Record<string, unknown>): Record<string, unknown> {
    return sanitizeState(state);
  }

  /**
   * Check if state change is expected
   */
  private isExpectedStateChange(action: string): boolean {
    return isExpectedStateChange(action);
  }

  /**
   * Check if gold increase is expected
   */
  private isExpectedGoldIncrease(action: string): boolean {
    return isExpectedGoldIncrease(action);
  }

  /**
   * Log security event
   */
  private logSecurityEvent(
    type: SecurityEventType,
    details: Record<string, unknown>,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): void {
    const event: SecurityEvent = {
      timestamp: Date.now(),
      type,
      action: String(details.action || 'unknown'),
      details,
      severity
    };

    this.auditLog.push(event);
    
    // Keep only last 1000 events
    if (this.auditLog.length > 1000) {
      this.auditLog.shift();
    }

    // Log to console for debugging in non-production environments
    // Security warning logged
  }

  /**
   * Perform security audit
   */
  private performSecurityAudit(): void {
    // Clean up old rate limiters
    this.cleanupRateLimiters();
    
    // Check for suspicious activity patterns
    const recentEvents = this.auditLog.filter(event => 
      Date.now() - event.timestamp < 60000 && 
      event.severity === 'critical'
    );
    
    if (recentEvents.length > 5) {
      this.isLocked = true;
      setTimeout(() => {
        this.isLocked = false;
      }, 300000); // 5 minutes lockout
      
      // Security: System temporarily locked due to suspicious activity
    }
  }

  /**
   * Clean up expired rate limiters
   */
  private cleanupRateLimiters(): void {
    const now = Date.now();
    Object.keys(this.rateLimiters).forEach(key => {
      if (now > this.rateLimiters[key].resetTime) {
        delete this.rateLimiters[key];
      }
    });
  }

  /**
   * Get security statistics for monitoring
   */
  public getSecurityStats(): Record<string, unknown> {
    return {
      totalEvents: this.auditLog.length,
      suspiciousActivityCount: this.suspiciousActivityCount,
      isLocked: this.isLocked,
      lastStateChecksum: this.lastStateChecksum,
      rateLimitersCount: Object.keys(this.rateLimiters).length,
      recentCriticalEvents: this.auditLog.filter(event => 
        Date.now() - event.timestamp < 60000 && 
        event.severity === 'critical'
      ).length
    };
  }
}

// Export singleton instance
export const securityManager = SecurityManager.getInstance();
