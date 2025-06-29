import React from 'react';
import { useGameStore } from '../../../models/store';
import { UpgradeCard } from './UpgradeCard';
import type { UpgradeData } from './types';

interface EnergyUpgradeCardProps {
  upgrade: {
    id: string;
    name: string;
    description: string;
    cost: number;
    maxLevel: number;
    category: string;
    icon: string;
  };
  currentLevel: number;
  gold: number;
  onUpgrade: (upgradeId: string) => void;
}

export const EnergyUpgradeCard: React.FC<EnergyUpgradeCardProps> = ({ 
  upgrade, 
  currentLevel, 
  gold, 
  onUpgrade 
}) => {
  const { 
    discountMultiplier,
    diceResult 
  } = useGameStore();

  const upgradeData: UpgradeData = {
    name: upgrade.name,
    description: upgrade.description,
    currentLevel: currentLevel,
    baseCost: upgrade.cost * Math.pow(1.5, currentLevel),
    maxLevel: upgrade.maxLevel,
    onUpgrade: () => onUpgrade(upgrade.id),
    icon: upgrade.icon,
    color: '#00cfff',
    isElite: false,
    additionalInfo: `${upgrade.category} upgrade`
  };

  return (
    <UpgradeCard
      upgrade={upgradeData}
      gold={gold}
      diceResult={diceResult}
      discountMultiplier={discountMultiplier}
    />
  );
}; 