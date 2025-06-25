import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/Constants';
import { formatProfessional } from '../../../utils/numberFormatting';
import type { SlotUnlockProps } from '../types';

export const SlotUnlockDisplay: React.FC<SlotUnlockProps> = ({
  slot,
  slotIdx,
  unlockCost,
  canUnlock,
  isUnlocking,
  isRecentlyUnlocked,
  onUnlock
}) => {
  if (slot.unlocked) return null;

  return (
    <g>
      {/* Base locked slot */}
      <rect
        x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
        width={GAME_CONSTANTS.TOWER_SIZE}
        height={GAME_CONSTANTS.TOWER_SIZE}
        fill="#333333"
        stroke="#666666"
        strokeWidth={2}
        rx={6}
        strokeDasharray="4 2"
        style={{ cursor: canUnlock ? 'pointer' : 'not-allowed' }}
        onClick={() => canUnlock && onUnlock(slotIdx)}
      />
      
      {/* 🎬 AŞAMA 1: Kilit Kırılması Animasyonu */}
      {/* Çatlak çizgileri */}
      {isUnlocking && (
        <>
          <line
            x1={slot.x - 12}
            y1={slot.y - 8}
            x2={slot.x + 12}
            y2={slot.y + 8}
            stroke="#FFD700"
            strokeWidth={2}
            style={{ animation: 'slot-crack 0.3s ease-out' }}
          />
          <line
            x1={slot.x - 8}
            y1={slot.y - 12}
            x2={slot.x + 8}
            y2={slot.y + 12}
            stroke="#FFD700"
            strokeWidth={2}
            style={{ animation: 'slot-crack 0.3s ease-out 0.1s' }}
          />
        </>
      )}
      
      {/* Lock icon */}
      <text
        x={slot.x}
        y={slot.y + 6}
        fill={isUnlocking ? "#FFD700" : "#888888"}
        fontSize={24}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ 
          cursor: canUnlock ? 'pointer' : 'not-allowed',
          animation: isUnlocking ? 'lock-shake 0.3s ease-in-out, lock-break 0.3s ease-out 0.3s' : 'none'
        }}
        onClick={() => canUnlock && onUnlock(slotIdx)}
      >
        🔒
      </text>

      {/* 🎆 AŞAMA 2: Parçacık Sistemi */}
      {isUnlocking && (
        <>
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
      )}

      {/* 🎊 AŞAMA 3: Slot Reveal & Celebration */}
      {isRecentlyUnlocked && (
        <>
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
      )}

      {/* Recently unlocked glow effect */}
      {isRecentlyUnlocked && !isUnlocking && (
        <circle
          cx={slot.x}
          cy={slot.y}
          r={GAME_CONSTANTS.TOWER_SIZE / 2 + 5}
          fill="none"
          stroke="#00FF00"
          strokeWidth={3}
          opacity={0.7}
          style={{ animation: 'recently-unlocked-glow 1s ease-in-out infinite' }}
        />
      )}
      
      {/* Unlock button text */}
      <text
        x={slot.x}
        y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2 + 25}
        fill={canUnlock ? "#FFD700" : "#888888"}
        fontSize={12}
        fontWeight="bold"
        textAnchor="middle"
        style={{ cursor: canUnlock ? 'pointer' : 'not-allowed' }}
        onClick={() => canUnlock && onUnlock(slotIdx)}
      >
        {canUnlock ? `Aç (${formatProfessional(unlockCost, 'currency')}💰)` : `Yetersiz Altın (${formatProfessional(unlockCost, 'currency')}💰)`}
      </text>
    </g>
  );
}; 