import React from 'react';
import type { TowerSlot } from '../../../models/gameTypes';
import type { TowerUpgradeInfo } from '../types';
import {
  ModifierRenderer,
  WallRenderer,
  TowerRenderer,
  VisualExtrasRenderer,

  TowerInfoPanel
} from './';

interface TowerContainerProps {
  slot: TowerSlot;
  slotIdx: number;
  wallLevel: number;
  currentTowerInfo: TowerUpgradeInfo | null;
  towerBottomY: number;
  canUpgrade: boolean;
  upgradeInfo: TowerUpgradeInfo | null;
  upgradeMessage: string;
  canAffordUpgrade: boolean;
  onUpgrade: (slotIdx: number) => void;
}

export const TowerContainer: React.FC<TowerContainerProps> = ({
  slot,
  slotIdx,
  wallLevel,
  
  currentTowerInfo,
  towerBottomY,
  canUpgrade,
  upgradeInfo,
  upgradeMessage,
  canAffordUpgrade,
  onUpgrade
}) => {
  return (
    <g>
      {/* Modifiers (behind tower) */}
      <ModifierRenderer slot={slot} />
      
      {/* Wall (behind tower) */}
      <WallRenderer slot={slot} wallLevel={wallLevel} />
      
      {/* Tower */}
      <TowerRenderer slot={slot} towerLevel={slot.tower!.level} />
      
      {/* Visual extras (above tower) */}
      <VisualExtrasRenderer slot={slot} />
      
      {/* Debug information removed for production optimization */}
      
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
        onUpgrade={onUpgrade}
      />
    </g>
  );
}; 