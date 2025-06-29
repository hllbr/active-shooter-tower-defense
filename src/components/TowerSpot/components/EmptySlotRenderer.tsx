import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/Constants';
import { SlotUnlockDisplay } from './SlotUnlockDisplay';
import type { EmptySlotRendererProps } from '../types';

export const EmptySlotRenderer: React.FC<EmptySlotRendererProps> = ({
  slot,
  slotIdx,
  isDragTarget,
  shouldShowBuildText,
  unlockCost,
  canUnlock,
  isUnlocking,
  isRecentlyUnlocked,
  onUnlock,
  onBuildTower
}) => {
  if (slot.unlocked) {
    return (
      <g style={{ cursor: 'pointer' }}>
        {/* Basic slot circle - always clickable */}
        <circle
          cx={slot.x}
          cy={slot.y}
          r={GAME_CONSTANTS.TOWER_SIZE / 2}
          fill="rgba(100, 100, 100, 0.2)"
          stroke="#888888"
          strokeWidth={2}
          strokeDasharray="4 2"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            console.log('Kule inşa et tıklandı', slotIdx);
            if (onBuildTower) onBuildTower(slotIdx, 'attack');
          }}
        />
        
        {/* Build indicator */}
        {shouldShowBuildText && (
          <text
            x={slot.x}
            y={slot.y + 4}
            textAnchor="middle"
            fontSize={12}
            fill="#4ade80"
            fontWeight="bold"
            pointerEvents="none"
          >
            İnşa Et
          </text>
        )}
        
        {/* Drag target highlight */}
        {isDragTarget && (
          <circle
            cx={slot.x}
            cy={slot.y}
            r={GAME_CONSTANTS.TOWER_SIZE / 2 + 5}
            fill="rgba(0, 255, 0, 0.3)"
            stroke="#00FF00"
            strokeWidth={3}
          />
        )}
      </g>
    );
  }

  return (
    <SlotUnlockDisplay
      slot={slot}
      slotIdx={slotIdx}
      unlockCost={unlockCost}
      canUnlock={canUnlock}
      isUnlocking={isUnlocking}
      isRecentlyUnlocked={isRecentlyUnlocked}
      onUnlock={onUnlock}
    />
  );
}; 