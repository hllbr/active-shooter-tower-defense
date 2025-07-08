import type { Store } from '../index';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { energyManager } from '../../../game-systems/EnergyManager';
import { useGameStore } from '../index';

export function unlockSlotAction(state: Store, slotIdx: number): Partial<Store> {
  const slot = state.towerSlots[slotIdx];
  if (slot.unlocked) {
    return {};
  }

  const cost = GAME_CONSTANTS.TOWER_SLOT_UNLOCK_GOLD[slotIdx] ?? 2400;
  if (state.gold < cost) {
    return {};
  }

  const energyCost = GAME_CONSTANTS.ENERGY_COSTS.buildTower;
  if (!energyManager.consume(energyCost, 'unlockSlot')) {
    return {};
  }

  const newSlots = [...state.towerSlots];
  newSlots[slotIdx] = { ...slot, unlocked: true };


  setTimeout(() => {
    import('../../../utils/sound').then(({ playContextualSound }) => {
      playContextualSound('unlock');
    });

    const { startSlotUnlockAnimation, finishSlotUnlockAnimation } = useGameStore.getState();
    startSlotUnlockAnimation(slotIdx);
    setTimeout(() => {
      finishSlotUnlockAnimation(slotIdx);
      setTimeout(() => {
        const { clearRecentlyUnlockedSlots } = useGameStore.getState();
        clearRecentlyUnlockedSlots();
      }, 500);
    }, 200);
  }, 25);

  return {
    towerSlots: newSlots,
    gold: state.gold - cost,
    maxTowers: state.maxTowers + 1,
    totalGoldSpent: state.totalGoldSpent + cost,
  };
}
