import React from 'react';
import type { TowerSlot } from '../../../models/gameTypes';
import type { TowerUpgradeInfo, DebugInfoProps } from '../types';
import {
  ModifierRenderer,
  WallRenderer,
  TowerRenderer,
  VisualExtrasRenderer,
  DebugInfo,
  TowerInfoPanel
} from './';

interface TowerContainerProps {
  slot: TowerSlot;
  slotIdx: number;
  wallLevel: number;
  debugInfo: DebugInfoProps['debugInfo'];
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
  debugInfo,
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
        onUpgrade={onUpgrade}
      />
    </g>
  );
}; 