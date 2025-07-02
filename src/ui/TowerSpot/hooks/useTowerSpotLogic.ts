import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { getNearestEnemy } from '../../../game-systems/TowerManager';
import { formatProfessional } from '../../../utils/formatters';
import type { TowerSlot, Enemy } from '../../../models/gameTypes';
import type { TowerUpgradeInfo } from '../types';
import { playSound } from '../../../utils/sound/soundEffects';

export const useTowerSpotLogic = (slot: TowerSlot, slotIdx: number) => {
  const gold = useGameStore((s) => s.gold);
  const buildTower = useGameStore((s) => s.buildTower);
  const upgradeTower = useGameStore((s) => s.upgradeTower);
  const unlockSlot = useGameStore((s) => s.unlockSlot);
  const maxTowers = useGameStore((s) => s.maxTowers);
  const wallLevel = useGameStore((s) => s.wallLevel);
  const performTileAction = useGameStore(s => s.performTileAction);
  const energy = useGameStore(s => s.energy);
  const enemies = useGameStore(s => s.enemies);
  const towerSlots = useGameStore(s => s.towerSlots);
  const unlockingSlots = useGameStore(s => s.unlockingSlots);
  const recentlyUnlockedSlots = useGameStore(s => s.recentlyUnlockedSlots);

  // Menu state
  const [menuPos, setMenuPos] = React.useState<{x:number;y:number}|null>(null);

  // Animation states
  const isUnlocking = unlockingSlots.has(slotIdx);
  const isRecentlyUnlocked = recentlyUnlockedSlots.has(slotIdx);
  
  // Build logic
  const canBuild = slot.unlocked && !slot.tower &&
    gold >= GAME_CONSTANTS.TOWER_COST &&
    energy >= GAME_CONSTANTS.ENERGY_COSTS.buildTower &&
    towerSlots.filter(s => s.tower).length < maxTowers;

  // Slot unlock logic
  const unlockCost = GAME_CONSTANTS.TOWER_SLOT_UNLOCK_GOLD[slotIdx] ?? 2400;
  const canUnlock = !slot.unlocked &&
    gold >= unlockCost &&
    energy >= GAME_CONSTANTS.ENERGY_COSTS.buildTower;
  
  // Upgrade logic
  const canUpgrade = Boolean(slot.tower && slot.tower.level < GAME_CONSTANTS.TOWER_MAX_LEVEL);
  const upgradeInfo: TowerUpgradeInfo | null = canUpgrade && slot.tower ? GAME_CONSTANTS.TOWER_UPGRADES[slot.tower.level] : null;
  const energyCost = GAME_CONSTANTS.ENERGY_COSTS.upgradeTower;
  const hasEnoughGold = upgradeInfo ? gold >= upgradeInfo.cost : false;
  const hasEnoughEnergy = energy >= energyCost;
  const canAffordUpgrade = Boolean(upgradeInfo && hasEnoughGold && hasEnoughEnergy);
  const upgradeMessage = upgradeInfo
    ? canAffordUpgrade
      ? `Yükselt (${formatProfessional(upgradeInfo.cost, 'currency')}💰)`
      : !hasEnoughGold
        ? `Yetersiz Altın (${formatProfessional(upgradeInfo.cost, 'currency')}💰)`
        : `Yetersiz Enerji (${energyCost})`
    : '';

  // Current tower info
  const currentTowerInfo: TowerUpgradeInfo | null = slot.tower ? GAME_CONSTANTS.TOWER_UPGRADES[slot.tower.level - 1] : null;
  const towerBottomY = slot.y + GAME_CONSTANTS.TOWER_SIZE / 2 + 15;

  // Debug info
  const debugInfo = React.useMemo(() => {
    if (!slot.tower || !GAME_CONSTANTS.DEBUG_MODE) return null;
    const { enemy } = getNearestEnemy(slot.tower.position, enemies);
    const firing = performance.now() - slot.tower.lastFired < 100;
    return enemy ? {
      enemy: enemy as Enemy,
      firing,
    } : null;
  }, [slot.tower, enemies]);

  // Show build text logic
  const shouldShowBuildText = canBuild;

  // Debug logging for slot unlock
  React.useEffect(() => {
    if (!slot.unlocked && slotIdx >= 4) {
      console.log(`🔍 Slot ${slotIdx} unlock status:`, {
        slotIdx,
        unlocked: slot.unlocked,
        unlockCost,
        costArray: GAME_CONSTANTS.TOWER_SLOT_UNLOCK_GOLD,
        gold,
        energy,
        energyNeeded: GAME_CONSTANTS.ENERGY_COSTS.buildTower,
        canUnlock,
        hasEnoughGold: gold >= unlockCost,
        hasEnoughEnergy: energy >= GAME_CONSTANTS.ENERGY_COSTS.buildTower
      });
    }
  }, [slot.unlocked, slotIdx, canUnlock, energy, gold, unlockCost]);

  // Event handlers
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  const handleMenuClose = () => setMenuPos(null);

  const handleBuildTower = (slotIdx: number, type: 'attack' | 'economy' = 'attack') => {
    buildTower(slotIdx, false, type);
    playSound('tower-create-sound');
  };

  const handlePerformTileAction = (slotIdx: number, action: 'wall' | 'trench' | 'buff') => {
    performTileAction(slotIdx, action);
  };

  const handleUpgrade = (slotIdx: number) => {
    upgradeTower(slotIdx);
  };

  const handleUnlock = (slotIdx: number) => {
    unlockSlot(slotIdx);
  };

  return {
    // State
    menuPos,
    isUnlocking,
    isRecentlyUnlocked,
    canBuild,
    canUnlock,
    unlockCost,
    canUpgrade,
    upgradeInfo,
    canAffordUpgrade,
    upgradeMessage,
    currentTowerInfo,
    towerBottomY,
    debugInfo,
    shouldShowBuildText,
    wallLevel,
    
    // Handlers
    handleContextMenu,
    handleMenuClose,
    handleBuildTower,
    handlePerformTileAction,
    handleUpgrade,
    handleUnlock
  };
}; 