import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { UpgradeCard } from './UpgradeCard';
import type { BulletTypeData } from './types';
import { getUpgradeColor } from './utils';

export const FireUpgrades: React.FC = () => {
  const { 
    gold, 
    upgradeBullet, 
    discountMultiplier, 
    diceResult,
    purchaseIndividualFireUpgrade,
    getIndividualFireUpgradeInfo
  } = useGameStore();
  // CRITICAL FIX: setRefreshing kaldırıldı - lock problemini çözmek için

  return (
    <div style={{ 
      width: '100%', 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
      gap: 20
    }}>
      {GAME_CONSTANTS.BULLET_TYPES.map((bulletType: BulletTypeData, index: number) => {
        const level = index + 1;
        const upgradeId = `fire_${level}`; // CRITICAL FIX: Her fire upgrade için benzersiz ID
        const cost = GAME_CONSTANTS.BULLET_COST * Math.pow(GAME_CONSTANTS.BULLET_COST_MULTIPLIER, index);
        
        // CRITICAL FIX: Individual tracking sistemini kullan
        const upgradeInfo = getIndividualFireUpgradeInfo(upgradeId, 2);
        const currentLevel = upgradeInfo.currentLevel;
        const isMaxed = upgradeInfo.isMaxed;
        const canUpgrade = upgradeInfo.canUpgrade && gold >= cost;
        
        // DEBUG: Only log if there's an issue
        if (currentLevel === 1 && bulletType.name.includes('Kraliçe')) {
          console.log(`🔍 ${bulletType.name} Debug:`, {
            upgradeId,
            currentLevel,
            isMaxed,
            canUpgrade: upgradeInfo.canUpgrade,
            hasGold: gold >= cost,
            finalCanUpgrade: canUpgrade,
            gold,
            cost
          });
        }
        
        const upgradeData = {
          name: bulletType.name,
          description: `${bulletType.name} mermi sistemi. Daha güçlü ve etkili saldırılar.`,
          currentLevel,
          baseCost: cost,
          maxLevel: 2,
          onUpgrade: () => {
            console.log(`🚀 ${bulletType.name} onUpgrade clicked!`);
            
            // CRITICAL FIX: Basit ve direkt satın alma - store kendi kontrollerini yapacak
            let discountedCost = cost;
            
            // Zar indirimleri
            if (diceResult && diceResult === 6) discountedCost = Math.floor(cost * 0.5);
            else if (diceResult && diceResult === 5) discountedCost = Math.floor(cost * 0.7);
            else if (diceResult && diceResult === 4) discountedCost = Math.floor(cost * 0.85);
            
            // Discount multiplier
            if (discountMultiplier !== 1) {
              discountedCost = Math.floor(discountedCost / discountMultiplier);
            }
            
            console.log(`💰 Attempting purchase: ${upgradeId} for ${discountedCost} gold`);
            
            // CRITICAL FIX: Individual tracking ile satın alma
            const success = purchaseIndividualFireUpgrade(upgradeId, discountedCost, 2);
            
            if (success) {
              upgradeBullet(false); // Backward compatibility için
              console.log(`✅ ${bulletType.name} upgrade successful!`);
            } else {
              console.log(`❌ ${bulletType.name} upgrade failed!`);
            }
          },
          icon: "🔥",
          color: getUpgradeColor(currentLevel > 0, canUpgrade, isMaxed),
          additionalInfo: `Hasar Çarpanı: x${bulletType.damageMultiplier} | Hız: x${bulletType.speedMultiplier || 1} | Seviye: ${currentLevel}/2`
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