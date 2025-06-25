import React, { useEffect } from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';
import { playContextualSound, stopBackgroundMusic } from '../../../utils/sound';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import { statCardStyle } from '../styles';

export const GameOverScreen: React.FC = () => {
  const {
    isGameOver,
    currentWave,
    totalEnemiesKilled,
    totalGoldSpent,
    fireUpgradesPurchased,
    shieldUpgradesPurchased,
    packagesPurchased,
    resetGame,
    setStarted
  } = useGameStore();

  // Animated stats for the game over screen
  const animatedKills = useAnimatedCounter(totalEnemiesKilled, isGameOver);
  const animatedGold = useAnimatedCounter(totalGoldSpent, isGameOver);
  const animatedFire = useAnimatedCounter(fireUpgradesPurchased, isGameOver);
  const animatedShield = useAnimatedCounter(shieldUpgradesPurchased, isGameOver);
  const animatedPackages = useAnimatedCounter(packagesPurchased, isGameOver);

  // ✅ AUDIO FIX: Immediate impactful game over sound + Victory vs Defeat logic
  useEffect(() => {
    if (!isGameOver) return;
    
    // Stop background music immediately
    stopBackgroundMusic();
    
    // ✅ FIXED: Play contextual sound immediately for maximum impact (no delay!)
    const isVictory = currentWave >= 100;
    if (isVictory) {
      playContextualSound('victory'); // Victory celebration sound (levelupwav.wav)
    } else {
      playContextualSound('defeat'); // Immediate defeat sound (gameover.wav)
    }
  }, [isGameOver, currentWave]);

  if (!isGameOver) return null;

  const isVictory = currentWave >= 100;

  const handleRestart = () => {
    stopBackgroundMusic();
    resetGame();
    setStarted(false);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 4,
        flexDirection: 'column',
      }}
    >
      <div
        className="game-over-card"
        style={{
          background: 'linear-gradient(145deg, #2a2a3a, #1a1a2a)',
          color: '#fff',
          padding: '40px',
          borderRadius: '20px',
          border: `2px solid ${isVictory ? '#4ade80' : '#ff3333'}`,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          width: '90%',
          maxWidth: '500px',
          textAlign: 'center',
        }}
      >
        {isVictory ? (
          // Victory Screen
          <>
            <h1 style={{ color: '#4ade80', fontSize: 48, margin: 0, padding: 0 }}>
              🏆 TEBRİKLER! 🏆
            </h1>
            <p style={{ fontSize: 20, color: '#ccc', marginTop: 16 }}>
              Tüm 100 dalgayı başarıyla tamamladınız!
            </p>
            <p style={{ fontSize: 18, color: GAME_CONSTANTS.GOLD_COLOR, marginBottom: 32 }}>
              Gerçek bir savunma ustası oldunuz! 👑
            </p>
          </>
        ) : (
          // Defeat Screen
          <>
            <h1 style={{ color: '#ff3333', fontSize: 48, margin: 0, padding: 0 }}>
              💀 Oyun Bitti 💀
            </h1>
            <p style={{ fontSize: 20, color: '#ccc', marginTop: 16, marginBottom: 32 }}>
              Savunman aşıldı. Ama her son yeni bir başlangıçtır.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              background: 'rgba(0,0,0,0.3)',
              padding: '24px',
              borderRadius: '12px',
              marginBottom: '32px'
            }}>
              {/* Stats Dashboard */}
              <div style={{...statCardStyle}}>
                <span>🌊</span>
                <span>Ulaşılan Dalga</span>
                <strong style={{ color: '#00cfff' }}>{currentWave}</strong>
              </div>
              <div style={{...statCardStyle}}>
                <span>☠️</span>
                <span>Yok Edilen</span>
                <strong style={{ color: '#ffcc00' }}>{animatedKills.toLocaleString()}</strong>
              </div>
              <div style={{...statCardStyle}}>
                <span>💰</span>
                <span>Harcanan Altın</span>
                <strong style={{ color: GAME_CONSTANTS.GOLD_COLOR }}>{animatedGold.toLocaleString()}</strong>
              </div>
              <div style={{...statCardStyle}}>
                <span>🔥</span>
                <span>Ateş Yükseltme</span>
                <strong style={{ color: '#ff4400' }}>{animatedFire}</strong>
              </div>
              <div style={{...statCardStyle}}>
                <span>🛡️</span>
                <span>Kalkan Yükseltme</span>
                <strong style={{ color: '#aa00ff' }}>{animatedShield}</strong>
              </div>
              <div style={{...statCardStyle}}>
                <span>🎁</span>
                <span>Alınan Paket</span>
                <strong style={{ color: '#4ade80' }}>{animatedPackages}</strong>
              </div>
            </div>
          </>
        )}
        
        <button
          onClick={handleRestart}
          style={{
            fontSize: 24,
            padding: '16px 48px',
            borderRadius: 12,
            background: isVictory ? '#4ade80' : '#00cfff',
            color: '#fff',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = `0 0 20px ${isVictory ? '#4ade80' : '#00cfff'}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {isVictory ? 'Tekrar Oyna' : 'Tekrar Dene'}
        </button>
      </div>
    </div>
  );
}; 