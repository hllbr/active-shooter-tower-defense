import type { CSSProperties } from 'react';

export const discountStyles = {
  discountStatusContainer: {
    padding: 18,
    borderRadius: 12,
    textAlign: 'center'
  } as CSSProperties,

  discountStatusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12
  } as CSSProperties,

  discountCategoriesGrid: {
    fontSize: 13,
    color: '#ddd',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 10,
    marginTop: 14
  } as CSSProperties,

  categoryCard: {
    padding: 10,
    background: 'rgba(0,0,0,0.3)',
    borderRadius: 6
  } as CSSProperties,

  categoryTitle: {
    fontWeight: 'bold',
    fontSize: 12
  } as CSSProperties,

  categoryDescription: {
    fontSize: 10,
    opacity: 0.8
  } as CSSProperties,
};

export const getDiscountStatusStyle = (discountMultiplier: number) => {
  const isDisabled = discountMultiplier === 0;
  const isSuper = discountMultiplier > 1;
  
  const color = isDisabled ? '#ff4444' : isSuper ? '#4ade80' : '#fbbf24';
  const bgColor = isDisabled ? 'rgba(255, 68, 68, 0.2)' : isSuper ? 'rgba(74, 222, 128, 0.2)' : 'rgba(251, 191, 36, 0.2)';
  
  return {
    ...discountStyles.discountStatusContainer,
    border: `2px solid ${color}`,
    background: `linear-gradient(135deg, ${bgColor}, rgba(0,0,0,0.1))`,
  };
};

export const getDiscountStatusTitleStyle = (discountMultiplier: number): CSSProperties => {
  const isDisabled = discountMultiplier === 0;
  const isSuper = discountMultiplier > 1;
  
  const color = isDisabled ? '#ff4444' : isSuper ? '#4ade80' : '#fbbf24';
  
  return {
    ...discountStyles.discountStatusTitle,
    color,
  };
}; 