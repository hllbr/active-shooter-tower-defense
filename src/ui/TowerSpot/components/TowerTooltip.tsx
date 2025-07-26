import React, { useState, useCallback } from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { formatProfessional } from '../../../utils/formatters';
import type { TowerSlot } from '../../../models/gameTypes';

interface TowerTooltipProps {
  slot: TowerSlot;
  slotIdx: number;
  isVisible: boolean;
}

export const TowerTooltip: React.FC<TowerTooltipProps> = ({
  slot,
  slotIdx,
  isVisible
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setShowTooltip(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  if (!slot.tower || !isVisible) return null;

  const tower = slot.tower;
  const towerCenterX = slot.x;
  const towerTopY = slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 10;

  // Calculate tooltip content based on tower type
  const getTowerInfo = () => {
    const baseInfo = {
      name: tower.towerClass ? GAME_CONSTANTS.SPECIALIZED_TOWERS[tower.towerClass]?.name || 'Tower' : 'Tower',
      level: tower.level,
      health: `${Math.ceil(tower.health)}/${tower.maxHealth}`,
      damage: tower.damage,
      range: tower.range,
      fireRate: tower.fireRate
    };

    if (tower.towerType === 'economy') {
      return {
        ...baseInfo,
        name: 'Economy Tower',
        icon: '💰',
        description: 'Generates gold over time'
      };
    }

    return {
      ...baseInfo,
      icon: '🏰',
      description: 'Attacks enemies'
    };
  };

  const towerInfo = getTowerInfo();

  return (
    <g data-tower-tooltip={slotIdx}>
      {/* Invisible hover area for tooltip */}
      <rect
        x={towerCenterX - 30}
        y={towerTopY - 10}
        width={60}
        height={20}
        fill="transparent"
        style={{ pointerEvents: 'auto' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      
      {/* Tooltip */}
      {showTooltip && (
        <foreignObject
          x={towerCenterX - 100}
          y={towerTopY - 80}
          width={200}
          height={70}
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="tower-tooltip"
            style={{
              background: 'rgba(0, 0, 0, 0.9)',
              color: '#ffffff',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              border: '1px solid #4a90e2',
              animation: 'tooltipFadeIn 0.2s ease-out',
              fontWeight: 'normal',
              lineHeight: '1.4'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ marginRight: '6px', fontSize: '14px' }}>{towerInfo.icon}</span>
              <span style={{ fontWeight: 'bold' }}>{towerInfo.name} Lv.{towerInfo.level}</span>
            </div>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>
              <div>Health: {towerInfo.health}</div>
              <div>Damage: {formatProfessional(towerInfo.damage, 'damage')}</div>
              <div>Range: {formatProfessional(towerInfo.range, 'stats')}</div>
            </div>
          </div>
        </foreignObject>
      )}
    </g>
  );
}; 