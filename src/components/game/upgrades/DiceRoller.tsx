import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';

export const DiceRoller: React.FC = () => {
  const diceRoll = useGameStore((s) => s.diceRoll);
  const diceUsed = useGameStore((s) => s.diceUsed);
  const discountMultiplier = useGameStore((s) => s.discountMultiplier);
  const isDiceRolling = useGameStore((s) => s.isDiceRolling);
  const rollDice = useGameStore((s) => s.rollDice);
  
  const [diceAnimation, setDiceAnimation] = useState(0);

  const getDiceFace = (roll: number | null): string => {
    if (!roll) return '';
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return faces[roll - 1];
  };

  useEffect(() => {
    if (isDiceRolling) {
      const interval = setInterval(() => {
        setDiceAnimation(prev => prev + 1);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setDiceAnimation(0);
    }
  }, [isDiceRolling]);

  const handleDiceRoll = () => {
    console.log('🎲 DiceRoller: Dice button clicked!');
    console.log('📊 Dice state before roll:', {
      diceUsed,
      isDiceRolling,
      diceRoll,
      discountMultiplier
    });
    
    try {
      console.log('🔄 Calling rollDice...');
      rollDice();
      console.log('✅ rollDice called successfully');
      
      // Check state after a short delay
      setTimeout(() => {
        const newState = useGameStore.getState();
        console.log('📊 Dice state after roll:', {
          diceUsed: newState.diceUsed,
          isDiceRolling: newState.isDiceRolling,
          diceRoll: newState.diceRoll,
          discountMultiplier: newState.discountMultiplier
        });
      }, 100);
      
    } catch (error) {
      console.error('❌ Error in rollDice:', error);
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
        {diceRoll ? (
          <span style={{
            width: 24,
            fontWeight: 'bold',
            fontSize: 28,
            lineHeight: 1,
            color: discountMultiplier > 1 ? '#4ade80' : discountMultiplier === 0 ? '#ff4444' : GAME_CONSTANTS.GOLD_COLOR
          }}>
            {getDiceFace(diceRoll)}
          </span>
        ) : (
          <div style={{ width: 24 }} /> /* Spacer */
        )}
      </div>

      {/* Bilgilendirme Metni */}
      {!diceUsed && !isDiceRolling && (
        <div style={{ fontSize: 14, color: '#aaa', marginBottom: 12, lineHeight: 1.4 }}>
          <div>💡 <strong>Güçlendirme indirimleri kazanmak ister misin?</strong></div>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            • 1-3: Normal indirimler (%10-30)<br />
            • 4-6: Süper indirimler (%30-50)<br />
            • <strong>Her wave'de sadece 1 hakkın var!</strong>
          </div>
        </div>
      )}

      {isDiceRolling && (
        <div style={{
          fontSize: 18,
          color: GAME_CONSTANTS.GOLD_COLOR,
          marginBottom: 12,
          textAlign: 'center'
        }}>
          <span>🎲 Zar atılıyor...</span>
          <div style={{
            marginTop: 8,
          }}>
            <span style={{
              display: 'inline-block',
              animation: 'spin 0.4s linear infinite',
              fontSize: 32,
            }}>
              🎲
            </span>
            <span style={{ fontSize: 24, marginLeft: '0.5em' }}>
              {getDiceFace((diceAnimation % 6) + 1)}
            </span>
          </div>
        </div>
      )}

      {diceRoll && !isDiceRolling && (
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{
            fontSize: 64,
            lineHeight: 1,
            marginBottom: 8,
            color: discountMultiplier < 1 ? '#4ade80' : discountMultiplier === 1 ? '#fbbf24' : '#fff',
            textShadow: `0 0 12px ${discountMultiplier < 1 ? '#4ade80' : discountMultiplier === 1 ? '#fbbf24' : '#fff'}`
          }}>
            {getDiceFace(diceRoll)}
          </div>
          <div style={{ fontSize: 14, color: '#aaa' }}>
            {discountMultiplier < 1 ? (
              <span style={{ color: '#4ade80' }}>🎉 Süper İndirim! %{Math.round((1 - discountMultiplier) * 100)} daha ucuz!</span>
            ) : discountMultiplier === 1 ? (
              <span style={{ color: '#fbbf24' }}>✅ Normal indirimler aktif</span>
            ) : (
              <span style={{ color: '#ff4444' }}>❌ İndirimler iptal edildi!</span>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleDiceRoll}
        disabled={diceUsed || isDiceRolling}
        style={{
          padding: !diceUsed && !isDiceRolling ? '12px 24px' : '8px 16px',
          fontSize: !diceUsed && !isDiceRolling ? 18 : 16,
          borderRadius: 8,
          background: diceUsed || isDiceRolling ? '#444' : '#4ade80',
          color: diceUsed || isDiceRolling ? '#999' : '#000',
          border: 'none',
          cursor: diceUsed || isDiceRolling ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          transition: 'all 0.2s ease',
          lineHeight: 1.2,
        }}
      >
        {isDiceRolling ? '🎲 Zar Atılıyor...' : diceUsed ? '✅ Zar Kullanıldı' : '🎲 ZAR AT!'}
      </button>

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