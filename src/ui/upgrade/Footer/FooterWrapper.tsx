import React from 'react';
import { footerStyles } from './footerStyles';

interface FooterWrapperProps {
  children: React.ReactNode;
}

export const FooterWrapper = ({ children }: FooterWrapperProps) => {
  return (
    <div style={footerStyles.footerContainer}>
      {children}
    </div>
  );
}; 