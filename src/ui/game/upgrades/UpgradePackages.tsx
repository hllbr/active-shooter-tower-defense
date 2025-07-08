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
    diceUsed,
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
        {PACKAGE_DEFINITIONS.map((packageDef) => {
          const packageInfo = getPackageInfo(packageDef.id, packageDef.purchaseLimit || 1);
          
          return (
            <PackageCard
              key={packageDef.id}
              packageId={packageDef.id}
              name={packageDef.name}
              description={packageDef.description}
              baseCost={packageDef.cost}
              waveRequirement={packageDef.waveRequirement}
              maxAllowed={packageDef.purchaseLimit || 1}
              purchaseCount={packageInfo.purchaseCount}
              canPurchase={packageInfo.canPurchase}
              isMaxed={packageInfo.isMaxed}
              currentWave={currentWave}
              gold={gold}
              diceResult={diceResult || 0}
              discountMultiplier={discountMultiplier}
              diceUsed={diceUsed}
              onPurchase={(_packageId, _finalCost) => {
                packageDef.onPurchase(addEnergy, addAction);
              }}
              color={packageDef.color}
              icon={packageDef.icon}
              benefits={packageDef.benefits}
              isElite={packageDef.isElite}
              purchaseLimit={packageDef.purchaseLimit}
              getPackageInfo={getPackageInfo}
              purchasePackage={purchasePackage}
            />
          );
        })}
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