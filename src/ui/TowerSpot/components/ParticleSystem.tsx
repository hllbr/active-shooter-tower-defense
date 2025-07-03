import React from 'react';

interface ParticleSystemProps {
  slot: { x: number; y: number };
  isUnlocking: boolean;
  showDust?: boolean;
  showUpgrade?: boolean;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  slot,
  isUnlocking,
  showDust = false,
  showUpgrade = false
}) => {
  if (!isUnlocking && !showDust && !showUpgrade) return null;

  // Sadece toz bulutu efekti
  return (
    <>
      {showDust && (
        <>
          <ellipse
            cx={slot.x}
            cy={slot.y + 24}
            rx={18}
            ry={7}
            fill="#E5C07B"
            opacity={0.38}
            style={{ animation: 'dust-puff 0.5s ease' }}
          />
          <ellipse
            cx={slot.x - 10}
            cy={slot.y + 28}
            rx={8}
            ry={3}
            fill="#E5C07B"
            opacity={0.22}
            style={{ animation: 'dust-puff 0.5s ease 0.08s' }}
          />
          <ellipse
            cx={slot.x + 12}
            cy={slot.y + 27}
            rx={7}
            ry={2.5}
            fill="#E5C07B"
            opacity={0.18}
            style={{ animation: 'dust-puff 0.5s ease 0.12s' }}
          />
        </>
      )}
      {/* Upgrade efekti: enerji dalgası ve parıltı */}
      {showUpgrade && (
        <>
          {/* Ana enerji dalgası (SMIL ile büyüyüp silikleşiyor) */}
          <circle
            cx={slot.x}
            cy={slot.y}
            r={38}
            fill="none"
            stroke="#fff"
            strokeWidth={7}
            opacity={0.85}
          >
            <animateTransform
              attributeName="transform"
              type="scale"
              from="1"
              to="1.8"
              begin="0s"
              dur="0.9s"
              fill="freeze"
            />
            <animate
              attributeName="opacity"
              from="0.85"
              to="0"
              begin="0s"
              dur="0.9s"
              fill="freeze"
            />
          </circle>
          {/* Hafif mavi dış dalga */}
          <circle
            cx={slot.x}
            cy={slot.y}
            r={44}
            fill="none"
            stroke="#4fd1ff"
            strokeWidth={4}
            opacity={0.35}
          >
            <animateTransform
              attributeName="transform"
              type="scale"
              from="1"
              to="1.8"
              begin="0.08s"
              dur="0.9s"
              fill="freeze"
            />
            <animate
              attributeName="opacity"
              from="0.35"
              to="0"
              begin="0.08s"
              dur="0.9s"
              fill="freeze"
            />
          </circle>
          {/* Parıltı */}
          <circle
            cx={slot.x}
            cy={slot.y}
            r={28}
            fill="#fff"
            opacity={0.22}
          >
            <animateTransform
              attributeName="transform"
              type="scale"
              from="1"
              to="1.7"
              begin="0s"
              dur="0.9s"
              fill="freeze"
            />
            <animate
              attributeName="opacity"
              from="0.22"
              to="0"
              begin="0s"
              dur="0.9s"
              fill="freeze"
            />
          </circle>
        </>
      )}
    </>
  );
}; 