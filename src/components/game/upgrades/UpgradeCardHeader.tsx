import React from 'react';
import { getUnifiedLevelDisplay } from '../../../utils/numberFormatting';

interface UpgradeCardHeaderProps {
  icon: string;
  name: string;
  color: string;
  currentLevel: number;
  maxLevel: number;
  isMaxed: boolean;
  isElite?: boolean;
}

export const UpgradeCardHeader: React.FC<UpgradeCardHeaderProps> = ({
  icon,
  name,
  color,
  currentLevel,
  maxLevel,
  isMaxed,
  isElite
}) => {
  return (
    <>
      {/* Elite Badge */}
      {isElite && (
        <div style={{
          position: 'absolute',
          top: -8,
          right: -8,
          background: 'linear-gradient(45deg, #ffd700, #ffed4a)',
          color: '#000',
          fontSize: 10,
          fontWeight: 'bold',
          padding: '4px 8px',
          borderRadius: 12,
          border: '2px solid #fff',
          boxShadow: '0 4px 12px rgba(255, 215, 0, 0.5)',
        }}>
          ⭐ ELİTE
        </div>
      )}

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12,
        borderBottom: `2px solid ${color}30`,
        paddingBottom: 12
      }}>
        <div style={{ fontSize: 28 }}>{icon}</div>
        <div>
          <div style={{ 
            fontSize: 16, 
            fontWeight: 'bold', 
            color: color,
            textShadow: `0 0 10px ${color}50`
          }}>
            {name}
          </div>
          <div style={{ 
            fontSize: 12, 
            color: isMaxed ? '#4ade80' : '#ccc',
            opacity: 0.9,
            fontWeight: isMaxed ? 'bold' : 'normal'
          }}>
            {getUnifiedLevelDisplay(currentLevel, maxLevel, isMaxed)}
          </div>
        </div>
      </div>
    </>
  );
}; 