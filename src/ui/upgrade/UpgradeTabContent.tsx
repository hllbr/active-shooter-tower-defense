import React from 'react';
import type { TabContentProps } from './types';
import { useGameStore } from '../../models/store';
import type { Store } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/constants';
import { FireUpgrades } from '../game/upgrades/FireUpgrades';
import { DiceSystemSection } from './DiceSystem/DiceSystemSection';
import { tabStyles } from './tabStyles';
import { ShieldUpgrades } from '../game/upgrades/ShieldUpgrades';
import { DefenseUpgrades } from '../game/upgrades/DefenseUpgrades';
import { UpgradePackages } from '../game/upgrades/UpgradePackages';
import { PowerMarket } from '../game/upgrades/PowerMarket';
import { SimplifiedMarketUI } from '../game/market/SimplifiedMarketUI';
import { AuraUpgrades } from '../game/upgrades/AuraUpgrades';
import { FireModeSelector } from '../game/upgrades/FireModeSelector';
import { AdvancedMineSelector } from '../game/upgrades/AdvancedMineSelector';
import { MissionDisplay } from '../game/upgrades/MissionDisplay';

// Tab specific components


export const UpgradeTabContent = ({ activeTab }: TabContentProps) => {
  const bulletLevel = useGameStore((s: Store) => s.bulletLevel);
  const discountMultiplier = useGameStore((s: Store) => s.discountMultiplier);

  const renderContent = () => {
    switch (activeTab) {
      case 'dice':
        return <DiceSystemSection discountMultiplier={discountMultiplier} />;
        
      case 'core':
        return (
          <div style={tabStyles.coreTabContainer}>
            <FireUpgrades/>
            <ShieldUpgrades />
            <AuraUpgrades />
            <FireModeSelector />
            <AdvancedMineSelector />
            {bulletLevel >= GAME_CONSTANTS.BULLET_TYPES.length && <DefenseUpgrades />}
          </div>
        );
        
      case 'missions':
        return <MissionDisplay />;
        
      case 'packages':
        return <UpgradePackages />;
        
      case 'advanced':
        return <PowerMarket />;
        
      case 'weather':
        return <SimplifiedMarketUI />;
        
      default:
        return null;
    }
  };

  return (
    <div style={tabStyles.tabContent}>
      {renderContent()}
    </div>
  );
}; 