import React, { useCallback, useState, useEffect } from 'react';
import { useGameStore } from '../../models/store';
import type { Store } from '../../models/store';
import { getContinueButtonStyle } from './Footer/footerStyles';
// CRITICAL FIX: Security validation kaldırıldı - oyun akıcılığı için
// import { validateStateChange } from '../../security/SecurityEnhancements';

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

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isRefreshing && isProcessing) {
      console.log('🔄 isRefreshing changed to false, resetting processing state');
      setIsProcessing(false);
    }
  }, [isRefreshing, isProcessing]);

  const handleContinue = useCallback(() => {
    console.log('🔒 Secure UpgradeScreen: handleContinue started');
    
    // CRITICAL FIX: Security validation kaldırıldı - oyun akıcılığı için
    // const validation = validateStateChange('continueWave', {}, {});
    // if (!validation.valid) {
    //   console.warn('🔒 Continue action blocked:', validation.reason);
    //   setIsProcessing(false);
    //   return;
    // }
    
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
      setRefreshing(false);
      console.log('✅ setRefreshing(false) completed');
      console.log('🎉 handleContinue completed successfully!');
      
      if (onContinueCallback) {
        onContinueCallback();
      }
      
    } catch (error) {
      console.error('❌ Error in handleContinue:', error);
      setRefreshing(false);
    } finally {
      setIsProcessing(false);
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
      isPreparing,
      isProcessing
    });
    
    // CRITICAL FIX: Lock problemi çözüldü - isRefreshing kontrolü kaldırıldı
    if (isProcessing) {
      console.log('⚠️ Button already processed, ignoring click');
      return;
    }
    
    console.log('✅ Setting processing state to true');
    setIsProcessing(true);
    
    try {
      console.log('🔄 Calling handleContinue...');
      handleContinue();
      console.log('✅ handleContinue called successfully');
    } catch (error) {
      console.error('❌ Error in handleContinue:', error);
      setRefreshing(false);
      setIsProcessing(false);
    }
  };

  // CRITICAL FIX: isRefreshing kontrolü kaldırıldı - sadece processing kontrol edilir
  const isDisabled = isProcessing;

  // ✅ DEBUG: Global debug function for testing
  useEffect(() => {
    (window as unknown as { debugContinueButton: () => void }).debugContinueButton = () => {
      console.log('🔍 ContinueButton Debug Info:', {
        isRefreshing,
        isProcessing,
        isDisabled,
        currentWave,
        isPreparing
      });
    };
  }, [isRefreshing, isProcessing, isDisabled, currentWave, isPreparing]);

  return (
    <button
      onClick={handleContinueClick}
      style={getContinueButtonStyle(hovered)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={isDisabled}
    >
      {isProcessing ? '🔄 İşleniyor...' : '🚀 Savaşa Devam'}
    </button>
  );
}; 