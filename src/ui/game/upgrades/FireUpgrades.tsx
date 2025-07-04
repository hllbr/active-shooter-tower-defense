import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { UpgradeCard } from './UpgradeCard';
import type { BulletTypeData } from './types';
import { getUpgradeColor } from './utils';

export const FireUpgrades: React.FC = () => {
  const { 
    gold, 
    spendGold, 
    bulletLevel, 
    upgradeBullet, 
    discountMultiplier, 
    diceResult 
  } = useGameStore();
  const setRefreshing = useGameStore((s) => s.setRefreshing);

  return (
    <div style={{ 
      width: '100%', 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
      gap: 20
    }}>
      {GAME_CONSTANTS.BULLET_TYPES.map((bulletType: BulletTypeData, index: number) => {
        const level = index + 1;
        const isUnlocked = bulletLevel >= level;
        const isNext = bulletLevel === level - 1;
        const cost = GAME_CONSTANTS.BULLET_COST * Math.pow(GAME_CONSTANTS.BULLET_COST_MULTIPLIER, index);
        
        // Seviye gösterimini düzelt: bulletLevel bu mermi tipine sahipse 2/2, hazırsa 1/2, değilse 0/2
        let currentLevel = 0;
        if (isUnlocked) {
          currentLevel = 2; // Sahip olunan upgrade'ler maksimum seviyede
        } else if (isNext) {
          currentLevel = 1; // Bir sonraki upgrade satın alınabilir durumda
        }
        
        const upgradeData = {
          name: bulletType.name,
          description: `${bulletType.name} mermi sistemi. Daha güçlü ve etkili saldırılar.`,
          currentLevel,
          baseCost: cost,
          maxLevel: 2,
          onUpgrade: () => {
            if (isNext) {
              const finalCost = cost;
              let discountedCost = finalCost;
              
              if (diceResult && diceResult === 6) discountedCost = Math.floor(finalCost * 0.5);
              else if (diceResult && diceResult === 5) discountedCost = Math.floor(finalCost * 0.7);
              else if (diceResult && diceResult === 4) discountedCost = Math.floor(finalCost * 0.85);
              
              if (discountMultiplier !== 1) {
                discountedCost = Math.floor(discountedCost / discountMultiplier);
              }
              
              spendGold(discountedCost);
              upgradeBullet(false);
              setRefreshing(true); // Satın alma sonrası upgrade ekranı açık kalsın
            }
          },
          icon: "🔥",
          color: getUpgradeColor(isUnlocked, isNext, currentLevel >= 2),
          additionalInfo: `Hasar Çarpanı: x${bulletType.damageMultiplier} | Hız: x${bulletType.speedMultiplier || 1}`
        };

        return (
          <UpgradeCard
            key={index}
            upgrade={upgradeData}
            gold={gold}
            diceResult={diceResult}
            discountMultiplier={discountMultiplier}
          />
        );
      })}
    </div>
  );
}; 