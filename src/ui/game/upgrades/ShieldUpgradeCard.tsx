import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { playSound } from '../../../utils/sound/soundEffects';

interface ShieldUpgradeCardProps {
  shield: {
    name: string;
    cost: number;
    strength: number;
    purchaseLimit: number;
  };
  index: number;
  gold: number;
  globalWallStrength: number;
  discountMultiplier: number;
  diceUsed: boolean;
  purchaseCount: number;
  maxAllowed: number;
  isMaxed: boolean;
  onPurchase: (index: number, finalCost: number) => void;
}

export const ShieldUpgradeCard: React.FC<ShieldUpgradeCardProps> = ({
  shield,
  index,
  gold,
  globalWallStrength,
  discountMultiplier,
  diceUsed,
  purchaseCount,
  maxAllowed,
  isMaxed,
  onPurchase,
}) => {
  // CRITICAL FIX: Handle progression states
  const isPastLevel = isMaxed;
  const isCurrentLevel = !isMaxed && purchaseCount === 0;
  const isFutureLevel = !isMaxed && !isCurrentLevel;
  
  // Zar sistemine göre dinamik fiyat hesaplama
  const discount = diceUsed ? discountMultiplier : 0;
  const discountedCost = Math.floor(shield.cost * (1 - discount));
  const finalCost = Math.max(1, discountedCost);
  
  const canAfford = gold >= finalCost && isCurrentLevel;
  const isDisabled = !canAfford || isMaxed || isFutureLevel;
  
  // CRITICAL FIX: Color and display logic for progression
  const shieldColor = isPastLevel 
    ? '#4ade80' // Green for completed
    : isFutureLevel 
      ? '#666666' // Gray for locked
      : isDisabled 
        ? '#444' 
        : '#aa00ff'; // Purple for available
        
  const newShieldStrength = (globalWallStrength + shield.strength) * 10;

  const handleClick = () => {
    console.log(`🛡️ Shield purchase attempt:`, {
      shield: shield.name,
      index,
      canAfford,
      isMaxed,
      isPastLevel,
      isCurrentLevel,
      isFutureLevel,
      gold,
      finalCost,
      purchaseCount,
      maxAllowed
    });
    
    if (canAfford && isCurrentLevel) {
      onPurchase(index, finalCost);
      playSound('upgrade-purchase');
    } else {
      const reason = isPastLevel 
        ? 'Already completed' 
        : isFutureLevel 
          ? 'Locked - complete previous levels first'
          : 'Not enough gold';
      console.log(`❌ Shield purchase blocked:`, { reason });
    }
  };

  return (
    <div
      style={{
        padding: 12,
        borderRadius: 8,
        border: `2px solid ${shieldColor}`,
        background: isPastLevel 
          ? 'rgba(74, 222, 128, 0.1)' 
          : isFutureLevel
            ? 'rgba(102, 102, 102, 0.1)'
            : isDisabled 
              ? '#1a1a1a' 
              : 'rgba(170, 0, 255, 0.1)',
        opacity: isDisabled && !isPastLevel ? 0.6 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isPastLevel 
          ? '0 2px 8px rgba(74, 222, 128, 0.2)' 
          : isFutureLevel
            ? 'none'
            : isDisabled 
              ? 'none' 
              : '0 2px 8px rgba(170, 0, 255, 0.2)',
        position: 'relative',
      }}
      onClick={handleClick}
    >
      {diceUsed && discount > 0 && isCurrentLevel && (
        <div style={{
          position: 'absolute',
          top: -8,
          right: -8,
          background: '#ef4444',
          color: 'white',
          fontSize: 11,
          fontWeight: 'bold',
          padding: '4px 8px',
          borderRadius: 12,
          border: '2px solid #fff',
          animation: 'pulse 2s infinite'
        }}>
          🎯 İNDİRİM
        </div>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{
          fontWeight: 'bold',
          fontSize: 16,
          color: isDisabled && !isPastLevel ? '#888' : shieldColor,
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}>
          {isPastLevel ? '✅' : isFutureLevel ? '🔒' : '🛡️'} {shield.name}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{
            fontWeight: 'bold',
            fontSize: 14,
            color: isPastLevel 
              ? '#4ade80' 
              : isFutureLevel 
                ? '#666' 
                : isDisabled 
                  ? '#888' 
                  : GAME_CONSTANTS.GOLD_COLOR
          }}>
            {isPastLevel ? 'TM' : isFutureLevel ? 'KİT' : `${finalCost} 💰`}
            {diceUsed && discount > 0 && isCurrentLevel && (
              <div style={{ fontSize: 10, color: '#888', textDecoration: 'line-through' }}>
                {shield.cost}
              </div>
            )}
          </span>
          <span style={{
            fontSize: 12,
            fontWeight: 'bold',
            color: isPastLevel ? '#4ade80' : '#fbbf24'
          }}>
            {isPastLevel ? '✅' : isFutureLevel ? '🔒' : '0/1'}
          </span>
        </div>
      </div>
      <div style={{
        fontSize: 12,
        color: isDisabled && !isPastLevel ? '#888' : '#aaa',
        textAlign: 'left',
        marginBottom: '4px'
      }}>
        {isPastLevel ? '✅ Tamamlandı' : isFutureLevel ? '🔒 Önceki seviyeleri tamamlayın' : `+${shield.strength} Kalkan Gücü`}
      </div>
      <div style={{
        fontSize: 10,
        color: isDisabled && !isPastLevel ? '#666' : '#888',
        textAlign: 'left'
      }}>
        {isPastLevel ? `Aktif Güç: ${newShieldStrength}` : `Yeni Toplam: ${newShieldStrength} Güç`}
      </div>
    </div>
  );
}; 