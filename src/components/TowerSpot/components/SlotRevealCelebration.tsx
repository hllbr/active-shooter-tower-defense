import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';

interface SlotRevealCelebrationProps {
  slot: { x: number; y: number };
  isRecentlyUnlocked: boolean;
}

export const SlotRevealCelebration: React.FC<SlotRevealCelebrationProps> = ({
  slot,
  isRecentlyUnlocked
}) => {
  if (!isRecentlyUnlocked) return null;

  return (
    <>
      {/* 🎊 AŞAMA 3: Slot Reveal & Celebration */}
      {/* Yerden çıkan çatlak efekti */}
      <g>
        <path
          d={`M ${slot.x - 30} ${slot.y + 25} L ${slot.x - 10} ${slot.y + 15} L ${slot.x + 15} ${slot.y + 20} L ${slot.x + 35} ${slot.y + 10}`}
          fill="none"
          stroke="#8B4513"
          strokeWidth={3}
          style={{ animation: 'ground-crack 1s ease-out 0.9s' }}
        />
        <path
          d={`M ${slot.x - 25} ${slot.y + 30} L ${slot.x + 5} ${slot.y + 25} L ${slot.x + 25} ${slot.y + 35}`}
          fill="none"
          stroke="#8B4513"
          strokeWidth={2}
          style={{ animation: 'ground-crack 0.8s ease-out 1.1s' }}
        />
      </g>
      
      {/* Slot emergence - Yerden çıkma efekti */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={GAME_CONSTANTS.TOWER_SIZE / 2 + 5}
        fill="rgba(139, 69, 19, 0.3)"
        stroke="#8B4513"
        strokeWidth={2}
        style={{ animation: 'slot-emerge 1.2s ease-out 1s' }}
      />
      
      {/* Ready glow - İnşa edilebilir parıltısı */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={GAME_CONSTANTS.TOWER_SIZE / 2}
        fill="none"
        stroke="#00FF00"
        style={{ animation: 'slot-ready-glow 2s ease-in-out 1.5s infinite' }}
      />
      
      {/* Celebration text */}
      <text
        x={slot.x}
        y={slot.y - 30}
        textAnchor="middle"
        fill="#FFD700"
        fontSize={16}
        fontWeight="bold"
        style={{ 
          animation: 'celebration-text 2s ease-out 1.2s',
          filter: 'drop-shadow(0 0 4px #FFD700)'
        }}
      >
        +1 Slot Unlocked! 🎉
      </text>
      
      {/* Flying coins */}
      {[0, 1, 2].map(i => (
        <text
          key={`coin-${i}`}
          x={slot.x + (i - 1) * 20}
          y={slot.y + 40}
          textAnchor="middle"
          fill="#FFD700"
          fontSize={14}
          style={{ 
            animation: `coin-animation 1.5s ease-out ${1.3 + i * 0.2}s`,
            filter: 'drop-shadow(0 0 2px #FFD700)'
          }}
        >
          💰
        </text>
      ))}
      
      {/* Achievement badge */}
      <g>
        <circle
          cx={slot.x + 25}
          cy={slot.y - 25}
          r={12}
          fill="#4169E1"
          stroke="#FFD700"
          strokeWidth={2}
          style={{ animation: 'achievement-badge 2s ease-out 1.4s' }}
        />
        <text
          x={slot.x + 25}
          y={slot.y - 20}
          textAnchor="middle"
          fill="#FFD700"
          fontSize={12}
          fontWeight="bold"
          style={{ animation: 'achievement-badge 2s ease-out 1.4s' }}
        >
          ⭐
        </text>
      </g>
    </>
  );
}; 