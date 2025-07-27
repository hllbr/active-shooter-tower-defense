import React from 'react';
import { useGameStore } from '../../../../models/store';
import { GAME_CONSTANTS } from '../../../../utils/constants';

export const StartScreen = () => {
  const { isStarted, setStarted, startPreparation, isFirstTowerPlaced } = useGameStore();

  if (isStarted) return null;

  const handleStartGame = () => {
    setStarted(true);
    startPreparation();
  };

  return (
    <div
      onClick={handleStartGame}
      role="button"
      aria-label="Oyunu başlat"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleStartGame();
        }
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3,
        cursor: 'pointer',
        flexDirection: 'column',
      }}
    >
      <span style={{ 
        color: '#00cfff', 
        font: GAME_CONSTANTS.UI_FONT_BIG, 
        fontWeight: 'bold', 
        marginBottom: 32 
      }}>
        Shooter Tower Defense
      </span>
      {/* Info message for first tower placement */}
      {!isFirstTowerPlaced && (
        <span style={{
          color: '#ffd700',
          fontSize: 28,
          fontWeight: 'bold',
          background: 'rgba(0,0,0,0.4)',
          padding: '16px 32px',
          borderRadius: 12,
          marginBottom: 24,
        }}>
          Place your first tower to begin<br />
          <span style={{ fontSize: 20, color: '#fff' }}>
            İlk kuleni yerleştir, oyun başlasın
          </span>
        </span>
      )}
      
      <span style={{ 
        color: '#ffffff', 
        fontSize: 24, 
        fontWeight: 'bold',
        background: 'rgba(0,0,0,0.4)',
        padding: '12px 24px',
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
          background: 'rgba(0,0,0,0.6)',
          transform: 'scale(1.05)'
        }
      }}>
        Click to Start
      </span>
    </div>
  );
}; 