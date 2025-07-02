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
  showUpgradeAnimation,
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
      transform: showUpgradeAnimation ? 'scale(1.05)' : 'scale(1)',
      transition: 'transform 0.3s ease',
    }}>
      <div style={{ fontSize: '14px', color: '#ccc', marginBottom: '4px' }}>
        Mevcut Kalkan Gücü
      </div>
      <div style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#6666ff',
        textShadow: showUpgradeAnimation ? '0 0 10px #6666ff' : 'none',
        transition: 'text-shadow 0.3s ease',
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
      {showUpgradeAnimation && (
        <div style={{
          color: '#4ade80',
          fontSize: '16px',
          fontWeight: 'bold',
          marginTop: '8px',
          animation: 'fadeUp 2s ease-out',
        }}>
          🛡️ Kalkan Güçlendirildi!
        </div>
      )}
      
      <style>
        {`
          @keyframes fadeUp {
            0% {
              opacity: 1;
              transform: translateY(0);
            }
            100% {
              opacity: 0;
              transform: translateY(-20px);
            }
          }
        `}
      </style>
    </div>
  );
}; 