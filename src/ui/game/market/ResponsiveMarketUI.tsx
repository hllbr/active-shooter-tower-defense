import React, { useState, useCallback } from 'react';
import { useResponsiveUI } from '../../../game-systems/responsive';
import { useButtonTouchControls } from '../../../game-systems/responsive';
import { marketManager } from '../../../game-systems/market/MarketManager';
import { useGameStore } from '../../../models/store';
import { formatProfessional } from '../../../utils/formatters/core';
import { playSound } from '../../../utils/sound';
import { toast } from 'react-toastify';

interface ResponsiveMarketUIProps {
  isOpen: boolean;
  onClose: () => void;
  isModal?: boolean;
}

export const ResponsiveMarketUI: React.FC<ResponsiveMarketUIProps> = React.memo(({
  isOpen,
  onClose,
  isModal = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
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
  const gold = useGameStore(state => state.gold);
  const currentWave = useGameStore(state => state.currentWave);

  // Touch controls for close button
  const { handlers: closeHandlers } = useButtonTouchControls(onClose);

  // Get market items
  const marketItems = marketManager.getAvailableItems();
  const categories = marketManager.getCategories();

  // Filter items by category
  const filteredItems = selectedCategory === 'all' 
    ? marketItems 
    : marketItems.filter(item => item.category === selectedCategory);

  // Purchase item handler
  const handlePurchase = useCallback((itemId: string) => {
    const item = marketItems.find(i => i.id === itemId);
    if (!item) return;

    if (gold < item.cost) {
      playSound('error');
      toast.warning(`Not enough gold! You need ${formatProfessional(item.cost, 'currency')} to purchase ${item.name}.`);
      return;
    }

    const success = marketManager.purchaseItem(itemId);
    if (success) {
      playSound('purchase');
      toast.success(`${item.name} purchased successfully!`);
    } else {
      playSound('error');
      toast.error('Purchase failed!');
    }
  }, [gold, marketItems]);

  // Touch controls for purchase buttons
  const { handlers: purchaseHandlers } = useButtonTouchControls(handlePurchase);

  // Responsive styles
  const getResponsiveContainerStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      background: '#1A202C',
      border: '2px solid #4A5568',
      borderRadius: '12px',
      overflow: 'hidden',
      position: 'relative' as const,
      display: 'flex',
      flexDirection: 'column',
    };

    if (isMobile()) {
      return {
        ...baseStyles,
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        borderRadius: config.isLandscape ? '8px' : '0px',
      };
    }

    if (isTablet()) {
      return {
        ...baseStyles,
        width: '95%',
        height: '90vh',
        maxWidth: '95%',
        maxHeight: '90vh',
      };
    }

    return {
      ...baseStyles,
      width: '900px',
      height: '85vh',
      maxWidth: '900px',
      maxHeight: '85vh',
    };
  };

  const getResponsiveHeaderStyles = (): React.CSSProperties => {
    return {
      background: 'linear-gradient(135deg, #2D3748, #1A202C)',
      padding: getOptimalSpacing(16),
      borderBottom: '2px solid #4A5568',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    };
  };

  const getResponsiveCategoryStyles = (): React.CSSProperties => {
    if (isMobile()) {
      return {
        display: 'flex',
        flexDirection: 'column',
        gap: getOptimalSpacing(8),
        padding: getOptimalSpacing(12),
        borderBottom: '1px solid #4A5568',
      };
    }

    return {
      display: 'flex',
      flexDirection: 'row',
      gap: getOptimalSpacing(8),
      padding: getOptimalSpacing(12),
      borderBottom: '1px solid #4A5568',
      overflowX: 'auto',
    };
  };

  const getResponsiveContentStyles = (): React.CSSProperties => {
    return {
      flex: 1,
      overflowY: 'auto',
      padding: getOptimalSpacing(16),
    };
  };

  const getResponsiveGridStyles = (): React.CSSProperties => {
    if (isMobile()) {
      return {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: getOptimalSpacing(12),
      };
    }

    if (isTablet()) {
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: getOptimalSpacing(16),
      };
    }

    return {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: getOptimalSpacing(20),
    };
  };

  const getResponsiveItemStyles = (): React.CSSProperties => {
    return {
      background: '#2D3748',
      border: '2px solid #4A5568',
      borderRadius: '8px',
      padding: getOptimalSpacing(16),
      display: 'flex',
      flexDirection: 'column',
      gap: getOptimalSpacing(12),
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      minHeight: isMobile() ? '120px' : '140px',
    };
  };

  const getResponsiveButtonStyles = (): React.CSSProperties => {
    return {
      ...styles.button,
      minHeight: isMobile() ? '44px' : '40px',
      minWidth: isMobile() ? '44px' : '40px',
      fontSize: getOptimalFontSize(14),
      padding: getOptimalSpacing(12),
    };
  };

  if (!isOpen) return null;

  return (
    <div style={getResponsiveContainerStyles()}>
      {/* Responsive Header */}
      <div style={getResponsiveHeaderStyles()}>
        <h2 style={{ 
          fontSize: getOptimalFontSize(20), 
          fontWeight: 'bold',
          color: '#FFFFFF',
          margin: 0
        }}>
          🏪 Market
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: getOptimalSpacing(8) }}>
          <span style={{ 
            fontSize: getOptimalFontSize(14), 
            color: '#F59E0B',
            fontWeight: 'bold'
          }}>
            💰 {formatProfessional(gold, 'currency')}
          </span>
          <button
            style={{
              ...getResponsiveButtonStyles(),
              background: '#E53E3E',
              color: '#FFFFFF',
              border: 'none',
            }}
            onClick={closeHandlers.onTap}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Responsive Category Navigation */}
      <div style={getResponsiveCategoryStyles()}>
        <button
          style={{
            ...getResponsiveButtonStyles(),
            background: selectedCategory === 'all' ? '#4ADE80' : '#4A5568',
            color: '#FFFFFF',
            whiteSpace: 'nowrap',
          }}
          onClick={() => setSelectedCategory('all')}
        >
          All Items
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            style={{
              ...getResponsiveButtonStyles(),
              background: selectedCategory === category.id ? category.color : '#4A5568',
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
            }}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>

      {/* Responsive Content */}
      <div style={getResponsiveContentStyles()}>
        <div style={getResponsiveGridStyles()}>
          {filteredItems.map(item => (
            <div
              key={item.id}
              style={getResponsiveItemStyles()}
              onClick={() => handlePurchase(item.id)}
            >
              {/* Item Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: getOptimalSpacing(8) }}>
                  <span style={{ fontSize: getOptimalFontSize(24) }}>{item.icon}</span>
                  <div>
                    <h3 style={{ 
                      fontSize: getOptimalFontSize(16), 
                      fontWeight: 'bold',
                      color: '#FFFFFF',
                      margin: 0
                    }}>
                      {item.name}
                    </h3>
                    <span style={{ 
                      fontSize: getOptimalFontSize(12), 
                      color: item.rarity === 'legendary' ? '#F59E0B' : 
                             item.rarity === 'epic' ? '#8B5CF6' :
                             item.rarity === 'rare' ? '#3B82F6' : '#6B7280'
                    }}>
                      {item.rarity.toUpperCase()}
                    </span>
                  </div>
                </div>
                <span style={{ 
                  fontSize: getOptimalFontSize(16), 
                  fontWeight: 'bold',
                  color: '#F59E0B'
                }}>
                  {formatProfessional(item.cost, 'currency')}
                </span>
              </div>

              {/* Item Description */}
              <p style={{ 
                fontSize: getOptimalFontSize(14), 
                color: '#D1D5DB',
                lineHeight: 1.4,
                margin: 0,
                flex: 1
              }}>
                {item.description}
              </p>

              {/* Purchase Button */}
              <button
                style={{
                  ...getResponsiveButtonStyles(),
                  background: gold >= item.cost ? '#4ADE80' : '#E53E3E',
                  color: '#FFFFFF',
                  width: '100%',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePurchase(item.id);
                }}
                disabled={gold < item.cost}
              >
                {gold >= item.cost ? 'Purchase' : 'Not Enough Gold'}
              </button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: getOptimalSpacing(32),
            color: '#6B7280'
          }}>
            <div style={{ fontSize: getOptimalFontSize(48), marginBottom: getOptimalSpacing(16) }}>
              📦
            </div>
            <h3 style={{ 
              fontSize: getOptimalFontSize(18), 
              marginBottom: getOptimalSpacing(8) 
            }}>
              No items available
            </h3>
            <p style={{ fontSize: getOptimalFontSize(14) }}>
              Check back later for new items!
            </p>
          </div>
        )}
      </div>

      {/* Responsive CSS */}
      <style>
        {`
          /* Custom scrollbar styles */
          .responsive-market::-webkit-scrollbar {
            width: ${isMobile() ? '6px' : '8px'};
          }

          .responsive-market::-webkit-scrollbar-track {
            background: #1A202C;
            border-radius: 4px;
          }

          .responsive-market::-webkit-scrollbar-thumb {
            background: #4A5568;
            border-radius: 4px;
          }

          .responsive-market::-webkit-scrollbar-thumb:hover {
            background: #6B7280;
          }

          /* Touch-friendly scrollbar for mobile */
          @media (hover: none) and (pointer: coarse) {
            .responsive-market::-webkit-scrollbar {
              width: 8px;
            }
          }

          /* High contrast mode support */
          @media (prefers-contrast: high) {
            .responsive-market::-webkit-scrollbar-thumb {
              background: #ffffff;
            }
          }

          /* Reduced motion support */
          @media (prefers-reduced-motion: reduce) {
            .responsive-market * {
              animation: none !important;
              transition: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}); 