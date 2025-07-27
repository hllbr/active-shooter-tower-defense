import React from 'react';
import { footerStyles } from './footerStyles';

export const FooterAnimations = () => {
  return (
    <style>
      {`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 6px 18px rgba(74, 222, 128, 0.4);
          }
          50% { 
            box-shadow: 0 8px 24px rgba(74, 222, 128, 0.6);
          }
        }
      `}
    </style>
  );
}; 