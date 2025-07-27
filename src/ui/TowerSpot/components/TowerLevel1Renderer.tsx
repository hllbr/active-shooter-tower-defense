import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import type { TowerRenderProps } from '../types';

export const TowerLevel1Renderer = ({ slot }: TowerRenderProps) => {
  const baseWidth = GAME_CONSTANTS.TOWER_SIZE + 8;
  
  return (
    <g>
      {/* Wooden Foundation */}
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
      
      {/* Main Tower Body - Wooden */}
      <rect
        x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
        width={GAME_CONSTANTS.TOWER_SIZE}
        height={GAME_CONSTANTS.TOWER_SIZE}
        fill="#D2691E"
        stroke="#8B4513"
        strokeWidth={3}
        rx={6}
      />
      
      {/* Wooden Planks Pattern */}
      <rect x={slot.x - 12} y={slot.y - 12} width={24} height={4} fill="#CD853F" stroke="#8B4513" strokeWidth={1} />
      <rect x={slot.x - 12} y={slot.y - 8} width={24} height={4} fill="#CD853F" stroke="#8B4513" strokeWidth={1} />
      <rect x={slot.x - 12} y={slot.y - 4} width={24} height={4} fill="#CD853F" stroke="#8B4513" strokeWidth={1} />
      <rect x={slot.x - 12} y={slot.y} width={24} height={4} fill="#CD853F" stroke="#8B4513" strokeWidth={1} />
      <rect x={slot.x - 12} y={slot.y + 4} width={24} height={4} fill="#CD853F" stroke="#8B4513" strokeWidth={1} />
      <rect x={slot.x - 12} y={slot.y + 8} width={24} height={4} fill="#CD853F" stroke="#8B4513" strokeWidth={1} />
      
      {/* Wooden Roof */}
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
      
      {/* Wooden Window */}
      <rect
        x={slot.x - 6}
        y={slot.y - 8}
        width={12}
        height={16}
        fill="#000000"
        stroke="#8B4513"
        strokeWidth={1}
        rx={2}
      />
      
      {/* Wooden Door */}
      <rect
        x={slot.x - 8}
        y={slot.y + 8}
        width={16}
        height={12}
        fill="#8B4513"
        stroke="#654321"
        strokeWidth={2}
        rx={2}
      />
      
      {/* Wooden Door Handle */}
      <circle
        cx={slot.x + 4}
        cy={slot.y + 14}
        r={2}
        fill="#654321"
        stroke="#8B4513"
        strokeWidth={1}
      />
      
      {/* Wooden Crossbeams */}
      <rect x={slot.x - 14} y={slot.y - 10} width={2} height={20} fill="#654321" />
      <rect x={slot.x + 12} y={slot.y - 10} width={2} height={20} fill="#654321" />
    </g>
  );
}; 