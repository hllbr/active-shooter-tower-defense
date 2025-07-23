import React from 'react';
import { EnergyUpgradeCard } from './EnergyUpgradeCard';
import { UpgradeCard } from './UpgradeCard';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants';
import type { Store } from '../../../models/store';

export const PowerMarket: React.FC = () => {
  const gold = useGameStore((s: Store) => s.gold);
  const energyUpgrades = useGameStore((s: Store) => s.energyUpgrades);
  const upgradeEnergySystem = useGameStore((s: Store) => s.upgradeEnergySystem);
  const { purchaseSupportTowerUpgrade, getSupportTowerUpgradeInfo } = useGameStore();
  const discountMultiplier = useGameStore((s: Store) => s.discountMultiplier);
  // Support tower upgrades config
  const supportUpgrades = [
    // Radar
    { id: 'radar_area_radius', name: 'Radar Alanı Yarıçapı', desc: 'Radar kulelerinin alan etkisi yarıçapını artırır.', icon: '📡', color: '#00FFAA', maxLevel: 5, cost: 200 },
    { id: 'radar_area_power', name: 'Radar Alanı Gücü', desc: 'Radar kulelerinin iyileştirme gücünü artırır.', icon: '💚', color: '#00FFAA', maxLevel: 5, cost: 220 },
    { id: 'radar_area_duration', name: 'Radar Alanı Süresi', desc: 'Radar alan etkisinin süresini artırır.', icon: '⏳', color: '#00FFAA', maxLevel: 5, cost: 180 },
    // Supply Depot
    { id: 'supply_depot_area_radius', name: 'Depo Alanı Yarıçapı', desc: 'Supply depot alan etkisi yarıçapını artırır.', icon: '📦', color: '#FFD700', maxLevel: 5, cost: 200 },
    { id: 'supply_depot_area_power', name: 'Depo Alanı Gücü', desc: 'Supply depot iyileştirme gücünü artırır.', icon: '💛', color: '#FFD700', maxLevel: 5, cost: 220 },
    { id: 'supply_depot_area_duration', name: 'Depo Alanı Süresi', desc: 'Supply depot alan etkisinin süresini artırır.', icon: '⏳', color: '#FFD700', maxLevel: 5, cost: 180 },
    // Shield Generator
    { id: 'shield_generator_area_radius', name: 'Kalkan Alanı Yarıçapı', desc: 'Kalkan jeneratörü alan etkisi yarıçapını artırır.', icon: '🛡️', color: '#00BFFF', maxLevel: 5, cost: 200 },
    { id: 'shield_generator_area_power', name: 'Kalkan Alanı Gücü', desc: 'Kalkan jeneratörü iyileştirme gücünü artırır.', icon: '💙', color: '#00BFFF', maxLevel: 5, cost: 220 },
    { id: 'shield_generator_area_duration', name: 'Kalkan Alanı Süresi', desc: 'Kalkan jeneratörü alan etkisinin süresini artırır.', icon: '⏳', color: '#00BFFF', maxLevel: 5, cost: 180 },
    // Repair Station
    { id: 'repair_station_area_radius', name: 'Tamir Alanı Yarıçapı', desc: 'Tamir istasyonu alan etkisi yarıçapını artırır.', icon: '🔧', color: '#4ade80', maxLevel: 5, cost: 200 },
    { id: 'repair_station_area_power', name: 'Tamir Alanı Gücü', desc: 'Tamir istasyonu iyileştirme gücünü artırır.', icon: '💚', color: '#4ade80', maxLevel: 5, cost: 220 },
    { id: 'repair_station_area_duration', name: 'Tamir Alanı Süresi', desc: 'Tamir istasyonu alan etkisinin süresini artırır.', icon: '⏳', color: '#4ade80', maxLevel: 5, cost: 180 },
    // EMP
    { id: 'emp_area_radius', name: 'EMP Alanı Yarıçapı', desc: 'EMP alan etkisi yarıçapını artırır.', icon: '⚡', color: '#a78bfa', maxLevel: 5, cost: 200 },
    { id: 'emp_area_power', name: 'EMP Alanı Gücü', desc: 'EMP zehir gücünü artırır.', icon: '☠️', color: '#a78bfa', maxLevel: 5, cost: 220 },
    { id: 'emp_area_duration', name: 'EMP Alanı Süresi', desc: 'EMP alan etkisinin süresini artırır.', icon: '⏳', color: '#a78bfa', maxLevel: 5, cost: 180 },
    // Stealth Detector
    { id: 'stealth_detector_area_radius', name: 'Dedektör Alanı Yarıçapı', desc: 'Stealth dedektör alan etkisi yarıçapını artırır.', icon: '🕵️', color: '#f472b6', maxLevel: 5, cost: 200 },
    { id: 'stealth_detector_area_power', name: 'Dedektör Alanı Gücü', desc: 'Stealth dedektör zehir gücünü artırır.', icon: '☠️', color: '#f472b6', maxLevel: 5, cost: 220 },
    { id: 'stealth_detector_area_duration', name: 'Dedektör Alanı Süresi', desc: 'Stealth dedektör alan etkisinin süresini artırır.', icon: '⏳', color: '#f472b6', maxLevel: 5, cost: 180 },
    // Air Defense
    { id: 'air_defense_area_radius', name: 'Hava Savunma Alanı Yarıçapı', desc: 'Hava savunma alan etkisi yarıçapını artırır.', icon: '🛩️', color: '#fbbf24', maxLevel: 5, cost: 200 },
    { id: 'air_defense_area_power', name: 'Hava Savunma Alanı Gücü', desc: 'Hava savunma ateş gücünü artırır.', icon: '🔥', color: '#fbbf24', maxLevel: 5, cost: 220 },
    { id: 'air_defense_area_duration', name: 'Hava Savunma Alanı Süresi', desc: 'Hava savunma alan etkisinin süresini artırır.', icon: '⏳', color: '#fbbf24', maxLevel: 5, cost: 180 },
    // Economy
    { id: 'economy_area_radius', name: 'Ekonomi Alanı Yarıçapı', desc: 'Para kulesi alan etkisi yarıçapını artırır.', icon: '💰', color: '#eab308', maxLevel: 5, cost: 200 },
    { id: 'economy_area_power', name: 'Ekonomi Alanı Gücü', desc: 'Para kulesi iyileştirme gücünü artırır.', icon: '💵', color: '#eab308', maxLevel: 5, cost: 220 },
    { id: 'economy_area_duration', name: 'Ekonomi Alanı Süresi', desc: 'Para kulesi alan etkisinin süresini artırır.', icon: '⏳', color: '#eab308', maxLevel: 5, cost: 180 },
  ];

  return (
    <div style={{ 
      width: '100%', 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
      gap: 20
    }}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}
      </style>

      {GAME_CONSTANTS.POWER_MARKET.ENERGY_UPGRADES.map(upgrade => (
        <EnergyUpgradeCard
          key={upgrade.id}
          upgrade={upgrade}
          currentLevel={energyUpgrades[upgrade.id] || 0}
          gold={gold}
          onUpgrade={upgradeEnergySystem}
        />
      ))}
      {/* Support Tower Area Effect Upgrades */}
      {supportUpgrades.map((upgrade) => {
        const { currentLevel } = getSupportTowerUpgradeInfo(upgrade.id, upgrade.maxLevel);
        return (
          <UpgradeCard
            key={upgrade.id}
            upgrade={{
              name: upgrade.name,
              description: upgrade.desc,
              currentLevel,
              baseCost: upgrade.cost,
              maxLevel: upgrade.maxLevel,
              onUpgrade: () => purchaseSupportTowerUpgrade(upgrade.id, upgrade.cost, upgrade.maxLevel),
              icon: upgrade.icon,
              color: upgrade.color,
              isElite: false,
              additionalInfo: `Seviye: ${currentLevel}/${upgrade.maxLevel}`,
            }}
            gold={gold}
            discountMultiplier={discountMultiplier}
          />
        );
      })}
      {/*
        ActionsUpgradeCard ve EliteUpgradeCard için de benzer şekilde prop iletimi gerekiyorsa,
        aynı mantıkla eklenmelidir. Şu an için örnek olarak bırakıldı:
        <ActionsUpgradeCard ... />
        <EliteUpgradeCard ... />
      */}
    </div>
  );
}; 