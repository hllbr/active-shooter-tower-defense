import React from 'react';
import { footerStyles } from './footerStyles';

interface FooterWrapperProps {
  children: React.ReactNode;
}

export const FooterWrapper: React.FC<FooterWrapperProps> = ({ children }) => {
  return (
    <div style={footerStyles.footerContainer}>
      {children}
    </div>
  );
}; 