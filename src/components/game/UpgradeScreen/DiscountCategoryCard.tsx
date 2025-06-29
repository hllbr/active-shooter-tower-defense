import React from 'react';
import type { DiscountCategory } from './types';
import { upgradeScreenStyles } from './styles';

interface DiscountCategoryCardProps {
  category: DiscountCategory;
}

export const DiscountCategoryCard: React.FC<DiscountCategoryCardProps> = ({ category }) => {
  return (
    <div style={upgradeScreenStyles.categoryCard}>
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
  );
}; 