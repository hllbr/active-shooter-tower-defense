import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';

export const ShieldUpgrades: React.FC = () => {
  const gold = useGameStore((s) => s.gold);
  const globalWallStrength = useGameStore((s) => s.globalWallStrength);
  const purchaseShield = useGameStore((s) => s.purchaseShield);
  
  const [prevWallStrength, setPrevWallStrength] = useState(globalWallStrength);
  const [showUpgradeAnimation, setShowUpgradeAnimation] = useState(false);

  // Calculate current shield strength
  const getCurrentShieldStrength = () => {
    return globalWallStrength * 10; // Each wall point = 10 shield strength
  };

  // Calculate next shield strength (if purchasing the cheapest shield)
  const getNextShieldStrength = () => {
    const cheapestShield = GAME_CONSTANTS.WALL_SHIELDS[0];
    return (globalWallStrength + cheapestShield.strength) * 10;
  };

  // Detect upgrade and trigger animation
  useEffect(() => {
    if (globalWallStrength > prevWallStrength) {
      setShowUpgradeAnimation(true);
      setTimeout(() => setShowUpgradeAnimation(false), 2000);
    }
    setPrevWallStrength(globalWallStrength);
  }, [globalWallStrength, prevWallStrength]);

  const currentShieldStrength = getCurrentShieldStrength();
  const nextShieldStrength = getNextShieldStrength();

  return (
    <div style={{ width: '100%' }}>
      <span style={{ fontWeight: 'bold', fontSize: 18, color: GAME_CONSTANTS.GOLD_COLOR, marginBottom: 12, display: 'block' }}>
        🛡️ Kalkanlar
      </span>
      
      {/* Current Stats Display */}
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
        {GAME_CONSTANTS.WALL_SHIELDS.length > 0 && (
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
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 12
      }}>
        {GAME_CONSTANTS.WALL_SHIELDS.map((shield, i) => {
          const isDisabled = gold < shield.cost;
          const shieldColor = isDisabled ? '#444' : '#aa00ff';
          const newShieldStrength = (globalWallStrength + shield.strength) * 10;
          
          return (
            <div
              key={i}
              style={{
                padding: 12,
                borderRadius: 8,
                border: `2px solid ${shieldColor}`,
                background: isDisabled ? '#1a1a1a' : 'rgba(170, 0, 255, 0.1)',
                opacity: isDisabled ? 0.6 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isDisabled ? 'none' : '0 2px 8px rgba(170, 0, 255, 0.2)',
              }}
              onClick={() => {
                if (!isDisabled) {
                  purchaseShield(i);
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{
                  fontWeight: 'bold',
                  fontSize: 16,
                  color: isDisabled ? '#888' : shieldColor
                }}>
                  {shield.name}
                </span>
                <span style={{
                  fontWeight: 'bold',
                  fontSize: 14,
                  color: isDisabled ? '#888' : GAME_CONSTANTS.GOLD_COLOR
                }}>
                  {shield.cost} 💰
                </span>
              </div>
              <div style={{
                fontSize: 12,
                color: isDisabled ? '#888' : '#aaa',
                textAlign: 'left',
                marginBottom: '4px'
              }}>
                +{shield.strength} Kalkan Gücü
              </div>
              <div style={{
                fontSize: 10,
                color: isDisabled ? '#666' : '#888',
                textAlign: 'left'
              }}>
                Yeni Toplam: {newShieldStrength} Güç
              </div>
            </div>
          );
        })}
      </div>

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