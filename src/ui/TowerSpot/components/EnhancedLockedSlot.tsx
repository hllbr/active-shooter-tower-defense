import React, { useState, useCallback } from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { formatProfessional } from '../../../utils/formatters';
import { playSound } from '../../../utils/sound/soundEffects';
import { toast } from 'react-toastify';

interface EnhancedLockedSlotProps {
  slot: { x: number; y: number };
  slotIdx: number;
  canUnlock: boolean;
  isUnlocking: boolean;
  unlockCost: number;
  onUnlock: (slotIdx: number) => void;
}

interface LockedZoneTooltipProps {
  unlockCost: number;
  canUnlock: boolean;
  position: { x: number; y: number } | null;
  isVisible: boolean;
}

const LockedZoneTooltip: React.FC<LockedZoneTooltipProps> = ({
  unlockCost,
  canUnlock,
  position,
  isVisible
}) => {
  if (!isVisible || !position) return null;

  return (
    <div
      className="locked-zone-tooltip"
      style={{
        position: 'fixed',
        left: position.x + 10,
        top: position.y - 10,
        zIndex: 1000,
        pointerEvents: 'none',
        animation: 'tooltipFadeIn 0.2s ease-out'
      }}
    >
      <div className="tooltip-content">
        <div className="tooltip-header">
          <span className="tooltip-icon">🔒</span>
          <span className="tooltip-title">Locked Zone</span>
        </div>
        <div className="tooltip-description">
          {canUnlock 
            ? `Click to unlock for ${formatProfessional(unlockCost, 'currency')}`
            : `Requires ${formatProfessional(unlockCost, 'currency')} to unlock`
          }
        </div>
        <div className="tooltip-status">
          {canUnlock ? '✅ Available' : '❌ Insufficient Gold'}
        </div>
      </div>
    </div>
  );
};

export const EnhancedLockedSlot: React.FC<EnhancedLockedSlotProps> = ({
  slot,
  slotIdx,
  canUnlock,
  isUnlocking,
  unlockCost,
  onUnlock
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
    setShowTooltip(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
    setTooltipPosition(null);
  }, []);

  const handleClick = useCallback(() => {
    if (!canUnlock) {
      playSound('error');
      toast.warning(`Not enough gold! You need ${formatProfessional(unlockCost, 'currency')} to unlock this zone.`);
      return;
    }

    onUnlock(slotIdx);
  }, [canUnlock, unlockCost, onUnlock, slotIdx]);

  const getGlowColor = () => {
    if (isUnlocking) return '#FFD700'; // Gold during unlock
    if (canUnlock) return '#4ade80'; // Green for available
    return '#6b7280'; // Gray for unavailable
  };



  return (
    <>
      {/* Glowing border effect */}
      <defs>
        <filter id={`glow-${slotIdx}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Base locked slot with enhanced styling */}
      <rect
        x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
        width={GAME_CONSTANTS.TOWER_SIZE}
        height={GAME_CONSTANTS.TOWER_SIZE}
        fill="#2a2a2a"
        stroke={getGlowColor()}
        strokeWidth={canUnlock ? 3 : 2}
        rx={8}
        strokeDasharray={canUnlock ? "6 3" : "4 2"}
        style={{ 
          cursor: canUnlock ? 'pointer' : 'not-allowed',
          filter: canUnlock ? `url(#glow-${slotIdx})` : 'none',
          animation: canUnlock 
            ? 'lockedZonePulse 2s ease-in-out infinite' 
            : isUnlocking 
              ? 'unlockShake 0.3s ease-in-out'
              : 'none'
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      
      {/* Lock icon with enhanced styling */}
      <text
        x={slot.x}
        y={slot.y + 6}
        fill={isUnlocking ? "#FFD700" : canUnlock ? "#4ade80" : "#888888"}
        fontSize={28}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ 
          cursor: canUnlock ? 'pointer' : 'not-allowed',
          animation: isUnlocking 
            ? 'lockBreak 0.3s ease-out 0.3s' 
            : canUnlock 
              ? 'lockGlow 2s ease-in-out infinite'
              : 'none',
          filter: canUnlock ? 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.6))' : 'none'
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        🔒
      </text>

      {/* Cost indicator for available slots */}
      {canUnlock && (
        <text
          x={slot.x}
          y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2 + 20}
          fill="#f39c12"
          fontSize={12}
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            cursor: 'pointer',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            animation: 'costGlow 2s ease-in-out infinite'
          }}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {formatProfessional(unlockCost, 'currency')}
        </text>
      )}

      {/* Tooltip */}
      <LockedZoneTooltip
        unlockCost={unlockCost}
        canUnlock={canUnlock}
        position={tooltipPosition}
        isVisible={showTooltip}
      />
    </>
  );
}; 