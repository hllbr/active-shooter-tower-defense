import React from 'react';
import { GAME_CONSTANTS } from '../../utils/Constants';
import type { TowerSpotProps } from './types';
import { useTowerSpotLogic } from './hooks/useTowerSpotLogic';
import {
  TowerRenderer,
  WallRenderer,
  ModifierRenderer,
  VisualExtrasRenderer,
  TowerMenu,
  TowerInfoPanel,
  SlotUnlockDisplay,
  DebugInfo
} from './components';

export const TowerSpot: React.FC<TowerSpotProps> = ({ 
  slot, 
  slotIdx, 
  onTowerDragStart, 
  isDragTarget, 
  draggedTowerSlotIdx 
}) => {
  const {
    // State
    menuPos,
    isUnlocking,
    isRecentlyUnlocked,
    canUnlock,
    unlockCost,
    canUpgrade,
    upgradeInfo,
    canAffordUpgrade,
    upgradeMessage,
    currentTowerInfo,
    towerBottomY,
    debugInfo,
    shouldShowBuildText,
    wallLevel,
    
    // Handlers
    handleContextMenu,
    handleMenuClose,
    handleBuildTower,
    handlePerformTileAction,
    handleUpgrade,
    handleUnlock
  } = useTowerSpotLogic(slot, slotIdx);

  return (
    <g onContextMenu={handleContextMenu}>
      {/* Slot or Tower */}
      {!slot.tower ? (
        <g>
          {/* Empty slot visualization */}
          {slot.unlocked ? (
            <>
              {/* Basic slot circle */}
              <circle
                cx={slot.x}
                cy={slot.y}
                r={GAME_CONSTANTS.TOWER_SIZE / 2}
                fill="rgba(100, 100, 100, 0.2)"
                stroke="#888888"
                strokeWidth={2}
                strokeDasharray="4 2"
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
            </>
          ) : (
            <SlotUnlockDisplay
              slot={slot}
              slotIdx={slotIdx}
              unlockCost={unlockCost}
              canUnlock={canUnlock}
              isUnlocking={isUnlocking}
              isRecentlyUnlocked={isRecentlyUnlocked}
              onUnlock={handleUnlock}
            />
          )}
        </g>
      ) : (
        <g>
          {/* Modifiers (behind tower) */}
          <ModifierRenderer slot={slot} />
          
          {/* Wall (behind tower) */}
          <WallRenderer slot={slot} wallLevel={wallLevel} />
          
          {/* Tower with drag support */}
          <g 
            style={{ 
              cursor: 'grab',
              opacity: draggedTowerSlotIdx === slotIdx ? 0.5 : 1,
              filter: draggedTowerSlotIdx === slotIdx ? 'brightness(0.7)' : 'none'
            }}
            onMouseDown={(e) => {
              if (onTowerDragStart) {
                onTowerDragStart(slotIdx, e);
              }
            }}
          >
            <TowerRenderer slot={slot} towerLevel={slot.tower.level} />
          </g>
          
          {/* Visual extras (above tower) */}
          <VisualExtrasRenderer slot={slot} />
          
          {/* Debug information */}
          <DebugInfo slot={slot} debugInfo={debugInfo} />
          
          {/* Tower info panel */}
                     <TowerInfoPanel
             slot={slot}
             slotIdx={slotIdx}
             currentTowerInfo={currentTowerInfo}
             towerBottomY={towerBottomY}
             canUpgrade={canUpgrade}
             upgradeInfo={upgradeInfo}
             upgradeMessage={upgradeMessage}
             canAffordUpgrade={canAffordUpgrade}
             onUpgrade={handleUpgrade}
           />
        </g>
      )}
      
      {/* Context menu */}
      <TowerMenu
        menuPos={menuPos}
        slot={slot}
        slotIdx={slotIdx}
        onClose={handleMenuClose}
        onBuildTower={handleBuildTower}
        onPerformTileAction={handlePerformTileAction}
      />
    </g>
  );
}; 