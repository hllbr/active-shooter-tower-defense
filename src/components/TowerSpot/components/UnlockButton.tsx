import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/Constants';
import { formatProfessional } from '../../../utils/numberFormatting';

interface UnlockButtonProps {
  slot: { x: number; y: number };
  slotIdx: number;
  unlockCost: number;
  canUnlock: boolean;
  onUnlock: (slotIdx: number) => void;
}

export const UnlockButton: React.FC<UnlockButtonProps> = ({
  slot,
  slotIdx,
  unlockCost,
  canUnlock,
  onUnlock
}) => {
  return (
    <>
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
    </>
  );
}; 