import React from 'react';
import { EnergyUpgradeCard } from './EnergyUpgradeCard';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants';
import type { Store } from '../../../models/store';

export const PowerMarket: React.FC = () => {
  const gold = useGameStore((s: Store) => s.gold);
  const energyUpgrades = useGameStore((s: Store) => s.energyUpgrades);
  const upgradeEnergySystem = useGameStore((s: Store) => s.upgradeEnergySystem);

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
      {/*
        ActionsUpgradeCard ve EliteUpgradeCard için de benzer şekilde prop iletimi gerekiyorsa,
        aynı mantıkla eklenmelidir. Şu an için örnek olarak bırakıldı:
        <ActionsUpgradeCard ... />
        <EliteUpgradeCard ... />
      */}
    </div>
  );
}; 