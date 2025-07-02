import React, { useState, useCallback } from 'react';
import type { TabType } from './types';
import { upgradeScreenStyles } from './styles';
import { UpgradeHeader } from './Header/UpgradeHeader';
import { UpgradeTabNavigation } from './UpgradeTabNavigation';
import { UpgradeTabContent } from './UpgradeTabContent';
import { UpgradeFooter } from './Footer/UpgradeFooter';

// Sub-components


export const UpgradeScreen: React.FC = () => {
  // Local state - Sadece activeTab kaldı, diğerleri alt komponentlere taşındı
  const [activeTab, setActiveTab] = useState<TabType>('dice');

  // Event handlers - Sadece tab change kaldı
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  return (
    <div style={upgradeScreenStyles.overlay}>
      <div style={upgradeScreenStyles.mainContainer}>
        {/* Header - Artık gold prop'una ihtiyaç yok */}
        <UpgradeHeader />

        {/* Tab Navigation - Tabs config artık internal */}
        <UpgradeTabNavigation 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />

        {/* Tab Content */}
        <UpgradeTabContent activeTab={activeTab} />

        {/* Footer - Artık onContinue prop'una ihtiyaç yok */}
        <UpgradeFooter />
      </div>
    </div>
  );
}; 