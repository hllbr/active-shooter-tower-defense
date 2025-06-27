import React from 'react';
import type { FooterProps } from './types';
import { upgradeScreenStyles } from './styles';
import { useGameStore } from '../../../models/store';

export const UpgradeFooter: React.FC<FooterProps> = ({ onContinue }) => {
  const currentWave = useGameStore(s => s.currentWave);
  const isRefreshing = useGameStore(s => s.isRefreshing);
  const isPreparing = useGameStore(s => s.isPreparing);
  
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 8px 24px rgba(74, 222, 128, 0.6)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 6px 18px rgba(74, 222, 128, 0.4)';
  };

  const handleContinueClick = () => {
    console.log('🚀 UpgradeFooter: Savaşa Devam button clicked!');
    console.log('📊 Current state:', {
      currentWave,
      isRefreshing,
      isPreparing
    });
    
    try {
      console.log('🔄 Calling onContinue...');
      onContinue();
      console.log('✅ onContinue called successfully');
    } catch (error) {
      console.error('❌ Error in onContinue:', error);
    }
  };

  return (
    <div style={upgradeScreenStyles.footerContainer}>
      <button
        onClick={handleContinueClick}
        style={upgradeScreenStyles.continueButton}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        🚀 Savaşa Devam
      </button>
      
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}
      </style>
    </div>
  );
}; 