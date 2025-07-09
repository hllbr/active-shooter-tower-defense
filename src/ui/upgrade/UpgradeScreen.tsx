import React, { useState, useCallback, useEffect } from 'react';
import type { TabType } from './types';
import { upgradeScreenStyles } from './styles';
import { UpgradeHeader } from './Header/UpgradeHeader';
import { UpgradeTabNavigation } from './UpgradeTabNavigation';
import { UpgradeTabContent } from './UpgradeTabContent';
import { UpgradeFooter } from './Footer/UpgradeFooter';
import { useGameStore } from '../../models/store';

// Sub-components


export const UpgradeScreen: React.FC = () => {
  // Local state - Sadece activeTab kaldı, diğerleri alt komponentlere taşındı
  const [activeTab, setActiveTab] = useState<TabType>('dice');
  
  // Store'dan dice state'lerini al
  const diceUsed = useGameStore(state => state.diceUsed);
  const rollDice = useGameStore(state => state.rollDice);

  // Yükseltme ekranı açıldığında zar otomatik at
  useEffect(() => {
    // Eğer zar henüz bu dalga için atılmamışsa otomatik at
    if (!diceUsed) {
      // Kısa bir delay ile zar at (kullanıcı deneyimi için)
      const timer = setTimeout(() => {
        try {
          // Zar sesi çal
          import('../../utils/sound').then(({ playSound }) => {
            playSound('dice-roll');
          });
          
          // Zar at
          rollDice();
        } catch (error) {
          console.error('Otomatik zar atma hatası:', error);
        }
      }, 500); // 500ms bekle

      return () => clearTimeout(timer);
    }
  }, []); // Sadece component mount olduğunda çalışsın

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