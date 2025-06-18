import React from 'react';
import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/Constants';
import type { TowerSlot } from '../models/gameTypes';

interface TowerSpotProps {
  slot: TowerSlot;
  slotIdx: number;
}

export const TowerSpot: React.FC<TowerSpotProps> = ({ slot, slotIdx }) => {
  const gold = useGameStore((s) => s.gold);
  const buildTower = useGameStore((s) => s.buildTower);
  const upgradeTower = useGameStore((s) => s.upgradeTower);
  const unlockSlot = useGameStore((s) => s.unlockSlot);

  const canBuild = slot.unlocked && !slot.tower && gold >= GAME_CONSTANTS.TOWER_COST;
  const canUpgrade =
    slot.tower &&
    slot.tower.level < GAME_CONSTANTS.TOWER_MAX_LEVEL &&
    gold >= GAME_CONSTANTS.TOWER_UPGRADE_COST;
  const canUnlock = !slot.unlocked && gold >= (GAME_CONSTANTS.TOWER_SLOT_UNLOCK_GOLD[slotIdx] || 0);

  // Health bar for tower
  const healthBar = slot.tower && (
    <rect
      x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
      y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 16}
      width={GAME_CONSTANTS.TOWER_SIZE}
      height={GAME_CONSTANTS.TOWER_HEALTHBAR_HEIGHT}
      fill={GAME_CONSTANTS.HEALTHBAR_BG}
      rx={4}
    />
  );
  const healthFill = slot.tower && (
    <rect
      x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
      y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 16}
      width={GAME_CONSTANTS.TOWER_SIZE * (slot.tower.health / GAME_CONSTANTS.TOWER_HEALTH)}
      height={GAME_CONSTANTS.TOWER_HEALTHBAR_HEIGHT}
      fill={slot.tower.health > 40 ? GAME_CONSTANTS.HEALTHBAR_GOOD : GAME_CONSTANTS.HEALTHBAR_BAD}
      rx={4}
    />
  );

  return (
    <g>
      {/* Slot or Tower */}
      {!slot.unlocked ? (
        <circle
          cx={slot.x}
          cy={slot.y}
          r={GAME_CONSTANTS.TOWER_SIZE / 2}
          fill={canUnlock ? '#ff6666' : '#661515'}
          stroke="#330000"
          strokeWidth={4}
          style={{ cursor: canUnlock ? 'pointer' : 'not-allowed' }}
          onClick={() => canUnlock && unlockSlot(slotIdx)}
        />
      ) : !slot.tower ? (
        <g>
          <circle
            cx={slot.x}
            cy={slot.y}
            r={GAME_CONSTANTS.TOWER_SIZE / 2}
            fill={canBuild ? '#4ade80' : '#444'}
            stroke="#166534"
            strokeWidth={4}
            style={{ cursor: canBuild ? 'pointer' : 'not-allowed' }}
            onClick={() => canBuild && buildTower(slotIdx)}
          />
          <text
            x={slot.x}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 30}
            fill="#ffffff"
            fontSize={14}
            fontWeight="bold"
            textAnchor="middle"
            pointerEvents="none"
          >
            {slot.wasDestroyed ? 'Kuleniz yıkıldı' : 'Kule inşa et'}
          </text>
          <polygon
            points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 24} ${
              slot.x - 6
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 14} ${
              slot.x + 6
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 14}`}
            fill="#ffffff"
            pointerEvents="none"
          />
        </g>
      ) : (
        <g>
          <circle
            cx={slot.x}
            cy={slot.y}
            r={GAME_CONSTANTS.TOWER_SIZE / 2}
            fill={GAME_CONSTANTS.TOWER_COLORS[slot.tower.level - 1]}
            stroke="#003366"
            strokeWidth={4}
            style={{ cursor: canUpgrade ? 'pointer' : 'default' }}
            onClick={() => canUpgrade && upgradeTower(slotIdx)}
          />
          {/* Health bar */}
          {healthBar}
          {healthFill}
          {canUpgrade && (
            <polygon
              points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 24} ${slot.x - GAME_CONSTANTS.UPGRADE_ARROW_SIZE / 2},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 10} ${slot.x + GAME_CONSTANTS.UPGRADE_ARROW_SIZE / 2},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 10}`}
              fill={GAME_CONSTANTS.UPGRADE_ARROW_COLOR}
              style={{ cursor: 'pointer' }}
              onClick={() => upgradeTower(slotIdx)}
            />
          )}
        </g>
      )}
    </g>
  );
}; 