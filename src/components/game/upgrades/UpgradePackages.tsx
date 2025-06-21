import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';

export const UpgradePackages: React.FC = () => {
  const gold = useGameStore((s) => s.gold);
  const bulletLevel = useGameStore((s) => s.bulletLevel);
  const discountMultiplier = useGameStore((s) => s.discountMultiplier);
  const purchaseShield = useGameStore((s) => s.purchaseShield);

  return (
    <div style={{ width: '100%' }}>
      <span style={{ fontWeight: 'bold', fontSize: 18, color: GAME_CONSTANTS.GOLD_COLOR, marginBottom: 12, display: 'block' }}>
        🎁 Avantajlı Paketler
      </span>
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
    </div>
  );
}; 