import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/Constants';
import type { TowerUpgradeListener } from '../models/gameTypes';

export function initUpgradeEffects() {
  const { addTowerUpgradeListener, addEffect } = useGameStore.getState();
  const listener: TowerUpgradeListener = (tower, _oldLevel, newLevel) => {
    const visual = GAME_CONSTANTS.TOWER_VISUALS.find(v => v.level === newLevel);
    if (visual?.effect) {
      addEffect({
        id: `${Date.now()}-${Math.random()}`,
        position: tower.position,
        radius: 40,
        color: '#88f',
        life: 600,
        maxLife: 600,
      });
    }
  };
  addTowerUpgradeListener(listener);
}
