import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import type { TowerInfoPanelProps } from '../types';

export const TowerInfoPanel: React.FC<TowerInfoPanelProps> = ({
  slot,
  slotIdx,
  currentTowerInfo,
  towerBottomY,
  canUpgrade,
  upgradeInfo,
  upgradeMessage,
  canAffordUpgrade,
  onUpgrade
}) => {
  if (!slot.tower) return null;

  // Health bar
  const healthBar = slot.tower.maxHealth > 0 && (
    <>
      <rect
        x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
        y={towerBottomY + 28}
        width={GAME_CONSTANTS.TOWER_SIZE}
        height={GAME_CONSTANTS.TOWER_HEALTHBAR_HEIGHT}
        fill={GAME_CONSTANTS.HEALTHBAR_BG}
        rx={4}
      />
      <rect
        x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
        y={towerBottomY + 28}
        width={GAME_CONSTANTS.TOWER_SIZE * (slot.tower.health / slot.tower.maxHealth)}
        height={GAME_CONSTANTS.TOWER_HEALTHBAR_HEIGHT}
        fill={slot.tower.health > slot.tower.maxHealth * 0.4 ? GAME_CONSTANTS.HEALTHBAR_GOOD : GAME_CONSTANTS.HEALTHBAR_BAD}
        rx={4}
      />
    </>
  );

  return (
    <>
      {/* Tower name and level */}
      {currentTowerInfo && (
        <text
          x={slot.x}
          y={towerBottomY + 18}
          fill="#ffffff"
          fontSize={16}
          fontWeight="bold"
          textAnchor="middle"
        >
          {`${currentTowerInfo.name} (Lvl ${slot.tower.level})`}
        </text>
      )}

      {/* Health bar */}
      {healthBar}
      
      {/* Upgrade button */}
      {canUpgrade && upgradeInfo && (
        <text
          x={slot.x}
          y={towerBottomY + 50}
          fill={canAffordUpgrade ? '#4ade80' : '#ff4444'}
          fontSize={14}
          fontWeight="bold"
          textAnchor="middle"
          style={{ cursor: canAffordUpgrade ? 'pointer' : 'not-allowed' }}
          onClick={() => canAffordUpgrade && onUpgrade(slotIdx)}
        >
          {upgradeMessage}
        </text>
      )}
    </>
  );
}; 