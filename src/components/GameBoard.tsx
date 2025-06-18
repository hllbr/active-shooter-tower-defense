import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/Constants';
import { TowerSpot } from './TowerSpot';
import { startEnemyWave, stopEnemyWave } from '../logic/EnemySpawner';
import { startGameLoop } from '../logic/GameLoop';

export const GameBoard: React.FC = () => {
  const {
    towerSlots,
    enemies,
    bullets,
    effects,
    gold,
    bulletLevel,
    currentWave,
    isStarted,
    isGameOver,
    setStarted,
    resetGame,
    nextWave,
    upgradeBullet,
    refreshBattlefield,
  } = useGameStore();

  const [isRefreshing, setRefreshing] = React.useState(false);
  const [upgradeBought, setUpgradeBought] = React.useState(false);

  useEffect(() => {
    if (!isRefreshing) return;
    const timeout = setTimeout(() => {
      const slotCount = Math.min(
        GAME_CONSTANTS.INITIAL_SLOT_COUNT + 2 * Math.floor(currentWave / 5),
        12,
      );
      refreshBattlefield(slotCount);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [isRefreshing, currentWave, refreshBattlefield]);

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
    if (!isStarted || isRefreshing) {
      stopEnemyWave();
      loopStopper.current?.();
      loopStopper.current = null;
      if (isRefreshing) setUpgradeBought(false);
      return;
    }
    if (!loopStopper.current) {
      startEnemyWave();
      loopStopper.current = startGameLoop();
    }
    return () => {
      stopEnemyWave();
      loopStopper.current?.();
      loopStopper.current = null;
    };
  }, [isStarted, isRefreshing]);

  // Auto next wave and refresh handling
  useEffect(() => {
    if (!isStarted || isRefreshing) return;
    if (enemies.length === 0) {
      if (currentWave % 5 === 0) {
        setRefreshing(true);
      } else {
        const timeout = setTimeout(() => {
          nextWave();
          startEnemyWave();
        }, 1200);
        return () => clearTimeout(timeout);
      }
    }
  }, [enemies, isStarted, nextWave, currentWave, isRefreshing]);

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
      {isRefreshing && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
          }}
        >
          <span style={{ color: '#00cfff', font: GAME_CONSTANTS.UI_FONT_BIG, fontWeight: 'bold', marginBottom: 24 }}>
            Savaş alanı yenileniyor...
          </span>
          <button
            onClick={() => {
              upgradeBullet();
              setUpgradeBought(true);
            }}
            disabled={
              upgradeBought ||
              bulletLevel >= GAME_CONSTANTS.BULLET_TYPES.length ||
              gold < GAME_CONSTANTS.BULLET_UPGRADE_COST
            }
            style={{ marginBottom: 16, padding: '12px 24px', fontSize: 24, borderRadius: 12, background: '#0077ff', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            {`Yeni Ateş: ${GAME_CONSTANTS.BULLET_TYPES[bulletLevel]?.name || ''}`} ({GAME_CONSTANTS.BULLET_UPGRADE_COST})
          </button>
          <button
            onClick={() => {
              setRefreshing(false);
              nextWave();
              startEnemyWave();
            }}
            style={{ padding: '12px 24px', fontSize: 24, borderRadius: 12, background: '#4ade80', color: '#000', border: 'none', cursor: 'pointer' }}
          >
            Devam Et
          </button>
        </div>
      )}
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
            <circle
              cx={enemy.position.x}
              cy={enemy.position.y}
              r={enemy.size / 2}
              fill={enemy.color}
              stroke="#b30000"
              strokeWidth={4}
            />
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
      </svg>
      {/* Game Over Overlay */}
      {isGameOver && (
        <div
          className="fade-in"
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
          <span style={{ color: '#ff3333', font: GAME_CONSTANTS.UI_FONT_BIG, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' }}>
            Seni savunacak hiç kulen kalmadı. Yarın yine deneriz.
          </span>
          <button
            onClick={() => { resetGame(); setStarted(false); }}
            style={{ fontSize: 32, padding: '16px 32px', borderRadius: 12, background: '#00cfff', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Tekrar Dene
          </button>
        </div>
      )}
    </div>
  );
}; 