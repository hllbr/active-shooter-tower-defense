import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';

export const CurrentPowers: React.FC = () => {
  const bulletLevel = useGameStore((s) => s.bulletLevel);
  const globalWallStrength = useGameStore((s) => s.globalWallStrength);
  
  const [prevBulletLevel, setPrevBulletLevel] = useState(bulletLevel);
  const [prevWallStrength, setPrevWallStrength] = useState(globalWallStrength);
  const [showBulletAnimation, setShowBulletAnimation] = useState(false);
  const [showShieldAnimation, setShowShieldAnimation] = useState(false);

  // Calculate current fire power
  const getFirePower = () => {
    const baseDamage = GAME_CONSTANTS.TOWER_DAMAGE;
    const bulletType = GAME_CONSTANTS.BULLET_TYPES[bulletLevel - 1];
    return Math.round(baseDamage * bulletType.damageMultiplier);
  };

  // Calculate current shield strength
  const getShieldStrength = () => {
    return globalWallStrength * 10; // Each wall point = 10 shield strength
  };

  // Detect changes and trigger animations
  useEffect(() => {
    if (bulletLevel > prevBulletLevel) {
      setShowBulletAnimation(true);
      setTimeout(() => setShowBulletAnimation(false), 2000);
    }
    setPrevBulletLevel(bulletLevel);
  }, [bulletLevel, prevBulletLevel]);

  useEffect(() => {
    if (globalWallStrength > prevWallStrength) {
      setShowShieldAnimation(true);
      setTimeout(() => setShowShieldAnimation(false), 2000);
    }
    setPrevWallStrength(globalWallStrength);
  }, [globalWallStrength, prevWallStrength]);

  const firePower = getFirePower();
  const shieldStrength = getShieldStrength();

  return (
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '20px',
        borderRadius: '12px',
        border: '2px solid #4ade80',
        width: '100%',
        marginBottom: '16px',
      }}
    >
      <h3 style={{ 
        margin: '0 0 16px 0', 
        color: GAME_CONSTANTS.GOLD_COLOR,
        fontSize: '20px',
        textAlign: 'center'
      }}>
        🔥 Mevcut Güçleriniz
      </h3>
      
      <div style={{ display: 'flex', justifyContent: 'space-around', gap: '20px' }}>
        {/* Fire Power */}
        <div
          style={{
            background: 'rgba(255, 100, 100, 0.2)',
            padding: '16px',
            borderRadius: '8px',
            border: '2px solid #ff6666',
            flex: 1,
            textAlign: 'center',
            position: 'relative',
            transform: showBulletAnimation ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.3s ease',
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
          <div style={{ fontSize: '14px', color: '#ccc', marginBottom: '4px' }}>
            Ateş Gücü
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#ff6666',
              textShadow: showBulletAnimation ? '0 0 10px #ff6666' : 'none',
              transition: 'text-shadow 0.3s ease',
            }}
          >
            {firePower}
          </div>
          <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
            Hasar Puanı
          </div>
          {showBulletAnimation && (
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#4ade80',
                fontSize: '16px',
                fontWeight: 'bold',
                animation: 'fadeUp 2s ease-out',
              }}
            >
              +{firePower - (GAME_CONSTANTS.TOWER_DAMAGE * GAME_CONSTANTS.BULLET_TYPES[prevBulletLevel - 1]?.damageMultiplier || 1)}!
            </div>
          )}
        </div>

        {/* Shield Strength */}
        <div
          style={{
            background: 'rgba(100, 100, 255, 0.2)',
            padding: '16px',
            borderRadius: '8px',
            border: '2px solid #6666ff',
            flex: 1,
            textAlign: 'center',
            position: 'relative',
            transform: showShieldAnimation ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.3s ease',
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🛡️</div>
          <div style={{ fontSize: '14px', color: '#ccc', marginBottom: '4px' }}>
            Kalkan Gücü
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#6666ff',
              textShadow: showShieldAnimation ? '0 0 10px #6666ff' : 'none',
              transition: 'text-shadow 0.3s ease',
            }}
          >
            {shieldStrength}
          </div>
          <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
            {globalWallStrength} Temas Dayanımı
          </div>
          {showShieldAnimation && (
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#4ade80',
                fontSize: '16px',
                fontWeight: 'bold',
                animation: 'fadeUp 2s ease-out',
              }}
            >
              +{globalWallStrength - prevWallStrength}!
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes fadeUp {
            0% {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
            100% {
              opacity: 0;
              transform: translateX(-50%) translateY(-30px);
            }
          }
        `}
      </style>
    </div>
  );
}; 