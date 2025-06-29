import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';
import { EnergyStatusPanel } from './EnergyStatusPanel';
import { EnergyUpgradeCard } from './EnergyUpgradeCard';
import type { EnergySystemState, EnergyStats } from './types';

export const EnergyUpgrades: React.FC = () => {
  // Validated energy system state
  const energySystemState: EnergySystemState = {
    gold: useGameStore((state) => state.gold),
    energyUpgrades: useGameStore((state) => state.energyUpgrades),
    energy: useGameStore((state) => state.energy),
    maxEnergy: useGameStore((state) => state.maxEnergy),
    actionsRemaining: useGameStore((state) => state.actionsRemaining),
    maxActions: useGameStore((state) => state.maxActions),
    actionRegenTime: useGameStore((state) => state.actionRegenTime)
  };

  const upgradeEnergySystem = useGameStore((state) => state.upgradeEnergySystem);
  const calculateEnergyStats = useGameStore((state) => state.calculateEnergyStats);

  const stats: EnergyStats = calculateEnergyStats();

  return (
    <div style={{ width: '100%', marginTop: '24px' }}>
      <span style={{ fontWeight: 'bold', fontSize: 18, color: '#00cfff', marginBottom: 12, display: 'block' }}>
        ⚡ Enerji Sistemi Geliştirmeleri
      </span>

      <EnergyStatusPanel 
        energy={energySystemState.energy}
        maxEnergy={energySystemState.maxEnergy}
        stats={stats}
        actionsRemaining={energySystemState.actionsRemaining}
        maxActions={energySystemState.maxActions}
        actionRegenTime={energySystemState.actionRegenTime}
      />

      {/* Upgradeler */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px'
      }}>
        {GAME_CONSTANTS.POWER_MARKET.ENERGY_UPGRADES?.map((upgrade) => {
          const currentLevel = energySystemState.energyUpgrades[upgrade.id] || 0;
          return (
            <EnergyUpgradeCard
              key={upgrade.id}
              upgrade={upgrade}
              currentLevel={currentLevel}
              gold={energySystemState.gold}
              onUpgrade={upgradeEnergySystem}
            />
          );
        })}
      </div>
    </div>
  );
}; 