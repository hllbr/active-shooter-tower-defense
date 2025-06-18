import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/Constants';
import { TowerSpot } from './TowerSpot';
import { TowerStats } from './TowerStats';
import { startEnemyWave, stopEnemyWave } from '../logic/EnemySpawner';
import { startGameLoop, stopGameLoop } from '../logic/GameLoop';

// Utility to interpolate color from light green to dark blue based on health ratio
function getHealthBarColor(ratio: number) {
  // Light green: #00ff00, Dark blue: #003366
  const start = { r: 0, g: 255, b: 0 };
  const end = { r: 0, g: 51, b: 102 };
  const r = Math.round(start.r + (end.r - start.r) * ratio);
  const g = Math.round(start.g + (end.g - start.g) * ratio);
  const b = Math.round(start.b + (end.b - start.b) * ratio);
  return `rgb(${r},${g},${b})`;
}

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
    upgradeBullet,
    purchaseShield,
    refreshBattlefield,
  } = useGameStore();

  const [refreshing, setRefreshing] = React.useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle continue button click
  const handleContinue = () => {
    const slotCount = Math.min(
      GAME_CONSTANTS.TOWER_SLOTS.length,
      GAME_CONSTANTS.INITIAL_SLOT_COUNT + Math.floor(currentWave / 5)
    );
    refreshBattlefield(slotCount);
    setRefreshing(false);
    setStarted(true);
    startGameLoop();
    startEnemyWave();
  };

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
    if (!isStarted || refreshing) {
      stopEnemyWave();
      loopStopper.current?.();
      loopStopper.current = null;
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
  }, [isStarted, refreshing]);

  // Auto next wave and refresh handling
  useEffect(() => {
    if (!isStarted || refreshing) return;
    
    // Only check for wave completion if enemies have been spawned
    const hasSpawnedEnemies = enemies.length > 0 || currentWave === 0;
    const allEnemiesDefeated = enemies.length === 0;
    
    if (hasSpawnedEnemies && allEnemiesDefeated && currentWave > 0) {
      setRefreshing(true);
      stopGameLoop();
    }
  }, [enemies, isStarted, refreshing, currentWave]);

  // Game loop setup
  useEffect(() => {
    if (!isStarted) {
      stopGameLoop();
      return;
    }
    
    startGameLoop();
    return () => stopGameLoop();
  }, [isStarted]);

  // Start game handler
  const handleStartGame = () => {
    setStarted(true);
    startGameLoop();
    startEnemyWave();
  };

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
      {/* Battlefield refresh screen */}
      {refreshing && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Wave {currentWave} Tamamlandı!</h2>
              <p>Kulelerinizi ve savunmanızı güçlendirin</p>
            </div>

            <div className="modal-body">
              {/* Tower upgrades */}
              <div className="upgrade-section">
                <h3>🏰 Kuleler</h3>
                {towerSlots.map((slot, idx) => slot.tower && (
                  <div key={`tower-${idx}`} className="tower-card">
                    <TowerStats tower={slot.tower} slotIdx={idx} />
                  </div>
                ))}
              </div>

              {/* Global shield upgrades */}
              <div className="shield-section">
                <h3>🛡️ Kalkanlar</h3>
                <div className="shield-list">
                  {GAME_CONSTANTS.WALL_SHIELDS.map((shield, idx) => (
                    <button
                      key={shield.name}
                      onClick={() => purchaseShield(idx)}
                      disabled={gold < shield.cost}
                      className={`shield-button ${gold >= shield.cost ? 'available' : 'disabled'}`}
                    >
                      {shield.name} (+{shield.strength}) ({shield.cost})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="continue-button" onClick={handleContinue}>
                Devam Et
              </button>
            </div>
          </div>

          <style jsx>{`
            .modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.85);
              display: flex;
              justify-content: center;
              align-items: center;
              z-index: 1000;
            }

            .modal-content {
              background: #1a202c;
              border-radius: 16px;
              border: 2px solid #2d3748;
              width: 90%;
              max-width: 1200px;
              max-height: 90vh;
              display: flex;
              flex-direction: column;
              position: relative;
              color: white;
            }

            .modal-header {
              padding: 24px;
              text-align: center;
              border-bottom: 2px solid #2d3748;
            }

            .modal-header h2 {
              margin: 0;
              color: #48bb78;
              font-size: 28px;
            }

            .modal-header p {
              margin: 8px 0 0;
              color: #a0aec0;
              font-size: 16px;
            }

            .modal-body {
              padding: 24px;
              overflow-y: auto;
              max-height: calc(90vh - 200px);
            }

            .upgrade-section, .shield-section {
              margin-bottom: 32px;
            }

            .upgrade-section h3, .shield-section h3 {
              margin: 0 0 16px;
              color: #90cdf4;
              font-size: 20px;
            }

            .tower-card {
              margin-bottom: 16px;
            }

            .shield-list {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
              gap: 12px;
            }

            .shield-button {
              padding: 12px;
              border-radius: 8px;
              border: none;
              font-size: 14px;
              cursor: pointer;
              transition: all 0.2s;
              text-align: center;
            }

            .shield-button.available {
              background: #d69e2e;
              color: white;
            }

            .shield-button.available:hover {
              background: #b7791f;
              transform: translateY(-1px);
            }

            .shield-button.disabled {
              background: #4a5568;
              color: #a0aec0;
              cursor: not-allowed;
            }

            .modal-footer {
              padding: 24px;
              border-top: 2px solid #2d3748;
              text-align: center;
            }

            .continue-button {
              padding: 12px 32px;
              font-size: 18px;
              font-weight: bold;
              background: #48bb78;
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s;
            }

            .continue-button:hover {
              background: #38a169;
              transform: translateY(-1px);
            }
          `}</style>
        </div>
      )}
      {/* Start Overlay */}
      {!isStarted && (
        <div
          onClick={handleStartGame}
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
              width={enemy.size}
              height={GAME_CONSTANTS.ENEMY_HEALTHBAR_HEIGHT}
              fill={getHealthBarColor(1 - (enemy.health / enemy.maxHealth))}
              rx={3}
            />
            <rect
              x={enemy.position.x - enemy.size / 2}
              y={enemy.position.y - enemy.size / 2 - 10}
              width={enemy.size * (enemy.health / enemy.maxHealth)}
              height={GAME_CONSTANTS.ENEMY_HEALTHBAR_HEIGHT}
              fill="transparent"
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
        {bullets.map((bullet) => {
          // Eğer renk bir dizi ise ilkini kullan
          const color = Array.isArray(bullet.color) ? bullet.color[0] : bullet.color;
          // Farklı efektler için farklı SVG elemanları kullanılabilir
          if (bullet.special === 'beam') {
            // Kalın ve parlak bir çizgi
            return (
              <line
                key={bullet.id}
                x1={bullet.position.x - bullet.direction.x * bullet.size}
                y1={bullet.position.y - bullet.direction.y * bullet.size}
                x2={bullet.position.x + bullet.direction.x * bullet.size * 2}
                y2={bullet.position.y + bullet.direction.y * bullet.size * 2}
                stroke={color}
                strokeWidth={8}
                opacity={0.8}
                filter="url(#glow)"
              />
            );
          }
          if (bullet.special === 'zigzag') {
            // Yıldırım efekti için kısa bir zigzag çizgi
            const x1 = bullet.position.x - bullet.direction.x * bullet.size;
            const y1 = bullet.position.y - bullet.direction.y * bullet.size;
            const x2 = bullet.position.x + bullet.direction.x * bullet.size;
            const y2 = bullet.position.y + bullet.direction.y * bullet.size;
            return (
              <polyline
                key={bullet.id}
                points={`
                  ${x1},${y1}
                  ${(x1 + x2) / 2 + 5},${(y1 + y2) / 2 - 5}
                  ${x2},${y2}
                `}
                fill="none"
                stroke={color}
                strokeWidth={4}
                opacity={0.9}
              />
            );
          }
          // Diğerleri için standart çizgi
          return (
            <line
              key={bullet.id}
              x1={bullet.position.x - bullet.direction.x * bullet.size}
              y1={bullet.position.y - bullet.direction.y * bullet.size}
              x2={bullet.position.x + bullet.direction.x * bullet.size}
              y2={bullet.position.y + bullet.direction.y * bullet.size}
              stroke={color}
              strokeWidth={4}
              opacity={0.85}
            />
          );
        })}
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
            You have no towers left to defend you. Try again tomorrow.
          </span>
          <button
            onClick={() => { resetGame(); setStarted(false); }}
            style={{ fontSize: 32, padding: '16px 32px', borderRadius: 12, background: '#00cfff', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}; 