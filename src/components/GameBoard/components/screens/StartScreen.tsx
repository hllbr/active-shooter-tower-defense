import React from 'react';
import { useGameStore } from '../../../../models/store';
import { GAME_CONSTANTS } from '../../../../utils/Constants';

export const StartScreen: React.FC = () => {
  const { isStarted, setStarted, startPreparation } = useGameStore();

  if (isStarted) return null;

  const handleStartGame = () => {
    setStarted(true);
    startPreparation();
  };

  return (
    <div
      onClick={handleStartGame}
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
      <span style={{ 
        color: '#fff', 
        fontSize: 40, 
        fontWeight: 'bold', 
        background: 'rgba(0,0,0,0.5)', 
        padding: '24px 48px', 
        borderRadius: 16 
      }}>
        Tap to Start
      </span>
    </div>
  );
}; 