import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import type { ModifierRenderProps } from '../types';

export const ModifierRenderer: React.FC<ModifierRenderProps> = ({ slot }) => {
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