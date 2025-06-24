import React from 'react';
import type { DiceSystemSectionProps, DiscountCategory } from './types';
import { upgradeScreenStyles, getDiscountStatusStyle, getDiscountStatusTitleStyle } from './styles';
import { DiceRoller } from '../upgrades/DiceRoller';

export const DiceSystemSection: React.FC<DiceSystemSectionProps> = ({ discountMultiplier }) => {
  const discountCategories: DiscountCategory[] = [
    {
      name: '🏪 Temel Güçler',
      color: '#4ade80',
      description: 'Ateş + Kalkan + Savunma'
    },
    {
      name: '🎁 Kombo Paketler',
      color: '#fbbf24',
      description: 'Wave-özel kombolar'
    },
    {
      name: '⚡ Elite Sistemler',
      color: '#8b5cf6',
      description: 'Enerji + Aksiyon + Elite'
    }
  ];

  const getDiscountMessage = (): string => {
    if (discountMultiplier === 0) {
      return '❌ Tüm İndirimler İptal!';
    }
    if (discountMultiplier > 1) {
      return `🎉 SÜPER İNDİRİM: +${Math.round((discountMultiplier - 1) * 100)}%`;
    }
    return '✅ Normal İndirimler Aktif';
  };

  return (
    <div style={upgradeScreenStyles.diceSystemContainer}>
      {/* Enhanced Dice System */}
      <div style={upgradeScreenStyles.diceSystemMain}>
        <div style={upgradeScreenStyles.diceSystemTitle}>
          🎲 Evrensel İndirim Sistemi
        </div>
        
        <DiceRoller />
        
        <div style={upgradeScreenStyles.diceSystemDescription}>
          Zar at ve <strong style={{ color: '#fbbf24' }}>TÜM yükseltmelerde</strong> büyük indirimler kazan!<br/>
          İndirimler geçerli kategoriler: <span style={{ color: '#4ade80' }}>Temel Güçler</span>, 
          <span style={{ color: '#fbbf24' }}> Kombo Paketler</span>, 
          <span style={{ color: '#8b5cf6' }}> Elite Sistemler</span>
        </div>
      </div>

      {/* Current Discount Status */}
      <div style={getDiscountStatusStyle(discountMultiplier)}>
        <div style={getDiscountStatusTitleStyle(discountMultiplier)}>
          {getDiscountMessage()}
        </div>
        
        <div style={upgradeScreenStyles.discountCategoriesGrid}>
          {discountCategories.map((category, index) => (
            <div key={index} style={upgradeScreenStyles.categoryCard}>
              <div style={{
                ...upgradeScreenStyles.categoryTitle,
                color: category.color
              }}>
                {category.name}
              </div>
              <div style={upgradeScreenStyles.categoryDescription}>
                {category.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 