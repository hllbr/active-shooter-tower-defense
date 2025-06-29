import React from 'react';
import type { TabContentProps } from './types';
import { tabStyles } from './styles';
import { useGameStore } from '../../../models/store';
import type { Store } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';

// Tab specific components
import { DiceSystemSection } from './DiceSystemSection';
import { FireUpgrades } from '../upgrades/FireUpgrades';
import { ShieldUpgrades } from '../upgrades/ShieldUpgrades';
import { DefenseUpgrades } from '../upgrades/DefenseUpgrades';
import { UpgradePackages } from '../upgrades/UpgradePackages';
import { PowerMarket } from '../upgrades/PowerMarket';

export const UpgradeTabContent: React.FC<TabContentProps> = ({ activeTab }) => {
  const bulletLevel = useGameStore((s: Store) => s.bulletLevel);
  const discountMultiplier = useGameStore((s: Store) => s.discountMultiplier);

  const renderContent = () => {
    switch (activeTab) {
      case 'dice':
        return <DiceSystemSection discountMultiplier={discountMultiplier} />;
        
      case 'core':
        return (
          <div style={tabStyles.coreTabContainer}>
            <FireUpgrades />
            <ShieldUpgrades />
            {bulletLevel >= GAME_CONSTANTS.BULLET_TYPES.length && <DefenseUpgrades />}
          </div>
        );
        
      case 'packages':
        return <UpgradePackages />;
        
      case 'advanced':
        return <PowerMarket />;
        
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