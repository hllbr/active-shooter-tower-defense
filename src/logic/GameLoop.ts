import { updateTowerFire, updateBullets } from './TowerManager';
import { updateEnemyMovement } from './EnemySpawner';
import { updateEffects } from './Effects';
import { GAME_CONSTANTS } from '../utils/Constants';

export function startGameLoop() {
  const interval = window.setInterval(() => {
    updateEnemyMovement();
    updateTowerFire();
    updateBullets();
    updateEffects();
  }, GAME_CONSTANTS.GAME_TICK);
  return () => clearInterval(interval);
}
