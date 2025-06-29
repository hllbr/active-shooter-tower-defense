import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';

interface ShieldUpgradeCardProps {
  shield: {
    name: string;
    cost: number;
    strength: number;
  };
  index: number;
  gold: number;
  globalWallStrength: number;
  discountMultiplier: number;
  onPurchase: (index: number, finalCost: number) => void;
}

export const ShieldUpgradeCard: React.FC<ShieldUpgradeCardProps> = ({
  shield,
  index,
  gold,
  globalWallStrength,
  discountMultiplier,
  onPurchase,
}) => {
  // Zar sistemine göre dinamik fiyat hesaplama
  let finalCost = shield.cost;
  if (discountMultiplier === 0) {
    // İndirimler iptal edildi - normal fiyat
    finalCost = shield.cost;
  } else if (discountMultiplier > 1) {
    // Ek indirim uygulandı
    finalCost = Math.max(25, Math.round(shield.cost * (2 - discountMultiplier)));
  }
  
  const isDisabled = gold < finalCost;
  const shieldColor = isDisabled ? '#444' : '#aa00ff';
  const newShieldStrength = (globalWallStrength + shield.strength) * 10;

  const handleClick = () => {
    if (!isDisabled) {
      onPurchase(index, finalCost);
    }
  };

  return (
    <div
      style={{
        padding: 12,
        borderRadius: 8,
        border: `2px solid ${shieldColor}`,
        background: isDisabled ? '#1a1a1a' : 'rgba(170, 0, 255, 0.1)',
        opacity: isDisabled ? 0.6 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isDisabled ? 'none' : '0 2px 8px rgba(170, 0, 255, 0.2)',
      }}
      onClick={handleClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{
          fontWeight: 'bold',
          fontSize: 16,
          color: isDisabled ? '#888' : shieldColor
        }}>
          {shield.name}
        </span>
        <span style={{
          fontWeight: 'bold',
          fontSize: 14,
          color: isDisabled ? '#888' : GAME_CONSTANTS.GOLD_COLOR
        }}>
          {finalCost} 💰
          {discountMultiplier !== 1 && (
            <div style={{ fontSize: 10, color: '#888', textDecoration: 'line-through' }}>
              {shield.cost}
            </div>
          )}
        </span>
      </div>
      <div style={{
        fontSize: 12,
        color: isDisabled ? '#888' : '#aaa',
        textAlign: 'left',
        marginBottom: '4px'
      }}>
        +{shield.strength} Kalkan Gücü
      </div>
      <div style={{
        fontSize: 10,
        color: isDisabled ? '#666' : '#888',
        textAlign: 'left'
      }}>
        Yeni Toplam: {newShieldStrength} Güç
      </div>
    </div>
  );
}; 