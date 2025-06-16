import { updateTowerFire, updateBullets } from './TowerManager';
import { updateEnemyMovement } from './EnemySpawner';
import { GAME_CONSTANTS } from '../utils/Constants';

export function startGameLoop() {
  const interval = window.setInterval(() => {
    updateEnemyMovement();
    updateTowerFire();
    updateBullets();
  }, GAME_CONSTANTS.GAME_TICK);
  return () => clearInterval(interval);
}
