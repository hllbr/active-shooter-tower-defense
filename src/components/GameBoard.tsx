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
    purchaseShield,
    refreshBattlefield,
    diceRoll,
    diceUsed,
    discountMultiplier,
    isDiceRolling,
    rollDice,
    resetDice,
  } = useGameStore();

  const [isRefreshing, setRefreshing] = React.useState(false);
  const [diceAnimation, setDiceAnimation] = React.useState(0);

  const getDiceFace = (roll: number | null): string => {
    if (!roll) return '';
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return faces[roll - 1];
  };

  useEffect(() => {
    if (!isRefreshing) return;
    if (currentWave % 5 === 0) {
      const timeout = setTimeout(() => {
        const slotCount = Math.min(
          GAME_CONSTANTS.INITIAL_SLOT_COUNT + 2 * Math.floor(currentWave / 5),
          12,
        );
        refreshBattlefield(slotCount);
      }, 1000);
      return () => clearTimeout(timeout);
    }
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
  const waveActive = useRef(false);
  useEffect(() => {
    if (!isStarted || isRefreshing) return;
    if (enemies.length > 0) {
      waveActive.current = true;
    } else if (waveActive.current) {
      waveActive.current = false;
      setRefreshing(true);
    }
  }, [enemies, isStarted, isRefreshing]);

  // Zar animasyonu için useEffect
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
        `}
      </style>
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
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
          }}
        >
          <div
            style={{
              background: GAME_CONSTANTS.CANVAS_BG,
              color: '#ffffff',
              padding: 32,
              borderRadius: 16,
              width: 600,
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              textAlign: 'center',
              overflowY: 'auto',
              border: `2px solid ${GAME_CONSTANTS.GOLD_COLOR}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
            }}
          >
            <span style={{ fontWeight: 'bold', fontSize: 28, marginBottom: 8, color: GAME_CONSTANTS.GOLD_COLOR }}>
              Yükseltmeler
            </span>
            
            {/* Zar Sistemi */}
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
                    • 3 ve altı: İndirimler iptal edilir<br/>
                    • 4-6: Mevcut indirim + %50-150 daha fazla<br/>
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
            
            {/* Ateş Güçleri */}
            <div style={{ width: '100%' }}>
              <span style={{ fontWeight: 'bold', fontSize: 18, color: GAME_CONSTANTS.GOLD_COLOR, marginBottom: 12, display: 'block' }}>
                🔥 Ateş Güçleri
              </span>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 12
              }}>
                {GAME_CONSTANTS.BULLET_TYPES.map((bullet, i) => {
                  const isAcquired = i < bulletLevel;
                  const isPurchasable = i === bulletLevel;
                  const isDisabledByGold = isPurchasable && gold < GAME_CONSTANTS.BULLET_UPGRADE_COST;
                  const isLocked = i > bulletLevel;

                  let borderColor = '#444';
                  let bgColor = '#1a1a1a';
                  let titleColor = '#888';
                  let boxShadow = 'none';
                  let cursor = 'default';
                  
                  if (isAcquired) {
                    borderColor = '#4ade80';
                    bgColor = 'rgba(74, 222, 128, 0.1)';
                    titleColor = '#4ade80';
                  } else if (isPurchasable) {
                    borderColor = isDisabledByGold ? '#444' : bullet.color;
                    bgColor = isDisabledByGold ? '#1a1a1a' : `rgba(${parseInt(bullet.color.slice(1,3), 16)}, ${parseInt(bullet.color.slice(3,5), 16)}, ${parseInt(bullet.color.slice(5,7), 16)}, 0.1)`;
                    titleColor = isDisabledByGold ? '#888' : bullet.color;
                    boxShadow = isDisabledByGold ? 'none' : `0 4px 16px rgba(${parseInt(bullet.color.slice(1,3), 16)}, ${parseInt(bullet.color.slice(3,5), 16)}, ${parseInt(bullet.color.slice(5,7), 16)}, 0.3)`;
                    cursor = isDisabledByGold ? 'not-allowed' : 'pointer';
                  }
                  
                  return (
                    <div
                      key={i}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        border: `2px solid ${borderColor}`,
                        background: bgColor,
                        opacity: isLocked ? 0.4 : 1,
                        cursor,
                        transition: 'all 0.2s ease',
                        boxShadow,
                        position: 'relative'
                      }}
                      onClick={() => {
                        if (isPurchasable && !isDisabledByGold) {
                          upgradeBullet();
                        }
                      }}
                    >
                      {isAcquired && (
                        <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 20, color: '#4ade80' }}>
                          ✔
                        </div>
                      )}
                      {isLocked && (
                         <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 20, color: '#888' }}>
                          🔒
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{
                          fontWeight: 'bold',
                          fontSize: 16,
                          color: titleColor
                        }}>
                          {bullet.name}
                        </span>
                        {isPurchasable && (
                          <span style={{
                            fontWeight: 'bold',
                            fontSize: 14,
                            color: gold >= GAME_CONSTANTS.BULLET_UPGRADE_COST ? GAME_CONSTANTS.GOLD_COLOR : '#ff4444'
                          }}>
                            {GAME_CONSTANTS.BULLET_UPGRADE_COST} 💰
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontSize: 12,
                        color: '#aaa',
                        textAlign: 'left'
                      }}>
                        {bullet.freezeDuration 
                          ? `Düşmanları ${bullet.freezeDuration / 1000}sn yavaşlatır`
                          : `Hasar: x${bullet.damageMultiplier}, Hız: x${bullet.speedMultiplier}`
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Avantajlı Paketler */}
            <div style={{ width: '100%' }}>
              <span style={{ fontWeight: 'bold', fontSize: 18, color: GAME_CONSTANTS.GOLD_COLOR, marginBottom: 12, display: 'block' }}>
                🎁 Avantajlı Paketler
              </span>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: 12 
              }}>
                {GAME_CONSTANTS.UPGRADE_PACKAGES.map((pkg, i) => {
                  const canUpgrade = bulletLevel < pkg.bulletLevel;
                  
                  // Zar sistemine göre dinamik fiyat hesaplama
                  let finalCost = pkg.discountedCost;
                  let discountPercent = Math.round(((pkg.originalCost - pkg.discountedCost) / pkg.originalCost) * 100);
                  
                  if (discountMultiplier === 0) {
                    // İndirimler iptal edildi
                    finalCost = pkg.originalCost;
                    discountPercent = 0;
                  } else if (discountMultiplier > 1) {
                    // Ek indirim
                    const baseDiscount = pkg.originalCost - pkg.discountedCost;
                    const extraDiscount = baseDiscount * (discountMultiplier - 1);
                    finalCost = Math.max(0, pkg.discountedCost - extraDiscount);
                    discountPercent = Math.round(((pkg.originalCost - finalCost) / pkg.originalCost) * 100);
                  }
                  
                  const isDisabledWithDice = gold < finalCost || bulletLevel >= pkg.bulletLevel;
                  const canAffordWithDice = gold >= finalCost;
                  
                  return (
                    <div
                      key={i}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        border: `2px solid ${isDisabledWithDice ? '#444' : pkg.color}`,
                        background: isDisabledWithDice ? '#1a1a1a' : `rgba(${parseInt(pkg.color.slice(1,3), 16)}, ${parseInt(pkg.color.slice(3,5), 16)}, ${parseInt(pkg.color.slice(5,7), 16)}, 0.1)`,
                        opacity: isDisabledWithDice ? 0.6 : 1,
                        cursor: isDisabledWithDice ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isDisabledWithDice ? 'none' : `0 4px 16px rgba(${parseInt(pkg.color.slice(1,3), 16)}, ${parseInt(pkg.color.slice(3,5), 16)}, ${parseInt(pkg.color.slice(5,7), 16)}, 0.3)`,
                        position: 'relative',
                      }}
                      onClick={() => {
                        if (!isDisabledWithDice) {
                          // Ateş yükseltmesi
                          for (let j = bulletLevel; j < pkg.bulletLevel; j++) {
                            upgradeBullet();
                          }
                          // Kalkan satın al
                          purchaseShield(pkg.shieldIndex);
                        }
                      }}
                    >
                      {/* İndirim Etiketi */}
                      <div style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        background: discountMultiplier === 0 ? '#ff4444' : discountMultiplier > 1 ? '#4ade80' : '#ffaa00',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 'bold',
                        padding: '4px 8px',
                        borderRadius: 8,
                        border: '2px solid #fff',
                      }}>
                        -{discountPercent}%
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ 
                          fontWeight: 'bold', 
                          fontSize: 18, 
                          color: isDisabledWithDice ? '#888' : pkg.color
                        }}>
                          {pkg.name}
                        </span>
                        <span style={{ 
                          fontWeight: 'bold', 
                          fontSize: 16, 
                          color: canAffordWithDice ? GAME_CONSTANTS.GOLD_COLOR : '#ff4444' 
                        }}>
                          {Math.round(finalCost as number)} 💰
                        </span>
                      </div>
                      
                      <div style={{ fontSize: 14, color: '#aaa', textAlign: 'left', marginBottom: 8 }}>
                        {pkg.description}
                      </div>
                      
                      <div style={{ 
                        fontSize: 12, 
                        color: isDisabledWithDice ? '#888' : '#666',
                        textAlign: 'left',
                        textDecoration: 'line-through'
                      }}>
                        Normal fiyat: {pkg.originalCost} 💰
                      </div>
                      
                      {!canUpgrade && (
                        <div style={{ 
                          fontSize: 12, 
                          color: '#ffaa00',
                          textAlign: 'left',
                          marginTop: 4
                        }}>
                          ⚠️ Bu ateş seviyesine zaten sahipsiniz
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shield Cards */}
            <div style={{ width: '100%' }}>
              <span style={{ fontWeight: 'bold', fontSize: 18, color: GAME_CONSTANTS.GOLD_COLOR, marginBottom: 12, display: 'block' }}>
                Kalkanlar
              </span>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: 12 
              }}>
                {GAME_CONSTANTS.WALL_SHIELDS.map((shield, i) => {
                  const isDisabled = gold < shield.cost;
                  const shieldColor = isDisabled ? '#444' : '#aa00ff';
                  return (
                    <div
                      key={i}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        border: `2px solid ${shieldColor}`,
                        background: isDisabled ? '#1a1a1a' : 'rgba(170, 0, 255, 0.1)',
                        opacity: isDisabled ? 0.6 : 1,
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isDisabled ? 'none' : '0 2px 8px rgba(170, 0, 255, 0.2)',
                      }}
                      onClick={() => {
                        if (!isDisabled) {
                          purchaseShield(i);
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ 
                          fontWeight: 'bold', 
                          fontSize: 16, 
                          color: isDisabled ? '#888' : shieldColor
                        }}>
                          {shield.name}
                        </span>
                        <span style={{ 
                          fontWeight: 'bold', 
                          fontSize: 14, 
                          color: isDisabled ? '#888' : GAME_CONSTANTS.GOLD_COLOR
                        }}>
                          {shield.cost} 💰
                        </span>
                      </div>
                      <div style={{ 
                        fontSize: 12, 
                        color: isDisabled ? '#888' : '#aaa',
                        textAlign: 'left' 
                      }}>
                        +{shield.strength} Kalkan Gücü
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                setRefreshing(false);
                nextWave();
                startEnemyWave();
                resetDice();
              }}
              style={{ 
                padding: '12px 24px', 
                fontSize: 24, 
                borderRadius: 12, 
                background: '#4ade80', 
                color: '#000', 
                border: 'none', 
                cursor: 'pointer',
                marginTop: 16,
                fontWeight: 'bold',
                boxShadow: '0 4px 16px rgba(74, 222, 128, 0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              Devam Et
            </button>
          </div>
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