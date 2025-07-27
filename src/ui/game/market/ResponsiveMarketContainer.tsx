/**
 * 📱 Responsive Market Container
 * Ensures market UI works well on desktop and tablet resolutions
 */

import React from 'react';
import { SimplifiedMarketUI } from './SimplifiedMarketUI';
import { useResponsiveMarket } from './marketUtils';

interface ResponsiveMarketContainerProps {
  isOpen: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

export const ResponsiveMarketContainer: React.FC<ResponsiveMarketContainerProps> = ({
  isOpen,
  onClose,
  isModal = false
}) => {
  const { screenSize, isLandscape } = useResponsiveMarket();

  // Responsive styles based on screen size
  const getResponsiveStyles = () => {
    const baseStyles = {
      container: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: screenSize === 'mobile' ? '8px' : '16px'
      },
      content: {
        backgroundColor: '#1A202C',
        border: '2px solid #4A5568',
        borderRadius: screenSize === 'mobile' ? '8px' : '12px',
        padding: screenSize === 'mobile' ? '16px' : '24px',
        overflow: 'hidden',
        position: 'relative' as const,
        width: '100%',
        height: '100%',
        maxWidth: screenSize === 'mobile' ? '100%' : screenSize === 'tablet' ? '90%' : '900px',
        maxHeight: screenSize === 'mobile' ? '100%' : '85vh'
      }
    };

    // Mobile-specific adjustments
    if (screenSize === 'mobile') {
      if (isLandscape) {
        // Landscape mobile - adjust for horizontal layout
        baseStyles.content.maxHeight = '95vh';
        baseStyles.content.padding = '12px';
      } else {
        // Portrait mobile - full screen
        baseStyles.content.maxWidth = '100%';
        baseStyles.content.maxHeight = '100%';
        baseStyles.content.borderRadius = '0';
      }
    }

    // Tablet-specific adjustments
    if (screenSize === 'tablet') {
      baseStyles.content.maxWidth = '95%';
      baseStyles.content.maxHeight = '90vh';
    }

    return baseStyles;
  };

  const styles = getResponsiveStyles();

  // Don't render if not open
  if (!isOpen) return null;

  // For mobile, use full-screen modal
  if (screenSize === 'mobile' && !isLandscape) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <SimplifiedMarketUI 
            isOpen={isOpen} 
            onClose={onClose} 
            isModal={false} // Use inline mode for mobile
          />
        </div>
      </div>
    );
  }

  // For tablet and desktop, use the standard modal approach
  return (
    <SimplifiedMarketUI 
      isOpen={isOpen} 
      onClose={onClose} 
      isModal={isModal} 
    />
  );
};

 