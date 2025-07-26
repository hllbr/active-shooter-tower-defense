import React, { Suspense, lazy, useEffect, useRef, useMemo, useCallback } from 'react';
import { useGameStore } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/constants';
import { useChallenge } from '../challenge/hooks/useChallenge';

import { useTheme } from '../theme/ThemeProvider';
import { SimplifiedEnvironmentManager } from '../../game-systems/environment/SimplifiedEnvironmentManager';
import { ConditionalRenderer } from './components/ConditionalRenderer';

// Lazy load heavy components for code splitting
const UpgradeScreen = lazy(() => import('../game/UpgradeScreen').then(module => ({ default: module.UpgradeScreen })));

// Import modular components
import {
  GameStatsPanel,
  EnergyWarning,
  DebugMessage,

  PreparationScreen,
  StartScreen,
  GameOverScreen,
  GameArea
} from './components';
import { SpawnZoneDebugOverlay } from './components/overlays/SpawnZoneDebugOverlay';
import { SynergyDisplay } from '../TowerSpot/components/SynergyDisplay';


// Import enhanced hooks
import { 
  useTowerDrag,
  useGameEffects,
  useGameTimers,
  useGameLoop,
} from './hooks';

// Import styles and types
import { containerStyle, keyframeStyles } from './styles';
import type { GameBoardProps } from './types';

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 'bold',
    textShadow: '0 0 10px rgba(0, 207, 255, 0.8)'
  }}>
    ⚡ Yükleniyor...
  </div>
);

export const GameBoard: React.FC<GameBoardProps> = React.memo(({ className, onSettingsClick, onChallengeClick }) => {
  const {
    towerSlots,
    currentWave,
    isStarted,
    isRefreshing,
    waveStatus,
    prepRemaining,
    startWave,
    tickPreparation,
    tickEnergyRegen,
    tickActionRegen,
    unlockingSlots,
    initializeAchievements,
    addEnemyKillListener,
    removeEnemyKillListener,
    addTowerUpgradeListener,

  } = useGameStore();

  // Weather market panel state


  const { incrementChallenge } = useChallenge();
  const { isReducedMotion } = useTheme();
  const prevWaveRef = React.useRef(currentWave);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const environmentManagerRef = useRef<SimplifiedEnvironmentManager | null>(null);


  // Initialize simplified environment manager for optimal performance
  useEffect(() => {
    if (!environmentManagerRef.current) {
      environmentManagerRef.current = new SimplifiedEnvironmentManager();
      const envState = environmentManagerRef.current.getEnvironmentState();
      useGameStore.setState({
        terrainTiles: [], // No terrain tiles for simplified mode
        weatherState: envState.weatherState,
        timeOfDayState: envState.timeOfDayState,
        environmentalHazards: [],
        interactiveElements: []
      });
    }
  }, []);









  React.useEffect(() => {
    if (isStarted && currentWave > prevWaveRef.current) {
      incrementChallenge('wave');
    }
    prevWaveRef.current = currentWave;
  }, [currentWave, isStarted, incrementChallenge]);

  // Düşman öldürme event listener
  React.useEffect(() => {
    const handleEnemyKill = (_isSpecial?: boolean, enemyType?: string) => {
      incrementChallenge('enemy');
      // Boss düşmanlar için
      if (enemyType && (enemyType.toLowerCase().includes('boss') || enemyType.toLowerCase().includes('king') || enemyType.toLowerCase().includes('lord') || enemyType.toLowerCase().includes('god'))) {
        incrementChallenge('boss');
      }
    };
    addEnemyKillListener(handleEnemyKill);
    return () => {
      removeEnemyKillListener(handleEnemyKill);
    };
  }, [addEnemyKillListener, removeEnemyKillListener, incrementChallenge]);

  // Kule yükseltme event listener
  React.useEffect(() => {
    const handleTowerUpgrade = (_tower: unknown, oldLevel: number, newLevel: number) => {
      if (newLevel > oldLevel) {
        incrementChallenge('upgrade');
      }
    };
    addTowerUpgradeListener(handleTowerUpgrade);
    return () => {
      // removeTowerUpgradeListener yok, array'den elle çıkar
      const store = useGameStore.getState();
      if (store.towerUpgradeListeners) {
        store.towerUpgradeListeners = store.towerUpgradeListeners.filter(fn => fn !== handleTowerUpgrade);
      }
    };
  }, [addTowerUpgradeListener, incrementChallenge]);

  // Enhanced drag & drop system
  const {
    dragState,
    dropZones,
    feedback,
    handleTowerDragStart,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
    debugMessage,
    clearDebugMessage
  } = useTowerDrag();

  // Game effects management
  const { screenShake, screenShakeIntensity, dimensions } = useGameEffects(unlockingSlots);

  // Game timers management
  useGameTimers(
    isStarted,
    waveStatus,
    prepRemaining,
    startWave,
    tickPreparation,
    tickEnergyRegen,
    tickActionRegen
  );

  // Game loop management
  useGameLoop(isStarted, isRefreshing, waveStatus, currentWave, environmentManagerRef.current);

  // Initialize game systems
  React.useEffect(() => {
    initializeAchievements();
  }, [initializeAchievements]);

  const { width, height } = dimensions;
  // Memoize props for GameArea
  const memoizedTowerSlots = useMemo(() => towerSlots, [towerSlots]);
  const memoizedDragState = useMemo(() => dragState, [dragState]);
  const memoizedDropZones = useMemo(() => dropZones, [dropZones]);
  const memoizedFeedback = useMemo(() => feedback, [feedback]);
  const memoizedHandleMouseMove = useCallback(handleMouseMove, [handleMouseMove]);
  const memoizedHandleMouseUp = useCallback(handleMouseUp, [handleMouseUp]);
  const memoizedHandleTouchMove = useCallback(handleTouchMove, [handleTouchMove]);
  const memoizedHandleTouchEnd = useCallback(handleTouchEnd, [handleTouchEnd]);
  const memoizedHandleTowerDragStart = useCallback(handleTowerDragStart, [handleTowerDragStart]);

  // --- Mobil algılama ---
  const isMobile = typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches || /Mobi|Android/i.test(navigator.userAgent));

  // Performance optimization: no cinematic or post-processing effects
  const isInCinematicMode = false;
  const cameraTransform = 'none';

  return (
    <div 
      ref={gameContainerRef}
      style={{ 
        ...containerStyle,
        background: environmentManagerRef.current?.getEnvironmentState().backgroundGradient || GAME_CONSTANTS.CANVAS_BG,
        animation: screenShake ? `screen-shake-${screenShakeIntensity} 0.6s ease-in-out` : 'none',
        transform: isInCinematicMode ? cameraTransform : 'none',
        filter: 'none', // Disable post-processing for performance
        transition: isReducedMotion ? 'none' : 'transform 0.3s ease-out, background 0.5s ease-out',
      }} 
      className={className}
    >
      {/* Post-processing disabled for performance */}

      <style>
        {keyframeStyles}
        {`
          @keyframes screen-shake-5 {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          @keyframes screen-shake-10 {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
          @keyframes screen-shake-15 {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-15px); }
            75% { transform: translateX(15px); }
          }
        `}
      </style>
      
      {/* UI Components */}
      <GameStatsPanel 
        onSettingsClick={onSettingsClick}
        onChallengeClick={onChallengeClick}
      />
      <EnergyWarning />
      <DebugMessage message={debugMessage} onClear={clearDebugMessage} />
      <PreparationScreen />
      <StartScreen />
      <GameOverScreen />



      {/* Weather Effects Indicator */}
      
              {/* Conditional renderer based on performance settings */}
        <ConditionalRenderer />
      
      {/* Debug overlays */}
      <SpawnZoneDebugOverlay />

      {/* Synergy Display */}
      <SynergyDisplay 
        towerSlots={towerSlots}
        isVisible={isStarted && !isRefreshing}
      />

      {/* Lazy loaded UpgradeScreen with Suspense */}
      {isRefreshing && (
        <Suspense fallback={<LoadingFallback />}>
          <UpgradeScreen />
        </Suspense>
      )}
      
      {/* Game Area */}
      <GameArea
        width={width}
        height={height}
        towerSlots={memoizedTowerSlots}
        dragState={memoizedDragState}
        dropZones={memoizedDropZones}
        feedback={memoizedFeedback}
        onMouseMove={memoizedHandleMouseMove}
        onMouseUp={memoizedHandleMouseUp}
        onTouchMove={memoizedHandleTouchMove}
        onTouchEnd={memoizedHandleTouchEnd}
        onTowerDragStart={memoizedHandleTowerDragStart}
        timeOfDay={'day'}
        isMobile={isMobile}
      />
      {/* Area Effect Overlays for Support Towers */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 3 }}>
        {towerSlots.map((slot) => {
          const t = slot.tower;
          if (!t || !t.areaEffectActive || !t.areaEffectType || !t.areaEffectRadius) return null;
          // Convert game coords to screen coords (assume 1:1 for now, adjust if needed)
          const left = t.position.x - t.areaEffectRadius;
          const top = t.position.y - t.areaEffectRadius;
          const size = t.areaEffectRadius * 2;
          let className = '';
          if (t.areaEffectType === 'heal') className = 'area-effect-heal';
          else if (t.areaEffectType === 'poison') className = 'area-effect-poison';
          else if (t.areaEffectType === 'fire') className = 'area-effect-fire';
          return (
            <div
              key={`area-effect-${t.id}`}
              className={className}
              style={{
                position: 'absolute',
                left,
                top,
                width: size,
                height: size,
                zIndex: 3,
                pointerEvents: 'none',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}); 