import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/Constants';
import type { WallRenderProps } from '../types';

export const WallRenderer: React.FC<WallRenderProps> = ({ slot, wallLevel }) => {
  if (!slot.tower || slot.tower.wallStrength <= 0) return null;

  const wallRadius = GAME_CONSTANTS.TOWER_SIZE / 2 + 35;
  const wallInfo = GAME_CONSTANTS.WALL_SYSTEM.WALL_LEVELS[wallLevel - 1];

  if (!wallInfo) return null; // Sur yoksa çizim yapma

  // Seviye 1-2: Taş Duvar
  if (wallLevel <= 2) {
    const numStones = 12;
    return (
      <g>
        {Array.from({ length: numStones }).map((_, i) => {
          const angle = (i / numStones) * 2 * Math.PI;
          const x = slot.x + wallRadius * Math.cos(angle);
          const y = slot.y + wallRadius * Math.sin(angle);
          return (
            <rect
              key={i}
              x={x - 10}
              y={y - 10}
              width={20}
              height={20}
              fill={wallLevel === 1 ? '#C0C0C0' : '#A9A9A9'}
              stroke={wallLevel === 1 ? '#505050' : '#404040'}
              strokeWidth={3}
              rx={4}
              transform={`rotate(${angle * (180 / Math.PI) + 45}, ${x}, ${y})`}
            />
          );
        })}
      </g>
    );
  }

  // Seviye 3-4: Kale Duvarı
  if (wallLevel <= 4) {
    const numSegments = 16;
    return (
      <g>
        <circle 
          cx={slot.x} 
          cy={slot.y} 
          r={wallRadius} 
          fill="none" 
          stroke={wallLevel === 3 ? '#A9A9A9' : '#808080'} 
          strokeWidth={10} 
        />
        {Array.from({ length: numSegments }).map((_, i) => {
          const angle = (i / numSegments) * 2 * Math.PI;
          const x = slot.x + (wallRadius + 5) * Math.cos(angle);
          const y = slot.y + (wallRadius + 5) * Math.sin(angle);
          return (
            <rect
              key={i}
              x={x - 5}
              y={y - 5}
              width={10}
              height={10}
              fill={wallLevel === 3 ? '#C0C0C0' : '#909090'}
            />
          );
        })}
      </g>
    );
  }
  
  // Seviye 5-6: Kristal Kalkan
  if (wallLevel <= 6) {
    const numCrystals = 9;
    return (
      <g opacity={0.9}>
        {/* Crystal Glow */}
         <circle 
           cx={slot.x} 
           cy={slot.y} 
           r={wallRadius + 5} 
           fill={wallLevel === 5 ? '#00E5FF' : '#B2EBF2'} 
           opacity={0.3} 
         />
        {Array.from({ length: numCrystals }).map((_, i) => {
          const angle = (i / numCrystals) * 2 * Math.PI;
          const x1 = slot.x + (wallRadius - 12) * Math.cos(angle);
          const y1 = slot.y + (wallRadius - 12) * Math.sin(angle);
          const x2 = slot.x + (wallRadius + 12) * Math.cos(angle + 0.15);
          const y2 = slot.y + (wallRadius + 12) * Math.sin(angle + 0.15);
          const x3 = slot.x + (wallRadius + 12) * Math.cos(angle - 0.15);
          const y3 = slot.y + (wallRadius + 12) * Math.sin(angle - 0.15);
          return (
            <polygon 
              key={i}
              points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} 
              fill={wallLevel === 5 ? '#00FFFF' : '#AFEEEE'}
              stroke="#00BCD4"
              strokeWidth={2.5}
            />
          );
        })}
      </g>
    );
  }
  
  // Seviye 7-8: Enerji Kalkanı
  return (
      <g>
          <defs>
              <pattern id="hex" patternUnits="userSpaceOnUse" width="25" height="25" x={0} y={0}>
                  <polygon 
                    points="12.5,0 25,6.25 25,18.75 12.5,25 0,18.75 0,6.25" 
                    fill="none" 
                    stroke={wallLevel === 7 ? '#00FF7F' : '#FFD700'} 
                    strokeWidth={1.5}
                  />
              </pattern>
               <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                  </feMerge>
              </filter>
          </defs>
          <circle 
            cx={slot.x} 
            cy={slot.y} 
            r={wallRadius} 
            fill="url(#hex)" 
            stroke={wallLevel === 7 ? '#00FF7F' : '#FFD700'} 
            strokeWidth={4} 
            opacity={0.7} 
            filter="url(#glow)"
          />
          <circle 
            cx={slot.x} 
            cy={slot.y} 
            r={wallRadius} 
            fill="none" 
            stroke={wallLevel === 7 ? 'white' : '#FFFACD'} 
            strokeWidth={1.5} 
            opacity={0.9}
          />
      </g>
  );
}; 