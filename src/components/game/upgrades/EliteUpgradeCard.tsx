import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';
import { UpgradeCard } from './UpgradeCard';
import type { UpgradeData } from './types';

export const EliteUpgradeCard: React.FC = () => {
  const { 
    gold, 
    setGold, 
    eliteModuleLevel,
    setEliteModuleLevel,
    discountMultiplier,
    diceResult 
  } = useGameStore();

  const eliteUpgrade: UpgradeData = {
    name: 'Elite Modül',
    description: 'Gelişmiş oyun mekaniği açar ve özel yetenekler kazandırır. En üst seviye güçlendirme.',
    currentLevel: eliteModuleLevel,
    baseCost: GAME_CONSTANTS.ELITE_MODULE_COST * Math.pow(GAME_CONSTANTS.ELITE_COST_MULTIPLIER, eliteModuleLevel),
    maxLevel: GAME_CONSTANTS.MAX_ELITE_MODULE_LEVEL,
    onUpgrade: () => {
      const cost = GAME_CONSTANTS.ELITE_MODULE_COST * Math.pow(GAME_CONSTANTS.ELITE_COST_MULTIPLIER, eliteModuleLevel);
      let finalCost = cost;
      
      if (diceResult && diceResult === 6) finalCost = Math.floor(cost * 0.5);
      else if (diceResult && diceResult === 5) finalCost = Math.floor(cost * 0.7);
      else if (diceResult && diceResult === 4) finalCost = Math.floor(cost * 0.85);
      
      if (discountMultiplier !== 1) {
        finalCost = Math.floor(finalCost / discountMultiplier);
      }
      
      setGold(gold - finalCost);
      setEliteModuleLevel(eliteModuleLevel + 1);
    },
    icon: '🚀',
    color: '#8b5cf6',
    isElite: true,
    additionalInfo: 'Özel yetenekler ve bonuslar'
  };

  return (
    <UpgradeCard
      upgrade={eliteUpgrade}
      gold={gold}
      diceResult={diceResult}
      discountMultiplier={discountMultiplier}
    />
  );
}; 