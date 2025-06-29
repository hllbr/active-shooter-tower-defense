import React, { useEffect, useState } from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { DiceFace } from './DiceFace';

interface DiceAnimationProps {
  isRolling: boolean;
}

export const DiceAnimation: React.FC<DiceAnimationProps> = ({ isRolling }) => {
  const [animationFrame, setAnimationFrame] = useState(0);

  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setAnimationFrame(prev => prev + 1);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAnimationFrame(0);
    }
  }, [isRolling]);

  if (!isRolling) return null;

  return (
    <div style={{
      fontSize: 18,
      color: GAME_CONSTANTS.GOLD_COLOR,
      marginBottom: 12,
      textAlign: 'center'
    }}>
      <span>🎲 Zar atılıyor...</span>
      <div style={{ marginTop: 8 }}>
        <span style={{
          display: 'inline-block',
          animation: 'spin 0.4s linear infinite',
          fontSize: 32,
        }}>
          🎲
        </span>
        <span style={{ fontSize: 24, marginLeft: '0.5em' }}>
          <DiceFace roll={(animationFrame % 6) + 1} size="small" />
        </span>
      </div>
    </div>
  );
}; 