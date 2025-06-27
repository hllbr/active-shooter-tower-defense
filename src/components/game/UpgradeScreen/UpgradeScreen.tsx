import React, { useState, useCallback } from 'react';
import type { TabType, TabConfig } from './types';
import { upgradeScreenStyles } from './styles';
import { useGameStore } from '../../../models/store';

// Sub-components
import { UpgradeHeader } from './UpgradeHeader';
import { UpgradeTabNavigation } from './UpgradeTabNavigation';
import { UpgradeTabContent } from './UpgradeTabContent';
import { UpgradeFooter } from './UpgradeFooter';

export const UpgradeScreen: React.FC = () => {
  // Store hooks
  const nextWave = useGameStore((s) => s.nextWave);
  const resetDice = useGameStore((s) => s.resetDice);
  const startPreparation = useGameStore(s => s.startPreparation);
  const setRefreshing = useGameStore(s => s.setRefreshing);
  const gold = useGameStore((s) => s.gold);
  
  // Local state
  const [activeTab, setActiveTab] = useState<TabType>('dice');

  // Tab configuration
  const tabs: TabConfig[] = [
    { 
      id: 'dice', 
      name: '🎲 İndirim Merkezi', 
      color: '#ef4444',
      priority: '🔥 ÖNCE BU'
    },
    { 
      id: 'core', 
      name: '🏪 Temel Güçler', 
      color: '#4ade80'
    },
    { 
      id: 'packages', 
      name: '🎁 Kombo Paketler', 
      color: '#fbbf24'
    },
    { 
      id: 'advanced', 
      name: '⚡ Elite Sistemler', 
      color: '#8b5cf6'
    },
  ];

  // Event handlers
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleContinue = useCallback(() => {
    console.log('🚀 UpgradeScreen: handleContinue started');
    
    // CRITICAL FIX: Correct execution order for wave progression
    try {
      // 1. First increment wave and setup next wave state
      console.log('📈 Calling nextWave...');
      nextWave();
      console.log('✅ nextWave completed');
      
      // 2. Start preparation phase (includes timer setup)  
      console.log('⏳ Calling startPreparation...');
      startPreparation();
      console.log('✅ startPreparation completed');
      
      // 3. Reset dice for next upgrade opportunity
      console.log('🎲 Calling resetDice...');
      resetDice();
      console.log('✅ resetDice completed');
      
      // 4. FINALLY close UpgradeScreen (after all state is stable)
      console.log('🔄 Setting refreshing to false...');
      setTimeout(() => {
        setRefreshing(false);
        console.log('✅ setRefreshing(false) completed');
        console.log('🎉 handleContinue completed successfully!');
      }, 50); // Small delay ensures state stability
      
    } catch (error) {
      console.error('❌ Error in handleContinue:', error);
    }
  }, [nextWave, startPreparation, resetDice, setRefreshing]);

  return (
    <div style={upgradeScreenStyles.overlay}>
      <div style={upgradeScreenStyles.mainContainer}>
        {/* Header with Gold Display */}
        <UpgradeHeader gold={gold} />

        {/* Tab Navigation */}
        <UpgradeTabNavigation 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />

        {/* Tab Content */}
        <UpgradeTabContent activeTab={activeTab} />

        {/* Footer */}
        <UpgradeFooter onContinue={handleContinue} />
      </div>
    </div>
  );
}; 