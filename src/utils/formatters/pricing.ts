// Clean pricing utilities to prevent floating point decimal issues

/**
 * Calculate upgrade cost with clean integer result
 * Prevents floating point artifacts like 4081.466880000004
 */
export const calculateCleanCost = (baseCost: number, multiplier: number, level: number): number => {
  const rawCost = baseCost * Math.pow(multiplier, level);
  return Math.round(rawCost);
};

/**
 * Apply discount to price with clean integer result
 */
export const applyCleanDiscount = (cost: number, discountPercent: number): number => {
  const discountedCost = cost * (1 - discountPercent / 100);
  return Math.max(1, Math.round(discountedCost));
};

/**
 * Apply dice discount to price with clean integer result
 */
export const applyDiceDiscount = (cost: number, diceResult?: number | null): number => {
  if (!diceResult) return cost;
  
  let discountMultiplier = 1;
  
  switch (diceResult) {
    case 6:
      discountMultiplier = 0.5; // 50% discount
      break;
    case 5:
      discountMultiplier = 0.7; // 30% discount
      break;
    case 4:
      discountMultiplier = 0.85; // 15% discount
      break;
    default:
      discountMultiplier = 1; // No discount
  }
  
  return Math.max(1, Math.round(cost * discountMultiplier));
};

/**
 * Apply universal discount multiplier with clean integer result
 */
export const applyUniversalDiscount = (cost: number, discountMultiplier: number): number => {
  return Math.max(1, Math.round(cost / discountMultiplier));
};

/**
 * Complete pricing calculation with all discounts applied cleanly
 */
export const calculateFinalPrice = (
  baseCost: number,
  level: number,
  costMultiplier: number,
  diceResult?: number | null,
  discountMultiplier?: number
): number => {
  // Step 1: Calculate base cost with level
  let finalCost = calculateCleanCost(baseCost, costMultiplier, level);
  
  // Step 2: Apply dice discount
  finalCost = applyDiceDiscount(finalCost, diceResult);
  
  // Step 3: Apply universal discount
  if (discountMultiplier && discountMultiplier !== 1) {
    finalCost = applyUniversalDiscount(finalCost, discountMultiplier);
  }
  
  return finalCost;
};

/**
 * Format price for display (with thousands separators if needed)
 */
export const formatPrice = (price: number): string => {
  return price.toLocaleString();
}; 