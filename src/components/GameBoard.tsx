import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/Constants';
import { TowerSpot } from './TowerSpot';
import { startEnemyWave } from '../logic/EnemySpawner';
import { startGameLoop } from '../logic/GameLoop';

export const GameBoard: React.FC = () => {
  const {
    towerSlots,
    enemies,
    bullets,
    effects,
    gold,
    currentWave,
    isStarted,
    isGameOver,
    setStarted,
    resetGame,
    nextWave,
  } = useGameStore();

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

  // Start game loops when game begins
  useEffect(() => {
    if (!isStarted) return;
    startEnemyWave();
    loopStopper.current = startGameLoop();
    return () => {
      loopStopper.current?.();
      loopStopper.current = null;
    };
  }, [isStarted]);

  // Auto next wave
  useEffect(() => {
    if (!isStarted) return;
    if (enemies.length === 0) {
      const timeout = setTimeout(() => {
        nextWave();
        startEnemyWave();
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [enemies, isStarted, nextWave]);

  // SVG size
  const width = window.innerWidth;
  const height = window.innerHeight;

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', background: GAME_CONSTANTS.CANVAS_BG, overflow: 'hidden' }}>
      {/* UI */}
      <div style={{ position: 'absolute', top: 24, left: 32, color: GAME_CONSTANTS.GOLD_COLOR, font: GAME_CONSTANTS.UI_FONT, textShadow: GAME_CONSTANTS.UI_SHADOW, zIndex: 2 }}>
        Gold: {gold}
      </div>
      <div style={{ position: 'absolute', top: 24, right: 32, color: '#00cfff', font: GAME_CONSTANTS.UI_FONT, textShadow: GAME_CONSTANTS.UI_SHADOW, zIndex: 2 }}>
        Wave: {currentWave}
      </div>
      {/* Start Overlay */}
      {!isStarted && (
        <div
          onClick={() => setStarted(true)}
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
          <circle
            key={enemy.id}
            cx={enemy.position.x}
            cy={enemy.position.y}
            r={enemy.size / 2}
            fill={enemy.color}
            stroke="#b30000"
            strokeWidth={4}
          />
        ))}
        {/* Bullets */}
        {bullets.map((bullet) => (
          <circle
            key={bullet.id}
            cx={bullet.position.x}
            cy={bullet.position.y}
            r={bullet.size / 2}
            fill={bullet.color}
            stroke="#b3b300"
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 4,
            flexDirection: 'column',
          }}
        >
          <span style={{ color: '#ff3333', font: GAME_CONSTANTS.UI_FONT_BIG, fontWeight: 'bold', marginBottom: 32 }}>
            GAME OVER
          </span>
          <button onClick={() => { resetGame(); setStarted(false); }} style={{ fontSize: 32, padding: '16px 32px', borderRadius: 12, background: '#00cfff', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            Restart
          </button>
        </div>
      )}
    </div>
  );
}; 