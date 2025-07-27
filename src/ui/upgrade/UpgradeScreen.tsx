import React, { useState, useCallback, useEffect } from 'react';
import type { TabType } from './types';
import { upgradeScreenStyles } from './styles';
import { UpgradeHeader } from './Header/UpgradeHeader';
import { UpgradeTabNavigation } from './UpgradeTabNavigation';
import { UpgradeTabContent } from './UpgradeTabContent';
import { UpgradeFooter } from './Footer/UpgradeFooter';
import { useGameStore } from '../../models/store';

export const UpgradeScreen = React.memo(() => {
  const [activeTab, setActiveTab] = useState<TabType>('dice');
  
  const diceUsed = useGameStore(state => state.diceUsed);
  const rollDice = useGameStore(state => state.rollDice);
  const clearAllEnemies = useGameStore(state => state.clearAllEnemies);
  const clearAllEffects = useGameStore(state => state.clearAllEffects);
  const setPaused = useGameStore(state => state.setPaused);

  // Pause game on mount, resume on unmount
  useEffect(() => {
    setPaused(true);
    return () => setPaused(false);
  }, [setPaused]);

  // Clear enemies and effects, auto-roll dice if not used
  useEffect(() => {
    clearAllEnemies();
    clearAllEffects();
    
    if (!diceUsed) {
      const timer = setTimeout(() => {
        try {
          import('../../utils/sound').then(({ playSound }) => {
            playSound('dice-roll');
          });
          
          rollDice();
        } catch (error) {
          // Error handling
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [clearAllEffects, clearAllEnemies, diceUsed, rollDice]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  return (
    <div style={upgradeScreenStyles.overlay}>
      <div style={upgradeScreenStyles.mainContainer}>
        <UpgradeHeader />
        <UpgradeTabNavigation 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />
        <UpgradeTabContent activeTab={activeTab} />
        <UpgradeFooter />
      </div>
    </div>
  );
}); 