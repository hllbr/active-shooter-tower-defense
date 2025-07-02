import React from 'react';
import { useGameStore } from '../../../models/store';
import { PackageCard } from './PackageCard';
import { PACKAGE_DEFINITIONS } from './packageData';

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

  return (
    <>
      <div style={{ 
        width: '100%', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: 20
      }}>
        {PACKAGE_DEFINITIONS.map((packageDef) => (
          <PackageCard
            key={packageDef.id}
            packageId={packageDef.id}
            name={packageDef.name}
            description={packageDef.description}
            cost={packageDef.cost}
            waveRequirement={packageDef.waveRequirement}
            icon={packageDef.icon}
            color={packageDef.color}
            onPurchase={() => packageDef.onPurchase(addEnergy, addAction)}
            benefits={packageDef.benefits}
            isElite={packageDef.isElite}
            purchaseLimit={packageDef.purchaseLimit}
            gold={gold}
            currentWave={currentWave}
            diceResult={diceResult}
            discountMultiplier={discountMultiplier}
            getPackageInfo={getPackageInfo}
            purchasePackage={purchasePackage}
          />
        ))}
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}
      </style>
    </>
  );
}; 