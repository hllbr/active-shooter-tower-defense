// PowerMarket specific utility functions

/**
 * Get the appropriate color based on upgrade state
 */
export function getUpgradeColor(
  isUnlocked: boolean,
  isNext: boolean,
  isMaxed: boolean
): string {
  if (isMaxed) return '#4ade80'; // Green for maxed
  if (isUnlocked) return '#4ade80'; // Green for unlocked
  if (isNext) return '#ef4444'; // Red for available
  return '#666'; // Gray for locked
}

export const calculateDiscountedCost = (
  baseCost: number, 
  diceResult?: number | null, 
  discountMultiplier?: number
): number => {
  let finalCost = baseCost;
  
  // Dice discount system
  if (diceResult && diceResult === 6) {
    finalCost = Math.floor(baseCost * 0.5); // 50% discount
  } else if (diceResult && diceResult === 5) {
    finalCost = Math.floor(baseCost * 0.7); // 30% discount
  } else if (diceResult && diceResult === 4) {
    finalCost = Math.floor(baseCost * 0.85); // 15% discount
  }
  
  // Apply universal discount multiplier
  if (discountMultiplier && discountMultiplier !== 1) {
    finalCost = Math.floor(finalCost / discountMultiplier);
  }
  
  return finalCost;
};

export const getDiscountPercentage = (diceResult?: number | null): number => {
  if (diceResult === 6) return 50;
  if (diceResult === 5) return 30;
  if (diceResult === 4) return 15;
  return 0;
};

// Helper function for PowerMarket upgrade handlers
export const createUpgradeHandler = (
  baseCost: number,
  currentLevel: number,
  costMultiplier: number,
  goldSetter: (gold: number) => void,
  levelSetter: (level: number) => void,
  gold: number,
  diceResult?: number | null,
  discountMultiplier?: number
) => {
  return () => {
    const cost = baseCost * Math.pow(costMultiplier, currentLevel);
    const finalCost = calculateDiscountedCost(cost, diceResult, discountMultiplier);
    
    goldSetter(gold - finalCost);
    levelSetter(currentLevel + 1);
  };
}; 