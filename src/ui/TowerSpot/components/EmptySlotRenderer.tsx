import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { SlotUnlockDisplay } from './SlotUnlockDisplay';
import { gameFlowManager } from '../../../game-systems/GameFlowManager';
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
  // Get build UI state from GameFlowManager
  const buildUIState = gameFlowManager.getBuildUIState(slotIdx);
  
  if (slot.unlocked) {
    return (
      <g style={{ cursor: buildUIState.isDisabled ? 'not-allowed' : 'pointer' }}>
        {/* Basic slot circle with disabled state */}
        <circle
          cx={slot.x}
          cy={slot.y}
          r={GAME_CONSTANTS.TOWER_SIZE / 2}
          fill={buildUIState.isDisabled ? "rgba(100, 100, 100, 0.1)" : "rgba(100, 100, 100, 0.2)"}
          stroke={buildUIState.isDisabled ? "#666666" : "#888888"}
          strokeWidth={2}
          strokeDasharray="4 2"
          style={{ 
            cursor: buildUIState.isDisabled ? 'not-allowed' : 'pointer',
            opacity: buildUIState.isDisabled ? 0.5 : 1
          }}
          onClick={() => {
            if (!buildUIState.isDisabled && onBuildTower) {
              onBuildTower(slotIdx, 'attack');
            }
          }}
        />
        
        {/* Build indicator with disabled state */}
        {shouldShowBuildText && (
          <text
            x={slot.x}
            y={slot.y + 4}
            textAnchor="middle"
            fontSize={12}
            fill={buildUIState.isDisabled ? "#666666" : "#4ade80"}
            fontWeight="bold"
            pointerEvents="none"
          >
            {buildUIState.isDisabled ? buildUIState.tooltip : 'İnşa Et'}
          </text>
        )}
        
        {/* Drag target highlight */}
        {isDragTarget && !buildUIState.isDisabled && (
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