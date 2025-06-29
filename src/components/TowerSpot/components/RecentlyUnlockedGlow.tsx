import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/Constants';

interface RecentlyUnlockedGlowProps {
  slot: { x: number; y: number };
  isRecentlyUnlocked: boolean;
  isUnlocking: boolean;
}

export const RecentlyUnlockedGlow: React.FC<RecentlyUnlockedGlowProps> = ({
  slot,
  isRecentlyUnlocked,
  isUnlocking
}) => {
  if (!isRecentlyUnlocked || isUnlocking) return null;

  return (
    <>
      {/* Recently unlocked glow effect */}
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
    </>
  );
}; 