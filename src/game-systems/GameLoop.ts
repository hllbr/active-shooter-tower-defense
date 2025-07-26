import { updateTowerFire, updateBullets } from './TowerManager';
import { updateEnemyMovement } from './EnemySpawner';
import { updateMineCollisions } from './MineManager';
import { useGameStore } from '../models/store';
import { stateTracker, performanceMonitor, GameStateSelectors } from './StateOptimizer';
import { SimplifiedEnvironmentManager } from './environment/SimplifiedEnvironmentManager';
import { aiManager } from './ai-automation';
import { FireHazardManager } from './FireHazardManager';

// Performance metrics for monitoring
interface GameLoopMetrics {
  totalFrames: number;
  skippedUpdates: number;
  lastFPS: number;
  avgDelta: number;
}

let gameLoopMetrics: GameLoopMetrics = {
  totalFrames: 0,
  skippedUpdates: 0,
  lastFPS: 0,
  avgDelta: 16
};

export function startGameLoop(existingManager?: SimplifiedEnvironmentManager) {
  let frameId = 0;
  let lastUpdateTime = performance.now();
  const lastStateSnapshot = {
    enemyCount: 0,
    bulletCount: 0,
    lastSignificantChange: 0
  };
  
  // Initialize simplified environment manager for optimal performance
  const environmentManager = existingManager ?? new SimplifiedEnvironmentManager();

  const loop = (currentTime: number) => {
    const deltaTime = currentTime - lastUpdateTime;
    gameLoopMetrics.totalFrames++;
    
    // Dynamic FPS cap based on activity level
    const state = useGameStore.getState();
    const isHighActivity = state.enemies.length > 20 || state.bullets.length > 30;
    const targetFrameTime = isHighActivity ? 16 : 20; // 60fps vs 50fps
    
    // Only update if enough time has passed
    if (deltaTime >= targetFrameTime) {
      // CRITICAL FIX: Stop game loop updates if game is over, paused, OR in upgrade screen
      if (state.isGameOver || state.isRefreshing || state.isPaused) {
        frameId = requestAnimationFrame(loop);
        return;
      }
      
      // Store previous counts for change detection
      const prevEnemyCount = lastStateSnapshot.enemyCount;
      const prevBulletCount = lastStateSnapshot.bulletCount;
      
      // Run core game logic updates only
      updateEnemyMovement();
      updateTowerFire();
      updateBullets(deltaTime);
      updateMineCollisions();
      
      // ✅ NEW: Check fire hazard time limits
      if (gameLoopMetrics.totalFrames % 10 === 0) { // Check every 10 frames
        const { towerSlots, destroyTowerByFire } = useGameStore.getState();
        towerSlots.forEach((slot, slotIdx) => {
          if (slot.tower && FireHazardManager.isTowerBurning(slot.tower)) {
            if (FireHazardManager.checkFireTimeLimit(slot.tower)) {
              destroyTowerByFire(slotIdx);
            }
          }
        });
      }
      
      // Execute automated AI actions
      if (gameLoopMetrics.totalFrames % 30 === 0) { // Every 30 frames (about 2 seconds at 60fps)
        aiManager.executeAutomatedActions();
      }
      
      // Update simplified environment (minimal processing)
      if (gameLoopMetrics.totalFrames % 10 === 0) {
        // Only update environment every 10 frames for performance
        const environmentState = environmentManager.getEnvironmentState();
        useGameStore.setState({
          weatherState: environmentState.weatherState, // Now managed by WeatherManager
          timeOfDayState: environmentState.timeOfDayState
        });
      }

      // Get current state after updates
      const updatedState = useGameStore.getState();
      const currentEnemyCount = updatedState.enemies.length;
      const currentBulletCount = updatedState.bullets.length;
      
      // Enhanced change detection using StateOptimizer
      const hasSignificantChange = stateTracker.hasSignificantChanges(updatedState);
      const needsVisualUpdate = GameStateSelectors.needsVisualUpdate(updatedState);
        
      if (hasSignificantChange || needsVisualUpdate) {
        // Batch the visual update to reduce setState calls
        const now = performance.now();
        const timeSinceLastUpdate = now - lastStateSnapshot.lastSignificantChange;
        
        // Dynamic throttling based on activity level
        const activityLevel = GameStateSelectors.getActivityLevel(updatedState);
        const throttleThreshold = activityLevel === 'high' ? 16 : 
                                activityLevel === 'medium' ? 25 : 40;
        
        // Smart update decision
        const shouldUpdate = timeSinceLastUpdate >= throttleThreshold || 
                           Math.abs(currentEnemyCount - prevEnemyCount) > 5 ||
                           Math.abs(currentBulletCount - prevBulletCount) > 10;
        
        if (shouldUpdate) {
          useGameStore.setState({ 
            lastUpdate: now
          });
          
          lastStateSnapshot.lastSignificantChange = now;
          stateTracker.updateSnapshot(updatedState);
          performanceMonitor.recordUpdate(false);
        } else {
          performanceMonitor.recordUpdate(true); // Skipped
        }
      } else {
        gameLoopMetrics.skippedUpdates++;
        performanceMonitor.recordUpdate(true);
      }
      
      // Update state snapshot
      lastStateSnapshot.enemyCount = currentEnemyCount;
      lastStateSnapshot.bulletCount = currentBulletCount;
      
      // At the end of each tick, log performance stats (debug only)
      // if (window && window['GAME_CONSTANTS'] && window['GAME_CONSTANTS'].DEBUG_MODE) {
      //   logPerformanceStats();
      // }
      
      // Calculate performance metrics
      gameLoopMetrics.avgDelta = (gameLoopMetrics.avgDelta * 0.9) + (deltaTime * 0.1);
      gameLoopMetrics.lastFPS = Math.round(1000 / gameLoopMetrics.avgDelta);
      
      lastUpdateTime = currentTime;
    }

    frameId = requestAnimationFrame(loop);
  };

  frameId = requestAnimationFrame(loop);

  return () => cancelAnimationFrame(frameId);
}

// Performance monitoring utilities
export const GameLoopPerformance = {
  getMetrics: (): GameLoopMetrics => ({ ...gameLoopMetrics }),
  
  logPerformance: () => {
    performanceMonitor.logPerformance();
  },
  
  resetMetrics: () => {
    gameLoopMetrics = {
      totalFrames: 0,
      skippedUpdates: 0,
      lastFPS: 0,
      avgDelta: 16
    };
  }
};
