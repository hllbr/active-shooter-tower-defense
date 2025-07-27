import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { getTargetEnemy, TargetingMode } from '../../../game-systems/TowerManager';
import { formatProfessional } from '../../../utils/formatters';
import type { TowerSlot, Enemy, TowerClass } from '../../../models/gameTypes';
import type { TowerUpgradeInfo } from '../types';
import { playSound } from '../../../utils/sound/soundEffects';
import { useChallenge } from '../../challenge/hooks/useChallenge';
import { toast } from 'react-toastify';
import { gameFlowManager } from '../../../game-systems/GameFlowManager';

export const useTowerSpotLogic = (slot: TowerSlot, slotIdx: number) => {
  const gold = useGameStore((s) => s.gold);
  const buildTower = useGameStore((s) => s.buildTower);
  const upgradeTower = useGameStore((s) => s.upgradeTower);
  const repairTower = useGameStore((s) => s.repairTower);
  const removeTower = useGameStore((s) => s.removeTower);
  const unlockSlot = useGameStore((s) => s.unlockSlot);
  const maxTowers = useGameStore((s) => s.maxTowers);
  const wallLevel = useGameStore((s) => s.wallLevel);
  const performTileAction = useGameStore(s => s.performTileAction);
  const energy = useGameStore(s => s.energy);
  const enemies = useGameStore(s => s.enemies);
  const towerSlots = useGameStore(s => s.towerSlots);
  const unlockingSlots = useGameStore(s => s.unlockingSlots);
  const recentlyUnlockedSlots = useGameStore(s => s.recentlyUnlockedSlots);

  const { incrementChallenge } = useChallenge();

  // Menu state
  const [menuPos, setMenuPos] = React.useState<{x:number;y:number}|null>(null);
  const [showTowerSelection, setShowTowerSelection] = React.useState(false);

  // Animation states
  const isUnlocking = unlockingSlots.has(slotIdx);
  const isRecentlyUnlocked = recentlyUnlockedSlots.has(slotIdx);
  
  // Build logic using GameFlowManager for improved UI state
  const buildUIState = gameFlowManager.getBuildUIState(slotIdx);
  const canBuild = buildUIState.canBuild;

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

  // Repair logic
  const canRepair = Boolean(slot.tower && slot.tower.health < slot.tower.maxHealth);
  const damagePercentage = slot.tower ? 1 - (slot.tower.health / slot.tower.maxHealth) : 0;
  const repairCost = Math.ceil(GAME_CONSTANTS.TOWER_REPAIR_BASE_COST * damagePercentage);
  const repairEnergyCost = GAME_CONSTANTS.ENERGY_COSTS.buildTower;
  const hasEnoughGoldForRepair = gold >= repairCost;
  const hasEnoughEnergyForRepair = energy >= repairEnergyCost;
  const canAffordRepair = Boolean(canRepair && hasEnoughGoldForRepair && hasEnoughEnergyForRepair);
  const repairMessage = canRepair
    ? canAffordRepair
      ? `🔧 Tamir (${formatProfessional(repairCost, 'currency')}💰)`
      : !hasEnoughGoldForRepair
        ? `Yetersiz Altın (${formatProfessional(repairCost, 'currency')}💰)`
        : `Yetersiz Enerji (${repairEnergyCost})`
    : '';

  // Current tower info
  const currentTowerInfo: TowerUpgradeInfo | null = slot.tower ? GAME_CONSTANTS.TOWER_UPGRADES[slot.tower.level - 1] : null;
  const towerBottomY = slot.y + GAME_CONSTANTS.TOWER_SIZE / 2 + 15;

  
  const debugInfo = React.useMemo(() => {
    return null;
    const { enemy } = getTargetEnemy(slot.tower, enemies, TargetingMode.NEAREST);
    const firing = performance.now() - slot.tower.lastFired < 100;
    return enemy ? {
      enemy: enemy as Enemy,
      firing,
    } : null;
  }, [slot.tower, enemies]);

  // Show build text logic
  const shouldShowBuildText = canBuild;



  // Event handlers
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  const handleMenuClose = () => setMenuPos(null);

  const handleShowTowerSelection = () => {
    setShowTowerSelection(true);
  };

  const handleCloseTowerSelection = () => {
    setShowTowerSelection(false);
  };

  const handleSelectTower = (towerClass: TowerClass) => {
    const towerCost = GAME_CONSTANTS.SPECIALIZED_TOWERS[towerClass]?.cost ?? GAME_CONSTANTS.TOWER_COST;
    const energyCost = GAME_CONSTANTS.ENERGY_COSTS.buildTower;

    if (gold < towerCost) {
      toast.warning('Yetersiz altın!');
      playSound('error');
      return;
    }
    if (energy < energyCost) {
      toast.warning('Yetersiz enerji!');
      playSound('error');
      return;
    }

    // Build tower and show success message immediately
    buildTower(slotIdx, false, 'attack', towerClass);
    playSound('tower-create-sound');
    toast.success('Kule inşa edildi!');
    incrementChallenge('build');
    
    // Update pathfinding when tower is placed
    gameFlowManager.updatePathfinding();
    
    setShowTowerSelection(false);
  };

  const handleBuildTower = (slotIdx: number, type: 'attack' | 'economy' = 'attack') => {
    buildTower(slotIdx, false, type);
    playSound('tower-create-sound');
    toast.success('Kule inşa edildi!');
    incrementChallenge('build');
    
    // Update pathfinding when tower is placed
    gameFlowManager.updatePathfinding();
  };

  const handlePerformTileAction = (slotIdx: number, action: 'wall' | 'trench' | 'buff') => {
    performTileAction(slotIdx, action);
  };

  const handleUpgrade = (slotIdx: number) => {
    if (!canUpgrade) {
      toast.error('Kule yükseltilemez!');
      return;
    }
    if (!canAffordUpgrade) {
      if (!hasEnoughGold) {
        toast.warning('Yetersiz altın!');
      } else if (!hasEnoughEnergy) {
        toast.warning('Yetersiz enerji!');
      }
      return;
    }
    upgradeTower(slotIdx);
    toast.success('Kule yükseltildi!');
  };

  const handleRepair = (slotIdx: number) => {
    if (!canRepair) {
      toast.error('Kule tamir edilemez!');
      return;
    }
    if (!canAffordRepair) {
      if (!hasEnoughGoldForRepair) {
        toast.warning('Yetersiz altın!');
      } else if (!hasEnoughEnergyForRepair) {
        toast.warning('Yetersiz enerji!');
      }
      return;
    }
    repairTower(slotIdx);
    toast.success('Kule tamir edildi!');
  };

  const handleUnlock = (slotIdx: number) => {
    if (!canUnlock) {
      if (!(gold >= unlockCost)) {
        toast.warning(`Not enough gold! You need ${formatProfessional(unlockCost, 'currency')} to unlock this zone.`);
        playSound('error');
      } else if (!(energy >= GAME_CONSTANTS.ENERGY_COSTS.buildTower)) {
        toast.warning('Yetersiz enerji!');
        playSound('error');
      } else {
        toast.error('Slot açılamaz!');
        playSound('error');
      }
      return;
    }
    unlockSlot(slotIdx);
    toast.success('Zone unlocked! New build area available.');
    playSound('unlock');
  };

  const handleDelete = (slotIdx: number) => {
    removeTower(slotIdx);
    
    // Update pathfinding when tower is removed
    gameFlowManager.updatePathfinding();
  };

  return {
    // State
    menuPos,
    showTowerSelection,
    isUnlocking,
    isRecentlyUnlocked,
    canBuild,
    canUnlock,
    unlockCost,
    canUpgrade,
    upgradeInfo,
    canAffordUpgrade,
    upgradeMessage,
    canRepair,
    canAffordRepair,
    repairMessage,
    currentTowerInfo,
    towerBottomY,
    debugInfo,
    shouldShowBuildText,
    wallLevel,
    
    // Handlers
    handleContextMenu,
    handleMenuClose,
    handleShowTowerSelection,
    handleCloseTowerSelection,
    handleSelectTower,
    handleBuildTower,
    handlePerformTileAction,
    handleUpgrade,
    handleRepair,
    handleUnlock,
    handleDelete
  };
}; 