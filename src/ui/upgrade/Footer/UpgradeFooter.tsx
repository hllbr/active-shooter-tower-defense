import React from 'react';
import { FooterWrapper } from './FooterWrapper';
import { ContinueButton } from '../ContinueButton';
import { FooterAnimations } from './FooterAnimations';


// Props artık gerekmiyor, ContinueButton kendi logic'ini handle ediyor
export const UpgradeFooter = () => {
  return (
    <FooterWrapper>
      <ContinueButton />
      <FooterAnimations />
    </FooterWrapper>
  );
}; 