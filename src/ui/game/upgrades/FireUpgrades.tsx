import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { UpgradeCard } from './UpgradeCard';
import type { BulletTypeData } from './types';
import { getUpgradeColor } from './utils';

export const FireUpgrades: React.FC = () => {
  const { 
    gold, 
    bulletLevel,
    upgradeBullet, 
    discountMultiplier, 
    diceResult,
  } = useGameStore();

  return (
    <div style={{ 
      width: '100%', 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
      gap: 20
    }}>
      {GAME_CONSTANTS.BULLET_TYPES.map((bulletType: BulletTypeData, index: number) => {
        const level = index + 1;
        const cost = GAME_CONSTANTS.BULLET_COST * Math.pow(GAME_CONSTANTS.BULLET_COST_MULTIPLIER, index);
        
        // CRITICAL FIX: Progression sistemi - sadece bir sonraki seviye satın alınabilir
        const currentBulletLevel = bulletLevel || 1; // Default 1 if undefined
        const isCurrentLevel = level === currentBulletLevel; // Mevcut seviye
        const isNextLevel = level === currentBulletLevel + 1; // Satın alınabilir seviye
        const isPastLevel = level < currentBulletLevel; // Geçmiş seviye (tamamlanmış)
        const isFutureLevel = level > currentBulletLevel + 1; // Gelecek seviye (henüz erişilemez)
        
        const canUpgrade = isNextLevel && gold >= cost;
        const isMaxed = isPastLevel; // Geçmiş seviyeler "tamamlanmış" olarak gösterilir
        const isLocked = isFutureLevel; // Gelecek seviyeler kilitli
        
        // Debug logging
        if (level <= 4) {
          console.log({
            currentBulletLevel,
            isCurrentLevel,
            isNextLevel,
            isPastLevel,
            isFutureLevel,
            canUpgrade,
            isMaxed,
            isLocked
          });
        }
        
        const upgradeData = {
          name: bulletType.name,
          description: isLocked 
            ? `🔒 Önce Level ${currentBulletLevel + 1} alın` 
            : isPastLevel 
              ? `✅ Tamamlandı - Aktif seviye`
              : `${bulletType.name} mermi sistemi. Daha güçlü ve etkili saldırılar.`,
          currentLevel: isPastLevel ? 1 : isCurrentLevel ? 1 : 0, // Visual için
          baseCost: cost,
          maxLevel: 1,
          onUpgrade: () => {
            if (!isNextLevel) {
              return;
            }
            
            
            // Zar indirimleri
            let discountedCost = cost;
            if (diceResult && diceResult === 6) discountedCost = Math.floor(cost * 0.5);
            else if (diceResult && diceResult === 5) discountedCost = Math.floor(cost * 0.7);
            else if (diceResult && diceResult === 4) discountedCost = Math.floor(cost * 0.85);
            
            // Discount multiplier
            if (discountMultiplier !== 1) {
              discountedCost = Math.floor(discountedCost / discountMultiplier);
            }
            
            console.log(`Upgrading bullet with cost: ${discountedCost}`);
            
            // CRITICAL FIX: Normal bullet upgrade kullan
            upgradeBullet(false);
          },
          icon: isPastLevel ? "✅" : isCurrentLevel ? "🔥" : isLocked ? "🔒" : "🔥",
          color: isPastLevel 
            ? '#4ade80' // Yeşil - tamamlanmış
            : isLocked 
              ? '#666666' // Gri - kilitli
              : getUpgradeColor(false, canUpgrade, isMaxed),
          additionalInfo: isPastLevel 
            ? `✅ Aktif - Hasar: x${bulletType.damageMultiplier}`
            : isLocked 
              ? `🔒 Level ${currentBulletLevel + 1} gerekli`
              : `Hasar Çarpanı: x${bulletType.damageMultiplier} | Hız: x${bulletType.speedMultiplier || 1}`
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