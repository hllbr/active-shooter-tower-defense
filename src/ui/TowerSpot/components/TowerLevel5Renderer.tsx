import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import type { TowerRenderProps } from '../types';

export const TowerLevel5Renderer: React.FC<TowerRenderProps> = ({ slot }) => {
  const baseWidth = GAME_CONSTANTS.TOWER_SIZE + 8;
  const topWidth = GAME_CONSTANTS.TOWER_SIZE - 4;
  
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
}; 