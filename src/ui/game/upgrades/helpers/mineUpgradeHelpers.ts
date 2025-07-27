import { GAME_CONSTANTS } from '../../../utils/constants';

interface DefenseUpgradeLimits {
  mines: {
    purchaseCount: number;
  };
}

export function getMineUpgradeState(
  gold: number,
  mineLevel: number,
  defenseUpgradeLimits: DefenseUpgradeLimits,
  discountMultiplier: number,
  diceUsed: boolean
) {
  const maxMineLevel = GAME_CONSTANTS.MINE_UPGRADES.length;
  const isMaxMineLevel = mineLevel >= maxMineLevel;
  const isMaxMinePurchases =
    defenseUpgradeLimits.mines.purchaseCount >=
    GAME_CONSTANTS.DEFENSE_UPGRADE_LIMITS.MINES.MAX_PURCHASES;
  const isMineUpgradeBlocked = isMaxMineLevel || isMaxMinePurchases;

  const mineUpgrade = isMineUpgradeBlocked
    ? null
    : GAME_CONSTANTS.MINE_UPGRADES[mineLevel];
  const baseCost = mineUpgrade?.cost || 0;
  const discountedCost = diceUsed && discountMultiplier > 0
    ? Math.floor(baseCost * (1 - discountMultiplier))
    : baseCost;
  const finalCost = Math.max(1, discountedCost);
  const canAffordMines = mineUpgrade ? gold >= finalCost : false;

  return {
    maxMineLevel,
    isMaxMineLevel,
    isMaxMinePurchases,
    isMineUpgradeBlocked,
    mineUpgrade,
    baseCost,
    finalCost,
    canAffordMines
  };
}
