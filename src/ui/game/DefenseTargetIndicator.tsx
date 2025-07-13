import React from 'react';
import { useGameStore } from '../../models/store';


interface DefenseTargetIndicatorProps {
  isVisible: boolean;
}

export const DefenseTargetIndicator: React.FC<DefenseTargetIndicatorProps> = ({ isVisible }) => {
  const { defenseTarget } = useGameStore();
  
  if (!isVisible || !defenseTarget || !defenseTarget.isActive) {
    return null;
  }

  const healthPercentage = (defenseTarget.health / defenseTarget.maxHealth) * 100;
  const shieldPercentage = (defenseTarget.shieldStrength / defenseTarget.maxShieldStrength) * 100;

  return (
    <div
      style={{
        position: 'absolute',
        left: defenseTarget.position.x - defenseTarget.size / 2,
        top: defenseTarget.position.y - defenseTarget.size / 2,
        width: defenseTarget.size,
        height: defenseTarget.size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${defenseTarget.color} 0%, rgba(0, 255, 255, 0.3) 70%)`,
        border: `3px solid ${defenseTarget.color}`,
        boxShadow: `0 0 ${20 * defenseTarget.glowIntensity}px ${defenseTarget.color}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        pointerEvents: 'none',
        animation: defenseTarget.showDamageIndicator ? 'pulse 0.5s ease-in-out' : 'none',
      }}
    >
      {/* Shield indicator */}
      {defenseTarget.shieldStrength > 0 && (
        <div
          style={{
            position: 'absolute',
            top: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 40,
            height: 8,
            backgroundColor: 'rgba(0, 255, 255, 0.3)',
            borderRadius: 4,
            border: '1px solid #00ffff',
          }}
        >
          <div
            style={{
              width: `${shieldPercentage}%`,
              height: '100%',
              backgroundColor: '#00ffff',
              borderRadius: 3,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}

      {/* Health indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: -10,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 40,
          height: 8,
          backgroundColor: 'rgba(255, 0, 0, 0.3)',
          borderRadius: 4,
          border: '1px solid #ff0000',
        }}
      >
        <div
          style={{
            width: `${healthPercentage}%`,
            height: '100%',
            backgroundColor: healthPercentage > 50 ? '#00ff00' : healthPercentage > 25 ? '#ffff00' : '#ff0000',
            borderRadius: 3,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Core icon */}
      <div
        style={{
          fontSize: '16px',
          color: '#ffffff',
          textShadow: '0 0 5px #00ffff',
          fontWeight: 'bold',
        }}
      >
        ⚡
      </div>

      {/* Pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default DefenseTargetIndicator; 