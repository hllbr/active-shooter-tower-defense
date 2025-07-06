export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/expression\(/gi, '')
    .trim();
}

export function sanitizeCSSValue(value: string, log?: (msg: string) => void): string {
  if (typeof value !== 'string') return '';
  const safeCSSPattern = /^[a-zA-Z0-9#\s\-.(),%]+$/;
  if (!safeCSSPattern.test(value)) {
    log?.('css_injection_attempt');
    return '';
  }
  return value;
}

export function validateComponentImport(componentPath: string, log?: (msg: string) => void): boolean {
  const suspiciousPatterns = [/\.\.\/\.\.\/\.\./, /http[s]?:\/\//, /data:/, /javascript:/, /eval\(/, /Function\(/];
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(componentPath)) {
      log?.('malicious_import_attempt');
      return false;
    }
  }
  return true;
}

export function generateStateChecksum(state: Record<string, unknown>, salt: string): string {
  const stateString = JSON.stringify(state) + salt;
  let hash = 0;
  for (let i = 0; i < stateString.length; i++) {
    const char = stateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

export function sanitizeState(state: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...state };
  const sensitiveFields = ['password', 'token', 'secret', 'key'];
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  return sanitized;
}

export function isExpectedStateChange(action: string): boolean {
  const expectedActions = ['addGold', 'spendGold', 'buildTower', 'upgradeTower', 'addEnergy', 'consumeEnergy', 'addAction', 'purchasePackage', 'continueWave'];
  return expectedActions.some(expected => action.includes(expected));
}

export function isExpectedGoldIncrease(action: string): boolean {
  const expectedActions = ['enemyKill', 'waveComplete', 'achievementReward'];
  return expectedActions.some(expected => action.includes(expected));
}
