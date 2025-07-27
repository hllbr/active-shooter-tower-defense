import { formatCurrency } from './core';

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


export function getUnifiedStatusDisplay(
  currentCount: number,
  maxCount: number,
  isCompleted?: boolean
): string {
  if (isCompleted || currentCount >= maxCount) {
    return "✅ Tamamlandı";
  }
  return `${currentCount}/${maxCount} Kullanıldı`;
}
