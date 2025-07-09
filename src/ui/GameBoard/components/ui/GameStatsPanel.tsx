import React from 'react';
import { useGameStore } from '../../../../models/store';

export const GameStatsPanel: React.FC = () => {
  const { gold, energy, currentWave, enemiesKilled, enemiesRequired, isStarted } = useGameStore();

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: 1000,
        minWidth: '200px'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div>💰 Altın: {gold}</div>
        <div>⚡ Enerji: {energy}</div>
        <div>🌊 Dalga: {currentWave}</div>
        <div>💀 Öldürülen: {enemiesKilled}/{enemiesRequired}</div>
        {isStarted && (
          <div style={{ marginTop: '5px', fontSize: '12px', color: '#ccc' }}>
            Oyun Aktif
          </div>
        )}
      </div>
    </div>
  );
}; 