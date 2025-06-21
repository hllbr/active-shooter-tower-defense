import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';

export const FireUpgrades: React.FC = () => {
  const gold = useGameStore((s) => s.gold);
  const bulletLevel = useGameStore((s) => s.bulletLevel);
  const upgradeBullet = useGameStore((s) => s.upgradeBullet);
  
  const [prevBulletLevel, setPrevBulletLevel] = useState(bulletLevel);
  const [showUpgradeAnimation, setShowUpgradeAnimation] = useState(false);

  // Calculate current fire power
  const getCurrentFirePower = () => {
    const baseDamage = GAME_CONSTANTS.TOWER_DAMAGE;
    const bulletType = GAME_CONSTANTS.BULLET_TYPES[bulletLevel - 1];
    return Math.round(baseDamage * bulletType.damageMultiplier);
  };

  // Calculate next fire power
  const getNextFirePower = () => {
    if (bulletLevel >= GAME_CONSTANTS.BULLET_TYPES.length) return getCurrentFirePower();
    const baseDamage = GAME_CONSTANTS.TOWER_DAMAGE;
    const nextBulletType = GAME_CONSTANTS.BULLET_TYPES[bulletLevel];
    return Math.round(baseDamage * nextBulletType.damageMultiplier);
  };

  // Detect upgrade and trigger animation
  useEffect(() => {
    if (bulletLevel > prevBulletLevel) {
      setShowUpgradeAnimation(true);
      setTimeout(() => setShowUpgradeAnimation(false), 2000);
    }
    setPrevBulletLevel(bulletLevel);
  }, [bulletLevel, prevBulletLevel]);

  const currentFirePower = getCurrentFirePower();
  const nextFirePower = getNextFirePower();

  return (
    <div style={{ width: '100%' }}>
      <span style={{ fontWeight: 'bold', fontSize: 18, color: GAME_CONSTANTS.GOLD_COLOR, marginBottom: 12, display: 'block' }}>
        🔥 Ateş Güçleri
      </span>
      
      {/* Current Stats Display */}
      <div style={{
        background: 'rgba(255, 100, 100, 0.1)',
        padding: '12px',
        borderRadius: '8px',
        border: '2px solid #ff6666',
        marginBottom: '16px',
        textAlign: 'center',
        transform: showUpgradeAnimation ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.3s ease',
      }}>
        <div style={{ fontSize: '14px', color: '#ccc', marginBottom: '4px' }}>
          Mevcut Ateş Gücü
        </div>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#ff6666',
          textShadow: showUpgradeAnimation ? '0 0 10px #ff6666' : 'none',
          transition: 'text-shadow 0.3s ease',
        }}>
          {currentFirePower} Hasar
        </div>
        {bulletLevel < GAME_CONSTANTS.BULLET_TYPES.length && (
          <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
            Sonraki Seviye: {nextFirePower} Hasar (+{nextFirePower - currentFirePower})
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
            ⬆️ Yükseltildi!
          </div>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 12
      }}>
        {GAME_CONSTANTS.BULLET_TYPES.map((bullet, i) => {
          const isAcquired = i < bulletLevel;
          const isPurchasable = i === bulletLevel;
          const isDisabledByGold = isPurchasable && gold < GAME_CONSTANTS.BULLET_UPGRADE_COST;
          const isLocked = i > bulletLevel;

          let borderColor = '#444';
          let bgColor = '#1a1a1a';
          let titleColor = '#888';
          let boxShadow = 'none';
          let cursor = 'default';

          if (isAcquired) {
            borderColor = '#4ade80';
            bgColor = 'rgba(74, 222, 128, 0.1)';
            titleColor = '#4ade80';
          } else if (isPurchasable) {
            borderColor = isDisabledByGold ? '#444' : bullet.color;
            bgColor = isDisabledByGold ? '#1a1a1a' : `rgba(${parseInt(bullet.color.slice(1, 3), 16)}, ${parseInt(bullet.color.slice(3, 5), 16)}, ${parseInt(bullet.color.slice(5, 7), 16)}, 0.1)`;
            titleColor = isDisabledByGold ? '#888' : bullet.color;
            boxShadow = isDisabledByGold ? 'none' : `0 4px 16px rgba(${parseInt(bullet.color.slice(1, 3), 16)}, ${parseInt(bullet.color.slice(3, 5), 16)}, ${parseInt(bullet.color.slice(5, 7), 16)}, 0.3)`;
            cursor = isDisabledByGold ? 'not-allowed' : 'pointer';
          }

          return (
            <div
              key={i}
              style={{
                padding: 12,
                borderRadius: 8,
                border: `2px solid ${borderColor}`,
                background: bgColor,
                opacity: isLocked ? 0.4 : 1,
                cursor,
                transition: 'all 0.2s ease',
                boxShadow,
                position: 'relative'
              }}
              onClick={() => {
                if (isPurchasable && !isDisabledByGold) {
                  upgradeBullet();
                }
              }}
            >
              {isAcquired && (
                <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 20, color: '#4ade80' }}>
                  ✔
                </div>
              )}
              {isLocked && (
                <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 20, color: '#888' }}>
                  🔒
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{
                  fontWeight: 'bold',
                  fontSize: 16,
                  color: titleColor
                }}>
                  {bullet.name}
                </span>
                {isPurchasable && (
                  <span style={{
                    fontWeight: 'bold',
                    fontSize: 14,
                    color: gold >= GAME_CONSTANTS.BULLET_UPGRADE_COST ? GAME_CONSTANTS.GOLD_COLOR : '#ff4444'
                  }}>
                    {GAME_CONSTANTS.BULLET_UPGRADE_COST} 💰
                  </span>
                )}
              </div>
              <div style={{
                fontSize: 12,
                color: '#aaa',
                textAlign: 'left'
              }}>
                {'freezeDuration' in bullet
                  ? `Düşmanları ${(bullet as { freezeDuration: number }).freezeDuration / 1000}sn yavaşlatır`
                  : `Hasar: x${bullet.damageMultiplier}, Hız: x${bullet.speedMultiplier}`
                }
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