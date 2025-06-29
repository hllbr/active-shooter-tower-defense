import { useEffect, useRef } from 'react';
import { stopEnemyWave, startContinuousSpawning, stopContinuousSpawning } from '../../../logic/EnemySpawner';
import { startGameLoop } from '../../../logic/GameLoop';
import { waveManager } from '../../../logic/WaveManager';
// import { startBackgroundMusic } from '../../../utils/sound'; // 🎵 OYUN MÜZİĞİ DEVRE DIŞI

export const useGameLoop = (
  isStarted: boolean,
  isRefreshing: boolean,
  isPreparing: boolean,
  currentWave: number
) => {
  const loopStopper = useRef<(() => void) | null>(null);

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
      // startBackgroundMusic(); // 🎵 OYUN MÜZİĞİ DEVRE DIŞI
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
}; 