import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/Constants';
import { TowerSpot } from './TowerSpot';
import { stopEnemyWave, startContinuousSpawning, stopContinuousSpawning } from '../logic/EnemySpawner';
import { startGameLoop } from '../logic/GameLoop';
import { waveManager } from '../logic/WaveManager';
import { initUpgradeEffects } from '../logic/UpgradeEffects';
import { UpgradeScreen } from './game/UpgradeScreen';
import { playSound } from '../utils/sound';

export const GameBoard: React.FC = () => {
  const {
    towerSlots,
    enemies,
    bullets,
    effects,
    mines,
    gold,
    currentWave,
    enemiesKilled,
    enemiesRequired,
    isStarted,
    isGameOver,
    isRefreshing,
    setStarted,
    setRefreshing,
    resetGame,
    refreshBattlefield,
    nextWave,
    resetDice,
    totalEnemiesKilled,
    totalGoldSpent,
    fireUpgradesPurchased,
    shieldUpgradesPurchased,
    packagesPurchased,
    deployMines,
    frostEffectActive,
    energy,
    energyWarning,
    actionsRemaining,
    prepRemaining,
    isPreparing,
    isPaused,
    tickPreparation,
    pausePreparation,
    resumePreparation,
    speedUpPreparation,
    startPreparation,
    startWave,
  } = useGameStore();

  const clearEnergyWarning = useGameStore(s => s.clearEnergyWarning);
  React.useEffect(() => {
    if (!energyWarning) return;
    const t = setTimeout(() => clearEnergyWarning(), 1500);
    return () => clearTimeout(t);
  }, [energyWarning, clearEnergyWarning]);

  useEffect(() => {
    initUpgradeEffects();
  }, []);

  useEffect(() => {
    waveManager.setHandlers(
      () => {
        // Continuous spawning handles this
      },
      () => {
        setRefreshing(true);
        nextWave();
        resetDice();
      },
    );
  }, [currentWave, nextWave, resetDice, setRefreshing]);

  useEffect(() => {
    if (isPreparing) {
      waveManager.scheduleAutoStart(currentWave, GAME_CONSTANTS.PREP_TIME);
    } else {
      waveManager.cancelAutoStart();
    }
  }, [isPreparing, currentWave]);

  // Deploy mines at the start of each wave
  useEffect(() => {
    if (isStarted) {
      deployMines();
    }
  }, [currentWave, isStarted, deployMines]);

  // Counter-up animation hook
  const useAnimatedCounter = (endValue: number) => {
    const [count, setCount] = useState(0);
    const duration = 1000; // 1 second animation

    useEffect(() => {
      if (!isGameOver) return;
      let startTime: number | null = null;
      const animateCount = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const current = Math.min(Math.floor(progress / duration * endValue), endValue);
        setCount(current);
        if (progress < duration) {
          requestAnimationFrame(animateCount);
        }
      };
      requestAnimationFrame(animateCount);
    }, [endValue, isGameOver]);
    return count;
  };

  // Animated stats for the game over screen
  const animatedKills = useAnimatedCounter(totalEnemiesKilled);
  const animatedGold = useAnimatedCounter(totalGoldSpent);
  const animatedFire = useAnimatedCounter(fireUpgradesPurchased);
  const animatedShield = useAnimatedCounter(shieldUpgradesPurchased);
  const animatedPackages = useAnimatedCounter(packagesPurchased);

  // Start/reset logic
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F5' || e.key === 'r' || e.key === 'R') {
        resetGame();
        setStarted(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [resetGame, setStarted]);

  const loopStopper = useRef<(() => void) | null>(null);

  // Handle game loop start/stop based on game state and refresh screen
  useEffect(() => {
    if (!isStarted || isRefreshing || isPreparing) {
      stopEnemyWave();
      stopContinuousSpawning();
      loopStopper.current?.();
      loopStopper.current = null;
      return;
    }
    if (!loopStopper.current) {
      loopStopper.current = startGameLoop();
    }
    // Sürekli düşman yaratma sistemini başlat
    startContinuousSpawning();
    waveManager.startWave(currentWave);
    return () => {
      stopEnemyWave();
      stopContinuousSpawning();
      loopStopper.current?.();
      loopStopper.current = null;
    };
  }, [isStarted, isRefreshing, isPreparing, currentWave]);

  const warningPlayed = useRef(false);

  useEffect(() => {
    if (!isPreparing || isPaused) return;
    const id = setInterval(() => tickPreparation(1000), 1000);
    return () => clearInterval(id);
  }, [isPreparing, isPaused, tickPreparation]);

  useEffect(() => {
    if (isPreparing && prepRemaining <= GAME_CONSTANTS.PREP_WARNING_THRESHOLD && !warningPlayed.current) {
      playSound('warning');
      warningPlayed.current = true;
    }
    if (isPreparing && prepRemaining <= 0) {
      startWave();
    }
    if (!isPreparing) warningPlayed.current = false;
  }, [prepRemaining, isPreparing, startWave]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isPreparing) return;
      if (e.key === 'p' || e.key === 'P') {
        isPaused ? resumePreparation() : pausePreparation();
      }
      if (e.key === 'f' || e.key === 'F') {
        speedUpPreparation(GAME_CONSTANTS.PREP_TIME);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPreparing, isPaused, pausePreparation, resumePreparation, speedUpPreparation]);

  // SVG size
  const width = window.innerWidth;
  const height = window.innerHeight;

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', background: GAME_CONSTANTS.CANVAS_BG, overflow: 'hidden' }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0% { opacity: 0.3; transform: scale(1); }
            100% { opacity: 0.8; transform: scale(1.1); }
          }
          @keyframes mine-light-pulse {
            0% { fill-opacity: 0.4; transform: scale(0.8); }
            50% { fill-opacity: 1; transform: scale(1); }
            100% { fill-opacity: 0.4; transform: scale(0.8); }
          }
          @keyframes frost-overlay {
            0% { opacity: 0; filter: blur(0px); }
            50% { opacity: 0.7; filter: blur(2px); }
            100% { opacity: 0.4; filter: blur(1px); }
          }
          .game-over-card {
            animation: scale-up-center 0.4s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
          }
          @keyframes scale-up-center {
            0% { transform: scale(0.5); }
            100% { transform: scale(1); }
          }
        `}
      </style>
      {/* UI */}
      <div style={{ position: 'absolute', top: 24, left: 32, color: GAME_CONSTANTS.GOLD_COLOR, font: GAME_CONSTANTS.UI_FONT, textShadow: GAME_CONSTANTS.UI_SHADOW, zIndex: 2, display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '8px', fontSize: '24px' }}>💰</span> Gold: {gold}
      </div>
      <div style={{ position: 'absolute', top: 56, left: 32, color: '#00cfff', font: GAME_CONSTANTS.UI_FONT, textShadow: GAME_CONSTANTS.UI_SHADOW, zIndex: 2 }}>
        Energy: {energy} ({actionsRemaining} actions)
      </div>
      {energyWarning && (
        <div style={{ position: 'absolute', top: 80, left: 32, color: '#ff5555', font: GAME_CONSTANTS.UI_FONT, textShadow: GAME_CONSTANTS.UI_SHADOW, zIndex: 2 }}>
          {energyWarning}
        </div>
      )}
      <div style={{ position: 'absolute', top: 24, right: 32, color: '#00cfff', font: GAME_CONSTANTS.UI_FONT, textShadow: GAME_CONSTANTS.UI_SHADOW, zIndex: 2 }}>
        Wave: {currentWave}/100
      </div>
      
      {/* Wave Progress */}
      <div style={{ 
        position: 'absolute', 
        top: 80, 
        right: 32, 
        color: '#00cfff', 
        font: 'bold 16px Arial', 
        textShadow: GAME_CONSTANTS.UI_SHADOW, 
        zIndex: 2,
        background: 'rgba(0,0,0,0.5)',
        padding: '8px 12px',
        borderRadius: '8px',
        minWidth: '140px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '4px' }}>
          {enemiesKilled.toLocaleString()} / {enemiesRequired.toLocaleString()}
        </div>
        <div style={{
          width: '100%',
          height: '6px',
          background: '#333',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${Math.min(100, (enemiesKilled / enemiesRequired) * 100)}%`,
            height: '100%',
            background: '#00cfff',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {isPreparing && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          textAlign: 'center',
          color: '#fff',
        }}>
          <div style={{ marginBottom: 4 }}>
            Next wave in {Math.ceil(prepRemaining / 1000)}s{isPaused ? ' (paused)' : ''}
          </div>
          <div style={{ width: 200, height: 8, background: '#333', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              width: `${(prepRemaining / GAME_CONSTANTS.PREP_TIME) * 100}%`,
              height: '100%',
              background: prepRemaining < GAME_CONSTANTS.PREP_WARNING_THRESHOLD ? '#ff5555' : '#00cfff',
              transition: 'width 0.25s linear',
            }} />
          </div>
          <button onClick={() => speedUpPreparation(GAME_CONSTANTS.PREP_TIME)} style={{ marginTop: 8, padding: '4px 12px', cursor: 'pointer' }}>
            Start Wave
          </button>
        </div>
      )}

      {isRefreshing && <UpgradeScreen />}

      {/* Start Overlay */}
      {!isStarted && (
        <div
          onClick={() => { setStarted(true); startPreparation(); }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3,
            cursor: 'pointer',
            flexDirection: 'column',
          }}
        >
          <span style={{ color: '#00cfff', font: GAME_CONSTANTS.UI_FONT_BIG, fontWeight: 'bold', marginBottom: 32 }}>
            Shooter Tower Defense
          </span>
          <span style={{ color: '#fff', fontSize: 40, fontWeight: 'bold', background: 'rgba(0,0,0,0.5)', padding: '24px 48px', borderRadius: 16 }}>
            Tap to Start
          </span>
        </div>
      )}
      {/* SVG Game Area */}
      <svg width={width} height={height} style={{ display: 'block', position: 'absolute', top: 0, left: 0 }}>
        {/* Tower Slots */}
        {towerSlots.map((slot, i) => (
          <TowerSpot key={i} slot={slot} slotIdx={i} />
        ))}
        {/* Enemies */}
        {enemies.map((enemy) => (
          <g key={enemy.id}>
            <rect
              x={enemy.position.x - enemy.size / 2}
              y={enemy.position.y - enemy.size / 2 - 10}
              width={enemy.size}
              height={GAME_CONSTANTS.ENEMY_HEALTHBAR_HEIGHT}
              fill={GAME_CONSTANTS.HEALTHBAR_BG}
              rx={3}
            />
            <rect
              x={enemy.position.x - enemy.size / 2}
              y={enemy.position.y - enemy.size / 2 - 10}
              width={enemy.size * (enemy.health / enemy.maxHealth)}
              height={GAME_CONSTANTS.ENEMY_HEALTHBAR_HEIGHT}
              fill={enemy.health > enemy.maxHealth * 0.3 ? GAME_CONSTANTS.HEALTHBAR_GOOD : GAME_CONSTANTS.HEALTHBAR_BAD}
              rx={3}
            />
            {enemy.isSpecial ? (
              // Special microbe enemy with pulsing effect
              <>
                <circle
                  cx={enemy.position.x}
                  cy={enemy.position.y}
                  r={enemy.size / 2 + 4}
                  fill="none"
                  stroke={GAME_CONSTANTS.MICROBE_ENEMY.pulseColor}
                  strokeWidth={2}
                  opacity={0.6}
                  style={{
                    animation: 'pulse 1.5s ease-in-out infinite alternate'
                  }}
                />
                <circle
                  cx={enemy.position.x}
                  cy={enemy.position.y}
                  r={enemy.size / 2}
                  fill={enemy.color}
                  stroke={GAME_CONSTANTS.MICROBE_ENEMY.borderColor}
                  strokeWidth={3}
                />
                {/* Microbe indicator */}
                <text
                  x={enemy.position.x}
                  y={enemy.position.y + enemy.size / 2 + 15}
                  textAnchor="middle"
                  fill={GAME_CONSTANTS.MICROBE_ENEMY.color}
                  fontSize="12"
                  fontWeight="bold"
                >
                  💰
                </text>
              </>
            ) : (
              // Normal enemy
              <circle
                cx={enemy.position.x}
                cy={enemy.position.y}
                r={enemy.size / 2}
                fill={enemy.color}
                stroke="#b30000"
                strokeWidth={4}
              />
            )}
          </g>
        ))}
        {/* Bullets */}
        {bullets.map((bullet) => (
          <line
            key={bullet.id}
            x1={bullet.position.x - bullet.direction.x * bullet.size}
            y1={bullet.position.y - bullet.direction.y * bullet.size}
            x2={bullet.position.x + bullet.direction.x * bullet.size}
            y2={bullet.position.y + bullet.direction.y * bullet.size}
            stroke={bullet.color}
            strokeWidth={2}
          />
        ))}
        {/* Effects */}
        {effects.map((effect) => (
          <circle
            key={effect.id}
            cx={effect.position.x}
            cy={effect.position.y}
            r={(effect.radius * effect.life) / effect.maxLife}
            fill={effect.color}
            fillOpacity={effect.life / effect.maxLife}
            stroke="none"
          />
        ))}
        {/* Mines */}
        {mines.map((mine) => (
          <g key={mine.id} transform={`translate(${mine.position.x}, ${mine.position.y})`} style={{ pointerEvents: 'none' }}>
            {/* The horns of the mine */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
              <circle
                key={angle}
                cx={mine.size * 0.8 * Math.cos(angle * Math.PI / 180)}
                cy={mine.size * 0.8 * Math.sin(angle * Math.PI / 180)}
                r={mine.size * 0.25}
                fill={GAME_CONSTANTS.MINE_VISUALS.bodyColor}
              />
            ))}
            {/* The main body of the mine */}
            <circle
              cx="0"
              cy="0"
              r={mine.size * 0.75}
              fill={GAME_CONSTANTS.MINE_VISUALS.bodyColor}
              stroke={GAME_CONSTANTS.MINE_VISUALS.borderColor}
              strokeWidth={3}
            />
            {/* The pulsing light */}
            <circle
              cx="0"
              cy="0"
              r={mine.size * 0.3}
              fill={GAME_CONSTANTS.MINE_VISUALS.lightColor}
              style={{ animation: 'mine-light-pulse 2s ease-in-out infinite' }}
            />
          </g>
        ))}
      </svg>
      {/* Game Over Overlay */}
      {isGameOver && (
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
              border: `2px solid ${currentWave >= 100 ? '#4ade80' : '#ff3333'}`,
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              width: '90%',
              maxWidth: '500px',
              textAlign: 'center',
            }}
          >
            {currentWave >= 100 ? (
              // Victory Screen
              <>
                <h1 style={{ color: '#4ade80', fontSize: 48, margin: 0, padding: 0 }}>🏆 TEBRİKLER! 🏆</h1>
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
                <h1 style={{ color: '#ff3333', fontSize: 48, margin: 0, padding: 0 }}>💀 Oyun Bitti 💀</h1>
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
                  <div style={statCardStyle}><span>🌊</span><span>Ulaşılan Dalga</span><strong style={{ color: '#00cfff' }}>{currentWave}</strong></div>
                  <div style={statCardStyle}><span>☠️</span><span>Yok Edilen</span><strong style={{ color: '#ffcc00' }}>{animatedKills.toLocaleString()}</strong></div>
                  <div style={statCardStyle}><span>💰</span><span>Harcanan Altın</span><strong style={{ color: GAME_CONSTANTS.GOLD_COLOR }}>{animatedGold.toLocaleString()}</strong></div>
                  <div style={statCardStyle}><span>🔥</span><span>Ateş Yükseltme</span><strong style={{ color: '#ff4400' }}>{animatedFire}</strong></div>
                  <div style={statCardStyle}><span>🛡️</span><span>Kalkan Yükseltme</span><strong style={{ color: '#aa00ff' }}>{animatedShield}</strong></div>
                  <div style={statCardStyle}><span>🎁</span><span>Alınan Paket</span><strong style={{ color: '#4ade80' }}>{animatedPackages}</strong></div>
                </div>
              </>
            )}
            <button
              onClick={() => {
                resetGame();
                setStarted(false);
              }}
              style={{
                fontSize: 24,
                padding: '16px 48px',
                borderRadius: 12,
                background: currentWave >= 100 ? '#4ade80' : '#00cfff',
                color: '#fff',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 0 20px ${currentWave >= 100 ? '#4ade80' : '#00cfff'}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {currentWave >= 100 ? 'Tekrar Oyna' : 'Tekrar Dene'}
            </button>
          </div>
        </div>
      )}
      {/* Buz Efekti Overlay */}
      {frostEffectActive && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(135deg, rgba(0, 150, 255, 0.3), rgba(0, 200, 255, 0.2))',
          pointerEvents: 'none',
          zIndex: 10,
          animation: 'frost-overlay 2s ease-in-out infinite alternate',
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '48px',
            color: '#00ccff',
            textShadow: '0 0 20px #00ccff',
            fontWeight: 'bold',
            animation: 'pulse 1s ease-in-out infinite',
          }}>
            ❄️ ZAMAN DONDU ❄️
          </div>
        </div>
      )}
    </div>
  );
}; 

const statCardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  padding: '12px',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  color: '#aaa',
};