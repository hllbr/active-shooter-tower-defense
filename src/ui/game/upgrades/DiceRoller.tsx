import React from 'react';
import { useGameStore, type Store } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { DiceFace } from './DiceFace';
import { DiceInfo } from './DiceInfo';
import { DiceAnimation } from './DiceAnimation';
import { DiceResult } from './DiceResult';
import { DiceButton } from './DiceButton';
import { Logger } from '../../../utils/Logger';

export const DiceRoller: React.FC = () => {
  const diceRoll = useGameStore((state: Store) => state.diceRoll);
  const diceUsed = useGameStore((state: Store) => state.diceUsed);
  const discountMultiplier = useGameStore((state: Store) => state.discountMultiplier);
  const isDiceRolling = useGameStore((state: Store) => state.isDiceRolling);
  const rollDice = useGameStore((state: Store) => state.rollDice);

  const handleDiceRoll = () => {
      diceUsed,
      isDiceRolling,
      diceRoll,
      discountMultiplier
    });
    
    // ✅ SOUND FIX: Play dice roll sound effect
    setTimeout(() => {
      import('../../../utils/sound').then(({ playDiceRollSound }) => {
        playDiceRollSound(); // Zar atma sesi
      });
    }, 50);
    
    try {
      rollDice();
      
      // Check state after a short delay
      setTimeout(() => {
        const newState = useGameStore.getState();
          diceUsed: newState.diceUsed,
          isDiceRolling: newState.isDiceRolling,
          diceRoll: newState.diceRoll,
          discountMultiplier: newState.discountMultiplier
        });
      }, 100);
      
    } catch (error) {
      Logger.error('❌ Error in rollDice:', error);
    }
  };

  return (
    <div style={{
      maxWidth: 'calc(100% - 40px)',
      margin: '0 auto',
      padding: 14,
      borderRadius: 12,
      border: `2px solid ${diceUsed ? '#444' : GAME_CONSTANTS.GOLD_COLOR}`,
      background: diceUsed ? '#1a1a1a' : 'rgba(255, 215, 0, 0.1)',
      marginBottom: 16,
      textAlign: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 24 }} /> {/* Spacer */}
        <span style={{ fontWeight: 'bold', fontSize: 20, color: diceUsed ? '#888' : GAME_CONSTANTS.GOLD_COLOR }}>
          🎲 Şansını Dene!
        </span>
        <DiceFace 
          roll={diceRoll} 
          size="small" 
          color={discountMultiplier > 1 ? '#4ade80' : discountMultiplier === 0 ? '#ff4444' : GAME_CONSTANTS.GOLD_COLOR}
        />
      </div>

      <DiceInfo show={!diceUsed && !isDiceRolling} />
      
      <DiceAnimation isRolling={isDiceRolling} />

      <DiceResult 
        diceRoll={diceRoll} 
        discountMultiplier={discountMultiplier} 
        show={!!diceRoll && !isDiceRolling} 
      />

      <DiceButton 
        onRoll={handleDiceRoll}
        diceUsed={diceUsed}
        isDiceRolling={isDiceRolling}
      />

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}; 