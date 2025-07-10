import React from 'react';

interface ShieldStatsDisplayProps {
  currentShieldStrength: number;
  nextShieldStrength: number;
  globalWallStrength: number;
  showUpgradeAnimation: boolean;
  hasAvailableShields: boolean;
}

export const ShieldStatsDisplay: React.FC<ShieldStatsDisplayProps> = ({
  currentShieldStrength,
  nextShieldStrength,
  globalWallStrength,
  showUpgradeAnimation: _showUpgradeAnimation,
  hasAvailableShields,
}) => {
  return (
    <div style={{
      background: 'rgba(100, 100, 255, 0.1)',
      padding: '12px',
      borderRadius: '8px',
      border: '2px solid #6666ff',
      marginBottom: '16px',
      textAlign: 'center',
      transform: 'scale(1)',
    }}>
      <div style={{ fontSize: '14px', color: '#ccc', marginBottom: '4px' }}>
        Mevcut Kalkan Gücü
      </div>
      <div style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#6666ff',
        textShadow: 'none',
      }}>
        {currentShieldStrength} Güç
      </div>
      <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
        {globalWallStrength} Temas Dayanımı
      </div>
      {hasAvailableShields && (
        <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
          Sonraki Kalkan: {nextShieldStrength} Güç (+{nextShieldStrength - currentShieldStrength})
        </div>
      )}

    </div>
  );
}; 