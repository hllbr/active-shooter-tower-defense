import React, { useCallback, useState, useEffect } from 'react';
import { useGameStore } from '../../models/store';
import type { Store } from '../../models/store';
import { getContinueButtonStyle } from './Footer/footerStyles';

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

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isRefreshing && isProcessing) {
      setIsProcessing(false);
    }
  }, [isRefreshing, isProcessing]);

  const handleContinue = useCallback(() => {
    try {
      nextWave();
      startPreparation();
      resetDice();
      
      // Resume game scene sounds after upgrade
      setTimeout(() => {
        import('../../utils/sound/soundEffects').then(({ resumeGameSceneSounds }) => {
          resumeGameSceneSounds();
        });
      }, 100);
      
      // Activate weather effects after upgrade screen closes
      import('../../game-systems/market/WeatherEffectMarket').then(({ weatherEffectMarket }) => {
        const currentWave = useGameStore.getState().currentWave;
        weatherEffectMarket.autoActivateEffects(currentWave);
      });

      setRefreshing(false);
      
      if (onContinueCallback) {
        onContinueCallback();
      }
      
    } catch (error) {
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
    if (isProcessing) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      handleContinue();
    } catch (error) {
      setRefreshing(false);
      setIsProcessing(false);
    }
  };

  const isDisabled = isProcessing;

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