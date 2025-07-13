import React, { useState, useCallback, useEffect } from 'react';
import type { TabType } from './types';
import { upgradeScreenStyles } from './styles';
import { UpgradeHeader } from './Header/UpgradeHeader';
import { UpgradeTabNavigation } from './UpgradeTabNavigation';
import { UpgradeTabContent } from './UpgradeTabContent';
import { UpgradeFooter } from './Footer/UpgradeFooter';
import { useGameStore } from '../../models/store';

// Sub-components


export const UpgradeScreen: React.FC = React.memo(() => {
  // ✅ OPTIMIZED: Local state with memoization
  const [activeTab, setActiveTab] = useState<TabType>('dice');
  
  // ✅ OPTIMIZED: Store selectors with memoization
  const diceUsed = useGameStore(state => state.diceUsed);
  const rollDice = useGameStore(state => state.rollDice);
  const clearAllEnemies = useGameStore(state => state.clearAllEnemies);
  const clearAllEffects = useGameStore(state => state.clearAllEffects);

  // Yükseltme ekranı açıldığında düşmanları temizle ve zar otomatik at
  useEffect(() => {
    // Düşmanları ve efektleri temizle (para vermeden)
    clearAllEnemies();
    clearAllEffects();
    
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
  }, [clearAllEffects, clearAllEnemies, diceUsed, rollDice]);

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
}); 