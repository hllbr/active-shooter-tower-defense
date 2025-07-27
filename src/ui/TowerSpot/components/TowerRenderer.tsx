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
export const TowerRenderer = ({ slot, towerLevel }: TowerRenderProps) => {
  // Check if this is a specialized tower that needs unique rendering
  if (slot.tower?.towerClass) {
    return <SpecializedTowerRenderer slot={slot} towerLevel={towerLevel} />;
  }

  // For non-specialized towers, use a modern default design
  const baseWidth = GAME_CONSTANTS.TOWER_SIZE + 8;
  
  return (
    <g>
      {/* Modern Foundation */}
      <rect
        x={slot.x - baseWidth / 2}
        y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
        width={baseWidth}
        height={12}
        fill="#374151"
        stroke="#1f2937"
        strokeWidth={2}
        rx={4}
      />
      
      {/* Main Tower Body - Modern Gray */}
      <rect
        x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
        width={GAME_CONSTANTS.TOWER_SIZE}
        height={GAME_CONSTANTS.TOWER_SIZE}
        fill="#6b7280"
        stroke="#4b5563"
        strokeWidth={3}
        rx={6}
      />
      
      {/* Modern Accent Lines */}
      <rect x={slot.x - 12} y={slot.y - 10} width={24} height={2} fill="#4b5563" opacity={0.6} />
      <rect x={slot.x - 12} y={slot.y - 5} width={24} height={2} fill="#4b5563" opacity={0.6} />
      <rect x={slot.x - 12} y={slot.y} width={24} height={2} fill="#4b5563" opacity={0.6} />
      <rect x={slot.x - 12} y={slot.y + 5} width={24} height={2} fill="#4b5563" opacity={0.6} />
      
      {/* Modern Roof */}
      <polygon
        points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${
          slot.x - 12
        },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2} ${
          slot.x + 12
        },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}`}
        fill="#374151"
        stroke="#1f2937"
        strokeWidth={2}
      />
      
      {/* Modern Window */}
      <rect
        x={slot.x - 6}
        y={slot.y - 8}
        width={12}
        height={16}
        fill="#000000"
        stroke="#374151"
        strokeWidth={1}
        rx={2}
      />
      
      {/* Modern Door */}
      <rect
        x={slot.x - 8}
        y={slot.y + 8}
        width={16}
        height={12}
        fill="#374151"
        stroke="#1f2937"
        strokeWidth={2}
        rx={2}
      />
      
      {/* Modern Door Handle */}
      <circle
        cx={slot.x + 4}
        cy={slot.y + 14}
        r={2}
        fill="#1f2937"
        stroke="#374151"
        strokeWidth={1}
      />
    </g>
  );
}; 