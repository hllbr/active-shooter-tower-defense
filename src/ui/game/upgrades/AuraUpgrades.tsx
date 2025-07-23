import React from 'react';
import { useGameStore } from '../../../models/store';
import { UpgradeCard } from './UpgradeCard';

// Placeholder aura upgrade data (should be replaced with real store logic)
const AURA_UPGRADES = [
  {
    name: 'İyileştirme Alanı',
    description: 'Yakındaki kuleleri ve birimleri iyileştirir. Alan yarıçapı ve iyileştirme gücü yükseltilebilir.',
    currentLevel: 1,
    baseCost: 200,
    maxLevel: 5,
    onUpgrade: () => {},
    icon: '⚕️',
    color: '#38a169',
    additionalInfo: 'Etki Alanı: 120px, Güç: +10 HP/sn',
  },
  {
    name: 'Kalkan Alanı',
    description: 'Yakındaki kulelere kalkan sağlar. Alan yarıçapı ve kalkan gücü yükseltilebilir.',
    currentLevel: 1,
    baseCost: 250,
    maxLevel: 5,
    onUpgrade: () => {},
    icon: '🛡️',
    color: '#38b2ac',
    additionalInfo: 'Etki Alanı: 140px, Kalkan: +15 HP/sn',
  },
  {
    name: 'Ateş Alanı',
    description: 'Yakındaki düşmanlara ateş hasarı verir. Alan yarıçapı ve hasar gücü yükseltilebilir.',
    currentLevel: 1,
    baseCost: 220,
    maxLevel: 5,
    onUpgrade: () => {},
    icon: '🔥',
    color: '#f56565',
    additionalInfo: 'Etki Alanı: 100px, Hasar: +8 HP/sn',
  },
];

export const AuraUpgrades: React.FC = () => {
  const gold = useGameStore(s => s.gold);
  const diceResult = useGameStore(s => s.diceResult);
  const discountMultiplier = useGameStore(s => s.discountMultiplier);

  return (
    <div style={{
      margin: '24px 0',
      padding: '18px',
      background: 'rgba(56, 189, 248, 0.08)',
      border: '2px solid #38b2ac',
      borderRadius: '14px',
      boxShadow: '0 2px 12px #38b2ac22',
    }}>
      <h3 style={{ color: '#38b2ac', fontSize: 20, margin: '0 0 12px 0', textAlign: 'center' }}>
        Alan Etkisi (Aura) Yükseltmeleri
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
        {AURA_UPGRADES.map((upgrade, idx) => (
          <UpgradeCard
            key={idx}
            upgrade={upgrade}
            gold={gold}
            diceResult={diceResult}
            discountMultiplier={discountMultiplier}
          />
        ))}
      </div>
    </div>
  );
}; 