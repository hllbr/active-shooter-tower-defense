import React from 'react';
import { MineUpgrade } from './MineUpgrade';
import { WallUpgrade } from './WallUpgrade';

export const DefenseUpgrades: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '20px',
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '12px',
      border: '2px solid #8a2be2',
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '10px',
      }}>
        <h3 style={{ margin: 0, color: '#8a2be2', fontSize: '24px' }}>
          🛡️ Savunma Sistemleri
        </h3>
        <p style={{ margin: '8px 0 0', color: '#ccc', fontSize: '14px' }}>
          Stratejik savunma yükseltmeleri ile düşmanları durdurun
        </p>
      </div>

      {/* Mine Upgrade Section */}
      <MineUpgrade />

      {/* Wall Upgrade Section */}
      <WallUpgrade />
    </div>
  );
}; 