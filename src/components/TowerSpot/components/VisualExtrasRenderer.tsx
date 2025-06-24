import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/Constants';
import type { VisualExtrasProps } from '../types';

export const VisualExtrasRenderer: React.FC<VisualExtrasProps> = ({ slot }) => {
  if (!slot.tower) return null;
  
  if (slot.tower.towerType === 'economy') {
    return (
      <text 
        x={slot.x} 
        y={slot.y + 4} 
        textAnchor="middle" 
        fontSize={20} 
        pointerEvents="none"
      >
        💰
      </text>
    );
  }
  
  const visual = GAME_CONSTANTS.TOWER_VISUALS.find(v => v.level === slot.tower!.level);
  if (!visual) return null;
  
  return (
    <>
      {visual.glow && (
        <circle 
          cx={slot.x} 
          cy={slot.y} 
          r={GAME_CONSTANTS.TOWER_SIZE} 
          fill="none" 
          stroke="#aef" 
          strokeWidth={3} 
          opacity={0.6} 
        />
      )}
      {visual.effect === 'electric_aura' && (
        <circle 
          cx={slot.x} 
          cy={slot.y} 
          r={GAME_CONSTANTS.TOWER_SIZE + 10} 
          fill="none" 
          stroke="#33f" 
          strokeDasharray="4 2" 
        />
      )}
    </>
  );
}; 