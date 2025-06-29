import React from 'react';
import { ContinueButton } from './ContinueButton';
import { FooterWrapper } from './FooterWrapper';
import { FooterAnimations } from './FooterAnimations';

// Props artık gerekmiyor, ContinueButton kendi logic'ini handle ediyor
export const UpgradeFooter: React.FC = () => {
  return (
    <FooterWrapper>
      <ContinueButton />
      <FooterAnimations />
    </FooterWrapper>
  );
}; 