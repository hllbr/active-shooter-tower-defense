import React from 'react';
import { useGameStore } from '../../../../models/store';
import { GAME_CONSTANTS } from '../../../../utils/constants';

export const PreparationScreen: React.FC = () => {
  const { 
    isPreparing, 
    prepRemaining, 
    isPaused, 
    speedUpPreparation 
  } = useGameStore();

  if (!isPreparing) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 2,
      textAlign: 'center',
      color: '#fff',
    }}>
      <div style={{ marginBottom: 4 }}>
                  Sonraki dalga {Math.ceil(prepRemaining / 1000)}s{isPaused ? ' (duraklatıldı)' : ''}
      </div>
      <div style={{ width: 200, height: 8, background: '#333', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          width: `${(prepRemaining / GAME_CONSTANTS.PREP_TIME) * 100}%`,
          height: '100%',
          background: prepRemaining < GAME_CONSTANTS.PREP_WARNING_THRESHOLD ? '#ff5555' : '#00cfff',
          transition: 'width 0.25s linear',
        }} />
      </div>
      <button 
        onClick={() => speedUpPreparation(GAME_CONSTANTS.PREP_TIME)} 
        aria-label="Dalga başlat"
        style={{ 
          marginTop: 8, 
          padding: '4px 12px', 
          cursor: 'pointer',
          backgroundColor: '#00cfff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
                  Dalgayı Başlat
      </button>
    </div>
  );
}; 