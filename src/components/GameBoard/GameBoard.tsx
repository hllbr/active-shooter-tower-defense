import React, { useRef } from 'react';
import { useGameStore } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/Constants';
import { TowerSpot } from '../TowerSpot';
import { stopEnemyWave, startContinuousSpawning, stopContinuousSpawning } from '../../logic/EnemySpawner';
import { startGameLoop } from '../../logic/GameLoop';
import { waveManager } from '../../logic/WaveManager';
import { initUpgradeEffects } from '../../logic/UpgradeEffects';
import { UpgradeScreen } from '../game/UpgradeScreen';
import { playSound, startBackgroundMusic } from '../../utils/sound';
import { performMemoryCleanup } from '../../logic/Effects';
import { bulletPool } from '../../logic/TowerManager';

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

// Import enhanced hooks
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
    isPreparing,
    isPaused,
    prepRemaining,
    startWave,
    tickPreparation,
    tickEnergyRegen,
    tickActionRegen,
    unlockingSlots
  } = useGameStore();

  // Enhanced drag & drop system
  const {
    dragState,
    dropZones,
    feedback,
    handleTowerDragStart,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    debugMessage,
    clearDebugMessage
  } = useTowerDrag();

  // Screen shake effect
  const [screenShake, setScreenShake] = React.useState(false);
  const screenShakeTimerRef = React.useRef<number | null>(null);

  // ⚠️ FIXED: Animation State Inconsistency  
  // Enhanced animation management with proper cleanup and overlap prevention
  React.useEffect(() => {
    // Clear any existing timer to prevent overlap
    if (screenShakeTimerRef.current) {
      clearTimeout(screenShakeTimerRef.current);
      screenShakeTimerRef.current = null;
    }

    if (unlockingSlots.size > 0) {
      setScreenShake(true);
      screenShakeTimerRef.current = window.setTimeout(() => {
        setScreenShake(false);
        screenShakeTimerRef.current = null;
      }, 600);
      
      // Cleanup function for component unmount or dependency change
      return () => {
        if (screenShakeTimerRef.current) {
          clearTimeout(screenShakeTimerRef.current);
          screenShakeTimerRef.current = null;
        }
      };
    } else {
      // Immediately stop shake if no unlocking slots
      setScreenShake(false);
    }
  }, [unlockingSlots]);

  React.useEffect(() => {
    initUpgradeEffects();
  }, []);

  // Main game loop effect
  const loopStopper = useRef<(() => void) | null>(null);

  React.useEffect(() => {
    if (!isStarted || isRefreshing || isPreparing) {
      stopEnemyWave();
      stopContinuousSpawning();
      loopStopper.current?.();
      loopStopper.current = null;
      return;
    }
    if (!loopStopper.current) {
      loopStopper.current = startGameLoop();
      // Background music
      startBackgroundMusic();
    }
    // Start continuous spawning system
    startContinuousSpawning();
    waveManager.startWave(currentWave);
    return () => {
      stopEnemyWave();
      stopContinuousSpawning();
      loopStopper.current?.();
      loopStopper.current = null;
    };
  }, [isStarted, isRefreshing, isPreparing, currentWave]);

  // Warning system
  const warningPlayed = useRef(false);

  // Preparation timer
  React.useEffect(() => {
    if (!isPreparing || isPaused) return;
    const id = setInterval(() => tickPreparation(1000), 1000);
    return () => clearInterval(id);
  }, [isPreparing, isPaused, tickPreparation]);

  // Preparation warning and auto-start
  React.useEffect(() => {
    if (isPreparing && prepRemaining <= GAME_CONSTANTS.PREP_WARNING_THRESHOLD && !warningPlayed.current) {
      playSound('warning');
      warningPlayed.current = true;
    }
    if (isPreparing && prepRemaining <= 0) {
      startWave();
    }
    if (!isPreparing) warningPlayed.current = false;
  }, [isPreparing, startWave, prepRemaining]);

  // Enerji rejenerasyonu timer'ı - 5 saniye intervals (memory managed)
  React.useEffect(() => {
    if (!isStarted || isPaused) return;
    
    const energyTimer = setInterval(() => {
      tickEnergyRegen(5000);
    }, 5000);
    
    return () => clearInterval(energyTimer);
  }, [isStarted, isPaused, tickEnergyRegen]);

  // Action rejenerasyonu timer'ı (memory managed)
  React.useEffect(() => {
    if (!isStarted || isPaused) return;
    
    const actionTimer = setInterval(() => {
      tickActionRegen(1000);
    }, 1000);
    
    return () => clearInterval(actionTimer);
  }, [isStarted, isPaused, tickActionRegen]);

     // Screen shake effect (legacy support) - Enhanced with proper cleanup
   React.useEffect(() => {
     const legacyShakeTimerRef = { current: null as number | null };
     
     const onScreenShake = () => {
       // Clear existing timer to prevent overlap
       if (legacyShakeTimerRef.current) {
         clearTimeout(legacyShakeTimerRef.current);
       }
       
       setScreenShake(true);
       legacyShakeTimerRef.current = window.setTimeout(() => {
         setScreenShake(false);
         legacyShakeTimerRef.current = null;
       }, 600);
     };
     
     window.addEventListener('screenShake', onScreenShake);
     return () => {
       window.removeEventListener('screenShake', onScreenShake);
       // Clean up any pending timer
       if (legacyShakeTimerRef.current) {
         clearTimeout(legacyShakeTimerRef.current);
       }
     };
   }, []);

  // Global memory cleanup on unmount - Enhanced
  React.useEffect(() => {
    return () => {
      // Comprehensive cleanup when component unmounts
      performMemoryCleanup();
      bulletPool.clear();
      
      // Clear all animation timers
      if (screenShakeTimerRef.current) {
        clearTimeout(screenShakeTimerRef.current);
      }
      
      if (GAME_CONSTANTS.DEBUG_MODE) {
        console.log('🧹 GameBoard: Global memory cleanup completed');
        
        // Log pool statistics
        const bulletStats = bulletPool.getStats();
        console.log(`📊 Bullet Pool Stats: Created: ${bulletStats.created}, Reused: ${bulletStats.reused}, Reuse Rate: ${bulletStats.reuseRate.toFixed(1)}%`);
      }
    };
  }, []);

  // SVG viewport size
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

      {/* SVG Game Area with Enhanced Touch Support */}
      <svg 
        width={width} 
        height={height} 
        style={{ display: 'block', position: 'absolute', top: 0, left: 0 }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Tower Slots with Enhanced Drag Support */}
        {towerSlots.map((slot, i) => (
          <TowerSpot 
            key={i} 
            slot={slot} 
            slotIdx={i} 
            onTowerDragStart={(slotIdx, event) => {
              // Support both mouse and touch events
              if ('touches' in event) {
                handleTouchStart(slotIdx, event as React.TouchEvent);
              } else {
                handleTowerDragStart(slotIdx, event as React.MouseEvent);
              }
            }}
            isDragTarget={dragState.isDragging && i !== dragState.draggedTowerSlotIdx && slot.unlocked && !slot.tower}
            draggedTowerSlotIdx={dragState.draggedTowerSlotIdx}
          />
        ))}

        {/* Enhanced Drag Visualization System */}
        <TowerDragVisualization 
          dragState={dragState}
          dropZones={dropZones}
          feedback={feedback}
        />

        {/* SVG Effects (Enemies, Bullets, Effects, Mines) */}
        <SVGEffectsRenderer />
      </svg>
    </div>
  );
}; 