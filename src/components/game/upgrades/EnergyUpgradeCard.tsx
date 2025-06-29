import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';
import { UpgradeCard } from './UpgradeCard';
import type { UpgradeData } from './types';

export const EnergyUpgradeCard: React.FC = () => {
  const { 
    gold, 
    setGold, 
    energyBoostLevel, 
    setEnergyBoostLevel, 
    discountMultiplier,
    diceResult 
  } = useGameStore();

  const energyUpgrade: UpgradeData = {
    name: 'Enerji Güçlendirici',
    description: 'Maksimum enerji kapasitesini artırır ve enerji yenileme hızını yükseltir.',
    currentLevel: energyBoostLevel,
    baseCost: GAME_CONSTANTS.ENERGY_BOOST_COST * Math.pow(GAME_CONSTANTS.COST_MULTIPLIER, energyBoostLevel),
    maxLevel: GAME_CONSTANTS.MAX_ENERGY_BOOST_LEVEL,
    onUpgrade: () => {
      const cost = GAME_CONSTANTS.ENERGY_BOOST_COST * Math.pow(GAME_CONSTANTS.COST_MULTIPLIER, energyBoostLevel);
      let finalCost = cost;
      
      if (diceResult && diceResult === 6) finalCost = Math.floor(cost * 0.5);
      else if (diceResult && diceResult === 5) finalCost = Math.floor(cost * 0.7);
      else if (diceResult && diceResult === 4) finalCost = Math.floor(cost * 0.85);
      
      if (discountMultiplier !== 1) {
        finalCost = Math.floor(finalCost / discountMultiplier);
      }
      
      setGold(gold - finalCost);
      setEnergyBoostLevel(energyBoostLevel + 1);
    },
    icon: '⚡',
    color: '#fbbf24',
    isElite: false,
    additionalInfo: 'Her seviye +20 enerji kapasitesi'
  };

  return (
    <UpgradeCard
      upgrade={energyUpgrade}
      gold={gold}
      diceResult={diceResult}
      discountMultiplier={discountMultiplier}
    />
  );
}; 