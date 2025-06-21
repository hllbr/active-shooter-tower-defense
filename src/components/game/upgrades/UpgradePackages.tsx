import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';

export const UpgradePackages: React.FC = () => {
  const gold = useGameStore((s) => s.gold);
  const bulletLevel = useGameStore((s) => s.bulletLevel);
  const globalWallStrength = useGameStore((s) => s.globalWallStrength);
  const discountMultiplier = useGameStore((s) => s.discountMultiplier);
  const purchaseShield = useGameStore((s) => s.purchaseShield);
  
  const [prevBulletLevel, setPrevBulletLevel] = useState(bulletLevel);
  const [prevWallStrength, setPrevWallStrength] = useState(globalWallStrength);
  const [showPackageAnimation, setShowPackageAnimation] = useState(false);

  // Calculate current stats
  const getCurrentFirePower = () => {
    const baseDamage = GAME_CONSTANTS.TOWER_DAMAGE;
    const bulletType = GAME_CONSTANTS.BULLET_TYPES[bulletLevel - 1];
    return Math.round(baseDamage * bulletType.damageMultiplier);
  };

  const getCurrentShieldStrength = () => {
    return globalWallStrength * 10;
  };

  // Detect changes and trigger animation
  useEffect(() => {
    if (bulletLevel > prevBulletLevel || globalWallStrength > prevWallStrength) {
      setShowPackageAnimation(true);
      setTimeout(() => setShowPackageAnimation(false), 2000);
    }
    setPrevBulletLevel(bulletLevel);
    setPrevWallStrength(globalWallStrength);
  }, [bulletLevel, globalWallStrength, prevBulletLevel, prevWallStrength]);

  const currentFirePower = getCurrentFirePower();
  const currentShieldStrength = getCurrentShieldStrength();

  return (
    <div style={{ width: '100%' }}>
      <span style={{ fontWeight: 'bold', fontSize: 18, color: GAME_CONSTANTS.GOLD_COLOR, marginBottom: 12, display: 'block' }}>
        🎁 Avantajlı Paketler
      </span>
      
      {/* Current Stats Display */}
      <div style={{
        background: 'rgba(255, 215, 0, 0.1)',
        padding: '12px',
        borderRadius: '8px',
        border: '2px solid #ffd700',
        marginBottom: '16px',
        textAlign: 'center',
        transform: showPackageAnimation ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.3s ease',
      }}>
        <div style={{ fontSize: '14px', color: '#ccc', marginBottom: '4px' }}>
          Mevcut Güçleriniz
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', gap: '20px' }}>
          <div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#ff6666',
              textShadow: showPackageAnimation ? '0 0 10px #ff6666' : 'none',
              transition: 'text-shadow 0.3s ease',
            }}>
              {currentFirePower} Hasar
            </div>
            <div style={{ fontSize: '10px', color: '#aaa' }}>Ateş Gücü</div>
          </div>
          <div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#6666ff',
              textShadow: showPackageAnimation ? '0 0 10px #6666ff' : 'none',
              transition: 'text-shadow 0.3s ease',
            }}>
              {currentShieldStrength} Güç
            </div>
            <div style={{ fontSize: '10px', color: '#aaa' }}>Kalkan Gücü</div>
          </div>
        </div>
        {showPackageAnimation && (
          <div style={{
            color: '#4ade80',
            fontSize: '16px',
            fontWeight: 'bold',
            marginTop: '8px',
            animation: 'fadeUp 2s ease-out',
          }}>
            🎁 Paket Aktifleştirildi!
          </div>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 12
      }}>
        {GAME_CONSTANTS.UPGRADE_PACKAGES.map((pkg, i) => {
          const canUpgrade = bulletLevel < pkg.bulletLevel;

          // Zar sistemine göre dinamik fiyat hesaplama
          let finalCost: number = pkg.discountedCost;
          let discountPercent = Math.round(((pkg.originalCost - pkg.discountedCost) / pkg.originalCost) * 100);

          if (discountMultiplier === 0) {
            // İndirimler iptal edildi
            finalCost = pkg.originalCost;
            discountPercent = 0;
          } else if (discountMultiplier > 1) {
            // Ek indirim
            const baseDiscount = pkg.originalCost - pkg.discountedCost;
            const extraDiscount = baseDiscount * (discountMultiplier - 1);
            finalCost = Math.max(0, pkg.discountedCost - extraDiscount);
            discountPercent = Math.round(((pkg.originalCost - finalCost) / pkg.originalCost) * 100);
          }

          const isDisabledWithDice = gold < finalCost || bulletLevel >= pkg.bulletLevel;
          const canAffordWithDice = gold >= finalCost;

          // Calculate what stats will become after purchase
          const newBulletLevel = Math.min(pkg.bulletLevel, GAME_CONSTANTS.BULLET_TYPES.length);
          const newBulletType = GAME_CONSTANTS.BULLET_TYPES[newBulletLevel - 1];
          const newFirePower = Math.round(GAME_CONSTANTS.TOWER_DAMAGE * newBulletType.damageMultiplier);
          const newShieldStrength = (globalWallStrength + GAME_CONSTANTS.WALL_SHIELDS[pkg.shieldIndex].strength) * 10;

          return (
            <div
              key={i}
              style={{
                padding: 16,
                borderRadius: 12,
                border: `2px solid ${isDisabledWithDice ? '#444' : pkg.color}`,
                background: isDisabledWithDice ? '#1a1a1a' : `rgba(${parseInt(pkg.color.slice(1, 3), 16)}, ${parseInt(pkg.color.slice(3, 5), 16)}, ${parseInt(pkg.color.slice(5, 7), 16)}, 0.1)`,
                opacity: isDisabledWithDice ? 0.6 : 1,
                cursor: isDisabledWithDice ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isDisabledWithDice ? 'none' : `0 4px 16px rgba(${parseInt(pkg.color.slice(1, 3), 16)}, ${parseInt(pkg.color.slice(3, 5), 16)}, ${parseInt(pkg.color.slice(5, 7), 16)}, 0.3)`,
                position: 'relative',
              }}
              onClick={() => {
                if (!isDisabledWithDice) {
                  // Önce harcamayı yap
                  useGameStore.getState().spendGold(finalCost);
                  // Sonra yükseltmeleri uygula
                  for (let j = bulletLevel; j < pkg.bulletLevel; j++) {
                    useGameStore.getState().upgradeBullet(true);
                  }
                  purchaseShield(pkg.shieldIndex, true); // Kalkanı da ücretsiz al
                }
              }}
            >
              {/* İndirim Etiketi */}
              <div style={{
                position: 'absolute',
                top: -8,
                right: -8,
                background: discountMultiplier === 0 ? '#ff4444' : discountMultiplier > 1 ? '#4ade80' : '#ffaa00',
                color: '#fff',
                fontSize: 12,
                fontWeight: 'bold',
                padding: '4px 8px',
                borderRadius: 8,
                border: '2px solid #fff',
              }}>
                -{discountPercent}%
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{
                  fontWeight: 'bold',
                  fontSize: 18,
                  color: isDisabledWithDice ? '#888' : pkg.color
                }}>
                  {pkg.name}
                </span>
                <span style={{
                  fontWeight: 'bold',
                  fontSize: 16,
                  color: canAffordWithDice ? GAME_CONSTANTS.GOLD_COLOR : '#ff4444'
                }}>
                  {Math.round(finalCost)} 💰
                </span>
              </div>

              <div style={{ fontSize: 14, color: '#aaa', textAlign: 'left', marginBottom: 8 }}>
                {pkg.description}
              </div>

              {/* Stats Preview */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.2)',
                padding: '8px',
                borderRadius: '6px',
                marginBottom: '8px',
                fontSize: '12px',
                color: '#ccc'
              }}>
                <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>Yeni Güçleriniz:</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>🔥 {newFirePower} Hasar</span>
                  <span>🛡️ {newShieldStrength} Güç</span>
                </div>
              </div>

              <div style={{
                fontSize: 12,
                color: isDisabledWithDice ? '#888' : '#666',
                textAlign: 'left',
                textDecoration: 'line-through'
              }}>
                Normal fiyat: {pkg.originalCost} 💰
              </div>

              {!canUpgrade && (
                <div style={{
                  fontSize: 12,
                  color: '#ffaa00',
                  textAlign: 'left',
                  marginTop: 4
                }}>
                  ⚠️ Bu ateş seviyesine zaten sahipsiniz
                </div>
              )}
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