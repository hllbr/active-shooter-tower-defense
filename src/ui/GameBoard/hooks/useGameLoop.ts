import { useEffect, useRef } from 'react';
import { stopEnemyWave, startContinuousSpawning, stopContinuousSpawning } from '../../../game-systems/EnemySpawner';
import { startGameLoop } from '../../../game-systems/GameLoop';
import type { SimplifiedEnvironmentManager } from '../../../game-systems/environment/SimplifiedEnvironmentManager';
import { waveManager } from '../../../game-systems/WaveManager';
import { startBackgroundMusic } from '../../../utils/sound';

export const useGameLoop = (
  isStarted: boolean,
  isRefreshing: boolean,
  waveStatus: string,
  currentWave: number,
  environmentManager: SimplifiedEnvironmentManager | null
) => {
  const loopStopper = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isStarted || isRefreshing || waveStatus !== 'in_progress') {
      stopEnemyWave();
      stopContinuousSpawning();
      loopStopper.current?.();
      loopStopper.current = null;
      return;
    }
    
    if (!loopStopper.current) {
      loopStopper.current = startGameLoop(environmentManager ?? undefined);
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
  }, [isStarted, isRefreshing, waveStatus, currentWave, environmentManager]);
}; 