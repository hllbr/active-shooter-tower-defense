import React from 'react';
import type { SlotUnlockProps } from '../types';
import {
  EnhancedLockedSlot,
  LockBreakAnimation,
  ParticleSystem,
  SlotRevealCelebration,
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
      {/* Enhanced locked slot with glowing borders and tooltips */}
      <EnhancedLockedSlot
        slot={slot}
        slotIdx={slotIdx}
        canUnlock={canUnlock}
        isUnlocking={isUnlocking}
        unlockCost={unlockCost}
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
    </g>
  );
}; 