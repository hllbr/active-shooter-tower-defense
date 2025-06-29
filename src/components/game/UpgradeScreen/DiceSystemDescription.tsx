import React from 'react';
import { upgradeScreenStyles } from './styles';

export const DiceSystemDescription: React.FC = () => {
  return (
    <div style={upgradeScreenStyles.diceSystemDescription}>
      Zar at ve <strong style={{ color: '#fbbf24' }}>TÜM yükseltmelerde</strong> büyük indirimler kazan!<br/>
      İndirimler geçerli kategoriler: <span style={{ color: '#4ade80' }}>Temel Güçler</span>, 
      <span style={{ color: '#fbbf24' }}> Kombo Paketler</span>, 
      <span style={{ color: '#8b5cf6' }}> Elite Sistemler</span>
    </div>
  );
}; 