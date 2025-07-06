import React from 'react';
import type { SlotUnlockProps } from '../types';
import {
  BaseLockedSlot,
  LockBreakAnimation,
  ParticleSystem,
  SlotRevealCelebration,
  UnlockButton,
  RecentlyUnlockedGlow
} from './index';

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
      {/* Base locked slot with lock icon */}
      <BaseLockedSlot
        slot={slot}
        slotIdx={slotIdx}
        canUnlock={canUnlock}
        isUnlocking={isUnlocking}
        onUnlock={onUnlock}
      />
      
      {/* Lock break animation */}
      <LockBreakAnimation
        slot={slot}
        isUnlocking={isUnlocking}
      />
      
      {/* Particle system effects */}
      <ParticleSystem
        slot={slot}
        isUnlocking={isUnlocking}
      />

      {/* Slot reveal and celebration effects */}
      <SlotRevealCelebration
        slot={slot}
        isRecentlyUnlocked={isRecentlyUnlocked}
      />

      {/* Recently unlocked glow effect */}
      <RecentlyUnlockedGlow
        slot={slot}
        isRecentlyUnlocked={isRecentlyUnlocked}
        isUnlocking={isUnlocking}
      />
      
      {/* Unlock button text */}
      <UnlockButton
        slotIdx={slotIdx}
        unlockCost={unlockCost}
        canUnlock={canUnlock}
        onClick={() => onUnlock(slotIdx)}
      />
    </g>
  );
}; 