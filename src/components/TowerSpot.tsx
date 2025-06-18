import React from 'react';
import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/Constants';
import type { TowerSlot } from '../models/gameTypes';

interface TowerSpotProps {
  slot: TowerSlot;
  slotIdx: number;
}

// Get health bar color based on health percentage
function getHealthBarColor(healthPercent: number) {
  // Convert health percentage to RGB values
  // Green (rgb(34, 197, 94)) -> Yellow (rgb(251, 191, 36)) -> Red (rgb(239, 68, 68))
  if (healthPercent > 0.5) {
    // Green to Yellow (100% -> 50%)
    const ratio = (healthPercent - 0.5) * 2; // 1 -> 0
    return `rgb(${34 + (251 - 34) * (1 - ratio)}, ${197 + (191 - 197) * (1 - ratio)}, ${94 + (36 - 94) * (1 - ratio)})`;
  } else {
    // Yellow to Red (50% -> 0%)
    const ratio = healthPercent * 2; // 1 -> 0
    return `rgb(${251 + (239 - 251) * (1 - ratio)}, ${191 + (68 - 191) * (1 - ratio)}, ${36 + (68 - 36) * (1 - ratio)})`;
  }
}

// Get wall color based on strength
function getWallColor(strength: number) {
  if (strength >= 13) return GAME_CONSTANTS.WALL_STRENGTH_COLORS.EPIC;
  if (strength >= 8) return GAME_CONSTANTS.WALL_STRENGTH_COLORS.STRONG;
  if (strength >= 4) return GAME_CONSTANTS.WALL_STRENGTH_COLORS.MEDIUM;
  return GAME_CONSTANTS.WALL_STRENGTH_COLORS.WEAK;
}

export const TowerSpot: React.FC<TowerSpotProps> = ({ slot, slotIdx }) => {
  const gold = useGameStore((s) => s.gold);
  const buildTower = useGameStore((s) => s.buildTower);
  const upgradeTower = useGameStore((s) => s.upgradeTower);
  const buyWall = useGameStore((s) => s.buyWall);
  const canBuild = !slot.tower && gold >= GAME_CONSTANTS.TOWER_COST;
  const canUpgrade =
    slot.tower &&
    slot.tower.level < GAME_CONSTANTS.TOWER_MAX_LEVEL &&
    gold >= GAME_CONSTANTS.TOWER_UPGRADE_COST;
  const canBuyWall = slot.tower && gold >= GAME_CONSTANTS.WALL_COST;

  const [damageFlash, setDamageFlash] = React.useState(false);
  const lastHealth = React.useRef(slot.tower?.health ?? 0);

  // Check for damage taken
  React.useEffect(() => {
    if (!slot.tower) return;
    if (slot.tower.health < lastHealth.current) {
      setDamageFlash(true);
      setTimeout(() => setDamageFlash(false), 200);
    }
    lastHealth.current = slot.tower.health;
  }, [slot.tower?.health]);

  // Health bar for tower
  const healthBar = slot.tower && (
    <g>
      {/* Background - Fixed width background */}
      <rect
        x={slot.x - GAME_CONSTANTS.TOWER_HEALTHBAR_WIDTH / 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}
        width={GAME_CONSTANTS.TOWER_HEALTHBAR_WIDTH}
        height={GAME_CONSTANTS.TOWER_HEALTHBAR_HEIGHT}
        fill={GAME_CONSTANTS.TOWER_HEALTHBAR_COLORS.BACKGROUND}
        rx={4}
      />
      {/* Health fill - Clipped to stay within fixed width */}
      <svg
        x={slot.x - GAME_CONSTANTS.TOWER_HEALTHBAR_WIDTH / 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}
        width={GAME_CONSTANTS.TOWER_HEALTHBAR_WIDTH}
        height={GAME_CONSTANTS.TOWER_HEALTHBAR_HEIGHT}
        viewBox={`0 0 ${GAME_CONSTANTS.TOWER_HEALTHBAR_WIDTH} ${GAME_CONSTANTS.TOWER_HEALTHBAR_HEIGHT}`}
        preserveAspectRatio="none"
      >
        <rect
          x={0}
          y={0}
          width={`${(100 * slot.tower.health) / slot.tower.maxHealth}%`}
          height={GAME_CONSTANTS.TOWER_HEALTHBAR_HEIGHT}
          fill={getHealthBarColor(slot.tower.health / slot.tower.maxHealth)}
          rx={4}
        />
      </svg>
      {/* Health text */}
      <text
        x={slot.x}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20 + GAME_CONSTANTS.TOWER_HEALTHBAR_HEIGHT / 2 + 1}
        fill="#ffffff"
        fontSize={12}
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
        filter="url(#text-shadow)"
      >
        {Math.round(slot.tower.health)}/{slot.tower.maxHealth}
      </text>
      {/* Damage flash overlay */}
      {damageFlash && (
        <rect
          x={slot.x - GAME_CONSTANTS.TOWER_HEALTHBAR_WIDTH / 2}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}
          width={GAME_CONSTANTS.TOWER_HEALTHBAR_WIDTH}
          height={GAME_CONSTANTS.TOWER_HEALTHBAR_HEIGHT}
          fill={GAME_CONSTANTS.TOWER_HEALTHBAR_COLORS.DAMAGE_FLASH}
          rx={4}
          opacity={0.6}
        >
          <animate
            attributeName="opacity"
            from="0.6"
            to="0"
            dur="0.2s"
            fill="freeze"
          />
        </rect>
      )}
    </g>
  );

  return (
    <g>
      {/* Filters for text shadow */}
      <defs>
        <filter id="text-shadow">
          <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="black" floodOpacity="0.5"/>
        </filter>
      </defs>

      {/* Slot or Tower */}
      {!slot.tower ? (
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
            style={{ cursor: canBuild ? 'pointer' : 'default' }}
            onClick={() => canBuild && buildTower(slotIdx)}
          >
            Kule inşa et ({GAME_CONSTANTS.TOWER_COST})
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
          {slot.tower.wallStrength > 0 && (
            <circle
              cx={slot.x}
              cy={slot.y}
              r={GAME_CONSTANTS.TOWER_SIZE / 2 + 10}
              fill="none"
              stroke={getWallColor(slot.tower.wallStrength)}
              strokeWidth={3}
            />
          )}
          <rect
            x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
            width={GAME_CONSTANTS.TOWER_SIZE}
            height={GAME_CONSTANTS.TOWER_SIZE}
            fill={GAME_CONSTANTS.TOWER_COLORS[slot.tower.level - 1]}
            stroke="#003366"
            strokeWidth={4}
            rx={8}
            style={{ cursor: canUpgrade ? 'pointer' : 'default' }}
            onClick={() => canUpgrade && upgradeTower(slotIdx)}
          />
          {/* Health bar */}
          {healthBar}
          {canUpgrade && (
            <text
              x={slot.x}
              y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2 + 40}
              fill="#ffffff"
              fontSize={12}
              fontWeight="bold"
              textAnchor="middle"
              style={{ cursor: 'pointer' }}
              onClick={() => upgradeTower(slotIdx)}
            >
              Yükselt ({GAME_CONSTANTS.TOWER_UPGRADE_COST})
            </text>
          )}
          {canBuyWall && (
            <text
              x={slot.x}
              y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2 + 20}
              fill="#ffffff"
              fontSize={12}
              fontWeight="bold"
              textAnchor="middle"
              style={{ cursor: 'pointer' }}
              onClick={() => buyWall(slotIdx)}
            >
              Sur Al ({GAME_CONSTANTS.WALL_COST})
            </text>
          )}
        </g>
      )}
    </g>
  );
}; 