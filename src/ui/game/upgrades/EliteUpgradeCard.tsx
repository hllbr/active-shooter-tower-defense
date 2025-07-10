import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { UpgradeCard } from './UpgradeCard';
import type { UpgradeData } from './types';
import { checkEliteUpgradeRequirements, getRequirementDisplayText } from './requirementHelpers';
import { calculateCleanCost, applyDiceDiscount, applyUniversalDiscount } from '../../../utils/formatters/pricing';

export const EliteUpgradeCard: React.FC = () => {
  const { 
    gold, 
    bulletLevel,
    wallLevel,
    currentWave,
    eliteModuleLevel,
    setEliteModuleLevel,
    discountMultiplier,
    diceResult 
  } = useGameStore();

  const rawBaseCost = calculateCleanCost(GAME_CONSTANTS.ELITE_MODULE_COST, GAME_CONSTANTS.ELITE_COST_MULTIPLIER, eliteModuleLevel);
  
  // Apply discounts cleanly
  let baseCost = applyDiceDiscount(rawBaseCost, diceResult);
  if (discountMultiplier !== 1) {
    baseCost = applyUniversalDiscount(baseCost, discountMultiplier);
  }
  
  const requirements = checkEliteUpgradeRequirements(bulletLevel, wallLevel, currentWave, gold, baseCost);
  const requirementText = getRequirementDisplayText(requirements);

  const eliteUpgrade: UpgradeData = {
    name: 'Elite Modül',
    description: requirements.allMet 
      ? 'Gelişmiş oyun mekaniği açar ve özel yetenekler kazandırır. En üst seviye güçlendirme.'
      : requirementText,
    currentLevel: eliteModuleLevel,
    baseCost,
    maxLevel: GAME_CONSTANTS.MAX_ELITE_MODULE_LEVEL,
    onUpgrade: () => {
      // Check requirements before attempting purchase
      if (!requirements.allMet) {
        console.error('❌ Elite upgrade blocked:', requirementText);
        import('../../../utils/sound').then(({ playSound }) => {
          playSound('error');
        });
        return;
      }

      const finalCost = baseCost; // Cost already has discounts applied
      
      // CRITICAL FIX: Use proper state transaction instead of direct gold manipulation
      const { spendGold } = useGameStore.getState();
      const success = spendGold(finalCost);
      
      if (success) {
        setEliteModuleLevel(eliteModuleLevel + 1);
      } else {
        console.error('❌ Elite upgrade failed: Insufficient funds or state error');
        import('../../../utils/sound').then(({ playSound }) => {
          playSound('error');
        });
      }
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