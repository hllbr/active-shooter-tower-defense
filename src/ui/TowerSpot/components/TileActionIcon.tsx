import React, { useState, useCallback } from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { playSound } from '../../../utils/sound/soundEffects';
import { toast } from 'react-toastify';
import type { TowerSlot } from '../../../models/gameTypes';

interface TileActionIconProps {
  slot: TowerSlot;
  _slotIdx: number;
  _onTileAction: (slotIdx: number, action: 'wall' | 'trench' | 'buff') => void;
  onShowMenu: () => void;
  isHovered: boolean;
  isSelected: boolean;
  canPerformAction: boolean;
  actionsRemaining: number;
}

export const TileActionIcon: React.FC<TileActionIconProps> = ({
  slot,
  _slotIdx,
  _onTileAction,
  onShowMenu,
  _isHovered,
  isSelected,
  canPerformAction,
  actionsRemaining
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleActionClick = useCallback(() => {
    if (!canPerformAction) {
      if (actionsRemaining <= 0) {
        toast.warning('No actions remaining!');
        playSound('error');
      } else {
        toast.error('Cannot perform tile action at this time!');
        playSound('error');
      }
      return;
    }

    // Show action menu
    playSound('tower-upgrade');
    onShowMenu();
  }, [canPerformAction, actionsRemaining, onShowMenu]);

  const handleMouseEnter = useCallback(() => {
    setShowTooltip(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  // Only show action icon when slot is selected (click behavior)
  // Hover no longer shows action icon
  if (!isSelected) return null;

  const slotCenterX = slot.x;
  const slotBottomY = slot.y + GAME_CONSTANTS.TOWER_SIZE / 2 + 15;
  
  // Position the action icon below the slot
  const actionIconX = slotCenterX;
  const actionIconY = slotBottomY + 15;

  // Determine icon and color based on state
  let icon = '⛏️';
  let color = '#f59e0b';
  let tooltip = `Tile Actions (${actionsRemaining} remaining)`;

  if (actionsRemaining <= 0) {
    icon = '🚫';
    color = '#6b7280';
    tooltip = 'No actions remaining';
  } else if (!canPerformAction) {
    icon = '⏳';
    color = '#f59e0b';
    tooltip = 'Cannot perform action now';
  }

  return (
    <g data-tower-controls={_slotIdx}>
      {/* Tile Action Icon */}
      <text
        x={actionIconX}
        y={actionIconY}
        fill={color}
        fontSize={16}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          cursor: canPerformAction ? 'pointer' : 'not-allowed',
          opacity: canPerformAction ? 1 : 0.6,
          userSelect: 'none',
          filter: canPerformAction ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' : 'grayscale(1) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
          transition: 'all 0.2s ease'
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleActionClick();
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {icon}
      </text>
      
      {/* Tooltip */}
      {showTooltip && (
        <foreignObject
          x={actionIconX - 80}
          y={actionIconY - 35}
          width={160}
          height={30}
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="tile-action-tooltip"
            style={{
              background: 'rgba(0, 0, 0, 0.9)',
              color: '#ffffff',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              textAlign: 'center',
              border: '1px solid #f59e0b',
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