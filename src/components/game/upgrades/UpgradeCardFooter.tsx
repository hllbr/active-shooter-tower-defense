import React from 'react';
import { formatCurrency, getAffordabilityColor, getUnifiedButtonText, getUnifiedCostDisplay } from '../../../utils/numberFormatting';

interface UpgradeCardFooterProps {
  baseCost: number;
  finalCost: number;
  gold: number;
  isMaxed: boolean;
  canAfford: boolean;
  color: string;
}

export const UpgradeCardFooter: React.FC<UpgradeCardFooterProps> = ({
  baseCost,
  finalCost,
  gold,
  isMaxed,
  canAfford,
  color
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      borderTop: `2px solid ${color}30`,
      paddingTop: 12
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 4
      }}>
        {baseCost !== finalCost && (
          <div style={{ 
            fontSize: 12, 
            color: '#999', 
            textDecoration: 'line-through'
          }}>
            {formatCurrency(baseCost)} 💰
          </div>
        )}
        <div style={{ 
          fontSize: 16, 
          fontWeight: 'bold',
          color: isMaxed ? '#4ade80' : getAffordabilityColor(finalCost, gold)
        }}>
          {getUnifiedCostDisplay(finalCost, baseCost !== finalCost ? baseCost : undefined, isMaxed).mainText}
        </div>
      </div>
      
      {!isMaxed && (
        <div style={{
          padding: '8px 16px',
          borderRadius: 10,
          background: canAfford 
            ? `linear-gradient(135deg, ${color}, ${color}cc)` 
            : 'rgba(255,255,255,0.1)',
          color: canAfford ? '#fff' : '#666',
          fontSize: 14,
          fontWeight: 'bold',
          border: `2px solid ${canAfford ? color : '#666'}`,
          textShadow: canAfford ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
        }}>
          {getUnifiedButtonText(isMaxed, canAfford, false, 'purchase')}
        </div>
      )}
    </div>
  );
}; 