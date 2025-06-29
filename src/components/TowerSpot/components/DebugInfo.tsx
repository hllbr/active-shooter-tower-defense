import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import type { DebugInfoProps } from '../types';

export const DebugInfo: React.FC<DebugInfoProps> = ({ slot, debugInfo }) => {
  if (!slot.tower || !debugInfo || !GAME_CONSTANTS.DEBUG_MODE) return null;

  return (
    <>
      {/* Range circle */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={slot.tower.range * (slot.tower.rangeMultiplier ?? 1)}
        fill="none"
        stroke="#ff0000"
        strokeDasharray="4 2"
        strokeWidth={1}
      />
      
      {/* Target line */}
      {debugInfo.enemy?.position && (
        <line
          x1={slot.x}
          y1={slot.y}
          x2={debugInfo.enemy.position.x}
          y2={debugInfo.enemy.position.y}
          stroke="#ff0000"
          strokeWidth={1}
        />
      )}
      
      {/* Firing status */}
      <text
        x={slot.x}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 4}
        fill={debugInfo.firing ? '#00ff00' : '#ff0000'}
        fontSize={10}
        textAnchor="middle"
        fontWeight="bold"
      >
        {debugInfo.firing ? 'FIRE' : 'IDLE'}
      </text>
      
      {/* Tower stats */}
      <text
        x={slot.x}
        y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2 + 15}
        fill="#ffffff"
        fontSize={8}
        textAnchor="middle"
      >
        DMG: {slot.tower.damage} | RNG: {Math.round(slot.tower.range)}
      </text>
    </>
  );
}; 