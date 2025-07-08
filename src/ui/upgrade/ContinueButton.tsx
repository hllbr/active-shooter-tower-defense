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
  
  // 🆕 UPGRADE SCREEN: New functions for cleanup
  const clearAllEnemies = useGameStore((s: Store) => s.clearAllEnemies);
  const clearAllEffects = useGameStore((s: Store) => s.clearAllEffects);
  
  const currentWave = useGameStore((s: Store) => s.currentWave);
  const isRefreshing = useGameStore((s: Store) => s.isRefreshing);
  const isPreparing = useGameStore((s: Store) => s.isPreparing);

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isRefreshing && isProcessing) {
      setIsProcessing(false);
    }
  }, [isRefreshing, isProcessing]);

  const handleContinue = useCallback(() => {
    
    // CRITICAL FIX: Security validation kaldırıldı - oyun akıcılığı için
    // const validation = validateStateChange('continueWave', {}, {});
    // if (!validation.valid) {
    //   console.warn('🔒 Continue action blocked:', validation.reason);
    //   setIsProcessing(false);
    //   return;
    // }
    
    try {
      clearAllEnemies();
      clearAllEffects();
      
      nextWave();
      
      startPreparation();
      
      resetDice();
      
      // 🎮 Resume game scene sounds after upgrade
      setTimeout(() => {
        import('../../utils/sound').then(({ resumeGameSceneSounds }) => {
          resumeGameSceneSounds();
        });
      }, 100);
      
      setRefreshing(false);
      
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
      currentWave,
      isRefreshing,
      isPreparing,
      isProcessing
    });
    
    // CRITICAL FIX: Lock problemi çözüldü - isRefreshing kontrolü kaldırıldı
    if (isProcessing) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      handleContinue();
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
      aria-label={isProcessing ? 'İşleniyor, lütfen bekleyin' : 'Savaşa devam et'}
      style={getContinueButtonStyle(hovered)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={isDisabled}
    >
      {isProcessing ? '🔄 İşleniyor...' : '🚀 Savaşa Devam'}
    </button>
  );
}; 