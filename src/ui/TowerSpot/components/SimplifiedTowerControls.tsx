import React, { useState, useCallback } from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { formatProfessional } from '../../../utils/formatters';
import { playSound } from '../../../utils/sound/soundEffects';
import { toast } from 'react-toastify';
import { useTowerTouchControls } from '../../../game-systems/responsive';
import type { TowerSlot } from '../../../models/gameTypes';

interface SimplifiedTowerControlsProps {
  slot: TowerSlot;
  slotIdx: number;
  canUpgrade: boolean;
  upgradeInfo: { cost: number } | null;
  canAffordUpgrade: boolean;
  onUpgrade: (slotIdx: number) => void;
  canRepair: boolean;
  canAffordRepair: boolean;
  repairCost: number;
  onRepair: (slotIdx: number) => void;
  onDelete: (slotIdx: number) => void;
  _isHovered: boolean;
  isSelected: boolean;
}

interface TowerControlIconProps {
  icon: string;
  color: string;
  position: { x: number; y: number };
  tooltip: string;
  onClick: () => void;
  isDisabled?: boolean;
}

const TowerControlIcon: React.FC<TowerControlIconProps> = ({
  icon,
  color,
  position,
  tooltip,
  onClick,
  isDisabled = false
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isDisabled) {
        onClick();
      }
    },
    [isDisabled, onClick]
  );

  const handleMouseEnter = useCallback(() => {
    setShowTooltip(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  return (
    <>
      <text
        x={position.x}
        y={position.y}
        fill={color}
        fontSize={20}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.5 : 1,
          userSelect: 'none',
          filter: isDisabled ? 'grayscale(1)' : 'none',
          transition: 'all 0.2s ease'
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {icon}
      </text>
      
      {/* Tooltip */}
      {showTooltip && (
        <foreignObject
          x={position.x - 60}
          y={position.y - 40}
          width={120}
          height={30}
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="tower-control-tooltip"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#ffffff',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              textAlign: 'center',
              border: '1px solid #4a90e2',
              animation: 'tooltipFadeIn 0.2s ease-out'
            }}
          >
            {tooltip}
          </div>
        </foreignObject>
      )}
    </>
  );
};

export const SimplifiedTowerControls: React.FC<SimplifiedTowerControlsProps> = ({
  slot,
  slotIdx,
  canUpgrade,
  upgradeInfo,
  canAffordUpgrade,
  onUpgrade,
  canRepair,
  canAffordRepair,
  repairCost,
  onRepair,
  onDelete,
  _isHovered,
  isSelected
}) => {
  // Touch controls for tower interactions
  const { 
    upgradeHandlers, 
    repairHandlers, 
    deleteHandlers 
  } = useTowerTouchControls(
    () => {
      if (!canAffordUpgrade) {
        playSound('error');
        toast.warning(`Not enough gold! You need ${formatProfessional(upgradeInfo?.cost || 0, 'currency')} to upgrade.`);
        return;
      }
      onUpgrade(slotIdx);
    },
    () => {
      if (!canAffordRepair) {
        playSound('error');
        toast.warning(`Not enough gold! You need ${formatProfessional(repairCost, 'currency')} to repair.`);
        return;
      }
      onRepair(slotIdx);
    },
    () => {
      onDelete(slotIdx);
      playSound('tower-upgrade');
      toast.success('Tower removed!');
    }
  );

  if (!slot.tower) return null;

  // Only show controls when tower is selected (click behavior)
  // Hover no longer shows upgrade/repair controls
  if (!isSelected) return null;

  const towerCenterX = slot.x;
  const towerBottomY = slot.y + GAME_CONSTANTS.TOWER_SIZE / 2 + 15;
  
  // Calculate positions for the three control icons
  const iconSpacing = 35;
  const upgradeIconX = towerCenterX - iconSpacing;
  const repairIconX = towerCenterX;
  const deleteIconX = towerCenterX + iconSpacing;
  const iconY = towerBottomY + 25;

  return (
    <g data-tower-controls={slotIdx}>
      {/* Upgrade Icon with Touch Controls */}
      {canUpgrade && (
        <TowerControlIcon
          icon={canAffordUpgrade ? '🔼' : '❌'}
          color={canAffordUpgrade ? '#4ade80' : '#ff4444'}
          position={{ x: upgradeIconX, y: iconY }}
          tooltip={canAffordUpgrade 
            ? `Upgrade (${formatProfessional(upgradeInfo?.cost || 0, 'currency')}) - Double tap for quick upgrade`
            : 'Not enough gold'
          }
          onClick={upgradeHandlers.onTap}
          isDisabled={!canAffordUpgrade}
        />
      )}

      {/* Repair Icon with Touch Controls */}
      {canRepair && (
        <TowerControlIcon
          icon="🔧"
          color={canAffordRepair ? '#3b82f6' : '#ff4444'}
          position={{ x: repairIconX, y: iconY }}
          tooltip={canAffordRepair 
            ? `Repair (${formatProfessional(repairCost, 'currency')})`
            : 'Not enough gold'
          }
          onClick={repairHandlers.onTap}
          isDisabled={!canAffordRepair}
        />
      )}

      {/* Delete Icon with Touch Controls */}
      <TowerControlIcon
        icon="🗑️"
        color="#ff4444"
        position={{ x: deleteIconX, y: iconY }}
        tooltip="Delete tower (Long press for confirmation)"
        onClick={deleteHandlers.onTap}
      />
    </g>
  );
}; 