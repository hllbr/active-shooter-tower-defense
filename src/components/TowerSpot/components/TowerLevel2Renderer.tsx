import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import type { TowerRenderProps } from '../types';

export const TowerLevel2Renderer: React.FC<TowerRenderProps> = ({ slot }) => {
  const baseWidth = GAME_CONSTANTS.TOWER_SIZE + 8;
  const topWidth = GAME_CONSTANTS.TOWER_SIZE - 4;
  
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
}; 