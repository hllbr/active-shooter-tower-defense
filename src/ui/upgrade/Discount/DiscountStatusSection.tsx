import React from 'react';

import type { DiscountCategory } from '../types';

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
      description: 'Dalga-özel kombolar'
    },
    {
      name: '⚡ Elite Sistemler',
      color: '#8b5cf6',
      description: 'Enerji + Aksiyon + Elite'
    },
    {
      name: '🌦️ Hava Mağazası',
      color: '#06b6d4',
      description: 'Hava durumu efektleri'
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

  const getStatusColor = () => {
    if (discountMultiplier === 0) return '#ef4444';
    if (discountMultiplier > 1) return '#4ade80';
    return '#F59E0B';
  };

  return (
    <div style={{
      color: '#D1D5DB',
      fontSize: '14px',
      lineHeight: '1.6'
    }}>
      {/* Status Header */}
      <div style={{
        backgroundColor: '#1A202C',
        border: `2px solid ${getStatusColor()}`,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          color: getStatusColor(),
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '8px'
        }}>
          {getDiscountMessage()}
        </div>
        <div style={{
          color: '#D1D5DB',
          fontSize: '14px'
        }}>
          Mevcut indirim çarpanı: <span style={{ 
            color: '#F59E0B', 
            fontWeight: 'bold',
            backgroundColor: '#2D3748',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            x{discountMultiplier.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Category Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {discountCategories.map((category, index) => (
          <div
            key={index}
            style={{
              backgroundColor: '#2D3748',
              border: `2px solid ${category.color}`,
              borderRadius: '12px',
              padding: '16px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: category.color,
                borderRadius: '50%'
              }}></div>
              <h4 style={{
                color: '#FFF',
                fontSize: '16px',
                fontWeight: 'bold',
                margin: 0
              }}>
                {category.name}
              </h4>
            </div>
            <p style={{
              color: '#D1D5DB',
              fontSize: '13px',
              margin: 0,
              lineHeight: '1.4'
            }}>
              {category.description}
            </p>
            <div style={{
              marginTop: '8px',
              padding: '6px 10px',
              backgroundColor: discountMultiplier > 1 ? '#4ade80' : '#6B7280',
              color: discountMultiplier > 1 ? '#000' : '#FFF',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {discountMultiplier > 1 ? '🎉 İNDİRİM AKTİF' : '⏳ İNDİRİM BEKLİYOR'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 