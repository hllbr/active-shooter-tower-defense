import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';

interface ParticleSystemProps {
  slot: { x: number; y: number };
  isUnlocking: boolean;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  slot,
  isUnlocking
}) => {
  if (!isUnlocking) return null;

  return (
    <>
      {/* 🎆 AŞAMA 2: Parçacık Sistemi */}
      {/* Ana patlama efekti */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={GAME_CONSTANTS.TOWER_SIZE}
        style={{ animation: 'golden-burst 0.6s ease-out 0.3s' }}
      />
      
      {/* Radial dalga efekti */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={10}
        fill="none"
        stroke="#FFD700"
        style={{ animation: 'radial-wave 0.8s ease-out 0.5s' }}
      />
      <circle
        cx={slot.x}
        cy={slot.y}
        r={10}
        fill="none"
        stroke="#FFA500"
        style={{ animation: 'radial-wave 0.8s ease-out 0.7s' }}
      />
      
      {/* Parçacık sistemi - 8 yönde parçacıklar */}
      {[1,2,3,4,5,6,7,8].map(i => (
        <circle
          key={i}
          cx={slot.x}
          cy={slot.y}
          r={4}
          fill="#FFD700"
          style={{ 
            animation: `particle-burst-${i} 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s`,
            filter: 'drop-shadow(0 0 6px #FFD700)',
            transformOrigin: `${slot.x}px ${slot.y}px`
          }}
        />
      ))}
      
      {/* İkinci dalga parçacıklar */}
      {[1,2,3,4,5,6,7,8].map(i => (
        <circle
          key={`second-${i}`}
          cx={slot.x}
          cy={slot.y}
          r={2}
          fill="#FFA500"
          style={{ 
            animation: `particle-burst-${i} 0.6s ease-out 0.8s`,
            filter: 'drop-shadow(0 0 2px #FFA500)'
          }}
        />
      ))}
    </>
  );
}; 