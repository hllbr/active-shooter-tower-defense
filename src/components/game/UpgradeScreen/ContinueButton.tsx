import React, { useCallback } from 'react';
import { useGameStore } from '../../../models/store';
import { footerStyles } from './footerStyles';

interface ContinueButtonProps {
  onContinueCallback?: () => void;
}

export const ContinueButton: React.FC<ContinueButtonProps> = ({ onContinueCallback }) => {
  const nextWave = useGameStore((s) => s.nextWave);
  const resetDice = useGameStore((s) => s.resetDice);
  const startPreparation = useGameStore((s) => s.startPreparation);
  const setRefreshing = useGameStore((s) => s.setRefreshing);
  
  const currentWave = useGameStore((s) => s.currentWave);
  const isRefreshing = useGameStore((s) => s.isRefreshing);
  const isPreparing = useGameStore((s) => s.isPreparing);

  const handleContinue = useCallback(() => {
    console.log('🚀 UpgradeScreen: handleContinue started');
    
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

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 8px 24px rgba(74, 222, 128, 0.6)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 6px 18px rgba(74, 222, 128, 0.4)';
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
      style={footerStyles.continueButton}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      🚀 Savaşa Devam
    </button>
  );
}; 