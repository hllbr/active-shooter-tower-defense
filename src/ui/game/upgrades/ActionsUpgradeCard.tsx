import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { UpgradeCard } from './UpgradeCard';
import type { UpgradeData } from './types';
import { calculateCleanCost, applyDiceDiscount, applyUniversalDiscount } from '../../../utils/formatters/pricing';

export const ActionsUpgradeCard: React.FC = () => {
  const { 
    gold, 
    maxActionsLevel, 
    setMaxActionsLevel,
    discountMultiplier,
    diceResult 
  } = useGameStore();

  // Calculate clean cost with discounts
  const rawBaseCost = calculateCleanCost(GAME_CONSTANTS.MAX_ACTIONS_COST, GAME_CONSTANTS.COST_MULTIPLIER, maxActionsLevel);
  let cleanBaseCost = applyDiceDiscount(rawBaseCost, diceResult);
  if (discountMultiplier !== 1) {
    cleanBaseCost = applyUniversalDiscount(cleanBaseCost, discountMultiplier);
  }

  const actionsUpgrade: UpgradeData = {
    name: 'Aksiyon Sistemi',
    description: 'Dalga başına maksimum aksiyon sayısını artırır ve daha fazla harita değişikliği yapma imkanı sağlar.',
    currentLevel: maxActionsLevel,
    baseCost: cleanBaseCost,
    maxLevel: GAME_CONSTANTS.MAX_MAX_ACTIONS_LEVEL,
    onUpgrade: () => {
      const finalCost = cleanBaseCost; // Cost already has discounts applied
      
      // CRITICAL FIX: Use proper state transaction instead of direct gold manipulation
      const { spendGold } = useGameStore.getState();
      const success = spendGold(finalCost);
      
      if (success) {
        setMaxActionsLevel(maxActionsLevel + 1);
      } else {
        console.error('❌ Actions upgrade failed: Insufficient funds or state error');
        import('../../../utils/sound').then(({ playSound }) => {
          playSound('error');
        });
      }
    },
    icon: '🎯',
    color: '#06b6d4',
    isElite: false,
    additionalInfo: 'Her seviye +1 aksiyon'
  };

  return (
    <UpgradeCard
      upgrade={actionsUpgrade}
      gold={gold}
      diceResult={diceResult}
      discountMultiplier={discountMultiplier}
    />
  );
}; 