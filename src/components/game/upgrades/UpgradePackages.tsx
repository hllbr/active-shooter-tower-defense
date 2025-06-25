import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';
import { formatCurrency, getAffordabilityColor, getAffordabilityStatus, getUnifiedButtonText, getUnifiedStatusDisplay, getUnifiedCostDisplay } from '../../../utils/numberFormatting';

export const UpgradePackages: React.FC = () => {
  const { 
    gold, 
    currentWave, 
    discountMultiplier, 
    diceResult,
    addEnergy,
    addAction,
    purchasePackage,
    getPackageInfo
  } = useGameStore();

  const createPackage = (
    packageId: string,
    name: string,
    description: string,
    cost: number,
    waveRequirement: { min: number; max?: number },
    icon: string,
    color: string,
    onPurchase: () => void,
    benefits: string[],
    isElite = false,
    purchaseLimit = 1
  ) => {
    const packageInfo = getPackageInfo(packageId, purchaseLimit);
    const isMaxed = packageInfo.isMaxed;
    const currentPurchases = packageInfo.purchaseCount;
    
    const isWaveValid = currentWave >= waveRequirement.min && 
                      (!waveRequirement.max || currentWave <= waveRequirement.max);
    
    let finalCost = cost;
    if (diceResult && diceResult === 6) {
      finalCost = Math.floor(cost * 0.5);
    } else if (diceResult && diceResult === 5) {
      finalCost = Math.floor(cost * 0.7);
    } else if (diceResult && diceResult === 4) {
      finalCost = Math.floor(cost * 0.85);
    }
    
    if (discountMultiplier !== 1) {
      finalCost = Math.floor(finalCost / discountMultiplier);
    }
    
    const canAfford = gold >= finalCost && !isMaxed && isWaveValid;
    
    const handlePurchase = () => {
      if (canAfford) {
        const success = purchasePackage(packageId, finalCost, purchaseLimit);
        if (success) {
          onPurchase();
        }
      }
    };

    return (
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))',
          border: `3px solid ${isMaxed ? '#666' : canAfford ? color : !isWaveValid ? '#444' : 'rgba(255,255,255,0.2)'}`,
          borderRadius: 16,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          minHeight: 200,
          position: 'relative',
          transition: 'all 0.3s ease',
          cursor: canAfford ? 'pointer' : 'not-allowed',
          opacity: !isWaveValid ? 0.5 : isMaxed ? 0.7 : 1,
          boxShadow: canAfford ? `0 8px 24px ${color}40` : 'none',
          transform: canAfford ? 'translateY(-2px)' : 'none',
        }}
        onClick={canAfford ? handlePurchase : undefined}
      >
        {isElite && (
          <div style={{
            position: 'absolute',
            top: -8,
            right: -8,
            background: 'linear-gradient(45deg, #ffd700, #ffed4a)',
            color: '#000',
            fontSize: 10,
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: 12,
            border: '2px solid #fff',
            boxShadow: '0 4px 12px rgba(255, 215, 0, 0.5)',
          }}>
            ⭐ ELİTE
          </div>
        )}

        <div style={{
          position: 'absolute',
          top: -8,
          left: -8,
          background: !isWaveValid ? '#666' : '#4ade80',
          color: 'white',
          fontSize: 11,
          fontWeight: 'bold',
          padding: '4px 8px',
          borderRadius: 12,
          border: '2px solid #fff',
        }}>
          Wave {waveRequirement.min}{waveRequirement.max ? `-${waveRequirement.max}` : '+'}
        </div>

        {(diceResult && diceResult >= 4) && (
          <div style={{
            position: 'absolute',
            top: 25,
            left: -8,
            background: '#ef4444',
            color: 'white',
            fontSize: 11,
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: 12,
            border: '2px solid #fff',
            animation: 'pulse 2s infinite'
          }}>
            🎯 İNDİRİM
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12,
          borderBottom: `2px solid ${color}30`,
          paddingBottom: 12,
          marginTop: 12
        }}>
          <div style={{ fontSize: 32 }}>{icon}</div>
          <div>
            <div style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: color,
              textShadow: `0 0 10px ${color}50`
            }}>
              {name}
            </div>
            <div style={{ 
              fontSize: 12, 
              color: isMaxed ? '#4ade80' : '#ccc',
              opacity: 0.9,
              fontWeight: isMaxed ? 'bold' : 'normal'
            }}>
              {getUnifiedStatusDisplay(currentPurchases, purchaseLimit, isMaxed)}
            </div>
          </div>
        </div>

        <div style={{ 
          fontSize: 13, 
          color: '#ddd', 
          lineHeight: 1.4,
          flex: 1
        }}>
          {description}
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 8,
          padding: 12,
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ fontSize: 12, fontWeight: 'bold', color: color, marginBottom: 8 }}>
            📋 Paket İçeriği:
          </div>
          {benefits.map((benefit, idx) => (
            <div key={idx} style={{ 
              fontSize: 11, 
              color: '#bbb', 
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span style={{ color: '#4ade80' }}>✓</span> {benefit}
            </div>
          ))}
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderTop: `2px solid ${color}30`,
          paddingTop: 12
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 4
          }}>
            {cost !== finalCost && (
              <div style={{ 
                fontSize: 12, 
                color: '#999', 
                textDecoration: 'line-through'
              }}>
                {formatCurrency(cost)} 💰
              </div>
            )}
            <div style={{ 
              fontSize: 16, 
              fontWeight: 'bold',
              color: isMaxed ? '#4ade80' : getAffordabilityColor(finalCost, gold)
            }}>
              {isMaxed ? '✅ TAMAMLANDI' : `${formatCurrency(finalCost)} 💰`}
            </div>
          </div>
          
          {!isMaxed && (
            <div style={{
              padding: '8px 16px',
              borderRadius: 10,
              background: canAfford 
                ? `linear-gradient(135deg, ${color}, ${color}cc)` 
                : !isWaveValid 
                  ? 'rgba(255,255,255,0.05)' 
                  : 'rgba(255,255,255,0.1)',
              color: canAfford ? '#fff' : !isWaveValid ? '#666' : '#666',
              fontSize: 14,
              fontWeight: 'bold',
              border: `2px solid ${canAfford ? color : '#666'}`,
              textShadow: canAfford ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
            }}>
              {getUnifiedButtonText(isMaxed, canAfford, !isWaveValid, 'package')}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      width: '100%', 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
      gap: 20
    }}>
      {createPackage(
        'starter_warrior',
        'Başlangıç Savaşçısı',
        'Oyuna güçlü başlamak için temel kombo paketi. Hızla güçlen ve ilk wave\'leri kolayca geç.',
        120,
        { min: 1, max: 15 },
        '🏃‍♂️',
        '#22c55e',
        () => {
          addEnergy(30);
          addAction(2);
        },
        [
          '+30 Bonus Enerji (Anında)',
          '+2 Bonus Aksiyon (Bu Wave)',
          'Erken oyun avantajı'
        ],
        false,
        3
      )}

      {createPackage(
        'economic_power',
        'Ekonomik Güç Paketi',
        'Ekonomini hızla büyütmek için ideal paket. Altın üretimini artır ve gelişim hızını maksimuma çıkar.',
        200,
        { min: 5, max: 25 },
        '💰',
        '#eab308',
        () => {
          addEnergy(25);
        },
        [
          '+100 Bonus Altın (Anında)',
          '+25 Bonus Enerji',
          'Ekonomik büyüme ivmesi'
        ],
        false,
        2
      )}

      {createPackage(
        'war_master',
        'Savaş Ustası Kombosu',
        'Orta seviye savaşlar için optimize edilmiş güçlü yükseltme paketi. Hem saldırı hem savunma.',
        350,
        { min: 15, max: 50 },
        '⚔️',
        '#ef4444',
        () => {
          addEnergy(50);
          addAction(3);
        },
        [
          '+50 Bonus Enerji',
          '+3 Bonus Aksiyon',
          'Orta-game güç artışı',
          'Dengeli savaş bonusu'
        ],
        false,
        2
      )}

      {createPackage(
        'tower_master',
        'Tower Master Paketi',
        'Daha fazla kule yerleştir ve güçlendir. Tower limit artışı ve bonus enerji ile.',
        500,
        { min: 20, max: 60 },
        '🏗️',
        '#8b5cf6',
        () => {
          addEnergy(40);
        },
        [
          '+1 Tower Slot (Kalıcı)',
          '+40 Bonus Enerji',
          'İnşaat hızı artışı'
        ],
        false,
        3
      )}

      {createPackage(
        'elite_commander',
        'Elite Komutan Paketi',
        'İleri seviye savaşçılar için özel tasarlanmış elite bonus paketi. Büyük güç artışları.',
        750,
        { min: 40, max: 80 },
        '🎖️',
        '#dc2626',
        () => {
          addEnergy(80);
          addAction(5);
        },
        [
          '+80 Bonus Enerji',
          '+5 Bonus Aksiyon',
          'Elite savaş bonusları',
          'Özel komutan yetkileri'
        ],
        true,
        2
      )}

      {createPackage(
        'tech_revolution',
        'Teknoloji Devrimi',
        'En son teknoloji ile güçlenmiş sistem. Tüm yükseltmelerde büyük sıçrama.',
        1000,
        { min: 50, max: 85 },
        '🚀',
        '#06b6d4',
        () => {
          addEnergy(100);
          addAction(6);
        },
        [
          '+100 Massive Enerji Artışı',
          '+6 Premium Aksiyon',
          'Teknoloji bonusları',
          'Gelişmiş sistem erişimi'
        ],
        true,
        1
      )}

      {createPackage(
        'legendary_master',
        'Legendary Master Paketi',
        'Son seviye savaşçılar için efsanevi güç paketi. Maksimum bonuslar ve özel yetenekler.',
        1500,
        { min: 70 },
        '👑',
        '#ffd700',
        () => {
          addEnergy(150);
          addAction(8);
        },
        [
          '+150 Legendary Enerji',
          '+8 Master Aksiyon',
          'Efsanevi savaş gücü',
          'Özel master yetenekleri',
          'Ultimate power boost'
        ],
        true,
        2
      )}

      {createPackage(
        'godlike_warrior',
        'Godlike Warrior Ultimate',
        'Tanrısal güç seviyesi. Sadece en elite savaşçılar için. Oyunun en güçlü paketi.',
        2500,
        { min: 90 },
        '⚡',
        '#9333ea',
        () => {
          addEnergy(250);
          addAction(12);
        },
        [
          '+250 Godlike Enerji',
          '+12 Divine Aksiyon',
          'Tanrısal güç seviyesi',
          'Ultimate war machine',
          'Legendary status unlock'
        ],
        true,
        1
      )}

      {createPackage(
        'quick_growth',
        'Hızlı Büyüme Paketi',
        'Erken wave\'lerde hızla güçlenmek isteyenler için özel paket. Sınırlı süre!',
        80,
        { min: 1, max: 10 },
        '⚡',
        '#f97316',
        () => {
          addEnergy(40);
          addAction(3);
        },
        [
          '+40 Hızlı Enerji',
          '+3 Hızlı Aksiyon',
          'Erken büyüme bonusu'
        ],
        false,
        1
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}
      </style>
    </div>
  );
}; 