import React from 'react';
import type { TowerSpotProps } from './types';
import { useTowerSpotLogic } from './hooks/useTowerSpotLogic';
import {
  EmptySlotRenderer,
  TowerContainer,
  TowerDragWrapper,
  TowerMenu
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
        <EmptySlotRenderer
          slot={slot}
          slotIdx={slotIdx}
          isDragTarget={isDragTarget || false}
          shouldShowBuildText={shouldShowBuildText}
          unlockCost={unlockCost}
          canUnlock={canUnlock}
          isUnlocking={isUnlocking}
          isRecentlyUnlocked={isRecentlyUnlocked}
          onUnlock={() => handleUnlock(slotIdx)}
        />
      ) : (
        <TowerDragWrapper
          slotIdx={slotIdx}
          draggedTowerSlotIdx={draggedTowerSlotIdx}
          onTowerDragStart={onTowerDragStart}
        >
          <TowerContainer
            slot={slot}
            slotIdx={slotIdx}
            wallLevel={wallLevel}
            debugInfo={debugInfo}
            currentTowerInfo={currentTowerInfo}
            towerBottomY={towerBottomY}
            canUpgrade={canUpgrade}
            upgradeInfo={upgradeInfo}
            upgradeMessage={upgradeMessage}
            canAffordUpgrade={canAffordUpgrade}
            onUpgrade={handleUpgrade}
          />
        </TowerDragWrapper>
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