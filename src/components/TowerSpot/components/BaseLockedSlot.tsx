import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/Constants';

interface BaseLockedSlotProps {
  slot: { x: number; y: number };
  slotIdx: number;
  canUnlock: boolean;
  isUnlocking: boolean;
  onUnlock: (slotIdx: number) => void;
}

export const BaseLockedSlot: React.FC<BaseLockedSlotProps> = ({
  slot,
  slotIdx,
  canUnlock,
  isUnlocking,
  onUnlock
}) => {
  return (
    <>
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
    </>
  );
}; 