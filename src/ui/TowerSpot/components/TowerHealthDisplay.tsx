import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import type { TowerSlot } from '../../../models/gameTypes';

interface TowerHealthDisplayProps {
  slot: TowerSlot;
  isVisible: boolean;
}

/**
 * Tower Health Display Component
 * Shows detailed health information when hovering over damaged towers
 */
export const TowerHealthDisplay: React.FC<TowerHealthDisplayProps> = ({ 
  slot, 
  isVisible 
}) => {
  if (!slot.tower || !isVisible) return null;

  const tower = slot.tower;
  const healthPercentage = (tower.health / tower.maxHealth) * 100;
  const isDamaged = tower.health < tower.maxHealth;
  const isCriticallyDamaged = healthPercentage < 30;

  if (!isDamaged) return null;

  const getHealthColor = (percentage: number): string => {
    if (percentage >= 70) return '#4ade80'; // Green
    if (percentage >= 40) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const getHealthStatus = (percentage: number): string => {
    if (percentage >= 80) return 'Hafif Hasar';
    if (percentage >= 50) return 'Orta Hasar';
    if (percentage >= 20) return 'Ağır Hasar';
    return 'Kritik Hasar';
  };

  return (
    <g>
      {/* Background panel */}
      <rect
        x={slot.x - 80}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 80}
        width={160}
        height={60}
        fill="rgba(0, 0, 0, 0.9)"
        stroke={getHealthColor(healthPercentage)}
        strokeWidth={2}
        rx={8}
        opacity={0.95}
      />
      
      {/* Health status text */}
      <text
        x={slot.x}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 60}
        fill="#ffffff"
        fontSize={12}
        fontWeight="bold"
        textAnchor="middle"
      >
        {getHealthStatus(healthPercentage)}
      </text>
      
      {/* Health percentage */}
      <text
        x={slot.x}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 45}
        fill={getHealthColor(healthPercentage)}
        fontSize={14}
        fontWeight="bold"
        textAnchor="middle"
      >
        {Math.round(healthPercentage)}% HP
      </text>
      
      {/* Health values */}
      <text
        x={slot.x}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 30}
        fill="#cccccc"
        fontSize={10}
        textAnchor="middle"
      >
        {tower.health} / {tower.maxHealth}
      </text>
      
      {/* Warning for critically damaged towers */}
      {isCriticallyDamaged && (
        <text
          x={slot.x}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 15}
          fill="#ef4444"
          fontSize={10}
          fontWeight="bold"
          textAnchor="middle"
        >
          ⚠️ Tamir Gerekli!
        </text>
      )}
    </g>
  );
}; 