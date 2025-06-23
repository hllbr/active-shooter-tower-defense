import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';

export const UpgradePackages: React.FC = () => {
  const { 
    gold, 
    setGold, 
    currentWave, 
    packagesPurchased,
    discountMultiplier, 
    diceResult,
    addEnergy,
    addAction
  } = useGameStore();

  const createPackage = (
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
    const currentPurchases = packagesPurchased;
    const isMaxed = currentPurchases >= purchaseLimit;
    const isWaveValid = currentWave >= waveRequirement.min && 
                      (!waveRequirement.max || currentWave <= waveRequirement.max);
    
    // Zar indirim sistemi
    let finalCost = cost;
    if (diceResult && diceResult === 6) {
      finalCost = Math.floor(cost * 0.5); // %50 indirim
    } else if (diceResult && diceResult === 5) {
      finalCost = Math.floor(cost * 0.7); // %30 indirim
    } else if (diceResult && diceResult === 4) {
      finalCost = Math.floor(cost * 0.85); // %15 indirim
    }
    
    // Evrensel indirim çarpanı uygula
    if (discountMultiplier !== 1) {
      finalCost = Math.floor(finalCost / discountMultiplier);
    }
    
    const canAfford = gold >= finalCost && !isMaxed && isWaveValid;

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
        onClick={canAfford ? onPurchase : undefined}
      >
        {/* Elite Badge */}
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

        {/* Wave Requirement Badge */}
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

                 {/* Discount Badge */}
         {((diceResult && diceResult >= 4) || discountMultiplier > 1) && canAfford && (
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

        {/* Header */}
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
              color: '#ccc',
              opacity: 0.9
            }}>
              {isMaxed ? 'Satın Alındı' : `${currentPurchases}/${purchaseLimit} Kullanıldı`}
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ 
          fontSize: 13, 
          color: '#ddd', 
          lineHeight: 1.4,
          flex: 1
        }}>
          {description}
        </div>

        {/* Benefits */}
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

        {/* Cost & Button */}
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
                {cost} 💰
              </div>
            )}
            <div style={{ 
              fontSize: 16, 
              fontWeight: 'bold',
              color: isMaxed ? '#666' : canAfford ? GAME_CONSTANTS.GOLD_COLOR : !isWaveValid ? '#666' : '#ff6b6b'
            }}>
              {isMaxed ? 'SATIN ALINDI' : `${finalCost} 💰`}
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
              {!isWaveValid ? '🔒 Kilitli' : canAfford ? '✅ Satın Al' : '❌ Yetersiz'}
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
      {/* Starter Packages (Wave 1-15) */}
      {createPackage(
        'Başlangıç Savaşçısı',
        'Oyuna güçlü başlamak için temel kombo paketi. Hızla güçlen ve ilk wave\'leri kolayca geç.',
        120,
        { min: 1, max: 15 },
        '🏃‍♂️',
        '#22c55e',
        () => {
          setGold(gold - 120);
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
        'Ekonomik Güç Paketi',
        'Ekonomini hızla büyütmek için ideal paket. Altın üretimini artır ve gelişim hızını maksimuma çıkar.',
        200,
        { min: 5, max: 25 },
        '💰',
        '#eab308',
        () => {
          setGold(gold - 200 + 100); // Net 100 harcama, 100 bonus
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

      {/* Mid-Game Packages (Wave 15-50) */}
      {createPackage(
        'Savaş Ustası Kombosu',
        'Orta seviye savaşlar için optimize edilmiş güçlü yükseltme paketi. Hem saldırı hem savunma.',
        350,
        { min: 15, max: 50 },
        '⚔️',
        '#ef4444',
        () => {
          setGold(gold - 350);
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
        'Tower Master Paketi',
        'Daha fazla kule yerleştir ve güçlendir. Tower limit artışı ve bonus enerji ile.',
        500,
        { min: 20, max: 60 },
        '🏗️',
        '#8b5cf6',
        () => {
          setGold(gold - 500);
          addEnergy(40);
          // Note: maxTowers artırma fonksiyonu store'a eklenmeli
        },
        [
          '+1 Tower Slot (Kalıcı)',
          '+40 Bonus Enerji',
          'İnşaat hızı artışı'
        ],
        false,
        3
      )}

      {/* Advanced Packages (Wave 40-80) */}
      {createPackage(
        'Elite Komutan Paketi',
        'İleri seviye savaşçılar için özel tasarlanmış elite bonus paketi. Büyük güç artışları.',
        750,
        { min: 40, max: 80 },
        '🎖️',
        '#dc2626',
        () => {
          setGold(gold - 750);
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
        'Teknoloji Devrimi',
        'En son teknoloji ile güçlenmiş sistem. Tüm yükseltmelerde büyük sıçrama.',
        1000,
        { min: 50, max: 85 },
        '🚀',
        '#06b6d4',
        () => {
          setGold(gold - 1000);
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

      {/* Legendary Packages (Wave 70+) */}
      {createPackage(
        'Legendary Master Paketi',
        'Son seviye savaşçılar için efsanevi güç paketi. Maksimum bonuslar ve özel yetenekler.',
        1500,
        { min: 70 },
        '👑',
        '#ffd700',
        () => {
          setGold(gold - 1500);
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
        'Godlike Warrior Ultimate',
        'Tanrısal güç seviyesi. Sadece en elite savaşçılar için. Oyunun en güçlü paketi.',
        2500,
        { min: 90 },
        '⚡',
        '#9333ea',
        () => {
          setGold(gold - 2500);
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

      {/* Special Limited Packages */}
      {createPackage(
        'Hızlı Büyüme Paketi',
        'Erken wave\'lerde hızla güçlenmek isteyenler için özel paket. Sınırlı süre!',
        80,
        { min: 1, max: 10 },
        '⚡',
        '#f97316',
        () => {
          setGold(gold - 80);
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