import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/Constants';
import type { TowerRenderProps } from '../types';

export const TowerLevel1Renderer: React.FC<TowerRenderProps> = ({ slot }) => {
  const baseWidth = GAME_CONSTANTS.TOWER_SIZE + 8;
  
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
}; 