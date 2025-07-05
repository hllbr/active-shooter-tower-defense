import React from 'react';
import type { UpgradeCardProps } from './types';
import { UpgradeCardHeader } from './UpgradeCardHeader';
import { UpgradeCardContent } from './UpgradeCardContent';
import { UpgradeCardFooter } from './UpgradeCardFooter';
import { DiscountBadge } from './DiscountBadge';
import { calculateDiscountedCost } from './utils';
import { playSound } from '../../../utils/sound/soundEffects';

export const UpgradeCard: React.FC<UpgradeCardProps> = ({ upgrade, gold, diceResult, discountMultiplier }) => {
  const {
    name,
    description,
    currentLevel,
    baseCost,
    maxLevel,
    onUpgrade,
    icon,
    color,
    isElite = false,
    additionalInfo
  } = upgrade;

  const isMaxed = currentLevel >= maxLevel;
  const finalCost = calculateDiscountedCost(baseCost, diceResult, discountMultiplier);
  const canAfford = gold >= finalCost && !isMaxed;

  const handleUpgrade = () => {
    if (canAfford) {
      onUpgrade();
      playSound('upgrade-purchase');
    }
  };

  return (
    <div
      role="button"
      aria-label={`${name} yükseltmesi. Seviye: ${currentLevel}/${maxLevel}. Maliyet: ${finalCost} altın. ${isMaxed ? 'Maksimum seviye.' : canAfford ? 'Yükseltme yapılabilir.' : 'Yetersiz altın.'}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && canAfford) {
          handleUpgrade();
        }
      }}
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))',
        border: `3px solid ${isMaxed ? '#4ade80' : canAfford ? color : 'rgba(255,255,255,0.2)'}`,
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minHeight: 180,
        position: 'relative',
        transition: 'all 0.3s ease',
        cursor: canAfford ? 'pointer' : 'not-allowed',
        opacity: isMaxed ? 0.8 : 1,
        boxShadow: canAfford ? `0 8px 24px ${color}40` : 'none',
        transform: canAfford ? 'translateY(-2px)' : 'none',
      }}
      onClick={handleUpgrade}
    >
      <DiscountBadge diceResult={diceResult} />
      
      <UpgradeCardHeader
        icon={icon}
        name={name}
        color={color}
        currentLevel={currentLevel}
        maxLevel={maxLevel}
        isMaxed={isMaxed}
        isElite={isElite}
      />

      <UpgradeCardContent
        description={description}
        additionalInfo={additionalInfo}
        color={color}
      />

      <UpgradeCardFooter
        baseCost={baseCost}
        finalCost={finalCost}
        gold={gold}
        isMaxed={isMaxed}
        canAfford={canAfford}
        color={color}
      />
    </div>
  );
}; 