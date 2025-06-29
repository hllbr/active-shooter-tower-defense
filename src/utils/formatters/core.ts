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
