import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { UpgradeCard } from './UpgradeCard';
import type { BulletTypeData } from './types';
import { getUpgradeColor } from './utils';
import { calculateCleanCost, applyDiceDiscount, applyUniversalDiscount } from '../../../utils/formatters/pricing';

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
        const baseCost = calculateCleanCost(GAME_CONSTANTS.BULLET_COST, GAME_CONSTANTS.BULLET_COST_MULTIPLIER, index);
        
        // Apply discounts cleanly
        let cost = applyDiceDiscount(baseCost, diceResult);
        if (discountMultiplier !== 1) {
          cost = applyUniversalDiscount(cost, discountMultiplier);
        }
        
        // CRITICAL FIX: Progression sistemi - sadece bir sonraki seviye satın alınabilir
        const currentBulletLevel = bulletLevel || 1; // Default 1 if undefined
        const isCurrentLevel = level === currentBulletLevel; // Mevcut seviye
        const isNextLevel = level === currentBulletLevel + 1; // Satın alınabilir seviye
        const isPastLevel = level <= currentBulletLevel; // FIXED: Current level ve past level dahil
        const isFutureLevel = level > currentBulletLevel + 1; // Gelecek seviye (henüz erişilemez)
        
        // DEBUG: Current state logging (removed from production)
        
        const canUpgrade = isNextLevel && gold >= cost;
        const isMaxed = isPastLevel; // Geçmiş seviyeler "tamamlanmış" olarak gösterilir
        const isLocked = isFutureLevel; // Gelecek seviyeler kilitli
        
        // Bullet level progression logic verified
        
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
              // Cannot upgrade: not next level
              return;
            }
            
            // CRITICAL FIX: Use normal bullet upgrade with clean cost already calculated
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