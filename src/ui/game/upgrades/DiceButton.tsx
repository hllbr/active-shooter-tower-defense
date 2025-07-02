import React from 'react';
import { playSound } from '../../../utils/sound/soundEffects';

interface DiceButtonProps {
  onRoll: () => void;
  diceUsed: boolean;
  isDiceRolling: boolean;
}

export const DiceButton: React.FC<DiceButtonProps> = ({ 
  onRoll, 
  diceUsed, 
  isDiceRolling 
}) => {
  const isDisabled = diceUsed || isDiceRolling;
  const isActive = !diceUsed && !isDiceRolling;

  const getButtonText = () => {
    if (isDiceRolling) return '🎲 Zar Atılıyor...';
    if (diceUsed) return '✅ Zar Kullanıldı';
    return '🎲 ZAR AT!';
  };

  const handleRoll = () => {
    playSound('dice-roll');
    onRoll();
  };

  return (
    <button
      onClick={handleRoll}
      disabled={isDisabled}
      style={{
        padding: isActive ? '12px 24px' : '8px 16px',
        fontSize: isActive ? 18 : 16,
        borderRadius: 8,
        background: isDisabled ? '#444' : '#4ade80',
        color: isDisabled ? '#999' : '#000',
        border: 'none',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.2s ease',
        lineHeight: 1.2,
      }}
    >
      {getButtonText()}
    </button>
  );
}; 