import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import type { TowerRenderProps } from '../types';
import { SpecializedTowerRenderer } from './SpecializedTowerRenderer';

/**
 * Dynamic Tower Renderer
 * Single component that renders all tower levels using a switch statement
 * Optimized for performance and cross-platform compatibility
 * Now includes specialized tower rendering for unique visual designs
 */
export const TowerRenderer: React.FC<TowerRenderProps> = ({ slot, towerLevel }) => {
  // Check if this is a specialized tower that needs unique rendering
  if (slot.tower?.towerClass) {
    return <SpecializedTowerRenderer slot={slot} towerLevel={towerLevel} />;
  }

  const baseWidth = GAME_CONSTANTS.TOWER_SIZE + 8;
  const topWidth = GAME_CONSTANTS.TOWER_SIZE - 4;
  
  switch (towerLevel) {
    case 1:
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

    case 2:
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

    case 3:
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

    case 4:
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
          
          {/* Windows with Iron Frames */}
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
            width={3}
            height={6}
            fill="#2F4F4F"
            stroke="#1A1A1A"
            strokeWidth={1}
            rx={1}
          />
        </g>
      );

    case 5:
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
          
          {/* Crystal Spikes */}
          <polygon points={`${slot.x - 8},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${slot.x - 4},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${slot.x - 12},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}`} fill="#9370DB" />
          <polygon points={`${slot.x + 8},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${slot.x + 4},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${slot.x + 12},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}`} fill="#9370DB" />
          
          {/* Windows with Crystal Frames */}
          <rect
            x={slot.x - 6}
            y={slot.y - 8}
            width={12}
            height={16}
            fill="#000000"
            stroke="#E6E6FA"
            strokeWidth={2}
            rx={2}
          />
          <rect
            x={slot.x - 5}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 18}
            width={10}
            height={14}
            fill="#000000"
            stroke="#E6E6FA"
            strokeWidth={2}
            rx={2}
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
            fill="#9370DB"
            stroke="#E6E6FA"
            strokeWidth={2}
          />
        </g>
      );

    default: // Level 6+
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
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40}
            width={topWidth - 8}
            height={20}
            fill="#9370DB"
            stroke="#8A2BE2"
            strokeWidth={2}
            rx={4}
          />
          
          {/* Marble Roof */}
          <polygon
            points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 60} ${
              slot.x - 8
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${
              slot.x + 8
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40}`}
            fill="#DEB887"
            stroke="#CD853F"
            strokeWidth={2}
          />
          
          {/* Royal Spikes */}
          <polygon points={`${slot.x - 8},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 60} ${slot.x - 4},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${slot.x - 12},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40}`} fill="#8A2BE2" />
          <polygon points={`${slot.x + 8},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 60} ${slot.x + 4},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${slot.x + 12},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40}`} fill="#8A2BE2" />
          
          {/* Windows with Gold Frames */}
          <rect
            x={slot.x - 6}
            y={slot.y - 8}
            width={12}
            height={16}
            fill="#000000"
            stroke="#FFD700"
            strokeWidth={2}
            rx={2}
          />
          <rect
            x={slot.x - 5}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 18}
            width={10}
            height={14}
            fill="#000000"
            stroke="#FFD700"
            strokeWidth={2}
            rx={2}
          />
          <rect
            x={slot.x - 4}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 38}
            width={8}
            height={12}
            fill="#000000"
            stroke="#9370DB"
            strokeWidth={2}
            rx={2}
          />
          
          {/* Marble Door */}
          <rect
            x={slot.x - 8}
            y={slot.y + 8}
            width={16}
            height={12}
            fill="#DEB887"
            stroke="#CD853F"
            strokeWidth={2}
            rx={2}
          />
          
          {/* Gold Door Handle */}
          <circle
            cx={slot.x + 4}
            cy={slot.y + 14}
            r={3}
            fill="#FFD700"
            stroke="#B8860B"
            strokeWidth={2}
          />
        </g>
      );
  }
}; 