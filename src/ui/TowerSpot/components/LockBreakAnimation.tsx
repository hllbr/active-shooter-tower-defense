import React from 'react';

interface LockBreakAnimationProps {
  slot: { x: number; y: number };
  isUnlocking: boolean;
}

export const LockBreakAnimation: React.FC<LockBreakAnimationProps> = ({
  slot,
  isUnlocking
}) => {
  if (!isUnlocking) return null;

  return (
    <>
      {/* 🎬 AŞAMA 1: Kilit Kırılması Animasyonu */}
      {/* Çatlak çizgileri */}
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
  );
}; 