import { updateTowerFire, updateBullets } from './TowerManager';
import { updateEnemyMovement } from './EnemySpawner';
import { updateEffects } from './Effects';
import { updateMineCollisions } from './MineManager';
import { useGameStore } from '../models/store';

export function startGameLoop() {
  let frameId = 0;
  let lastUpdateTime = performance.now();

  const loop = (currentTime: number) => {
    const deltaTime = currentTime - lastUpdateTime;
    
    // Only update if enough time has passed (60 FPS cap)
    if (deltaTime >= 16) {
      updateEnemyMovement();
      updateTowerFire();
      updateBullets(deltaTime); // Pass actual deltaTime for frame-rate independence
      updateEffects();
      updateMineCollisions();

      // Only force re-render if there are active game objects
      const state = useGameStore.getState();
      if (state.enemies.length > 0 || state.bullets.length > 0 || state.effects.length > 0) {
        // Selective state update - only trigger re-render when needed
        useGameStore.setState({ 
          // Force re-render by updating a timestamp
          lastUpdate: currentTime 
        });
      }
      
      lastUpdateTime = currentTime;
    }

    frameId = requestAnimationFrame(loop);
  };

  frameId = requestAnimationFrame(loop);

  return () => cancelAnimationFrame(frameId);
}
