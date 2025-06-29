import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import type { TowerRenderProps } from '../types';

export const TowerLevel4Renderer: React.FC<TowerRenderProps> = ({ slot }) => {
  const baseWidth = GAME_CONSTANTS.TOWER_SIZE + 8;
  const topWidth = GAME_CONSTANTS.TOWER_SIZE - 4;
  
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
}; 