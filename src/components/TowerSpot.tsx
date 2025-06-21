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
  const wallLevel = useGameStore((s) => s.wallLevel);
  const performTileAction = useGameStore(s => s.performTileAction);
  const actionsRemaining = useGameStore(s => s.actionsRemaining);
  const energy = useGameStore(s => s.energy);
  const canBuild = !slot.tower && gold >= GAME_CONSTANTS.TOWER_COST;

  const [menuPos, setMenuPos] = React.useState<{x:number;y:number}|null>(null);
  
  // Get upgrade info for current tower
  const canUpgrade = slot.tower && slot.tower.level < GAME_CONSTANTS.TOWER_MAX_LEVEL;
  const upgradeInfo = canUpgrade && slot.tower ? GAME_CONSTANTS.TOWER_UPGRADES[slot.tower.level] : null;
  const canAffordUpgrade = upgradeInfo && gold >= upgradeInfo.cost;
  const currentTowerInfo = slot.tower ? GAME_CONSTANTS.TOWER_UPGRADES[slot.tower.level - 1] : null;

  const towerBottomY = slot.y + GAME_CONSTANTS.TOWER_SIZE / 2 + 15;

  // Health bar for tower
  const healthBar = slot.tower && (
    <rect
      x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
      y={towerBottomY + 28}
      width={GAME_CONSTANTS.TOWER_SIZE}
      height={GAME_CONSTANTS.TOWER_HEALTHBAR_HEIGHT}
      fill={GAME_CONSTANTS.HEALTHBAR_BG}
      rx={4}
    />
  );
  const healthFill = slot.tower && slot.tower.maxHealth > 0 && (
    <rect
      x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
      y={towerBottomY + 28}
      width={GAME_CONSTANTS.TOWER_SIZE * (slot.tower.health / slot.tower.maxHealth)}
      height={GAME_CONSTANTS.TOWER_HEALTHBAR_HEIGHT}
      fill={slot.tower.health > slot.tower.maxHealth * 0.4 ? GAME_CONSTANTS.HEALTHBAR_GOOD : GAME_CONSTANTS.HEALTHBAR_BAD}
      rx={4}
    />
  );

  // Tower design function - Artistic progression for each level
  const renderTower = (towerLevel: number) => {
    const baseWidth = GAME_CONSTANTS.TOWER_SIZE + 8;
    const topWidth = GAME_CONSTANTS.TOWER_SIZE - 4;
    
    // Level 1: Rustic Wooden Watchtower
    if (towerLevel === 1) {
      return (
        <g>
          {/* Stone Foundation */}
          <rect
            x={slot.x - baseWidth / 2}
            y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
            width={baseWidth}
            height={12}
            fill="#8B4513"
            stroke="#654321"
            strokeWidth={2}
            rx={4}
          />
          
          {/* Main Tower Body - Weathered Wood */}
          <rect
            x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
            width={GAME_CONSTANTS.TOWER_SIZE}
            height={GAME_CONSTANTS.TOWER_SIZE}
            fill="#CD853F"
            stroke="#8B7355"
            strokeWidth={3}
            rx={6}
          />
          
          {/* Wood Grain Pattern */}
          <rect x={slot.x - 12} y={slot.y - 10} width={24} height={2} fill="#8B7355" opacity={0.6} />
          <rect x={slot.x - 12} y={slot.y - 5} width={24} height={2} fill="#8B7355" opacity={0.6} />
          <rect x={slot.x - 12} y={slot.y} width={24} height={2} fill="#8B7355" opacity={0.6} />
          <rect x={slot.x - 12} y={slot.y + 5} width={24} height={2} fill="#8B7355" opacity={0.6} />
          
          {/* Thatched Roof */}
          <polygon
            points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${
              slot.x - 12
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2} ${
              slot.x + 12
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}`}
            fill="#8B4513"
            stroke="#654321"
            strokeWidth={2}
          />
          
          {/* Simple Window */}
          <rect
            x={slot.x - 6}
            y={slot.y - 8}
            width={12}
            height={16}
            fill="#000000"
            stroke="#333333"
            strokeWidth={1}
            rx={2}
          />
          
          {/* Wooden Door */}
          <rect
            x={slot.x - 8}
            y={slot.y + 8}
            width={16}
            height={12}
            fill="#654321"
            stroke="#8B4513"
            strokeWidth={2}
            rx={2}
          />
          
          {/* Door Handle */}
          <circle
            cx={slot.x + 4}
            cy={slot.y + 14}
            r={2}
            fill="#8B4513"
            stroke="#654321"
            strokeWidth={1}
          />
        </g>
      );
    }
    
    // Level 2: Medieval Stone Fortress
    if (towerLevel === 2) {
      return (
        <g>
          {/* Stone Foundation */}
          <rect
            x={slot.x - baseWidth / 2}
            y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
            width={baseWidth}
            height={12}
            fill="#696969"
            stroke="#404040"
            strokeWidth={2}
            rx={4}
          />
          
          {/* Main Tower Body - Stone Blocks */}
          <rect
            x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
            width={GAME_CONSTANTS.TOWER_SIZE}
            height={GAME_CONSTANTS.TOWER_SIZE}
            fill="#A9A9A9"
            stroke="#696969"
            strokeWidth={3}
            rx={6}
          />
          
          {/* Stone Block Pattern */}
          <rect x={slot.x - 12} y={slot.y - 12} width={8} height={6} fill="#8B8B8B" stroke="#696969" strokeWidth={1} />
          <rect x={slot.x - 4} y={slot.y - 12} width={8} height={6} fill="#8B8B8B" stroke="#696969" strokeWidth={1} />
          <rect x={slot.x + 4} y={slot.y - 12} width={8} height={6} fill="#8B8B8B" stroke="#696969" strokeWidth={1} />
          <rect x={slot.x - 12} y={slot.y - 6} width={8} height={6} fill="#8B8B8B" stroke="#696969" strokeWidth={1} />
          <rect x={slot.x - 4} y={slot.y - 6} width={8} height={6} fill="#8B8B8B" stroke="#696969" strokeWidth={1} />
          <rect x={slot.x + 4} y={slot.y - 6} width={8} height={6} fill="#8B8B8B" stroke="#696969" strokeWidth={1} />
          
          {/* Second Floor - Battlements */}
          <rect
            x={slot.x - topWidth / 2}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}
            width={topWidth}
            height={20}
            fill="#C0C0C0"
            stroke="#A9A9A9"
            strokeWidth={2}
            rx={4}
          />
          
          {/* Stone Roof */}
          <polygon
            points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${
              slot.x - 10
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${
              slot.x + 10
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}`}
            fill="#696969"
            stroke="#404040"
            strokeWidth={2}
          />
          
          {/* Battlements */}
          <rect x={slot.x - 12} y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 22} width={4} height={6} fill="#404040" />
          <rect x={slot.x + 8} y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 22} width={4} height={6} fill="#404040" />
          <rect x={slot.x - 4} y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 22} width={8} height={6} fill="#404040" />
          
          {/* Windows */}
          <rect
            x={slot.x - 6}
            y={slot.y - 8}
            width={12}
            height={16}
            fill="#000000"
            stroke="#333333"
            strokeWidth={1}
            rx={2}
          />
          <rect
            x={slot.x - 5}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 18}
            width={10}
            height={14}
            fill="#000000"
            stroke="#333333"
            strokeWidth={1}
            rx={2}
          />
          
          {/* Stone Door */}
          <rect
            x={slot.x - 8}
            y={slot.y + 8}
            width={16}
            height={12}
            fill="#404040"
            stroke="#696969"
            strokeWidth={2}
            rx={2}
          />
          
          {/* Iron Door Handle */}
          <rect
            x={slot.x + 4}
            y={slot.y + 12}
            width={3}
            height={6}
            fill="#2F2F2F"
            stroke="#1A1A1A"
            strokeWidth={1}
            rx={1}
          />
        </g>
      );
    }
    
    // Level 3: Bronze Age Fortress
    if (towerLevel === 3) {
      return (
        <g>
          {/* Bronze Foundation */}
          <rect
            x={slot.x - baseWidth / 2}
            y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
            width={baseWidth}
            height={12}
            fill="#CD7F32"
            stroke="#8B4513"
            strokeWidth={2}
            rx={4}
          />
          
          {/* Main Tower Body - Bronze */}
          <rect
            x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
            width={GAME_CONSTANTS.TOWER_SIZE}
            height={GAME_CONSTANTS.TOWER_SIZE}
            fill="#D2691E"
            stroke="#CD7F32"
            strokeWidth={3}
            rx={6}
          />
          
          {/* Bronze Plates */}
          <rect x={slot.x - 12} y={slot.y - 12} width={24} height={4} fill="#B8860B" stroke="#CD7F32" strokeWidth={1} />
          <rect x={slot.x - 12} y={slot.y - 4} width={24} height={4} fill="#B8860B" stroke="#CD7F32" strokeWidth={1} />
          <rect x={slot.x - 12} y={slot.y + 4} width={24} height={4} fill="#B8860B" stroke="#CD7F32" strokeWidth={1} />
          
          {/* Second Floor - Bronze */}
          <rect
            x={slot.x - topWidth / 2}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}
            width={topWidth}
            height={20}
            fill="#DAA520"
            stroke="#CD7F32"
            strokeWidth={2}
            rx={4}
          />
          
          {/* Bronze Roof */}
          <polygon
            points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${
              slot.x - 10
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${
              slot.x + 10
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}`}
            fill="#CD7F32"
            stroke="#8B4513"
            strokeWidth={2}
          />
          
          {/* Bronze Spikes */}
          <polygon points={`${slot.x - 8},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${slot.x - 4},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${slot.x - 12},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}`} fill="#8B4513" />
          <polygon points={`${slot.x + 8},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${slot.x + 4},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${slot.x + 12},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}`} fill="#8B4513" />
          
          {/* Windows with Bronze Frames */}
          <rect
            x={slot.x - 6}
            y={slot.y - 8}
            width={12}
            height={16}
            fill="#000000"
            stroke="#CD7F32"
            strokeWidth={2}
            rx={2}
          />
          <rect
            x={slot.x - 5}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 18}
            width={10}
            height={14}
            fill="#000000"
            stroke="#CD7F32"
            strokeWidth={2}
            rx={2}
          />
          
          {/* Bronze Door */}
          <rect
            x={slot.x - 8}
            y={slot.y + 8}
            width={16}
            height={12}
            fill="#CD7F32"
            stroke="#8B4513"
            strokeWidth={2}
            rx={2}
          />
          
          {/* Bronze Door Handle */}
          <circle
            cx={slot.x + 4}
            cy={slot.y + 14}
            r={3}
            fill="#B8860B"
            stroke="#8B4513"
            strokeWidth={2}
          />
        </g>
      );
    }
    
    // Level 4: Iron Age Stronghold
    if (towerLevel === 4) {
      return (
        <g>
          {/* Iron Foundation */}
          <rect
            x={slot.x - baseWidth / 2}
            y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
            width={baseWidth}
            height={12}
            fill="#708090"
            stroke="#2F4F4F"
            strokeWidth={2}
            rx={4}
          />
          
          {/* Main Tower Body - Iron */}
          <rect
            x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
            width={GAME_CONSTANTS.TOWER_SIZE}
            height={GAME_CONSTANTS.TOWER_SIZE}
            fill="#778899"
            stroke="#708090"
            strokeWidth={3}
            rx={6}
          />
          
          {/* Iron Rivets */}
          <circle cx={slot.x - 8} cy={slot.y - 8} r={2} fill="#2F4F4F" />
          <circle cx={slot.x + 8} cy={slot.y - 8} r={2} fill="#2F4F4F" />
          <circle cx={slot.x - 8} cy={slot.y + 8} r={2} fill="#2F4F4F" />
          <circle cx={slot.x + 8} cy={slot.y + 8} r={2} fill="#2F4F4F" />
          <circle cx={slot.x} cy={slot.y} r={2} fill="#2F4F4F" />
          
          {/* Second Floor - Iron */}
          <rect
            x={slot.x - topWidth / 2}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}
            width={topWidth}
            height={20}
            fill="#B0C4DE"
            stroke="#778899"
            strokeWidth={2}
            rx={4}
          />
          
          {/* Iron Roof */}
          <polygon
            points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${
              slot.x - 10
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${
              slot.x + 10
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}`}
            fill="#708090"
            stroke="#2F4F4F"
            strokeWidth={2}
          />
          
          {/* Iron Spikes */}
          <polygon points={`${slot.x - 8},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${slot.x - 4},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${slot.x - 12},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}`} fill="#2F4F4F" />
          <polygon points={`${slot.x + 8},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${slot.x + 4},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${slot.x + 12},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}`} fill="#2F4F4F" />
          <polygon points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${slot.x - 4},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${slot.x + 4},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}`} fill="#2F4F4F" />
          
          {/* Windows with Iron Bars */}
          <rect
            x={slot.x - 6}
            y={slot.y - 8}
            width={12}
            height={16}
            fill="#000000"
            stroke="#708090"
            strokeWidth={2}
            rx={2}
          />
          <rect x={slot.x - 6} y={slot.y - 4} width={12} height={2} fill="#2F4F4F" />
          <rect x={slot.x - 6} y={slot.y + 2} width={12} height={2} fill="#2F4F4F" />
          <rect x={slot.x - 6} y={slot.y + 8} width={12} height={2} fill="#2F4F4F" />
          
          <rect
            x={slot.x - 5}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 18}
            width={10}
            height={14}
            fill="#000000"
            stroke="#708090"
            strokeWidth={2}
            rx={2}
          />
          <rect x={slot.x - 5} y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 12} width={10} height={2} fill="#2F4F4F" />
          <rect x={slot.x - 5} y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 6} width={10} height={2} fill="#2F4F4F" />
          
          {/* Iron Door */}
          <rect
            x={slot.x - 8}
            y={slot.y + 8}
            width={16}
            height={12}
            fill="#708090"
            stroke="#2F4F4F"
            strokeWidth={2}
            rx={2}
          />
          
          {/* Iron Door Handle */}
          <rect
            x={slot.x + 4}
            y={slot.y + 12}
            width={4}
            height={8}
            fill="#2F4F4F"
            stroke="#1A1A1A"
            strokeWidth={1}
            rx={2}
          />
        </g>
      );
    }
    
    // Level 5: Crystal Tower
    if (towerLevel === 5) {
      return (
        <g>
          {/* Crystal Foundation */}
          <rect
            x={slot.x - baseWidth / 2}
            y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
            width={baseWidth}
            height={12}
            fill="#E6E6FA"
            stroke="#9370DB"
            strokeWidth={2}
            rx={4}
          />
          
          {/* Main Tower Body - Crystal */}
          <rect
            x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
            width={GAME_CONSTANTS.TOWER_SIZE}
            height={GAME_CONSTANTS.TOWER_SIZE}
            fill="#F0F8FF"
            stroke="#E6E6FA"
            strokeWidth={3}
            rx={6}
          />
          
          {/* Crystal Facets */}
          <polygon points={`${slot.x - 12},${slot.y - 12} ${slot.x - 8},${slot.y - 8} ${slot.x - 12},${slot.y - 4}`} fill="#E6E6FA" opacity={0.7} />
          <polygon points={`${slot.x + 12},${slot.y - 12} ${slot.x + 8},${slot.y - 8} ${slot.x + 12},${slot.y - 4}`} fill="#E6E6FA" opacity={0.7} />
          <polygon points={`${slot.x - 12},${slot.y + 4} ${slot.x - 8},${slot.y + 8} ${slot.x - 12},${slot.y + 12}`} fill="#E6E6FA" opacity={0.7} />
          <polygon points={`${slot.x + 12},${slot.y + 4} ${slot.x + 8},${slot.y + 8} ${slot.x + 12},${slot.y + 12}`} fill="#E6E6FA" opacity={0.7} />
          
          {/* Second Floor - Crystal */}
          <rect
            x={slot.x - topWidth / 2}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}
            width={topWidth}
            height={20}
            fill="#E0FFFF"
            stroke="#E6E6FA"
            strokeWidth={2}
            rx={4}
          />
          
          {/* Crystal Roof */}
          <polygon
            points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${
              slot.x - 10
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${
              slot.x + 10
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}`}
            fill="#E6E6FA"
            stroke="#9370DB"
            strokeWidth={2}
          />
          
          {/* Crystal Spire */}
          <polygon
            points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 50} ${
              slot.x - 6
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${
              slot.x + 6
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40}`}
            fill="#E0FFFF"
            stroke="#9370DB"
            strokeWidth={2}
          />
          
          {/* Windows with Crystal Glow */}
          <rect
            x={slot.x - 6}
            y={slot.y - 8}
            width={12}
            height={16}
            fill="#000000"
            stroke="#9370DB"
            strokeWidth={2}
            rx={2}
          />
          <rect
            x={slot.x - 5}
            y={slot.y - 7}
            width={10}
            height={14}
            fill="#E0FFFF"
            opacity={0.6}
            rx={1}
          />
          
          <rect
            x={slot.x - 5}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 18}
            width={10}
            height={14}
            fill="#000000"
            stroke="#9370DB"
            strokeWidth={2}
            rx={2}
          />
          <rect
            x={slot.x - 4}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 17}
            width={8}
            height={12}
            fill="#E0FFFF"
            opacity={0.6}
            rx={1}
          />
          
          {/* Crystal Door */}
          <rect
            x={slot.x - 8}
            y={slot.y + 8}
            width={16}
            height={12}
            fill="#E6E6FA"
            stroke="#9370DB"
            strokeWidth={2}
            rx={2}
          />
          
          {/* Crystal Door Handle */}
          <circle
            cx={slot.x + 4}
            cy={slot.y + 14}
            r={3}
            fill="#E0FFFF"
            stroke="#9370DB"
            strokeWidth={2}
          />
          
          {/* Crystal Aura */}
          <circle
            cx={slot.x}
            cy={slot.y}
            r={GAME_CONSTANTS.TOWER_SIZE / 2 + 5}
            fill="none"
            stroke="#E0FFFF"
            strokeWidth={1}
            opacity={0.4}
          />
        </g>
      );
    }
    
    // Level 6+: Majestic Palace Tower (Enhanced)
    return (
      <g>
        {/* Marble Foundation */}
        <rect
          x={slot.x - baseWidth / 2}
          y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
          width={baseWidth}
          height={12}
          fill="#F5F5DC"
          stroke="#DEB887"
          strokeWidth={2}
          rx={4}
        />
        
        {/* Main Tower Body - Marble */}
        <rect
          x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
          width={GAME_CONSTANTS.TOWER_SIZE}
          height={GAME_CONSTANTS.TOWER_SIZE}
          fill="#FFF8DC"
          stroke="#DEB887"
          strokeWidth={3}
          rx={6}
        />
        
        {/* Marble Veins */}
        <path d={`M ${slot.x - 12} ${slot.y - 12} Q ${slot.x} ${slot.y - 8} ${slot.x + 12} ${slot.y - 12}`} stroke="#DEB887" strokeWidth={1} fill="none" opacity={0.6} />
        <path d={`M ${slot.x - 12} ${slot.y} Q ${slot.x} ${slot.y + 4} ${slot.x + 12} ${slot.y}`} stroke="#DEB887" strokeWidth={1} fill="none" opacity={0.6} />
        <path d={`M ${slot.x - 12} ${slot.y + 12} Q ${slot.x} ${slot.y + 8} ${slot.x + 12} ${slot.y + 12}`} stroke="#DEB887" strokeWidth={1} fill="none" opacity={0.6} />
        
        {/* Second Floor - Gold accents */}
        <rect
          x={slot.x - topWidth / 2}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}
          width={topWidth}
          height={20}
          fill="#FFD700"
          stroke="#B8860B"
          strokeWidth={2}
          rx={4}
        />
        
        {/* Third Floor - Royal Purple */}
        <rect
          x={slot.x - (topWidth - 8) / 2}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 36}
          width={topWidth - 8}
          height={16}
          fill="#9370DB"
          stroke="#4B0082"
          strokeWidth={2}
          rx={4}
        />
        
        {/* Golden Spire */}
        <polygon
          points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 52} ${
            slot.x - 8
          },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 36} ${
            slot.x + 8
          },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 36}`}
          fill="#FFD700"
          stroke="#B8860B"
          strokeWidth={2}
        />
        
        {/* Crown on top */}
        <polygon
          points={`${slot.x - 6},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 52} ${
            slot.x - 3
          },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 56} ${
            slot.x
          },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 58} ${
            slot.x + 3
          },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 56} ${
            slot.x + 6
          },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 52}`}
          fill="#FFD700"
          stroke="#B8860B"
          strokeWidth={1}
        />
        
        {/* Crown Jewels */}
        <circle cx={slot.x - 3} cy={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 56} r={2} fill="#FF1493" />
        <circle cx={slot.x} cy={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 58} r={2} fill="#00CED1" />
        <circle cx={slot.x + 3} cy={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 56} r={2} fill="#32CD32" />
        
        {/* Ornate Windows with Stained Glass */}
        <rect
          x={slot.x - 6}
          y={slot.y - 8}
          width={12}
          height={16}
          fill="#000000"
          stroke="#FFD700"
          strokeWidth={1}
          rx={2}
        />
        <rect
          x={slot.x - 5}
          y={slot.y - 7}
          width={10}
          height={14}
          fill="#FF69B4"
          opacity={0.6}
          rx={1}
        />
        
        <rect
          x={slot.x - 5}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 18}
          width={10}
          height={14}
          fill="#000000"
          stroke="#FFD700"
          strokeWidth={1}
          rx={2}
        />
        <rect
          x={slot.x - 4}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 17}
          width={8}
          height={12}
          fill="#00CED1"
          opacity={0.6}
          rx={1}
        />
        
        <rect
          x={slot.x - 4}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 34}
          width={8}
          height={12}
          fill="#000000"
          stroke="#FFD700"
          strokeWidth={1}
          rx={2}
        />
        <rect
          x={slot.x - 3}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 33}
          width={6}
          height={10}
          fill="#32CD32"
          opacity={0.6}
          rx={1}
        />
        
        {/* Golden Door */}
        <rect
          x={slot.x - 8}
          y={slot.y + 8}
          width={16}
          height={12}
          fill="#FFD700"
          stroke="#B8860B"
          strokeWidth={2}
          rx={2}
        />
        
        {/* Door Handle */}
        <circle
          cx={slot.x + 4}
          cy={slot.y + 14}
          r={2}
          fill="#B8860B"
          stroke="#8B4513"
          strokeWidth={1}
        />
        
        {/* Royal Banners */}
        <rect
          x={slot.x - 10}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 2}
          width={4}
          height={8}
          fill="#FF0000"
          stroke="#8B0000"
          strokeWidth={1}
        />
        <rect
          x={slot.x + 6}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 2}
          width={4}
          height={8}
          fill="#0000FF"
          stroke="#00008B"
          strokeWidth={1}
        />
        
        {/* Gemstone Decorations */}
        <circle
          cx={slot.x - 8}
          cy={slot.y - 4}
          r={3}
          fill="#FF1493"
          stroke="#C71585"
          strokeWidth={1}
        />
        <circle
          cx={slot.x + 8}
          cy={slot.y - 4}
          r={3}
          fill="#00BFFF"
          stroke="#0080FF"
          strokeWidth={1}
        />
        
        {/* Royal Aura Effect */}
        <circle
          cx={slot.x}
          cy={slot.y}
          r={GAME_CONSTANTS.TOWER_SIZE / 2 + 8}
          fill="none"
          stroke="#FFD700"
          strokeWidth={1}
          opacity={0.3}
        />
      </g>
    );
  };

  // --- Yeni Sur Tasarım Fonksiyonu ---
  const renderWall = () => {
    if (!slot.tower || slot.tower.wallStrength <= 0) return null;

    const wallRadius = GAME_CONSTANTS.TOWER_SIZE / 2 + 35;
    const wallInfo = GAME_CONSTANTS.WALL_SYSTEM.WALL_LEVELS[wallLevel - 1];

    if (!wallInfo) return null; // Sur yoksa çizim yapma

    // Seviye 1-2: Taş Duvar
    if (wallLevel <= 2) {
      const numStones = 12;
      return (
        <g>
          {Array.from({ length: numStones }).map((_, i) => {
            const angle = (i / numStones) * 2 * Math.PI;
            const x = slot.x + wallRadius * Math.cos(angle);
            const y = slot.y + wallRadius * Math.sin(angle);
            return (
              <rect
                key={i}
                x={x - 10}
                y={y - 10}
                width={20}
                height={20}
                fill={wallLevel === 1 ? '#C0C0C0' : '#A9A9A9'}
                stroke={wallLevel === 1 ? '#505050' : '#404040'}
                strokeWidth={3}
                rx={4}
                transform={`rotate(${angle * (180 / Math.PI) + 45}, ${x}, ${y})`}
              />
            );
          })}
        </g>
      );
    }

    // Seviye 3-4: Kale Duvarı
    if (wallLevel <= 4) {
      const numSegments = 16;
      return (
        <g>
          <circle cx={slot.x} cy={slot.y} r={wallRadius} fill="none" stroke={wallLevel === 3 ? '#A9A9A9' : '#808080'} strokeWidth={10} />
          {Array.from({ length: numSegments }).map((_, i) => {
            const angle = (i / numSegments) * 2 * Math.PI;
            const x = slot.x + (wallRadius + 5) * Math.cos(angle);
            const y = slot.y + (wallRadius + 5) * Math.sin(angle);
            return (
              <rect
                key={i}
                x={x - 5}
                y={y - 5}
                width={10}
                height={10}
                fill={wallLevel === 3 ? '#C0C0C0' : '#909090'}
              />
            );
          })}
        </g>
      );
    }
    
    // Seviye 5-6: Kristal Kalkan
    if (wallLevel <= 6) {
      const numCrystals = 9;
      return (
        <g opacity={0.9}>
          {/* Crystal Glow */}
           <circle cx={slot.x} cy={slot.y} r={wallRadius + 5} fill={wallLevel === 5 ? '#00E5FF' : '#B2EBF2'} opacity={0.3} />
          {Array.from({ length: numCrystals }).map((_, i) => {
            const angle = (i / numCrystals) * 2 * Math.PI;
            const x1 = slot.x + (wallRadius - 12) * Math.cos(angle);
            const y1 = slot.y + (wallRadius - 12) * Math.sin(angle);
            const x2 = slot.x + (wallRadius + 12) * Math.cos(angle + 0.15);
            const y2 = slot.y + (wallRadius + 12) * Math.sin(angle + 0.15);
            const x3 = slot.x + (wallRadius + 12) * Math.cos(angle - 0.15);
            const y3 = slot.y + (wallRadius + 12) * Math.sin(angle - 0.15);
            return (
              <polygon 
                key={i}
                points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} 
                fill={wallLevel === 5 ? '#00FFFF' : '#AFEEEE'}
                stroke="#00BCD4"
                strokeWidth={2.5}
              />
            );
          })}
        </g>
      );
    }
    
    // Seviye 7-8: Enerji Kalkanı
    return (
        <g>
            <defs>
                <pattern id="hex" patternUnits="userSpaceOnUse" width="25" height="25" x={0} y={0}>
                    <polygon points="12.5,0 25,6.25 25,18.75 12.5,25 0,18.75 0,6.25" fill="none" stroke={wallLevel === 7 ? '#00FF7F' : '#FFD700'} strokeWidth={1.5}/>
                </pattern>
                 <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <circle cx={slot.x} cy={slot.y} r={wallRadius} fill="url(#hex)" stroke={wallLevel === 7 ? '#00FF7F' : '#FFD700'} strokeWidth={4} opacity={0.7} filter="url(#glow)"/>
            <circle cx={slot.x} cy={slot.y} r={wallRadius} fill="none" stroke={wallLevel === 7 ? 'white' : '#FFFACD'} strokeWidth={1.5} opacity={0.9}/>
        </g>
    );
  };

  const renderModifier = () => {
    if (!slot.modifier) return null;
    const { type, expiresAt } = slot.modifier;
    if (expiresAt && expiresAt < performance.now()) return null;
    if (type === 'wall') {
      return (
        <rect
          x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2 - 10}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 10}
          width={GAME_CONSTANTS.TOWER_SIZE + 20}
          height={GAME_CONSTANTS.TOWER_SIZE + 20}
          fill="rgba(100,100,100,0.5)"
          stroke="#666"
          strokeWidth={2}
        />
      );
    }
    if (type === 'trench') {
      return (
        <circle
          cx={slot.x}
          cy={slot.y}
          r={GAME_CONSTANTS.TOWER_SIZE / 2 + 12}
          fill="rgba(0,0,0,0.3)"
          stroke="#222"
          strokeDasharray="4 2"
          strokeWidth={2}
        />
      );
    }
    if (type === 'buff') {
      return (
        <circle
          cx={slot.x}
          cy={slot.y}
          r={GAME_CONSTANTS.TOWER_SIZE / 2 + 16}
          fill="none"
          stroke="#0ff"
          strokeWidth={3}
        />
      );
    }
    return null;
  };

  const renderVisualExtras = () => {
    if (!slot.tower) return null;
    const visual = GAME_CONSTANTS.TOWER_VISUALS.find(v => v.level === slot.tower!.level);
    if (!visual) return null;
    return (
      <>
        {visual.glow && (
          <circle cx={slot.x} cy={slot.y} r={GAME_CONSTANTS.TOWER_SIZE} fill="none" stroke="#aef" strokeWidth={3} opacity={0.6} />
        )}
        {visual.effect === 'electric_aura' && (
          <circle cx={slot.x} cy={slot.y} r={GAME_CONSTANTS.TOWER_SIZE + 10} fill="none" stroke="#33f" strokeDasharray="4 2" />
        )}
      </>
    );
  };

  return (
    <g onContextMenu={(e) => { e.preventDefault(); setMenuPos({ x: e.clientX, y: e.clientY }); }}>
      {/* Slot or Tower */}
      {!slot.tower ? (
        <g>
          {/* Empty slot with foundation */}
          {renderModifier()}
          <rect
            x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2 - 4}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 4}
            width={GAME_CONSTANTS.TOWER_SIZE + 8}
            height={GAME_CONSTANTS.TOWER_SIZE + 8}
            fill={canBuild ? '#2d5016' : '#333333'}
            stroke={canBuild ? (slot.type === 'dynamic' ? '#3b82f6' : '#4ade80') : '#666666'}
            strokeWidth={3}
            rx={8}
            style={{ cursor: canBuild ? 'pointer' : 'not-allowed' }}
            onClick={() => canBuild && buildTower(slotIdx)}
          />
          <rect
            x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
            width={GAME_CONSTANTS.TOWER_SIZE}
            height={GAME_CONSTANTS.TOWER_SIZE}
            fill={canBuild ? (slot.type === 'dynamic' ? GAME_CONSTANTS.BUILD_TILE_COLORS.dynamic : GAME_CONSTANTS.BUILD_TILE_COLORS.fixed) : '#444444'}
            stroke={canBuild ? (slot.type === 'dynamic' ? '#1e3a8a' : '#166534') : '#555555'}
            strokeWidth={2}
            rx={6}
            style={{ cursor: canBuild ? 'pointer' : 'not-allowed' }}
            onClick={() => canBuild && buildTower(slotIdx)}
          />
          <text
            x={slot.x}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 35}
            fill="#ffffff"
            fontSize={14}
            fontWeight="bold"
            textAnchor="middle"
            pointerEvents="none"
          >
            Kule inşa et
          </text>
          <polygon
            points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 28} ${
              slot.x - 6
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 18} ${
              slot.x + 6
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 18}`}
            fill="#ffffff"
            pointerEvents="none"
          />
        </g>
      ) : (
        <g>
          {renderModifier()}
          {/* Render Wall first so it's behind the tower */}
          {renderWall()}
          {/* Render detailed tower */}
          {renderTower(slot.tower.level)}
          {renderVisualExtras()}
          
          {/* Info panel below tower */}
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

          {healthBar}
          {healthFill}
          
          {canUpgrade && upgradeInfo && (
            <text
              x={slot.x}
              y={towerBottomY + 50}
              fill={canAffordUpgrade ? '#4ade80' : '#ff4444'}
              fontSize={14}
              fontWeight="bold"
              textAnchor="middle"
              style={{ cursor: canAffordUpgrade ? 'pointer' : 'not-allowed' }}
              onClick={() => canAffordUpgrade && upgradeTower(slotIdx)}
            >
              {canAffordUpgrade 
                ? `Yükselt (${upgradeInfo.cost}💰)`
                : `Yetersiz Altın (${upgradeInfo.cost}💰)`
              }
            </text>
          )}
        </g>
      )}
      {menuPos && (
        <foreignObject x={menuPos.x} y={menuPos.y} width="120" height="80" style={{ pointerEvents: 'auto' }}>
          <div style={{ background: '#222', color: '#fff', border: '1px solid #555', fontSize: 12 }}>
            <div style={{ padding: 4, cursor: 'pointer' }} onClick={() => { performTileAction(slotIdx, 'wall'); setMenuPos(null); }}>
              Build Wall
            </div>
            <div style={{ padding: 4, cursor: 'pointer' }} onClick={() => { performTileAction(slotIdx, 'trench'); setMenuPos(null); }}>
              Dig Trench
            </div>
            <div style={{ padding: 4, cursor: 'pointer' }} onClick={() => { performTileAction(slotIdx, 'buff'); setMenuPos(null); }}>
              Buff Tile
            </div>
          </div>
        </foreignObject>
      )}
    </g>
  );
};
