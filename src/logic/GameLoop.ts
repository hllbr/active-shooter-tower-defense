import { updateTowerFire, updateBullets } from './TowerManager';
import { updateEnemyMovement } from './EnemySpawner';
import { updateEffects } from './Effects';
import { updateMineCollisions } from './MineManager';
import { useGameStore } from '../models/store';

export function startGameLoop() {
  let frameId = 0;

  const loop = () => {
    updateEnemyMovement();
    updateTowerFire();
    updateBullets();
    updateEffects();
    updateMineCollisions();

    // Force state update so React re-renders with new positions
    useGameStore.setState({});

    frameId = requestAnimationFrame(loop);
  };

  frameId = requestAnimationFrame(loop);

  return () => cancelAnimationFrame(frameId);
}
