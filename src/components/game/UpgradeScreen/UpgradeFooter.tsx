import React from 'react';
import type { FooterProps } from './types';
import { upgradeScreenStyles } from './styles';

export const UpgradeFooter: React.FC<FooterProps> = ({ onContinue }) => {
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 8px 24px rgba(74, 222, 128, 0.6)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 6px 18px rgba(74, 222, 128, 0.4)';
  };

  return (
    <div style={upgradeScreenStyles.footerContainer}>
      <button
        onClick={onContinue}
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