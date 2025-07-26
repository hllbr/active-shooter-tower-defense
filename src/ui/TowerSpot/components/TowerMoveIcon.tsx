import React, { useState, useCallback } from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { playSound } from '../../../utils/sound/soundEffects';
import { toast } from 'react-toastify';
import type { TowerSlot } from '../../../models/gameTypes';

interface TowerMoveIconProps {
  slot: TowerSlot;
  slotIdx: number;
  onMoveInitiate: (slotIdx: number) => void;
  isHovered: boolean;
  isSelected: boolean;
  canMove: boolean;
  moveCost: number;
  canAffordMove: boolean;
  cooldownRemaining: number;
}

export const TowerMoveIcon: React.FC<TowerMoveIconProps> = ({
  slot,
  slotIdx,
  onMoveInitiate,
  _isHovered,
  isSelected,
  canMove,
  moveCost,
  canAffordMove,
  cooldownRemaining
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMoveClick = useCallback(() => {
    if (!canMove) {
      if (cooldownRemaining > 0) {
        const seconds = Math.ceil(cooldownRemaining / 1000);
        toast.warning(`🕒 Tower can be moved in ${seconds} seconds`);
        playSound('error');
      } else if (!canAffordMove) {
        toast.warning(`⚡ Not enough energy! You need ${moveCost} energy to move tower.`);
        playSound('error');
      } else {
        toast.error('Cannot move tower at this time!');
        playSound('error');
      }
      return;
    }

    onMoveInitiate(slotIdx);
    playSound('tower-upgrade');
    toast.info('✋ Drag the tower to move it!');
  }, [canMove, cooldownRemaining, canAffordMove, moveCost, onMoveInitiate, slotIdx]);

  const handleMouseEnter = useCallback(() => {
    setShowTooltip(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  if (!slot.tower) return null;

  // Only show move icon when tower is selected (click behavior)
  // Hover no longer shows move icon
  if (!isSelected) return null;

  const towerCenterX = slot.x;
  const towerBottomY = slot.y + GAME_CONSTANTS.TOWER_SIZE / 2 + 15;
  
  // Position the move icon above the tower
  const moveIconX = towerCenterX;
  const moveIconY = towerBottomY - 15;

  // Determine icon and color based on state
  let icon = '✋';
  let color = '#3b82f6';
  let tooltip = `Move Tower (${moveCost} energy)`;

  if (cooldownRemaining > 0) {
    icon = '⏳';
    color = '#f59e0b';
    const seconds = Math.ceil(cooldownRemaining / 1000);
    tooltip = `Cooldown: ${seconds}s remaining`;
  } else if (!canAffordMove) {
    icon = '❌';
    color = '#ff4444';
    tooltip = `Not enough energy (${moveCost} required)`;
  } else if (!canMove) {
    icon = '🚫';
    color = '#6b7280';
    tooltip = 'Cannot move tower now';
  }

  return (
    <g data-tower-controls={slotIdx}>
      {/* Move Icon */}
      <text
        x={moveIconX}
        y={moveIconY}
        fill={color}
        fontSize={18}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          cursor: canMove ? 'pointer' : 'not-allowed',
          opacity: canMove ? 1 : 0.6,
          userSelect: 'none',
          filter: canMove ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' : 'grayscale(1) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
          transition: 'all 0.2s ease'
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleMoveClick();
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {icon}
      </text>
      
      {/* Tooltip */}
      {showTooltip && (
        <foreignObject
          x={moveIconX - 80}
          y={moveIconY - 35}
          width={160}
          height={30}
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="tower-move-tooltip"
            style={{
              background: 'rgba(0, 0, 0, 0.9)',
              color: '#ffffff',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              textAlign: 'center',
              border: '1px solid #3b82f6',
              animation: 'tooltipFadeIn 0.2s ease-out',
              fontWeight: 'bold'
            }}
          >
            {tooltip}
          </div>
        </foreignObject>
      )}
    </g>
  );
}; 