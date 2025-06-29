import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import type { TowerRenderProps } from '../types';

export const TowerLevel3Renderer: React.FC<TowerRenderProps> = ({ slot }) => {
  const baseWidth = GAME_CONSTANTS.TOWER_SIZE + 8;
  const topWidth = GAME_CONSTANTS.TOWER_SIZE - 4;
  
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
}; 