import React from 'react';
import { useGameStore } from '../../../../models/store';

export const FrostOverlay: React.FC = () => {
  const { frostEffectActive } = useGameStore();

  if (!frostEffectActive) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, rgba(0, 150, 255, 0.3), rgba(0, 200, 255, 0.2))',
      pointerEvents: 'none',
      zIndex: 10,
      animation: 'frost-overlay 2s ease-in-out infinite alternate',
    }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '48px',
        color: '#00ccff',
        textShadow: '0 0 20px #00ccff',
        fontWeight: 'bold',
        animation: 'pulse 1s ease-in-out infinite',
      }}>
        ❄️ ZAMAN DONDU ❄️
      </div>
    </div>
  );
}; 