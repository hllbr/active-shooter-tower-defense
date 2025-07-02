import React from 'react';
import { DiceFace } from './DiceFace';

interface DiceResultProps {
  diceRoll: number | null;
  discountMultiplier: number;
  show: boolean;
}

export const DiceResult: React.FC<DiceResultProps> = ({ 
  diceRoll, 
  discountMultiplier, 
  show 
}) => {
  if (!show || !diceRoll) return null;

  const getResultColor = () => {
    if (discountMultiplier < 1) return '#4ade80';
    if (discountMultiplier === 1) return '#fbbf24';
    return '#fff';
  };

  const getResultMessage = () => {
    if (discountMultiplier < 1) {
      return (
        <span style={{ color: '#4ade80' }}>
          🎉 Süper İndirim! %{Math.round((1 - discountMultiplier) * 100)} daha ucuz!
        </span>
      );
    }
    if (discountMultiplier === 1) {
      return <span style={{ color: '#fbbf24' }}>✅ Normal indirimler aktif</span>;
    }
    return <span style={{ color: '#ff4444' }}>❌ İndirimler iptal edildi!</span>;
  };

  return (
    <div style={{ textAlign: 'center', marginBottom: 12 }}>
      <div style={{ marginBottom: 8 }}>
        <DiceFace 
          roll={diceRoll} 
          size="large" 
          color={getResultColor()} 
          showShadow={true}
        />
      </div>
      <div style={{ fontSize: 14, color: '#aaa' }}>
        {getResultMessage()}
      </div>
    </div>
  );
}; 