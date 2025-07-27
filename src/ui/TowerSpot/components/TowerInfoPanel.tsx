import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import type { TowerInfoPanelProps } from '../types';

export const TowerInfoPanel = ({ 
  slot,
  slotIdx,
  _currentTowerInfo,
  towerBottomY,
  canUpgrade,
  upgradeInfo,
  upgradeMessage,
  canAffordUpgrade,
  onUpgrade,
  canRepair,
  canAffordRepair,
  repairMessage,
  onRepair,
  upgradeAnim = false
}: TowerInfoPanelProps & { upgradeAnim?: boolean }) => {
  if (!slot.tower) return null;

  // Health bar
  const healthBar = slot.tower.maxHealth > 0 && (
    <>
      <rect
        x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
        y={towerBottomY + 28}
        width={GAME_CONSTANTS.TOWER_SIZE}
        height={GAME_CONSTANTS.TOWER_HEALTHBAR_HEIGHT}
        fill="var(--health-background, #333)"
        rx={4}
      />
      <rect
        x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
        y={towerBottomY + 28}
        width={GAME_CONSTANTS.TOWER_SIZE * (slot.tower.health / slot.tower.maxHealth)}
        height={GAME_CONSTANTS.TOWER_HEALTHBAR_HEIGHT}
        fill={slot.tower.health > slot.tower.maxHealth * 0.4 ? 'var(--health-good, #00ff00)' : 'var(--health-bad, #ff0000)'}
        rx={4}
      />
    </>
  );

  return (
    <g>
      {/* Background panel */}
      <rect
        x={slot.x - 120}
        y={towerBottomY + 50}
        width={240}
        height={120}
        fill="rgba(0, 0, 0, 0.9)"
        stroke="var(--primary-color, #4a90e2)"
        strokeWidth={2}
        rx={8}
        opacity={0.95}
      />

      {/* Tower info */}
      <text
        x={slot.x}
        y={towerBottomY + 70}
        fill="var(--primary-color, #4a90e2)"
        fontSize={14}
        fontWeight="bold"
        textAnchor="middle"
      >
        Kule #{slotIdx + 1}
      </text>

      {/* Health info */}
      <text
        x={slot.x}
        y={towerBottomY + 90}
        fill="#ffffff"
        fontSize={12}
        textAnchor="middle"
      >
        Sağlık: {slot.tower.health}/{slot.tower.maxHealth}
      </text>

      {/* Health bar */}
      {healthBar}

      {/* Upgrade section */}
      {canUpgrade && (
        <>
          <text
            x={slot.x}
            y={towerBottomY + 110}
            fill="var(--accent-color, #10B981)"
            fontSize={12}
            fontWeight="bold"
            textAnchor="middle"
          >
            Yükseltme: {upgradeInfo?.cost || 0} 💰
          </text>
          
          <text
            x={slot.x}
            y={towerBottomY + 125}
            fill={canAffordUpgrade ? "var(--success-color, #22C55E)" : "var(--danger-color, #EF4444)"}
            fontSize={10}
            textAnchor="middle"
          >
            {upgradeMessage}
          </text>

          <rect
            x={slot.x - 40}
            y={towerBottomY + 130}
            width={80}
            height={20}
            fill={canAffordUpgrade ? "var(--accent-color, #10B981)" : "var(--danger-color, #EF4444)"}
            rx={10}
            cursor="pointer"
            onClick={onUpgrade}
            className={upgradeAnim ? 'upgrade-button-animation' : ''}
          />
          
          <text
            x={slot.x}
            y={towerBottomY + 143}
            fill="white"
            fontSize={10}
            fontWeight="bold"
            textAnchor="middle"
            cursor="pointer"
            onClick={onUpgrade}
          >
            Yükselt
          </text>
        </>
      )}

      {/* Repair section */}
      {canRepair && (
        <>
          <text
            x={slot.x}
            y={towerBottomY + 110}
            fill="var(--warning-color, #F59E0B)"
            fontSize={12}
            fontWeight="bold"
            textAnchor="middle"
          >
            Tamir: {repairMessage}
          </text>

          <rect
            x={slot.x - 40}
            y={towerBottomY + 130}
            width={80}
            height={20}
            fill={canAffordRepair ? "var(--warning-color, #F59E0B)" : "var(--danger-color, #EF4444)"}
            rx={10}
            cursor="pointer"
            onClick={onRepair}
          />
          
          <text
            x={slot.x}
            y={towerBottomY + 143}
            fill="white"
            fontSize={10}
            fontWeight="bold"
            textAnchor="middle"
            cursor="pointer"
            onClick={onRepair}
          >
            Tamir Et
          </text>
        </>
      )}
    </g>
  );
}; 