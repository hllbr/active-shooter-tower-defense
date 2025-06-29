import React from 'react';
import { EnergyUpgradeCard } from './EnergyUpgradeCard';
import { ActionsUpgradeCard } from './ActionsUpgradeCard';
import { EliteUpgradeCard } from './EliteUpgradeCard';

export const PowerMarket: React.FC = () => {
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

      <EnergyUpgradeCard />
      <ActionsUpgradeCard />
      <EliteUpgradeCard />
    </div>
  );
}; 