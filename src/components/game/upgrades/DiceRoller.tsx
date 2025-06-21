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

  return (
    <div style={{
      width: '100%',
      padding: 16,
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
            • 3 ve altı: İndirimler iptal edilir<br />
            • 4-6: Mevcut indirim + %50-150 daha fazla<br />
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
          <span>Zar atılıyor...</span>
          <div style={{
            marginTop: 8,
          }}>
            <span style={{
              display: 'inline-block',
              animation: 'spin 0.4s linear infinite',
              fontSize: 24,
            }}>
              🎲
            </span>
            <span style={{ fontSize: 24, marginLeft: '0.5em' }}>
              {diceAnimation % 6 + 1}
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
            color: discountMultiplier === 0 ? '#ff4444' : discountMultiplier > 1 ? '#4ade80' : '#fff',
            textShadow: `0 0 12px ${discountMultiplier === 0 ? '#ff4444' : discountMultiplier > 1 ? '#4ade80' : '#fff'}`
          }}>
            {getDiceFace(diceRoll)}
          </div>
          <div style={{ fontSize: 14, color: '#aaa' }}>
            {discountMultiplier === 0 ? (
              <span style={{ color: '#ff4444' }}>❌ İndirimler iptal edildi!</span>
            ) : discountMultiplier > 1 ? (
              <span style={{ color: '#4ade80' }}>🎉 İndirimler {Math.round((discountMultiplier - 1) * 100)}% daha artırıldı!</span>
            ) : (
              <span style={{ color: GAME_CONSTANTS.GOLD_COLOR }}>✅ Normal indirimler aktif</span>
            )}
          </div>
        </div>
      )}

      <button
        onClick={rollDice}
        disabled={diceUsed || isDiceRolling}
        style={{
          padding: !diceUsed && !isDiceRolling ? '8px 12px' : '8px 16px',
          fontSize: !diceUsed && !isDiceRolling ? 24 : 16,
          borderRadius: 8,
          background: diceUsed || isDiceRolling ? '#444' : '#4ade80',
          color: '#000',
          border: 'none',
          cursor: diceUsed || isDiceRolling ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          transition: 'all 0.2s ease',
          lineHeight: 1.2,
        }}
      >
        {isDiceRolling ? '🎲 Zar Atılıyor...' : diceUsed ? '🎲 Zar Kullanıldı' : '🎲'}
      </button>
    </div>
  );
}; 