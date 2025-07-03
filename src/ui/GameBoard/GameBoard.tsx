import React from 'react';
import { useGameStore } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/constants';
import { initUpgradeEffects } from '../../game-systems/UpgradeEffects';
import { UpgradeScreen } from '../game/UpgradeScreen';
import { useChallenge } from '../challenge/ChallengeContext';

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
  } = useGameStore();

  const { incrementChallenge } = useChallenge();
  const prevWaveRef = React.useRef(currentWave);

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

  // --- Mobil algılama ---
  const isMobile = typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches || /Mobi|Android/i.test(navigator.userAgent));

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