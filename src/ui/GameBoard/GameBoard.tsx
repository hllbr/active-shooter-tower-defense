import React, { Suspense, lazy, useEffect, useRef, useMemo, useCallback, useState } from 'react';
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

// Import new components
import { WavePreviewOverlay } from './components/WavePreviewOverlay';
import { UnlockAnimation } from '../common/UnlockAnimation';
import DifficultyIndicator from '../game/DifficultyIndicator';
import SaveLoadPanel from '../game/SaveLoadPanel';
import { EnhancedParticleRenderer } from './components/renderers/EnhancedParticleRenderer';

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
const LoadingFallback = React.memo(() => (
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

export const GameBoard = React.memo(({ onSettingsClick, onChallengeClick }: GameBoardProps) => {
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
    tickActionRegen: _tickActionRegen,
    showWavePreview,
    wavePreviewCountdown,
    hideWavePreviewOverlay,
    startWavePreviewCountdown,
    notifications
  } = useGameStore();

  const { incrementChallenge: _incrementChallenge } = useChallenge();
  const { theme: _theme } = useTheme();

  // Unlock animation state
  const [unlockAnimation, setUnlockAnimation] = useState<{
    isVisible: boolean;
    type: 'upgrade' | 'reward' | 'achievement' | 'mission';
    title: string;
    description?: string;
    icon?: string;
  }>({
    isVisible: false,
    type: 'upgrade',
    title: '',
    description: '',
    icon: ''
  });

  // Save/Load panel state
  const [saveLoadPanelOpen, setSaveLoadPanelOpen] = useState(false);

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

  const handleSaveLoadClick = useCallback(() => {
    setSaveLoadPanelOpen(true);
  }, []);

  // Wave preview countdown handler
  const handleWavePreviewCountdownComplete = useCallback(() => {
    hideWavePreviewOverlay();
    _startWave();
  }, [hideWavePreviewOverlay, _startWave]);

  // Unlock animation handlers
  const handleUnlockAnimationComplete = useCallback(() => {
    setUnlockAnimation(prev => ({ ...prev, isVisible: false }));
  }, []);

  // Game effects hook
  const { screenShake, screenShakeIntensity, dimensions } = useGameEffects(unlockingSlots || new Set());
  
  // ✅ NEW: Enhanced visual effects integration
  useEffect(() => {
    const updateEnhancedEffects = () => {
      import('../../game-systems/effects-system/EnhancedVisualEffectsManager').then(({ enhancedVisualEffectsManager }) => {
        enhancedVisualEffectsManager.update(16); // 60 FPS update
      });
    };
    
    const effectInterval = setInterval(updateEnhancedEffects, 16);
    
    return () => {
      clearInterval(effectInterval);
    };
  }, []);

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

  // Wave preview countdown timer
  useEffect(() => {
    if (showWavePreview && wavePreviewCountdown > 0) {
      const timer = setInterval(() => {
        startWavePreviewCountdown();
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showWavePreview, wavePreviewCountdown, startWavePreviewCountdown]);

  // Handle notifications for unlock animations
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[notifications.length - 1];
      
      // Check if this is an unlock notification
      if (latestNotification.type === 'success' && 
          (latestNotification.message.includes('Unlocked') || 
           latestNotification.message.includes('Completed') ||
           latestNotification.message.includes('Earned'))) {
        
        // Determine animation type based on message content
        let type: 'upgrade' | 'reward' | 'achievement' | 'mission' = 'upgrade';
        let icon = '✨';
        
        if (latestNotification.message.includes('Achievement')) {
          type = 'achievement';
          icon = '🏆';
        } else if (latestNotification.message.includes('Mission')) {
          type = 'mission';
          icon = '🎯';
        } else if (latestNotification.message.includes('Reward')) {
          type = 'reward';
          icon = '🎁';
        }
        
        setUnlockAnimation({
          isVisible: true,
          type,
          title: latestNotification.message.split(':')[1]?.trim() || 'Unlocked!',
          description: latestNotification.message,
          icon
        });
      }
    }
  }, [notifications]);

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
        onSaveLoadClick={handleSaveLoadClick}
      />



      {/* Energy Warning */}
      <EnergyWarning />

      {/* Difficulty Indicator */}
      <DifficultyIndicator isVisible={isStarted && !isRefreshing} />

      {/* Wave Preview Overlay */}
      <WavePreviewOverlay
        isVisible={showWavePreview}
        onCountdownComplete={handleWavePreviewCountdownComplete}
      />

      {/* Unlock Animation */}
      <UnlockAnimation
        isVisible={unlockAnimation.isVisible}
        _type={unlockAnimation.type}
        title={unlockAnimation.title}
        description={unlockAnimation.description}
        icon={unlockAnimation.icon}
        onComplete={handleUnlockAnimationComplete}
      />

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

      {/* ✅ NEW: Enhanced Particle Effects Renderer */}
      <EnhancedParticleRenderer
        width={dimensions.width}
        height={dimensions.height}
        isActive={isStarted && !isRefreshing}
      />

      {/* Conditional Renderer */}
      <ConditionalRenderer />

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

      {/* Save/Load Panel */}
      <SaveLoadPanel
        isOpen={saveLoadPanelOpen}
        onClose={() => setSaveLoadPanelOpen(false)}
      />
    </div>
  );
}); 