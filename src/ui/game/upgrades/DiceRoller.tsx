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
    // Handle dice roll action
    
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
        const _newState = useGameStore.getState();
        // State verification after dice roll
      }, 100);
      
    } catch (error) {
      Logger.error('❌ Error in rollDice:', error);
    }
  };

  const getStatusColor = () => {
    if (diceUsed) return '#6B7280';
    if (discountMultiplier > 1) return '#4ade80';
    if (discountMultiplier === 0) return '#ef4444';
    return GAME_CONSTANTS.GOLD_COLOR;
  };

  return (
    <div style={{
      backgroundColor: '#1A202C',
      border: `2px solid ${getStatusColor()}`,
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '16px' 
      }}>
        <div style={{ width: '40px' }} /> {/* Spacer */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px' 
        }}>
          <span style={{ fontSize: '24px' }}>🎲</span>
          <span style={{ 
            fontWeight: 'bold', 
            fontSize: '18px', 
            color: getStatusColor() 
          }}>
            Şansını Dene!
          </span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <DiceFace 
            roll={diceRoll} 
            size="small" 
            color={getStatusColor()}
          />
          {discountMultiplier > 1 && (
            <span style={{
              backgroundColor: '#4ade80',
              color: '#000',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              x{discountMultiplier.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Status Info */}
      <div style={{
        backgroundColor: '#2D3748',
        border: '1px solid #4A5568',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          color: '#D1D5DB',
          fontSize: '14px',
          lineHeight: '1.4'
        }}>
          {diceUsed ? (
            <div style={{ color: '#6B7280' }}>
              ⏳ Zar bu dalga için kullanıldı. Yeni dalga bekleyin.
            </div>
          ) : (
            <div>
              <div style={{ color: '#F59E0B', fontWeight: 'bold', marginBottom: '4px' }}>
                💡 Zar atarak indirim kazanın!
              </div>
              <div style={{ fontSize: '13px' }}>
                • 4-5-6 atarsanız büyük indirimler kazanırsınız
                • 1-2-3 atarsanız normal fiyatlar geçerli olur
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dice Info */}
      <DiceInfo show={!diceUsed && !isDiceRolling} />
      
      {/* Dice Animation */}
      <DiceAnimation isRolling={isDiceRolling} />

      {/* Dice Result */}
      <DiceResult 
        diceRoll={diceRoll} 
        discountMultiplier={discountMultiplier} 
        show={!!diceRoll && !isDiceRolling} 
      />

      {/* Dice Button */}
      <div style={{ marginTop: '16px' }}>
        <DiceButton 
          onRoll={handleDiceRoll}
          diceUsed={diceUsed}
          isDiceRolling={isDiceRolling}
        />
      </div>

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