import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import type { VisualExtrasProps } from '../types';
import { TowerEffectsRenderer } from './TowerEffectsRenderer';

export const VisualExtrasRenderer: React.FC<VisualExtrasProps> = ({ slot }) => {
  if (!slot.tower) return null;
  
  // Use specialized effects renderer for tower classes
  if (slot.tower.towerClass) {
    return <TowerEffectsRenderer slot={slot} />;
  }
  
  // Economy tower indicator
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
  
  // Standard visual effects for non-specialized towers
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