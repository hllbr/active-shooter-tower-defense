import React, { Suspense, lazy, useEffect, useRef, useMemo, useCallback } from 'react';
import { useGameStore } from '../../models/store';
import { useChallenge } from '../challenge/hooks/useChallenge';

import { useTheme } from '../theme/useTheme';
import { SimplifiedEnvironmentManager } from '../../game-systems/environment/SimplifiedEnvironmentManager';
import { ConditionalRenderer } from './components/ConditionalRenderer';
import { gameFlowManager } from '../../game-systems/GameFlowManager';

// Lazy load heavy components for code splitting
const UpgradeScreen = lazy(() => import('../game/UpgradeScreen').then(module => ({ default: module.UpgradeScreen })));

// Import modular components
import {
  GameStatsPanel,
  EnergyWarning,

  PreparationScreen,
  StartScreen,
  GameOverScreen,
  GameArea
} from './components';

import { SynergyDisplay } from '../TowerSpot/components/SynergyDisplay';


// Import enhanced hooks
import { 
  useTowerDrag,
  useGameEffects,
  useGameLoop,
} from './hooks';

// Import styles and types
import { containerStyle, keyframeStyles } from './styles';
import type { GameBoardProps } from './types';

// Loading fallback component
const LoadingFallback: React.FC = React.memo(() => (
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
));

export const GameBoard: React.FC<GameBoardProps> = React.memo(({ onSettingsClick, onChallengeClick }) => {
  const {
    isStarted,
    isGameOver,
    isRefreshing,
    isPaused,
    currentWave,
    energy: _energy,
    gold: _gold,
    enemiesKilled: _enemiesKilled,
    energyWarning: _energyWarning,
    unlockingSlots,
    towerSlots,
    lastUpdate: _lastUpdate,
    waveStatus,
    prepRemaining: _prepRemaining,
    startWave: _startWave,
    tickPreparation: _tickPreparation,
    tickEnergyRegen: _tickEnergyRegen,
    tickActionRegen: _tickActionRegen
  } = useGameStore();

  const { incrementChallenge: _incrementChallenge } = useChallenge();
  const { theme: _theme } = useTheme();

  const shouldShowUpgradeScreen = useMemo(() => 
    isRefreshing && !isGameOver, 
    [isRefreshing, isGameOver]
  );

  const shouldShowGameArea = useMemo(() => 
    isStarted && !isRefreshing && !isGameOver, 
    [isStarted, isRefreshing, isGameOver]
  );

  const shouldShowPreparationScreen = useMemo(() => 
    isStarted && !isRefreshing && !isGameOver && isPaused, 
    [isStarted, isRefreshing, isGameOver, isPaused]
  );

  const shouldShowStartScreen = useMemo(() => 
    !isStarted && !isGameOver, 
    [isStarted, isGameOver]
  );

  const shouldShowGameOverScreen = useMemo(() => 
    isGameOver, 
    [isGameOver]
  );

  // Memoized callbacks for performance
  const handleSettingsClick = useCallback(() => {
    onSettingsClick?.();
  }, [onSettingsClick]);

  const handleChallengeClick = useCallback(() => {
    onChallengeClick?.();
  }, [onChallengeClick]);

  // Game effects hook
  const { screenShake, screenShakeIntensity, dimensions } = useGameEffects(unlockingSlots || new Set());

  // Tower drag hook
  const towerDragState = useTowerDrag();

  // Environment manager
  const environmentManagerRef = useRef<SimplifiedEnvironmentManager | null>(null);

  // Initialize environment manager and game flow
  useEffect(() => {
    if (!environmentManagerRef.current) {
      environmentManagerRef.current = new SimplifiedEnvironmentManager();
    }
    
    // Initialize game flow manager
    gameFlowManager.initialize();
  }, []);

  // Game loop hook
  useGameLoop(
    isStarted,
    isRefreshing,
    waveStatus,
    currentWave,
    environmentManagerRef.current || null
  );

  // Start game flow when game starts
  useEffect(() => {
    if (isStarted && !isRefreshing && !isGameOver) {
      gameFlowManager.startGame();
    }
  }, [isStarted, isRefreshing, isGameOver]);

  // Memoized container style
  const containerStyleMemo = useMemo(() => ({
    ...containerStyle,
    transform: screenShake 
      ? `translate(${Math.random() * screenShakeIntensity - screenShakeIntensity/2}px, ${Math.random() * screenShakeIntensity - screenShakeIntensity/2}px)` 
      : 'none',
    transition: screenShake ? 'none' : 'transform 0.1s ease-out'
  }), [screenShake, screenShakeIntensity]);

  return (
    <div style={containerStyleMemo}>
      <style>{keyframeStyles}</style>
      
      {/* Game Stats Panel */}
      <GameStatsPanel 
        onSettingsClick={handleSettingsClick}
        onChallengeClick={handleChallengeClick}
      />

      {/* Energy Warning */}
      <EnergyWarning />

      {/* Debug Message removed for production optimization */}

      {/* Game Area */}
      {shouldShowGameArea && (
        <GameArea 
          width={dimensions.width}
          height={dimensions.height}
          towerSlots={towerSlots}
          dragState={towerDragState.dragState}
          dropZones={towerDragState.dropZones}
          feedback={towerDragState.feedback}
          onMouseMove={towerDragState.handleMouseMove}
          onMouseUp={towerDragState.handleMouseUp}
          onTouchMove={towerDragState.handleTouchMove}
          onTouchEnd={towerDragState.handleTouchEnd}
          onTowerDragStart={towerDragState.handleTowerDragStart}
        />
      )}

      {/* Conditional Renderer */}
      <ConditionalRenderer />

      {/* Debug overlays removed for production optimization */}

      {/* Synergy Display */}
      <SynergyDisplay 
        towerSlots={towerSlots}
        isVisible={isStarted && !isRefreshing}
      />

      {/* Upgrade Screen */}
      {shouldShowUpgradeScreen && (
        <Suspense fallback={<LoadingFallback />}>
          <UpgradeScreen />
        </Suspense>
      )}

      {/* Preparation Screen */}
      {shouldShowPreparationScreen && (
        <PreparationScreen />
      )}

      {/* Start Screen */}
      {shouldShowStartScreen && (
        <StartScreen />
      )}

      {/* Game Over Screen */}
      {shouldShowGameOverScreen && (
        <GameOverScreen />
      )}
    </div>
  );
}); 