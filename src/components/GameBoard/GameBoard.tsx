import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/Constants';
import { TowerSpot } from '../TowerSpot';
import { stopEnemyWave, startContinuousSpawning, stopContinuousSpawning } from '../../logic/EnemySpawner';
import { startGameLoop } from '../../logic/GameLoop';
import { waveManager } from '../../logic/WaveManager';
import { initUpgradeEffects } from '../../logic/UpgradeEffects';
import { UpgradeScreen } from '../game/UpgradeScreen';
import { playSound, startBackgroundMusic } from '../../utils/sound';

// Import modular components
import {
  GameStatsPanel,
  EnergyWarning,
  DebugMessage,
  FrostOverlay,
  PreparationScreen,
  StartScreen,
  GameOverScreen,
  TowerDragVisualization,
  SVGEffectsRenderer
} from './components';

// Import hooks
import { useTowerDrag } from './hooks';

// Import styles and types
import { containerStyle, keyframeStyles } from './styles';
import type { GameBoardProps } from './types';

export const GameBoard: React.FC<GameBoardProps> = ({ className }) => {
  const {
    towerSlots,
    currentWave,
    isStarted,
    isRefreshing,
    setStarted,
    setRefreshing,
    resetGame,
    nextWave,
    resetDice,
    deployMines,
    isPreparing,
    isPaused,
    prepRemaining,
    tickPreparation,
    pausePreparation,
    resumePreparation,
    speedUpPreparation,
    startWave,
    tickEnergyRegen,
    tickActionRegen,
    unlockingSlots,
    mines
  } = useGameStore();

  // Tower drag functionality
  const {
    dragState,
    debugMessage,
    clearDebugMessage,
    handleTowerDragStart,
    handleMouseMove,
    handleMouseUp
  } = useTowerDrag();

  // Screen shake effect
  const [screenShake, setScreenShake] = useState(false);

  // Animation States
  useEffect(() => {
    if (unlockingSlots.size > 0) {
      setScreenShake(true);
      const timer = setTimeout(() => setScreenShake(false), 600);
      return () => clearTimeout(timer);
    }
  }, [unlockingSlots]);

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
      tickEnergyRegen(5000);
    }, 5000);
    
    return () => clearInterval(energyTimer);
  }, [isStarted, isPaused, tickEnergyRegen]);

  // Action rejenerasyonu timer'ı
  useEffect(() => {
    if (!isStarted || isPaused) return;
    
    const actionTimer = setInterval(() => {
      tickActionRegen(1000);
    }, 1000);
    
    return () => clearInterval(actionTimer);
  }, [isStarted, isPaused, tickActionRegen]);

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
      // Background müzik başlat
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
  }, [isPreparing, startWave]);

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

  return (
    <div style={{ 
      ...containerStyle,
      background: GAME_CONSTANTS.CANVAS_BG,
      animation: screenShake ? 'screen-shake 0.6s ease-in-out' : 'none'
    }} className={className}>
      <style>
        {keyframeStyles}
      </style>
      
      {/* UI Components */}
      <GameStatsPanel />
      <EnergyWarning />
      <DebugMessage message={debugMessage} onClear={clearDebugMessage} />
      <PreparationScreen />
      <StartScreen />
      <GameOverScreen />
      <FrostOverlay />

      {isRefreshing && <UpgradeScreen />}

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
        <TowerDragVisualization dragState={dragState} />

        {/* SVG Effects (Enemies, Bullets, Effects, Mines) */}
        <SVGEffectsRenderer />
      </svg>
    </div>
  );
}; 