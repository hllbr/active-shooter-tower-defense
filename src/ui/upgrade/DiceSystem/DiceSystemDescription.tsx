import React from 'react';

export const DiceSystemDescription: React.FC = () => {
  return (
    <div style={{
      color: '#D1D5DB',
      fontSize: '14px',
      lineHeight: '1.6',
      textAlign: 'left'
    }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          color: '#F59E0B', 
          fontWeight: 'bold',
          marginBottom: '8px',
          fontSize: '16px'
        }}>
          🎯 Nasıl Çalışır?
        </div>
        <p style={{ margin: '0 0 8px 0' }}>
          Zar at ve <strong style={{ color: '#fbbf24' }}>TÜM yükseltmelerde</strong> büyük indirimler kazan!
        </p>
      </div>

      <div style={{
        backgroundColor: '#1A202C',
        border: '1px solid #4A5568',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ 
          color: '#FFF', 
          fontWeight: 'bold',
          marginBottom: '12px',
          fontSize: '15px'
        }}>
          🎲 Zar Sonuçları:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 
              backgroundColor: '#4ade80', 
              color: '#000', 
              padding: '4px 8px', 
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              minWidth: '40px',
              textAlign: 'center'
            }}>
              6
            </span>
            <span>%50 İndirim - Süper Şanslı! 🎉</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 
              backgroundColor: '#3B82F6', 
              color: '#FFF', 
              padding: '4px 8px', 
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              minWidth: '40px',
              textAlign: 'center'
            }}>
              5
            </span>
            <span>%30 İndirim - Çok İyi! 🌟</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 
              backgroundColor: '#8B5CF6', 
              color: '#FFF', 
              padding: '4px 8px', 
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              minWidth: '40px',
              textAlign: 'center'
            }}>
              4
            </span>
            <span>%15 İndirim - İyi! ✨</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 
              backgroundColor: '#6B7280', 
              color: '#FFF', 
              padding: '4px 8px', 
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              minWidth: '40px',
              textAlign: 'center'
            }}>
              1-3
            </span>
            <span>Normal Fiyat - Tekrar Dene! 🔄</span>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: '#1A202C',
        border: '1px solid #4A5568',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <div style={{ 
          color: '#FFF', 
          fontWeight: 'bold',
          marginBottom: '12px',
          fontSize: '15px'
        }}>
          🛍️ İndirimler Geçerli Kategoriler:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#4ade80' }}>•</span>
            <span style={{ color: '#4ade80' }}>Temel Güçler</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#fbbf24' }}>•</span>
            <span style={{ color: '#fbbf24' }}>Kombo Paketler</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#8b5cf6' }}>•</span>
            <span style={{ color: '#8b5cf6' }}>Elite Sistemler</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#06b6d4' }}>•</span>
            <span style={{ color: '#06b6d4' }}>Hava Mağazası</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 