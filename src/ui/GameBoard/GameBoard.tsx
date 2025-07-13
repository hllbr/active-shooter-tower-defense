import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { useGameStore } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/constants';
import { initUpgradeEffects } from '../../game-systems/UpgradeEffects';
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

import { WeatherEffectsIndicator } from './components/overlays/WeatherEffectsIndicator';

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

export const GameBoard: React.FC<GameBoardProps> = ({ className, onSettingsClick, onChallengeClick }) => {
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





  // 🎮 UPGRADE SCREEN: Stop only game scene sounds when upgrade screen opens
  useEffect(() => {
    if (isRefreshing) {
      import('../../utils/sound').then(({ pauseGameSceneSounds }) => {
        pauseGameSceneSounds();
      });
    }
  }, [isRefreshing]);



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
    initUpgradeEffects();
    initializeAchievements();
  }, [initializeAchievements]);

  const { width, height } = dimensions;

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
        animation: screenShake ? 'screen-shake 0.6s ease-in-out' : 'none',
        transform: isInCinematicMode ? cameraTransform : 'none',
        filter: 'none', // Disable post-processing for performance
        transition: isReducedMotion ? 'none' : 'transform 0.3s ease-out, background 0.5s ease-out',
      }} 
      className={className}
    >
      {/* Post-processing disabled for performance */}

      <style>
        {keyframeStyles}
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
      <WeatherEffectsIndicator />

      
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