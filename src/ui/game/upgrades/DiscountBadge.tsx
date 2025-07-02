import React from 'react';
import type { BadgeProps } from './types';

export const DiscountBadge: React.FC<BadgeProps> = ({ diceResult }) => {
  if (!diceResult || diceResult < 4) return null;

  return (
    <div style={{
      position: 'absolute',
      top: -8,
      left: -8,
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
  );
}; 