import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { UpgradeCard } from './UpgradeCard';
import type { UpgradeData } from './types';

export const ActionsUpgradeCard: React.FC = () => {
  const { 
    gold, 
    setGold, 
    maxActionsLevel, 
    setMaxActionsLevel,
    discountMultiplier,
    diceResult 
  } = useGameStore();

  const actionsUpgrade: UpgradeData = {
    name: 'Aksiyon Sistemi',
    description: 'Wave başına maksimum aksiyon sayısını artırır ve daha fazla harita değişikliği yapma imkanı sağlar.',
    currentLevel: maxActionsLevel,
    baseCost: GAME_CONSTANTS.MAX_ACTIONS_COST * Math.pow(GAME_CONSTANTS.COST_MULTIPLIER, maxActionsLevel),
    maxLevel: GAME_CONSTANTS.MAX_MAX_ACTIONS_LEVEL,
    onUpgrade: () => {
      const cost = GAME_CONSTANTS.MAX_ACTIONS_COST * Math.pow(GAME_CONSTANTS.COST_MULTIPLIER, maxActionsLevel);
      let finalCost = cost;
      
      if (diceResult && diceResult === 6) finalCost = Math.floor(cost * 0.5);
      else if (diceResult && diceResult === 5) finalCost = Math.floor(cost * 0.7);
      else if (diceResult && diceResult === 4) finalCost = Math.floor(cost * 0.85);
      
      if (discountMultiplier !== 1) {
        finalCost = Math.floor(finalCost / discountMultiplier);
      }
      
      setGold(gold - finalCost);
      setMaxActionsLevel(maxActionsLevel + 1);
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