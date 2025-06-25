/**
 * 🎯 SMART NUMBER FORMATTING SYSTEM
 * CRITICAL FIX: Replaces confusing decimals with clean, meaningful displays
 * User Experience: "245.67" → "245", "%23.456" → "23%", "123.456789" → "125"
 */

// =============================================
// CORE FORMATTING FUNCTIONS
// =============================================

/**
 * Format currency/gold amounts with intelligent rounding
 * Rules: Round to nearest 5 or 10, use K/M notation for large numbers
 */
export function formatCurrency(amount: number): string {
  if (amount <= 0) return '0';
  
  // Large numbers get K/M notation
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1).replace('.0', '')}M`;
  }
  
  if (amount >= 10000) {
    return `${(amount / 1000).toFixed(1).replace('.0', '')}K`;
  }
  
  if (amount >= 1000) {
    return `${Math.round(amount / 1000 * 10) / 10}K`;
  }
  
  // Small amounts: round to nearest 5 or 10
  if (amount >= 100) {
    return Math.round(amount / 5) * 5 + '';
  }
  
  if (amount >= 20) {
    return Math.round(amount / 5) * 5 + '';
  }
  
  // Very small amounts: round to whole numbers
  return Math.round(amount) + '';
}

/**
 * Format percentages with meaningful precision
 * Rules: Round to whole numbers, use meaningful increments
 */
export function formatPercentage(decimal: number, precision: 'basic' | 'standard' | 'detailed' = 'basic'): string {
  const percentage = decimal * 100;
  
  if (percentage <= 0) return '0%';
  if (percentage >= 100) return '100%';
  
  switch (precision) {
    case 'basic':
      // Round to nearest whole number
      return Math.round(percentage) + '%';
      
    case 'standard':
      // Round to nearest 5%
      return Math.round(percentage / 5) * 5 + '%';
      
    case 'detailed':
      // One decimal place for precise values
      return percentage.toFixed(1).replace('.0', '') + '%';
      
    default:
      return Math.round(percentage) + '%';
  }
}

/**
 * Format damage values with combat-appropriate rounding
 * Rules: Round to nearest 5, 10, or 25 based on magnitude
 */
export function formatDamage(damage: number): string {
  if (damage <= 0) return '0';
  
  // Very large damage
  if (damage >= 10000) {
    return formatCurrency(damage);
  }
  
  // Large damage: round to nearest 25
  if (damage >= 1000) {
    return Math.round(damage / 25) * 25 + '';
  }
  
  // Medium damage: round to nearest 10
  if (damage >= 100) {
    return Math.round(damage / 10) * 10 + '';
  }
  
  // Small damage: round to nearest 5
  if (damage >= 20) {
    return Math.round(damage / 5) * 5 + '';
  }
  
  // Very small damage: whole numbers
  return Math.round(damage) + '';
}

/**
 * Format range/distance values
 * Rules: Round to meaningful increments
 */
export function formatRange(range: number): string {
  if (range <= 0) return '0';
  
  // Large ranges: round to nearest 25
  if (range >= 500) {
    return Math.round(range / 25) * 25 + '';
  }
  
  // Medium ranges: round to nearest 10
  if (range >= 100) {
    return Math.round(range / 10) * 10 + '';
  }
  
  // Small ranges: round to nearest 5
  return Math.round(range / 5) * 5 + '';
}

/**
 * Format timer values (seconds)
 * Rules: Show whole seconds, use appropriate units
 */
export function formatTime(seconds: number): string {
  if (seconds <= 0) return '0s';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  
  if (mins > 0) {
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  
  return `${secs}s`;
}

/**
 * Format speed/rate values
 * Rules: One decimal place max, meaningful units
 */
export function formatRate(rate: number, unit: string = '/sec'): string {
  if (rate <= 0) return `0${unit}`;
  
  // High rates: round to one decimal
  if (rate >= 10) {
    return `${rate.toFixed(1).replace('.0', '')}${unit}`;
  }
  
  // Low rates: one decimal place
  return `${rate.toFixed(1)}${unit}`;
}

// =============================================
// CONTEXTUAL FORMATTING
// =============================================

/**
 * Format numbers based on context and screen size
 */
export function formatContextual(
  value: number, 
  context: 'price' | 'damage' | 'percentage' | 'range' | 'time' | 'rate',
  options: {
    isMobile?: boolean;
    precision?: 'basic' | 'standard' | 'detailed';
    showUnit?: boolean;
  } = {}
): string {
  const { precision = 'basic', showUnit = true } = options;
  
  switch (context) {
    case 'price': {
      const formatted = formatCurrency(value);
      return showUnit ? `${formatted} 💰` : formatted;
    }
      
    case 'damage':
      return formatDamage(value);
      
    case 'percentage':
      return formatPercentage(value, precision);
      
    case 'range': {
      const range = formatRange(value);
      return showUnit ? `${range} units` : range;
    }
      
    case 'time':
      return formatTime(value);
      
    case 'rate':
      return formatRate(value);
      
    default:
      return Math.round(value) + '';
  }
}

// =============================================
// AFFORDABILITY HELPERS
// =============================================

/**
 * Get color coding for affordability
 */
export function getAffordabilityColor(cost: number, available: number): string {
  if (available >= cost) return '#4ade80'; // Green - can afford
  if (available >= cost * 0.8) return '#fbbf24'; // Yellow - almost affordable
  return '#ef4444'; // Red - cannot afford
}

/**
 * Get affordability status with helpful text
 */
export function getAffordabilityStatus(cost: number, available: number): {
  canAfford: boolean;
  color: string;
  message: string;
} {
  const canAfford = available >= cost;
  const deficit = cost - available;
  
  return {
    canAfford,
    color: getAffordabilityColor(cost, available),
    message: canAfford 
      ? '✅ Satın Alınabilir'
      : `❌ ${formatCurrency(deficit)} daha gerekli`
  };
}

// ✅ UNIFIED BUTTON TEXT SYSTEM (fixes inconsistent button states)
export function getUnifiedButtonText(
  isMaxed: boolean, 
  canAfford: boolean, 
  isLocked: boolean = false,
  context: 'upgrade' | 'purchase' | 'package' = 'upgrade'
): string {
  if (isLocked) return '🔒 Kilitli';
  if (isMaxed) {
    switch (context) {
      case 'package': return '✅ Satın Alındı';
      case 'purchase': return '✅ Tamamlandı';
      case 'upgrade':
      default: return '✅ Maksimum Seviye';
    }
  }
  if (canAfford) {
    switch (context) {
      case 'package': return '💰 Satın Al';
      case 'purchase': return '✅ Satın Al';
      case 'upgrade':
      default: return '⬆️ Yükselt';
    }
  }
  return '❌ Yetersiz Altın';
}

// ✅ UNIFIED COST DISPLAY SYSTEM (fixes inconsistent cost formatting)
export function getUnifiedCostDisplay(
  cost: number,
  originalCost?: number,
  isMaxed: boolean = false
): {
  mainText: string;
  strikeText?: string;
  color: string;
} {
  if (isMaxed) {
    return {
      mainText: '✅ TAMAMLANDI',
      color: '#4ade80'
    };
  }

  const hasDiscount = originalCost && originalCost !== cost;
  
  return {
    mainText: `${formatCurrency(cost)} 💰`,
    strikeText: hasDiscount ? `${formatCurrency(originalCost)} 💰` : undefined,
    color: '#fff'
  };
}

// ✅ UNIFIED LEVEL DISPLAY SYSTEM (fixes level display inconsistencies)
export function getUnifiedLevelDisplay(
  currentLevel: number,
  maxLevel: number,
  isMaxed?: boolean
): string {
  if (isMaxed || currentLevel >= maxLevel) {
    return '✅ Maksimum';
  }
  return `${currentLevel}/${maxLevel}`;
}

// ✅ UNIFIED STATUS DISPLAY SYSTEM (fixes purchase count inconsistencies)  
export function getUnifiedStatusDisplay(
  currentCount: number,
  maxCount: number,
  isCompleted?: boolean
): string {
  if (isCompleted || currentCount >= maxCount) {
    return '✅ Tamamlandı';
  }
  return `${currentCount}/${maxCount} Kullanıldı`;
}

// =============================================
// COMPARISON HELPERS
// =============================================

/**
 * Format comparison between old and new values
 */
export function formatComparison(
  oldValue: number, 
  newValue: number, 
  context: 'price' | 'damage' | 'percentage' = 'damage'
): {
  oldFormatted: string;
  newFormatted: string;
  change: string;
  changeColor: string;
} {
  const oldFormatted = formatContextual(oldValue, context, { showUnit: false });
  const newFormatted = formatContextual(newValue, context, { showUnit: false });
  
  const diff = newValue - oldValue;
  const isIncrease = diff > 0;
  const change = isIncrease ? `+${formatContextual(diff, context, { showUnit: false })}` 
                            : formatContextual(diff, context, { showUnit: false });
  
  return {
    oldFormatted,
    newFormatted,
    change,
    changeColor: isIncrease ? '#4ade80' : '#ef4444'
  };
}

// =============================================
// VALIDATION HELPERS
// =============================================

/**
 * Validate that a number is meaningful for game context
 */
export function validateGameValue(value: number, context: 'price' | 'damage' | 'percentage'): boolean {
  switch (context) {
    case 'price':
      return value >= 0 && value <= 1000000; // Max 1M gold
      
    case 'damage':
      return value >= 0 && value <= 100000; // Max 100K damage
      
    case 'percentage':
      return value >= 0 && value <= 1; // 0-100%
      
    default:
      return value >= 0;
  }
}

// =============================================
// EXPORT DEFAULT CONFIGURATIONS
// =============================================

export const NUMBER_FORMAT_CONFIG = {
  CURRENCY: {
    SMALL_INCREMENT: 5,
    MEDIUM_INCREMENT: 10,
    LARGE_INCREMENT: 25,
    K_THRESHOLD: 1000,
    M_THRESHOLD: 1000000,
  },
  
  DAMAGE: {
    SMALL_INCREMENT: 5,
    MEDIUM_INCREMENT: 10,
    LARGE_INCREMENT: 25,
  },
  
  PERCENTAGE: {
    BASIC_ROUND: 1, // Round to whole numbers
    STANDARD_ROUND: 5, // Round to nearest 5%
    DETAILED_ROUND: 0.1, // One decimal place
  },
  
  COLORS: {
    CAN_AFFORD: '#4ade80',
    ALMOST_AFFORD: '#fbbf24',
    CANNOT_AFFORD: '#ef4444',
    IMPROVEMENT: '#4ade80',
    DECLINE: '#ef4444',
    NEUTRAL: '#94a3b8',
  }
} as const;

// =============================================
// SMART FORMATTING ENHANCEMENTS 
// =============================================

/**
 * ✅ PROFESSIONAL DISPLAY SYSTEM (fixes confusing decimals)
 * Automatically chooses best format based on value and context
 */
export function formatProfessional(value: number, type: 'currency' | 'damage' | 'health' | 'stats'): string {
  if (value <= 0) return '0';
  
  switch (type) {
    case 'currency':
      // Currency should always be clean, round numbers
      if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace('.0', '')}M`;
      if (value >= 10000) return `${(value / 1000).toFixed(1).replace('.0', '')}K`;
      if (value >= 1000) return `${Math.round(value / 100) / 10}K`;
      if (value >= 100) return Math.round(value / 5) * 5 + '';
      return Math.round(value / 5) * 5 + '';
      
    case 'damage':
      // Damage should feel impactful - round to 5s or 10s
      if (value >= 1000) return Math.round(value / 25) * 25 + '';
      if (value >= 100) return Math.round(value / 10) * 10 + '';
      if (value >= 20) return Math.round(value / 5) * 5 + '';
      return Math.round(value) + '';
      
    case 'health':
      // Health should be clear and readable
      if (value >= 10000) return `${Math.round(value / 1000)}K`;
      if (value >= 1000) return Math.round(value / 100) * 100 + '';
      if (value >= 100) return Math.round(value / 10) * 10 + '';
      return Math.round(value) + '';
      
    case 'stats':
      // Stats should be precise but not overwhelming
      if (value >= 1000) return Math.round(value / 10) * 10 + '';
      if (value >= 100) return Math.round(value / 5) * 5 + '';
      return Math.round(value) + '';
      
    default:
      return Math.round(value) + '';
  }
}

/**
 * ✅ MOBILE-OPTIMIZED FORMATTING (fixes mobile number display issues)
 * Shorter notation for mobile screens
 */
export function formatMobile(value: number, maxChars: number = 6): string {
  const formatted = formatCurrency(value);
  
  if (formatted.length <= maxChars) {
    return formatted;
  }
  
  // Ultra-compact notation for very small screens
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(0)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
  if (value >= 10000) return `${(value / 1000).toFixed(0)}K`;
  if (value >= 1000) return `${Math.round(value / 100) / 10}K`;
  
  return Math.round(value) + '';
}

/**
 * ✅ INTELLIGENT PERCENTAGE SYSTEM (fixes percentage chaos)
 * Context-aware percentage formatting
 */
export function formatSmartPercentage(
  decimal: number, 
  context: 'damage' | 'probability' | 'effectiveness' | 'progress' = 'damage'
): string {
  const percentage = decimal * 100;
  
  if (percentage <= 0) return '0%';
  if (percentage >= 100) return '100%';
  
  switch (context) {
    case 'damage':
      // Damage percentages: meaningful for combat decisions
      if (percentage >= 75) return '75%';  // Major damage
      if (percentage >= 50) return '50%';  // Significant
      if (percentage >= 25) return '25%';  // Moderate
      if (percentage >= 10) return '10%';  // Minor
      if (percentage >= 5) return '5%';    // Slight
      return '0%';  // Negligible
      
    case 'probability':
      // Probability: round to 5% increments for clarity
      return Math.round(percentage / 5) * 5 + '%';
      
    case 'effectiveness':
      // Effectiveness: use meaningful categories
      if (percentage >= 90) return '90%';   // Excellent
      if (percentage >= 75) return '75%';   // Very Good
      if (percentage >= 60) return '60%';   // Good
      if (percentage >= 40) return '40%';   // Fair
      if (percentage >= 25) return '25%';   // Poor
      return '10%';  // Very Poor
      
    case 'progress':
      // Progress: more precision for player feedback
      if (percentage >= 99) return '99%';
      if (percentage >= 95) return '95%';
      return Math.round(percentage / 5) * 5 + '%';
      
    default:
      return Math.round(percentage) + '%';
  }
}

/**
 * ✅ UPGRADE COST INTELLIGENCE (fixes upgrade cost chaos)
 * Smart cost progression that makes sense to players
 */
export function formatUpgradeCost(baseCost: number, level: number): string {
  // Costs should scale predictably: 2x, 3x, 5x progression
  const scalingFactors = [1, 2, 3, 5, 8, 12, 20, 30, 50, 75, 100];
  const factor = scalingFactors[Math.min(level, scalingFactors.length - 1)] || Math.pow(1.5, level);
  
  const cost = baseCost * factor;
  
  // Round to meaningful increments
  if (cost >= 10000) return formatCurrency(Math.round(cost / 1000) * 1000);
  if (cost >= 1000) return formatCurrency(Math.round(cost / 100) * 100);
  if (cost >= 100) return formatCurrency(Math.round(cost / 25) * 25);
  return formatCurrency(Math.round(cost / 5) * 5);
}

/**
 * ✅ TOOLTIP PRECISION SYSTEM (fixes "need more detail" issue)
 * Show exact values in tooltips while keeping UI clean
 */
export function getTooltipValue(displayValue: string, exactValue: number): string {
  const rounded = parseFloat(displayValue.replace(/[^\d.-]/g, ''));
  
  if (Math.abs(rounded - exactValue) < 0.01) {
    return displayValue; // No need for tooltip if values are same
  }
  
  return `${displayValue} (exactly: ${exactValue.toFixed(2)})`;
}

/**
 * ✅ ENHANCED COMPARISON DISPLAY SYSTEM (fixes unclear improvements)
 * Clear before/after comparisons for upgrades with improvement descriptions
 */
export function formatComparisonEnhanced(
  oldValue: number, 
  newValue: number, 
  context: 'price' | 'damage' | 'percentage' = 'damage'
): {
  oldFormatted: string;
  newFormatted: string;
  change: string;
  changeColor: string;
  improvement: string;
} {
  const change = newValue - oldValue;
  const percentChange = oldValue > 0 ? (change / oldValue) * 100 : 0;
  
  let oldFormatted: string;
  let newFormatted: string;
  
  switch (context) {
    case 'price':
      oldFormatted = formatCurrency(oldValue);
      newFormatted = formatCurrency(newValue);
      break;
    case 'damage':
      oldFormatted = formatDamage(oldValue);
      newFormatted = formatDamage(newValue);
      break;
    case 'percentage':
      oldFormatted = formatPercentage(oldValue);
      newFormatted = formatPercentage(newValue);
      break;
    default:
      oldFormatted = Math.round(oldValue) + '';
      newFormatted = Math.round(newValue) + '';
  }
  
  const changeFormatted = change > 0 ? `+${formatCurrency(Math.abs(change))}` : `-${formatCurrency(Math.abs(change))}`;
  const changeColor = change > 0 ? '#4ade80' : change < 0 ? '#ef4444' : '#ffffff';
  
  // Improvement description
  let improvement: string;
  if (percentChange >= 100) improvement = 'Massive boost!';
  else if (percentChange >= 50) improvement = 'Major upgrade!';
  else if (percentChange >= 25) improvement = 'Good improvement';
  else if (percentChange >= 10) improvement = 'Minor boost';
  else improvement = 'Small change';
  
  return {
    oldFormatted,
    newFormatted,
    change: changeFormatted,
    changeColor,
    improvement
  };
} 