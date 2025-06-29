import { updateTowerFire, updateBullets } from './TowerManager';
import { updateEnemyMovement } from './EnemySpawner';
import { updateEffects } from './Effects';
import { updateMineCollisions } from './MineManager';
import { useGameStore } from '../models/store';
import { stateTracker, performanceMonitor, GameStateSelectors } from './StateOptimizer';

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

export function startGameLoop() {
  let frameId = 0;
  let lastUpdateTime = performance.now();
  const lastStateSnapshot = {
    enemyCount: 0,
    bulletCount: 0,
    effectCount: 0,
    lastSignificantChange: 0
  };

  const loop = (currentTime: number) => {
    const deltaTime = currentTime - lastUpdateTime;
    gameLoopMetrics.totalFrames++;
    
    // Dynamic FPS cap based on activity level
    const state = useGameStore.getState();
    const isHighActivity = state.enemies.length > 20 || state.bullets.length > 30;
    const targetFrameTime = isHighActivity ? 16 : 20; // 60fps vs 50fps
    
    // Only update if enough time has passed
    if (deltaTime >= targetFrameTime) {
      // ✅ CRITICAL FIX: Stop game loop updates if game is over
      if (state.isGameOver) {
        // Still request animation frame to show game over screen, but don't update game logic
        frameId = requestAnimationFrame(loop);
        return;
      }
      
      // Store previous counts for change detection
      const prevEnemyCount = lastStateSnapshot.enemyCount;
      const prevBulletCount = lastStateSnapshot.bulletCount;
      
      // Run game logic updates
      updateEnemyMovement();
      updateTowerFire();
      updateBullets(deltaTime);
      updateEffects();
      updateMineCollisions();

      // Get current state after updates
      const updatedState = useGameStore.getState();
      const currentEnemyCount = updatedState.enemies.length;
      const currentBulletCount = updatedState.bullets.length;
      const currentEffectCount = updatedState.effects.length;
      
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
                           Math.abs(currentBulletCount - prevBulletCount) > 10 ||
                           updatedState.isGameOver !== stateTracker['lastValues']?.isGameOver;
        
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
      lastStateSnapshot.effectCount = currentEffectCount;
      
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
    const efficiency = gameLoopMetrics.totalFrames > 0 ? 
      ((gameLoopMetrics.skippedUpdates / gameLoopMetrics.totalFrames) * 100).toFixed(1) : '0';
    
    console.log(`🎮 GameLoop Performance:
      FPS: ${gameLoopMetrics.lastFPS}
      Total Frames: ${gameLoopMetrics.totalFrames}
      Skipped Updates: ${gameLoopMetrics.skippedUpdates} (${efficiency}% saved)
      Avg Delta: ${gameLoopMetrics.avgDelta.toFixed(1)}ms`);
      
    // Also log StateOptimizer metrics
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
