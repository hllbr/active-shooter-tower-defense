import React from 'react';

import { DiscountCategoryCard } from './DiscountCategoryCard';
import type { DiscountCategory } from '../types';
import { getDiscountStatusStyle, getDiscountStatusTitleStyle } from './discountStyles';
import { upgradeScreenStyles } from '../styles';

interface DiscountStatusSectionProps {
  discountMultiplier: number;
}

export const DiscountStatusSection: React.FC<DiscountStatusSectionProps> = ({ discountMultiplier }) => {
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
    <div style={getDiscountStatusStyle(discountMultiplier)}>
      <div style={getDiscountStatusTitleStyle(discountMultiplier)}>
        {getDiscountMessage()}
      </div>
      
      <div style={upgradeScreenStyles.discountCategoriesGrid}>
        {discountCategories.map((category, index) => (
          <DiscountCategoryCard key={index} category={category} />
        ))}
      </div>
    </div>
  );
}; 