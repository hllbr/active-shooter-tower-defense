import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../models/store';

import { GAME_CONSTANTS } from '../utils/Constants';
import { TowerSpot } from './TowerSpot';
import { stopEnemyWave, startContinuousSpawning, stopContinuousSpawning } from '../logic/EnemySpawner';
import { startGameLoop } from '../logic/GameLoop';
import { waveManager } from '../logic/WaveManager';
import { initUpgradeEffects } from '../logic/UpgradeEffects';
import { UpgradeScreen } from './game/UpgradeScreen';
import { playSound, startBackgroundMusic, stopBackgroundMusic } from '../utils/sound';

// Drag state for tower relocation
interface DragState {
  isDragging: boolean;
  draggedTowerSlotIdx: number | null;
  dragOffset: { x: number; y: number };
  mousePosition: { x: number; y: number };
}

export const GameBoard: React.FC = () => {
  const {
    towerSlots,
    towers,
    maxTowers,
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
    moveTower,
    tickEnergyRegen,
    maxEnergy,
    tickActionRegen,
    actionRegenTime,
    maxActions,
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

  // Redeploy mines when window size changes to keep them visible
  useEffect(() => {
    if (!isStarted) return;
    
    const handleResize = () => {
      // Mayınları yeniden konumlandır (ekran boyutu değişirse)
      if (mines.length > 0) {
        deployMines();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isStarted, mines.length, deployMines]);

  // Enerji rejenerasyonu timer'ı - 5 saniye intervals
  useEffect(() => {
    if (!isStarted || isPaused) return;
    
    const energyTimer = setInterval(() => {
      tickEnergyRegen(5000); // Her 5 saniye, precision hatalarını azaltmak için
    }, 5000);
    
    return () => clearInterval(energyTimer);
  }, [isStarted, isPaused, tickEnergyRegen]);

  // Action rejenerasyonu timer'ı
  useEffect(() => {
    if (!isStarted || isPaused) return;
    
    const actionTimer = setInterval(() => {
      tickActionRegen(1000); // Her saniye
    }, 1000);
    
    return () => clearInterval(actionTimer);
  }, [isStarted, isPaused, tickActionRegen]);

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
    }, [endValue]);
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
      // 🎵 Background müzik başlat
      startBackgroundMusic();
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
        if (isPaused) {
          resumePreparation();
        } else {
          pausePreparation();
        }
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

  // Drag state for tower relocation
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedTowerSlotIdx: null,
    dragOffset: { x: 0, y: 0 },
    mousePosition: { x: 0, y: 0 },
  });

  // Debug message state
  const [debugMessage, setDebugMessage] = useState<string>('');

  // Clear debug message after 3 seconds
  useEffect(() => {
    if (debugMessage) {
      const timer = setTimeout(() => setDebugMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [debugMessage]);

  // Drag handlers for tower relocation
  const handleTowerDragStart = (slotIdx: number, event: React.MouseEvent) => {
    const slot = towerSlots[slotIdx];
    if (!slot.tower || !isStarted || isRefreshing || isPreparing) return;
    
    // Check if tower can be relocated (cooldown check)
    const now = performance.now();
    if (slot.tower.lastRelocated && now - slot.tower.lastRelocated < GAME_CONSTANTS.RELOCATE_COOLDOWN) {
      // Show cooldown message
      setDebugMessage(`Kule ${Math.ceil((GAME_CONSTANTS.RELOCATE_COOLDOWN - (now - slot.tower.lastRelocated)) / 1000)} saniye sonra taşınabilir`);
      return;
    }

    // Check if player has enough energy
    if (energy < GAME_CONSTANTS.ENERGY_COSTS.relocateTower) {
      setDebugMessage("Yetersiz enerji! Kule taşımak için 15 enerji gerekli.");
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const svgElement = (event.currentTarget as SVGElement).closest('svg');
    if (!svgElement) return;
    
    const svgRect = svgElement.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;

    setDebugMessage(`${slot.tower.towerType === 'economy' ? 'Ekonomi' : 'Saldırı'} kulesi taşınıyor...`);

    setDragState({
      isDragging: true,
      draggedTowerSlotIdx: slotIdx,
      dragOffset: {
        x: mouseX - slot.x,
        y: mouseY - slot.y,
      },
      mousePosition: { x: mouseX, y: mouseY },
    });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!dragState.isDragging) return;
    
    event.preventDefault();
    const svgElement = event.currentTarget as SVGElement;
    const svgRect = svgElement.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;

    setDragState(prev => ({
      ...prev,
      mousePosition: { x: mouseX, y: mouseY },
    }));
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    if (!dragState.isDragging || dragState.draggedTowerSlotIdx === null) return;

    event.preventDefault();
    const svgElement = event.currentTarget as SVGElement;
    const svgRect = svgElement.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;

    // Find the target slot under the mouse with increased detection radius
    let targetSlotIdx = -1;
    let minDistance = Infinity;
    const detectionRadius = GAME_CONSTANTS.TOWER_SIZE * 2; // Daha büyük detection area

    towerSlots.forEach((slot, idx) => {
      if (idx === dragState.draggedTowerSlotIdx) return; // Can't drop on itself
      if (!slot.unlocked || slot.tower) return; // Must be unlocked and empty

      const distance = Math.sqrt(
        Math.pow(mouseX - slot.x, 2) + Math.pow(mouseY - slot.y, 2)
      );

      // Check if mouse is within the enlarged detection area
      if (distance <= detectionRadius && distance < minDistance) {
        minDistance = distance;
        targetSlotIdx = idx;
      }
    });

    // Perform the move if valid target found
    if (targetSlotIdx !== -1) {
      setDebugMessage("Kule başarıyla taşındı!");
      moveTower(dragState.draggedTowerSlotIdx, targetSlotIdx);
    } else {
      setDebugMessage("Geçersiz hedef! Kule boş bir slota taşınmalı.");
    }

    // Reset drag state
    setDragState({
      isDragging: false,
      draggedTowerSlotIdx: null,
      dragOffset: { x: 0, y: 0 },
      mousePosition: { x: 0, y: 0 },
    });
  };

  const [showTooltip, setShowTooltip] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  
  // Animation States
  const unlockingSlots = useGameStore(s => s.unlockingSlots);
  
  // Screen shake effect when slot unlocks
  useEffect(() => {
    if (unlockingSlots.size > 0) {
      setScreenShake(true);
      const timer = setTimeout(() => setScreenShake(false), 600);
      return () => clearTimeout(timer);
    }
  }, [unlockingSlots]);

  // Tab tuşu ile tooltip açma/kapama
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault(); // Tab'ın normal davranışını engelle
        setShowTooltip(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setShowTooltip(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      width: '100vw', 
      height: '100vh', 
      background: GAME_CONSTANTS.CANVAS_BG, 
      overflow: 'hidden',
      animation: screenShake ? 'screen-shake 0.6s ease-in-out' : 'none'
    }}>
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
          @keyframes shine {
            0% { left: -50%; }
            100% { left: 100%; }
          }
          
          /* 🎬 SLOT UNLOCK ANIMATIONS */
          @keyframes lock-shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
            20%, 40%, 60%, 80% { transform: translateX(2px); }
          }
          @keyframes lock-break {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.1); }
            100% { opacity: 0; transform: scale(1.3); }
          }
          @keyframes slot-crack {
            0% { stroke-dasharray: 0, 100; opacity: 0; }
            50% { stroke-dasharray: 50, 100; opacity: 1; }
            100% { stroke-dasharray: 100, 100; opacity: 0.7; }
          }
          @keyframes golden-burst {
            0% { 
              opacity: 0; 
              transform: scale(0.1); 
              fill: #FFD700;
            }
            50% { 
              opacity: 1; 
              transform: scale(1.5); 
              fill: #FFA500;
            }
            100% { 
              opacity: 0; 
              transform: scale(2); 
              fill: #FF6B35;
            }
          }
          @keyframes slot-reveal {
            0% { 
              transform: translateY(10px) scale(0.8);
              opacity: 0;
            }
            100% { 
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
          
          /* 🎆 AŞAMA 2: Parçacık & Dalga Efektleri */
          @keyframes particle-burst-1 {
            0% { 
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            100% { 
              transform: translate(-30px, -30px) scale(0.1);
              opacity: 0;
            }
          }
          @keyframes particle-burst-2 {
            0% { 
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            100% { 
              transform: translate(30px, -30px) scale(0.1);
              opacity: 0;
            }
          }
          @keyframes particle-burst-3 {
            0% { 
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            100% { 
              transform: translate(-30px, 30px) scale(0.1);
              opacity: 0;
            }
          }
          @keyframes particle-burst-4 {
            0% { 
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            100% { 
              transform: translate(30px, 30px) scale(0.1);
              opacity: 0;
            }
          }
          @keyframes particle-burst-5 {
            0% { 
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            100% { 
              transform: translate(0, -40px) scale(0.1);
              opacity: 0;
            }
          }
          @keyframes particle-burst-6 {
            0% { 
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            100% { 
              transform: translate(40px, 0) scale(0.1);
              opacity: 0;
            }
          }
          @keyframes particle-burst-7 {
            0% { 
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            100% { 
              transform: translate(0, 40px) scale(0.1);
              opacity: 0;
            }
          }
          @keyframes particle-burst-8 {
            0% { 
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            100% { 
              transform: translate(-40px, 0) scale(0.1);
              opacity: 0;
            }
          }
          @keyframes radial-wave {
            0% { 
              r: 10;
              stroke-width: 4;
              opacity: 1;
            }
            50% { 
              r: 50;
              stroke-width: 2;
              opacity: 0.6;
            }
            100% { 
              r: 80;
              stroke-width: 0;
              opacity: 0;
            }
          }
          @keyframes screen-shake {
            0%, 100% { transform: translate(0, 0); }
            10% { transform: translate(-1px, -1px); }
            20% { transform: translate(1px, -1px); }
            30% { transform: translate(-1px, 1px); }
            40% { transform: translate(1px, 1px); }
            50% { transform: translate(-1px, -1px); }
            60% { transform: translate(1px, -1px); }
            70% { transform: translate(-1px, 1px); }
            80% { transform: translate(1px, 1px); }
            90% { transform: translate(-1px, -1px); }
          }
          
          /* 🎊 AŞAMA 3: Slot Reveal & Celebration */
          @keyframes slot-emerge {
            0% { 
              transform: translateY(15px) scale(0.7);
              opacity: 0;
              filter: blur(2px);
            }
            30% { 
              transform: translateY(5px) scale(0.9);
              opacity: 0.6;
              filter: blur(1px);
            }
            100% { 
              transform: translateY(0) scale(1);
              opacity: 1;
              filter: blur(0px);
            }
          }
          @keyframes ground-crack {
            0% { 
              stroke-dasharray: 0, 200;
              opacity: 0;
            }
            50% { 
              stroke-dasharray: 100, 200;
              opacity: 1;
            }
            100% { 
              stroke-dasharray: 200, 200;
              opacity: 0;
            }
          }
          @keyframes slot-ready-glow {
            0%, 100% { 
              stroke-opacity: 0.3;
              stroke-width: 2;
            }
            50% { 
              stroke-opacity: 0.8;
              stroke-width: 4;
            }
          }
          @keyframes celebration-text {
            0% { 
              transform: translateY(0) scale(0.5);
              opacity: 0;
            }
            20% { 
              transform: translateY(-20px) scale(1.2);
              opacity: 1;
            }
            80% { 
              transform: translateY(-40px) scale(1);
              opacity: 1;
            }
            100% { 
              transform: translateY(-60px) scale(0.8);
              opacity: 0;
            }
          }
          @keyframes coin-animation {
            0% { 
              transform: rotate(0deg) translateY(0);
              opacity: 1;
            }
            50% { 
              transform: rotate(180deg) translateY(-30px);
              opacity: 0.8;
            }
            100% { 
              transform: rotate(360deg) translateY(-60px);
              opacity: 0;
            }
          }
          @keyframes achievement-badge {
            0% { 
              transform: scale(0) rotate(-45deg);
              opacity: 0;
            }
            50% { 
              transform: scale(1.3) rotate(0deg);
              opacity: 1;
            }
            100% { 
              transform: scale(1) rotate(0deg);
              opacity: 0;
            }
          }

        `}
      </style>
      {/* UI */}
      <div style={{ position: 'absolute', top: 24, left: 32, zIndex: 2, display: 'flex', alignItems: 'center' }}>
        {/* Enhanced Info Icon - Standalone */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 18,
            fontWeight: 'bold',
            color: 'white',
            border: '2px solid rgba(59, 130, 246, 0.5)',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
            setShowTooltip(true);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            setShowTooltip(false);
          }}
        >
          📊
        </div>

        {/* Enhanced Tooltip - Left Aligned */}
        {showTooltip && (
          <div style={{
            position: 'absolute',
            top: '120%',
            left: 0,
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95))',
            color: 'white',
            padding: 16,
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: 13,
            lineHeight: 1.4,
            minWidth: 320,
            maxWidth: 400,
            zIndex: 1000,
            opacity: 1
          }}>
            {/* Header */}
            <div style={{ 
              fontSize: 16, 
              fontWeight: 'bold', 
              color: '#3b82f6',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              📊 Oyun İstatistikleri
            </div>

            {/* Wave Progress Section */}
            <div style={{
              background: 'rgba(0, 207, 255, 0.1)',
              border: '1px solid rgba(0, 207, 255, 0.3)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16
            }}>
              <div style={{
                color: '#00cfff',
                fontSize: 16,
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 8,
                textShadow: '0 0 10px rgba(0, 207, 255, 0.5)'
              }}>
                🌊 Wave {currentWave}/100
              </div>
              
              <div style={{
                color: '#ffffff',
                fontSize: 12,
                textAlign: 'center',
                marginBottom: 8,
                opacity: 0.9
              }}>
                Kalan Düşman: {Math.max(0, enemiesRequired - enemiesKilled).toLocaleString()}
              </div>
              
              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: 10,
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 5,
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
                marginBottom: 6
              }}>
                <div style={{
                  width: `${Math.min(100, (enemiesKilled / enemiesRequired) * 100)}%`,
                  height: '100%',
                  background: (() => {
                    const progress = (enemiesKilled / enemiesRequired) * 100;
                    if (progress < 25) return 'linear-gradient(90deg, #ef4444, #f87171)';
                    if (progress < 50) return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
                    if (progress < 75) return 'linear-gradient(90deg, #eab308, #facc15)';
                    if (progress < 95) return 'linear-gradient(90deg, #22c55e, #4ade80)';
                    return 'linear-gradient(90deg, #06b6d4, #0891b2)';
                  })(),
                  transition: 'all 0.4s ease'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 9,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  textShadow: '0 0 4px rgba(0, 0, 0, 0.8)'
                }}>
                  {Math.round((enemiesKilled / enemiesRequired) * 100)}%
                </div>
              </div>
              
              <div style={{
                color: '#94a3b8',
                fontSize: 11,
                textAlign: 'center',
                opacity: 0.8
              }}>
                {enemiesKilled.toLocaleString()} / {enemiesRequired.toLocaleString()}
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gap: 8 }}>
              {/* Gold Info */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '6px 10px',
                background: 'rgba(255, 215, 0, 0.1)',
                borderRadius: 6,
                border: '1px solid rgba(255, 215, 0, 0.2)'
              }}>
                <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: 12 }}>💰 Altın</span>
                <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: 12 }}>{gold.toLocaleString()}</span>
              </div>

              {/* Tower Info */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '6px 10px',
                background: 'rgba(74, 222, 128, 0.1)',
                borderRadius: 6,
                border: '1px solid rgba(74, 222, 128, 0.2)'
              }}>
                <span style={{ color: '#4ade80', fontSize: 12 }}>🏰 Kuleler</span>
                <span style={{ color: '#4ade80', fontSize: 12 }}>{towers.length}/{maxTowers}</span>
              </div>

              {/* Actions Info */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '6px 10px',
                background: 'rgba(251, 191, 36, 0.1)',
                borderRadius: 6,
                border: '1px solid rgba(251, 191, 36, 0.2)'
              }}>
                <span style={{ color: '#fbbf24', fontSize: 12 }}>⚡ Aksiyonlar</span>
                <span style={{ color: '#fbbf24', fontSize: 12 }}>
                  {actionsRemaining}/{maxActions}
                  {actionRegenTime < 30000 && (
                    <span style={{ fontSize: 10, opacity: 0.8 }}>
                      {' '}(+1 {Math.ceil(actionRegenTime / 1000)}s)
                    </span>
                  )}
                </span>
              </div>

              {/* Energy Info */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '6px 10px',
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: 6,
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                <span style={{ color: '#8b5cf6', fontSize: 12 }}>🔋 Enerji</span>
                <span style={{ color: '#8b5cf6', fontSize: 12 }}>{Math.round(energy)}/{maxEnergy}</span>
              </div>
            </div>

            {/* Action Guide */}
            <div style={{ 
              marginTop: 12, 
              padding: '8px 10px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 6,
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: 11, fontWeight: 'bold', color: '#e2e8f0', marginBottom: 4 }}>
                💡 Hızlı Kılavuz:
              </div>
              <div style={{ fontSize: 10, color: '#cbd5e1', lineHeight: 1.3 }}>
                • <strong>Sol tık:</strong> Kule inşa et<br/>
                • <strong>Sağ tık:</strong> Kule yükselt<br/>
                • <strong>ESC:</strong> Yükseltme menüsü<br/>
                • <strong>Enerji:</strong> Her aksiyon enerji harcar
              </div>
            </div>
          </div>
        )}
      </div>

      {energyWarning && (
        <div style={{ position: 'absolute', top: 80, left: 32, color: '#ff5555', font: GAME_CONSTANTS.UI_FONT, textShadow: GAME_CONSTANTS.UI_SHADOW, zIndex: 2 }}>
          {energyWarning}
        </div>
      )}
      {/* Debug message for tower relocation */}
      {debugMessage && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          color: '#00cfff', 
          font: 'bold 20px Arial', 
          textShadow: GAME_CONSTANTS.UI_SHADOW, 
          zIndex: 10,
          background: 'rgba(0,0,0,0.8)',
          padding: '12px 24px',
          borderRadius: '8px',
          border: '2px solid #00cfff'
        }}>
          {debugMessage}
        </div>
      )}


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
      <svg 
        width={width} 
        height={height} 
        style={{ display: 'block', position: 'absolute', top: 0, left: 0 }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Tower Slots */}
        {towerSlots.map((slot, i) => (
          <TowerSpot 
            key={i} 
            slot={slot} 
            slotIdx={i} 
            onTowerDragStart={handleTowerDragStart}
            isDragTarget={dragState.isDragging && i !== dragState.draggedTowerSlotIdx && slot.unlocked && !slot.tower}
            draggedTowerSlotIdx={dragState.draggedTowerSlotIdx}
          />
        ))}

        {/* Dragged Tower Visualization */}
        {dragState.isDragging && dragState.draggedTowerSlotIdx !== null && (
          <g style={{ pointerEvents: 'none', opacity: 0.8 }}>
            {/* Dragged tower preview */}
            <circle
              cx={dragState.mousePosition.x - dragState.dragOffset.x}
              cy={dragState.mousePosition.y - dragState.dragOffset.y}
              r={GAME_CONSTANTS.TOWER_SIZE / 2}
              fill="rgba(255, 255, 255, 0.3)"
              stroke="#00cfff"
              strokeWidth={2}
              strokeDasharray="4 2"
            />
            {/* Tower type indicator */}
            <text
              x={dragState.mousePosition.x - dragState.dragOffset.x}
              y={dragState.mousePosition.y - dragState.dragOffset.y + 4}
              fill="#00cfff"
              fontSize={16}
              textAnchor="middle"
              fontWeight="bold"
            >
              {towerSlots[dragState.draggedTowerSlotIdx!]?.tower?.towerType === 'economy' ? '💰' : '🏰'}
            </text>
            {/* Instructions */}
            <text
              x={dragState.mousePosition.x - dragState.dragOffset.x}
              y={dragState.mousePosition.y - dragState.dragOffset.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 10}
              fill="#00cfff"
              fontSize={12}
              textAnchor="middle"
              fontWeight="bold"
            >
              Boş slota bırakın
            </text>
            {/* Connection line to nearest valid slot */}
            {(() => {
              let nearestSlotX = 0;
              let nearestSlotY = 0;
              let hasNearestSlot = false;
              let minDist = Infinity;
              const mouseX = dragState.mousePosition.x - dragState.dragOffset.x;
              const mouseY = dragState.mousePosition.y - dragState.dragOffset.y;
              
              towerSlots.forEach((slot, idx) => {
                if (idx === dragState.draggedTowerSlotIdx || !slot.unlocked || slot.tower) return;
                const dist = Math.sqrt((slot.x - mouseX) ** 2 + (slot.y - mouseY) ** 2);
                if (dist < minDist && dist <= GAME_CONSTANTS.TOWER_SIZE * 2) {
                  minDist = dist;
                  nearestSlotX = slot.x;
                  nearestSlotY = slot.y;
                  hasNearestSlot = true;
                }
              });
              
              return hasNearestSlot ? (
                <line
                  x1={mouseX}
                  y1={mouseY}
                  x2={nearestSlotX}
                  y2={nearestSlotY}
                  stroke="#00cfff"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  opacity={0.6}
                />
              ) : null;
            })()}
          </g>
        )}
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
      {isGameOver && (() => {
        // 🎵 Game over müzik
        stopBackgroundMusic();
        setTimeout(() => playSound('gameover'), 500);
        return true;
      })() && (
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
                // 🎵 Oyun reset edildiğinde müzik durdur
                stopBackgroundMusic();
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