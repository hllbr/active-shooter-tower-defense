import React, { useCallback, useState } from 'react';
import { useGameStore } from '../../models/store';
import type { Store } from '../../models/store';
import { getContinueButtonStyle } from './Footer/footerStyles';
import { validateStateChange } from '../../security/SecurityEnhancements';

interface ContinueButtonProps {
  onContinueCallback?: () => void;
}

export const ContinueButton: React.FC<ContinueButtonProps> = ({ onContinueCallback }) => {
  const nextWave = useGameStore((s: Store) => s.nextWave);
  const resetDice = useGameStore((s: Store) => s.resetDice);
  const startPreparation = useGameStore((s: Store) => s.startPreparation);
  const setRefreshing = useGameStore((s: Store) => s.setRefreshing);
  
  const currentWave = useGameStore((s: Store) => s.currentWave);
  const isRefreshing = useGameStore((s: Store) => s.isRefreshing);
  const isPreparing = useGameStore((s: Store) => s.isPreparing);

  const handleContinue = useCallback(() => {
    console.log('🔒 Secure UpgradeScreen: handleContinue started');
    
    // Security validation before proceeding
    const validation = validateStateChange('continueWave', {}, {});
    if (!validation.valid) {
      console.warn('🔒 Continue action blocked:', validation.reason);
      return;
    }
    
    try {
      console.log('📈 Calling nextWave...');
      nextWave();
      console.log('✅ nextWave completed');
      
      console.log('⏳ Calling startPreparation...');
      startPreparation();
      console.log('✅ startPreparation completed');
      
      console.log('🎲 Calling resetDice...');
      resetDice();
      console.log('✅ resetDice completed');
      
      console.log('🔄 Setting refreshing to false...');
      setTimeout(() => {
        setRefreshing(false);
        console.log('✅ setRefreshing(false) completed');
        console.log('🎉 handleContinue completed successfully!');
        
        if (onContinueCallback) {
          onContinueCallback();
        }
      }, 50);
      
    } catch (error) {
      console.error('❌ Error in handleContinue:', error);
    }
  }, [nextWave, startPreparation, resetDice, setRefreshing, onContinueCallback]);

  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const handleContinueClick = () => {
    console.log('🚀 ContinueButton: Savaşa Devam button clicked!');
    console.log('📊 Current state:', {
      currentWave,
      isRefreshing,
      isPreparing
    });
    
    try {
      console.log('🔄 Calling handleContinue...');
      handleContinue();
      console.log('✅ handleContinue called successfully');
    } catch (error) {
      console.error('❌ Error in handleContinue:', error);
    }
  };

  return (
    <button
      onClick={handleContinueClick}
      style={getContinueButtonStyle(hovered)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      🚀 Savaşa Devam
    </button>
  );
}; 