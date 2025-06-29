import React from 'react';
import { useGameStore } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/constants';
import { initUpgradeEffects } from '../../logic/UpgradeEffects';
import { UpgradeScreen } from '../game/UpgradeScreen';

// Import modular components
import {
  GameStatsPanel,
  EnergyWarning,
  DebugMessage,
  FrostOverlay,
  PreparationScreen,
  StartScreen,
  GameOverScreen,
  CommandCenter,
  NotificationSystem,
  GameArea
} from './components';

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
    initializeAchievements
  } = useGameStore();

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
  useGameLoop(isStarted, isRefreshing, isPreparing, currentWave);

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
      <GameStatsPanel onCommandCenterOpen={() => closeCommandCenter} />
      <EnergyWarning />
      <DebugMessage message={debugMessage} onClear={clearDebugMessage} />
      <PreparationScreen />
      <StartScreen />
      <GameOverScreen />
      <FrostOverlay />

      {isRefreshing && <UpgradeScreen />}
      
      {/* Command Center (S Key) */}
      <CommandCenter 
        isOpen={commandCenterOpen} 
        onClose={closeCommandCenter} 
      />

      {/* Notification System */}
      <NotificationSystem />

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
      />
    </div>
  );
}; 