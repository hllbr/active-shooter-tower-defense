import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { useGameStore } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/constants';
import { initUpgradeEffects } from '../../game-systems/UpgradeEffects';
import { useChallenge } from '../challenge/hooks/useChallenge';
import { CinematicCameraManager } from '../../game-systems/cinematic/CinematicCameraManager';
import { PostProcessingManager } from '../../game-systems/post-processing/PostProcessingManager';
import { useTheme } from '../theme/ThemeProvider';
import { EnvironmentManager } from '../../game-systems/environment/EnvironmentManager';

// Lazy load heavy components for code splitting
const UpgradeScreen = lazy(() => import('../game/UpgradeScreen').then(module => ({ default: module.UpgradeScreen })));

// Import modular components
import {
  GameStatsPanel,
  EnergyWarning,
  DebugMessage,
  FrostOverlay,
  PreparationScreen,
  StartScreen,
  GameOverScreen,
  GameArea
} from './components';
import { SpawnZoneDebugOverlay } from './components/overlays/SpawnZoneDebugOverlay';
import { CommandCenter } from './components/ui/CommandCenter';

// Import enhanced hooks
import { 
  useTowerDrag,
  useGameEffects,
  useGameTimers,
  useGameLoop,
  useCommandCenter
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
    unlockingSlots,
    pausePreparation,
    resumePreparation,
    initializeAchievements,
    addEnemyKillListener,
    removeEnemyKillListener,
    addTowerUpgradeListener,
    energy,
    maxEnergy,
  } = useGameStore();

  const { incrementChallenge } = useChallenge();
  const { isReducedMotion } = useTheme();
  const prevWaveRef = React.useRef(currentWave);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const environmentManagerRef = useRef<EnvironmentManager | null>(null);
  const cinematicManager = CinematicCameraManager.getInstance();
  const postProcessingManager = PostProcessingManager.getInstance();

  // Initialize environment manager for background rendering
  useEffect(() => {
    if (!environmentManagerRef.current) {
      environmentManagerRef.current = new EnvironmentManager();
      const envState = environmentManagerRef.current.getEnvironmentState();
      useGameStore.setState({
        terrainTiles: envState.terrainTiles,
        weatherState: envState.weatherState,
        timeOfDayState: envState.timeOfDayState,
        environmentalHazards: envState.environmentalHazards,
        interactiveElements: envState.interactiveElements,
      });
    }
  }, []);

  // Initialize cinematic and post-processing systems
  useEffect(() => {
    const updateSystems = (currentTime: number) => {
      cinematicManager.update(currentTime);
      postProcessingManager.update(currentTime);
    };

    const gameLoop = () => {
      const currentTime = performance.now();
      updateSystems(currentTime);
      requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);
  }, [cinematicManager, postProcessingManager]);

  // Apply post-processing based on game state
  useEffect(() => {
    if (!isStarted) {
      postProcessingManager.applyGameStateFilter('normal');
      return;
    }

    // Low health warning
    if (energy < maxEnergy * 0.3) {
      postProcessingManager.applyGameStateFilter('low_health', 1000);
    } else if (energy < maxEnergy * 0.5) {
      postProcessingManager.applyGameStateFilter('under_attack', 1000);
    } else {
      postProcessingManager.applyGameStateFilter('normal', 1000);
    }
  }, [energy, maxEnergy, isStarted, postProcessingManager]);

  // 🎮 UPGRADE SCREEN: Stop only game scene sounds when upgrade screen opens
  useEffect(() => {
    if (isRefreshing) {
      import('../../utils/sound').then(({ pauseGameSceneSounds }) => {
        pauseGameSceneSounds();
      });
    }
  }, [isRefreshing]);

  // Boss wave cinematic effects
  useEffect(() => {
    if (currentWave % 10 === 0 && currentWave > 0) {
      // Boss wave
      postProcessingManager.applyGameStateFilter('boss_fight', 2000);
      
      // Trigger boss entrance cinematic
      setTimeout(() => {
        cinematicManager.triggerBossEntrance({ x: 960, y: 540 });
      }, 1000);
    }
  }, [currentWave, cinematicManager, postProcessingManager]);

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
  const { screenShake, dimensions } = useGameEffects(unlockingSlots);

  // Game timers management
  useGameTimers(
    isStarted,
    isPreparing,
    isPaused,
    prepRemaining,
    startWave,
    tickPreparation,
    tickEnergyRegen,
    tickActionRegen
  );

  // Game loop management
  useGameLoop(isStarted, isRefreshing, isPreparing, currentWave, environmentManagerRef.current);

  // Command center management
  const { commandCenterOpen, closeCommandCenter } = useCommandCenter(
    isPreparing,
    isPaused,
    pausePreparation,
    resumePreparation
  );

  // Initialize game systems
  React.useEffect(() => {
    initUpgradeEffects();
    initializeAchievements();
  }, [initializeAchievements]);

  const { width, height } = dimensions;

  // --- Mobil algılama ---
  const isMobile = typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches || /Mobi|Android/i.test(navigator.userAgent));

  // Get cinematic camera transform
  const cameraTransform = cinematicManager.getCameraTransform();
  const isInCinematicMode = cinematicManager.isInCinematicMode();

  // Get post-processing effects
  const postProcessingFilters = postProcessingManager.getCSSFilters();
  const vignetteCSS = postProcessingManager.getVignetteCSS();
  const grainCSS = postProcessingManager.getGrainCSS();
  const scanlinesCSS = postProcessingManager.getScanlinesCSS();

  return (
    <div 
      ref={gameContainerRef}
      style={{ 
        ...containerStyle,
        background: GAME_CONSTANTS.CANVAS_BG,
        animation: screenShake ? 'screen-shake 0.6s ease-in-out' : 'none',
        transform: isInCinematicMode ? cameraTransform : 'none',
        filter: postProcessingFilters,
        transition: isReducedMotion ? 'none' : 'transform 0.3s ease-out, filter 0.5s ease-out',
      }} 
      className={className}
    >
      {/* Post-processing overlays */}
      {vignetteCSS && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: vignetteCSS,
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        />
      )}
      
      {grainCSS && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: grainCSS,
            pointerEvents: 'none',
            zIndex: 1001,
            opacity: 0.1,
          }}
        />
      )}
      
      {scanlinesCSS && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: scanlinesCSS,
            pointerEvents: 'none',
            zIndex: 1002,
            opacity: 0.05,
          }}
        />
      )}

      <style>
        {keyframeStyles}
      </style>
      
      {/* UI Components */}
      <GameStatsPanel onCommandCenterOpen={() => closeCommandCenter} />
      <EnergyWarning />
      <DebugMessage message={debugMessage} onClear={clearDebugMessage} />
      <PreparationScreen />
      <StartScreen />
      <GameOverScreen />
      <FrostOverlay />
      
      {/* Debug overlays */}
      <SpawnZoneDebugOverlay />

      {/* Lazy loaded UpgradeScreen with Suspense */}
      {isRefreshing && (
        <Suspense fallback={<LoadingFallback />}>
          <UpgradeScreen />
        </Suspense>
      )}
      
      {/* Command Center (S Key) */}
      <CommandCenter 
        isOpen={commandCenterOpen} 
        onClose={closeCommandCenter} 
      />

      {/* Game Area */}
      <GameArea
        width={width}
        height={height}
        towerSlots={towerSlots}
        dragState={dragState}
        dropZones={dropZones}
        feedback={feedback}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTowerDragStart={handleTowerDragStart}
        timeOfDay={'day'}
        isMobile={isMobile}
      />
    </div>
  );
}; 