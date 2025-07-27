/**
 * 🏪 Simplified Market UI
 * Clean, categorized market interface with progressive unlocks
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../../../models/store';
import { marketManager, type MarketCategory, type MarketItem } from '../../../game-systems/market/MarketManager';
import { playSound } from '../../../utils/sound/soundEffects';
import { ScrollableGridList } from '../../common/ScrollableList';
import { useResponsiveMarket, getResponsiveGridConfig, getResponsiveCategoryConfig } from './ResponsiveMarketContainer';

interface SimplifiedMarketUIProps {
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

export const SimplifiedMarketUI: React.FC<SimplifiedMarketUIProps> = ({ 
  isOpen = true, 
  onClose, 
  isModal = false 
}) => {
  const { gold } = useGameStore();
  const { screenSize, isMobile } = useResponsiveMarket();
  const [activeCategory, setActiveCategory] = useState<MarketCategory>('offense');
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [categories, setCategories] = useState(marketManager.getMarketCategories());

  // Update market data when component mounts or game state changes
  useEffect(() => {
    if (isOpen) {
      marketManager.updateUnlockStatus();
      setCategories(marketManager.getMarketCategories());
      setMarketItems(marketManager.getItemsByCategory(activeCategory));
    }
  }, [isOpen, activeCategory, gold]);

  // Handle category change
  const handleCategoryChange = (category: MarketCategory) => {
    setActiveCategory(category);
    setMarketItems(marketManager.getItemsByCategory(category));
    playSound('ui-click');
  };

  // Handle item purchase
  const handlePurchase = (itemId: string) => {
    const success = marketManager.purchaseItem(itemId);
    if (success) {
      playSound('coin-collect');
      // Refresh market data
      marketManager.updateUnlockStatus();
      setMarketItems(marketManager.getItemsByCategory(activeCategory));
    } else {
      playSound('error');
    }
  };

  // Filter items for current category
  const currentItems = useMemo(() => {
    return marketItems.filter(item => item.category === activeCategory);
  }, [marketItems, activeCategory]);

  // Get unlocked and locked items
  const unlockedItems = currentItems.filter(item => item.isUnlocked);
  const lockedItems = currentItems.filter(item => !item.isUnlocked);

  const containerStyle: React.CSSProperties = isModal ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  } : {};

  const contentStyle: React.CSSProperties = isModal ? {
    backgroundColor: '#1A202C',
    border: '2px solid #4A5568',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '900px',
    maxHeight: '85vh',
    width: '95%',
    overflow: 'hidden',
    position: 'relative'
  } : {
    padding: '20px',
    color: '#FFF'
  };

  if (!isOpen) return null;

  return (
    <div style={containerStyle} onClick={isModal ? onClose : undefined}>
      <div style={contentStyle} onClick={isModal ? (e) => e.stopPropagation() : undefined}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#FFF', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            🏪 Market
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ color: '#F59E0B', fontSize: '18px', fontWeight: 'bold' }}>
              💰 {gold.toLocaleString()}
            </div>
            {isModal && onClose && (
              <button
                onClick={onClose}
                style={{
                  backgroundColor: '#EF4444',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        {(() => {
          const categoryConfig = getResponsiveCategoryConfig(screenSize);
          return (
            <div style={{ 
              display: 'flex', 
              flexDirection: categoryConfig.flexDirection,
              gap: categoryConfig.gap, 
              marginBottom: '20px',
              borderBottom: '2px solid #4A5568',
              paddingBottom: '12px'
            }}>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  style={{
                    flex: 1,
                    padding: categoryConfig.padding,
                    backgroundColor: activeCategory === category.id ? category.color : 'transparent',
                    color: '#FFF',
                    border: `2px solid ${category.color}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: categoryConfig.fontSize,
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: activeCategory === category.id ? 1 : 0.7
                  }}
                >
                  <span style={{ fontSize: isMobile ? '14px' : '16px' }}>{category.icon}</span>
                  <span>{category.name}</span>
                  <span style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {category.itemCount}
                  </span>
                </button>
              ))}
            </div>
          );
        })()}

        {/* Category Description */}
        <div style={{ 
          marginBottom: '20px', 
          padding: '12px', 
          backgroundColor: '#2D3748', 
          borderRadius: '8px',
          borderLeft: `4px solid ${categories.find(c => c.id === activeCategory)?.color || '#6B7280'}`
        }}>
          <p style={{ color: '#D1D5DB', fontSize: '14px', margin: 0 }}>
            {categories.find(c => c.id === activeCategory)?.description}
          </p>
        </div>

        {/* Market Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Unlocked Items */}
          {unlockedItems.length > 0 && (
            <div>
              <h3 style={{ color: '#FFF', fontSize: '18px', margin: '0 0 12px 0' }}>
                ✅ Available Items ({unlockedItems.length})
              </h3>
              {(() => {
                const gridConfig = getResponsiveGridConfig(screenSize);
                return (
                  <ScrollableGridList
                    items={unlockedItems}
                    renderItem={(item) => (
                      <MarketItemCard
                        item={item}
                        gold={gold}
                        onPurchase={() => handlePurchase(item.id)}
                        isLocked={false}
                      />
                    )}
                    keyExtractor={(item) => item.id}
                    maxHeight={gridConfig.maxHeight}
                    gridTemplateColumns={gridConfig.gridTemplateColumns}
                    gap={gridConfig.gap}
                    itemMinWidth={gridConfig.itemMinWidth}
                    emptyMessage="No items available in this category"
                    emptyIcon="📦"
                    containerStyle={{ padding: '4px' }}
                  />
                );
              })()}
            </div>
          )}

          {/* Locked Items */}
          {lockedItems.length > 0 && (
            <div>
              <h3 style={{ color: '#FFF', fontSize: '18px', margin: '0 0 12px 0' }}>
                🔒 Locked Items ({lockedItems.length})
              </h3>
              {(() => {
                const gridConfig = getResponsiveGridConfig(screenSize);
                return (
                  <ScrollableGridList
                    items={lockedItems}
                    renderItem={(item) => (
                      <MarketItemCard
                        item={item}
                        gold={gold}
                        onPurchase={() => {}} // No purchase for locked items
                        isLocked={true}
                      />
                    )}
                    keyExtractor={(item) => item.id}
                    maxHeight={gridConfig.maxHeight}
                    gridTemplateColumns={gridConfig.gridTemplateColumns}
                    gap={gridConfig.gap}
                    itemMinWidth={gridConfig.itemMinWidth}
                    emptyMessage="No locked items in this category"
                    emptyIcon="🔒"
                    containerStyle={{ padding: '4px' }}
                  />
                );
              })()}
            </div>
          )}

          {/* No Items Message */}
          {currentItems.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#9CA3AF',
              backgroundColor: '#2D3748',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h3 style={{ margin: '0 0 8px 0' }}>No Items Available</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Items will appear as you progress through the game
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Market Item Card Component
interface MarketItemCardProps {
  item: MarketItem;
  gold: number;
  onPurchase: () => void;
  isLocked: boolean;
}

const MarketItemCard: React.FC<MarketItemCardProps> = ({ item, gold, onPurchase, isLocked }) => {
  const canAfford = gold >= item.cost;
  const unlockRequirements = marketManager.getUnlockRequirementsText(item.id);

  const rarityColor = marketManager.getRarityColor(item.rarity);
  const categoryColor = marketManager.getCategoryColor(item.category);

  return (
    <div
      style={{
        backgroundColor: '#2D3748',
        border: `2px solid ${isLocked ? '#6B7280' : rarityColor}`,
        borderRadius: '12px',
        padding: '16px',
        position: 'relative',
        opacity: isLocked ? 0.6 : 1,
        transition: 'all 0.2s ease',
        cursor: isLocked ? 'default' : 'pointer'
      }}
      onClick={!isLocked && canAfford ? onPurchase : undefined}
    >
      {/* Lock Overlay */}
      {isLocked && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          fontSize: '20px',
          color: '#6B7280'
        }}>
          🔒
        </div>
      )}

      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>{item.icon}</span>
          <div>
            <h3 style={{ color: '#FFF', fontSize: '16px', fontWeight: 'bold', margin: 0 }}>
              {item.name}
            </h3>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <span style={{ 
                backgroundColor: categoryColor,
                color: '#FFF',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {item.category.toUpperCase()}
              </span>
              <span style={{ 
                backgroundColor: rarityColor,
                color: '#FFF',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {item.rarity.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <div style={{ 
          color: canAfford ? '#F59E0B' : '#EF4444', 
          fontSize: '16px', 
          fontWeight: 'bold',
          textAlign: 'right'
        }}>
          {item.cost}💰
        </div>
      </div>

      {/* Description */}
      <p style={{ color: '#D1D5DB', fontSize: '14px', lineHeight: '1.4', margin: '0 0 12px 0' }}>
        {item.description}
      </p>

      {/* Unlock Requirements */}
      {isLocked && unlockRequirements.length > 0 && (
        <div style={{ 
          marginBottom: '12px', 
          padding: '8px', 
          backgroundColor: '#4A5568', 
          borderRadius: '6px',
          border: '1px solid #6B7280'
        }}>
          <div style={{ color: '#F59E0B', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
            🔒 Unlock Requirements:
          </div>
          {unlockRequirements.map((req, index) => (
            <div key={index} style={{ color: '#D1D5DB', fontSize: '12px', marginBottom: '2px' }}>
              • {req}
            </div>
          ))}
        </div>
      )}

      {/* Purchase Button */}
      {!isLocked && (
        <button
          onClick={onPurchase}
          disabled={!canAfford}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: canAfford ? '#10B981' : '#6B7280',
            color: '#FFF',
            border: 'none',
            borderRadius: '6px',
            cursor: canAfford ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'background-color 0.2s',
            opacity: canAfford ? 1 : 0.6
          }}
        >
          {canAfford ? 'Purchase' : 'Insufficient Gold'}
        </button>
      )}
    </div>
  );
}; 