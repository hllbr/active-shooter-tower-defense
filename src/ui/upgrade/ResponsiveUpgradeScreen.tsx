import React, { useState, useCallback, useEffect } from 'react';
import type { TabType } from './types';
import { UpgradeHeader } from './Header/UpgradeHeader';
import { UpgradeTabNavigation } from './UpgradeTabNavigation';
import { UpgradeTabContent } from './UpgradeTabContent';
import { UpgradeFooter } from './Footer/UpgradeFooter';
import { useGameStore } from '../../models/store';
import { useResponsiveUI } from '../../game-systems/responsive';
import { useButtonTouchControls } from '../../game-systems/responsive';

export const ResponsiveUpgradeScreen: React.FC = React.memo(() => {
  const [activeTab, setActiveTab] = useState<TabType>('dice');
  
  // Responsive UI hook
  const { 
    config, 
    styles, 
    isMobile, 
    isTablet, 
    isDesktop,
    getOptimalFontSize,
    getOptimalSpacing 
  } = useResponsiveUI();

  // Store selectors
  const diceUsed = useGameStore(state => state.diceUsed);
  const rollDice = useGameStore(state => state.rollDice);
  const clearAllEnemies = useGameStore(state => state.clearAllEnemies);
  const clearAllEffects = useGameStore(state => state.clearAllEffects);
  const setPaused = useGameStore(state => state.setPaused);

  // Touch controls for close button
  const { handlers: closeHandlers } = useButtonTouchControls(() => {
    // Close upgrade screen logic
  });

  // Pause game on mount, resume on unmount
  useEffect(() => {
    setPaused(true);
    return () => setPaused(false);
  }, [setPaused]);

  // Auto-clear enemies and roll dice
  useEffect(() => {
    clearAllEnemies();
    clearAllEffects();
    
    if (!diceUsed) {
      const timer = setTimeout(() => {
        try {
          import('../../utils/sound').then(({ playSound }) => {
            playSound('dice-roll');
          });
          rollDice();
            } catch (error) {
      // Auto dice roll error handled silently
    }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [clearAllEffects, clearAllEnemies, diceUsed, rollDice]);

  // Responsive event handlers
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  // Responsive styles based on screen size
  const getResponsiveOverlayStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5,
      backdropFilter: 'blur(6px)',
      animation: 'fadeInOverlay 0.7s ease',
    };

    if (isMobile()) {
      return {
        ...baseStyles,
        padding: config.isLandscape ? '8px' : '0px',
      };
    }

    if (isTablet()) {
      return {
        ...baseStyles,
        padding: '16px',
      };
    }

    return {
      ...baseStyles,
      padding: '24px',
    };
  };

  const getResponsiveContainerStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
      color: '#ffffff',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      border: '3px solid #4ade80',
      boxShadow: '0 0 32px 8px #4ade80, 0 20px 60px rgba(0,0,0,0.9)',
      transition: 'box-shadow 0.3s, transform 0.2s',
    };

    if (isMobile()) {
      return {
        ...baseStyles,
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        borderRadius: config.isLandscape ? '8px' : '0px',
        padding: getOptimalSpacing(16),
        fontSize: getOptimalFontSize(14),
      };
    }

    if (isTablet()) {
      return {
        ...baseStyles,
        width: '95%',
        height: '90vh',
        maxWidth: '95%',
        maxHeight: '90vh',
        padding: getOptimalSpacing(20),
        fontSize: getOptimalFontSize(15),
      };
    }

    return {
      ...baseStyles,
      width: '90%',
      maxWidth: 1000,
      maxHeight: '88vh',
      padding: getOptimalSpacing(16),
      fontSize: getOptimalFontSize(16),
    };
  };

  const getResponsiveTabNavigationStyles = (): React.CSSProperties => {
    if (isMobile()) {
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: getOptimalSpacing(8),
        padding: getOptimalSpacing(8),
      };
    }

    if (isTablet()) {
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: getOptimalSpacing(8),
        padding: getOptimalSpacing(12),
      };
    }

    return {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: getOptimalSpacing(8),
      padding: getOptimalSpacing(16),
    };
  };

  const getResponsiveTabContentStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      flex: 1,
      overflowY: 'auto',
      background: 'rgba(0,0,0,0.15)',
      borderRadius: '12px',
      border: '2px solid rgba(255,255,255,0.1)',
      scrollbarWidth: 'thin' as const,
      scrollbarColor: '#4A5568 #1A202C',
    };

    if (isMobile()) {
      return {
        ...baseStyles,
        padding: getOptimalSpacing(12),
        maxHeight: '60vh',
      };
    }

    if (isTablet()) {
      return {
        ...baseStyles,
        padding: getOptimalSpacing(16),
        maxHeight: '70vh',
      };
    }

    return {
      ...baseStyles,
      padding: getOptimalSpacing(20),
      maxHeight: '75vh',
    };
  };

  return (
    <div style={getResponsiveOverlayStyles()}>
      <div style={getResponsiveContainerStyles()}>
        {/* Responsive Header */}
        <div style={{ 
          padding: getOptimalSpacing(16),
          borderBottom: '2px solid rgba(255,255,255,0.1)'
        }}>
          <UpgradeHeader />
        </div>

        {/* Responsive Tab Navigation */}
        <div style={getResponsiveTabNavigationStyles()}>
          <UpgradeTabNavigation 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />
        </div>

        {/* Responsive Tab Content */}
        <div style={getResponsiveTabContentStyles()}>
          <UpgradeTabContent activeTab={activeTab} />
        </div>

        {/* Responsive Footer */}
        <div style={{ 
          padding: getOptimalSpacing(16),
          borderTop: '2px solid rgba(255,255,255,0.1)'
        }}>
          <UpgradeFooter />
        </div>
      </div>

      {/* Responsive CSS for scrollbars */}
      <style>
        {`
          @keyframes fadeInOverlay {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          /* Custom scrollbar styles */
          .responsive-upgrade-screen::-webkit-scrollbar {
            width: ${isMobile() ? '6px' : '8px'};
          }

          .responsive-upgrade-screen::-webkit-scrollbar-track {
            background: #1A202C;
            border-radius: 4px;
          }

          .responsive-upgrade-screen::-webkit-scrollbar-thumb {
            background: #4A5568;
            border-radius: 4px;
          }

          .responsive-upgrade-screen::-webkit-scrollbar-thumb:hover {
            background: #6B7280;
          }

          /* Touch-friendly scrollbar for mobile */
          @media (hover: none) and (pointer: coarse) {
            .responsive-upgrade-screen::-webkit-scrollbar {
              width: 8px;
            }
          }

          /* High contrast mode support */
          @media (prefers-contrast: high) {
            .responsive-upgrade-screen::-webkit-scrollbar-thumb {
              background: #ffffff;
            }
          }

          /* Reduced motion support */
          @media (prefers-reduced-motion: reduce) {
            .responsive-upgrade-screen {
              animation: none;
              transition: none;
            }
          }
        `}
      </style>
    </div>
  );
}); 