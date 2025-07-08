import { GAME_CONSTANTS } from '../../../utils/constants';
import { securityManager } from '../../../security/SecurityManager';
import type { StateCreator } from 'zustand';
import type { Store } from '../index';
import { Logger } from '../../../utils/Logger';

export interface UpgradeSlice {
  upgradeBullet: (free?: boolean) => void;
  refreshBattlefield: (slots: number) => void;
  purchasePackage: (packageId: string, cost: number, maxAllowed: number) => boolean;
  getPackageInfo: (packageId: string, maxAllowed: number) => { purchaseCount: number; maxAllowed: number; canPurchase: boolean; isMaxed: boolean; };
  purchaseIndividualFireUpgrade: (upgradeId: string, cost: number, maxLevel: number) => boolean;
  getIndividualFireUpgradeInfo: (upgradeId: string, maxLevel: number) => { currentLevel: number; maxLevel: number; canUpgrade: boolean; isMaxed: boolean; };
  purchaseIndividualShieldUpgrade: (upgradeId: string, cost: number, maxLevel: number) => boolean;
  getIndividualShieldUpgradeInfo: (upgradeId: string, maxLevel: number) => { currentLevel: number; maxLevel: number; canUpgrade: boolean; isMaxed: boolean; };
  purchaseIndividualDefenseUpgrade: (upgradeId: string, cost: number, maxLevel: number) => boolean;
  getIndividualDefenseUpgradeInfo: (upgradeId: string, maxLevel: number) => { currentLevel: number; maxLevel: number; canUpgrade: boolean; isMaxed: boolean; };
  unlockTowerType: (towerType: string) => void;
  unlockSkin: (skinName: string) => void;
  initializeAchievements: () => void;
  triggerAchievementEvent: (eventType: string, eventData?: unknown) => void;
}

export const createUpgradeSlice: StateCreator<Store, [], [], UpgradeSlice> = (set, get, _api) => ({
  upgradeBullet: (free) => set((state: Store) => {
    const cost = free ? 0 : GAME_CONSTANTS.BULLET_UPGRADE_COST;
    if (state.gold < cost) return {};
    return {
      bulletLevel: Math.min(state.bulletLevel + 1, GAME_CONSTANTS.BULLET_TYPES.length - 1),
      gold: state.gold - cost,
      fireUpgradesPurchased: state.fireUpgradesPurchased + 1,
      totalGoldSpent: state.totalGoldSpent + cost,
    };
  }),

  refreshBattlefield: (slots) => set((state: Store) => {
    const newSlots = [...state.towerSlots];
    let unlocked = 0;
    for (let i = 0; i < newSlots.length && unlocked < slots; i++) {
      if (!newSlots[i].unlocked) {
        newSlots[i] = { ...newSlots[i], unlocked: true };
        unlocked++;
      }
    }
    return { towerSlots: newSlots, maxTowers: state.maxTowers + unlocked };
  }),

  purchasePackage: (packageId, cost, maxAllowed) => {
    const validation = securityManager.validateStateChange('purchasePackage', {}, { packageId, cost, maxAllowed });
    if (!validation.valid) {
      Logger.warn('🔒 Security: purchasePackage blocked:', validation.reason);
      return false;
    }
    if (!packageId || typeof packageId !== 'string') {
      Logger.warn('🔒 Security: Invalid package ID:', packageId);
      return false;
    }
    if (cost <= 0 || cost > 10000) {
      Logger.warn('🔒 Security: Invalid package cost:', cost);
      return false;
    }
    const state = get();
    const tracker = state.packageTracker[packageId] || { purchaseCount: 0, lastPurchased: 0, maxAllowed };
    const current = tracker.purchaseCount;
    if (current >= maxAllowed || state.gold < cost) return false;
    set({
      packageTracker: { ...state.packageTracker, [packageId]: { purchaseCount: current + 1, lastPurchased: Date.now(), maxAllowed } },
      gold: state.gold - cost,
      packagesPurchased: state.packagesPurchased + 1,
      totalGoldSpent: state.totalGoldSpent + cost,
    });
    return true;
  },

  getPackageInfo: (packageId, maxAllowed) => {
    const state = get();
    const tracker = state.packageTracker[packageId] || { purchaseCount: 0, lastPurchased: 0, maxAllowed };
    const purchaseCount = tracker.purchaseCount;
    return { purchaseCount, maxAllowed, canPurchase: purchaseCount < maxAllowed && state.gold >= 0, isMaxed: purchaseCount >= maxAllowed };
  },

  initializeAchievements: () => {
  },

  triggerAchievementEvent: (eventType, eventData) => {
  },

  unlockTowerType: (towerType) => set((state: Store) => {
    if (state.unlockedTowerTypes && state.unlockedTowerTypes.includes(towerType)) return {};
    return { unlockedTowerTypes: [...(state.unlockedTowerTypes || []), towerType] };
  }),

  unlockSkin: (skinName) => set((state: Store) => {
    if (state.playerProfile.unlockedCosmetics.includes(skinName)) return {};
    return { playerProfile: { ...state.playerProfile, unlockedCosmetics: [...state.playerProfile.unlockedCosmetics, skinName] } };
  }),

  purchaseIndividualFireUpgrade: (upgradeId, cost, maxLevel) => {
    const state = get();
    const currentLevel = state.individualFireUpgrades[upgradeId] || 0;
    if (currentLevel >= maxLevel || state.gold < cost) return false;
    set({
      individualFireUpgrades: { ...state.individualFireUpgrades, [upgradeId]: currentLevel + 1 },
      gold: state.gold - cost,
      fireUpgradesPurchased: state.fireUpgradesPurchased + 1,
      totalGoldSpent: state.totalGoldSpent + cost,
    });
    return true;
  },

  getIndividualFireUpgradeInfo: (upgradeId, maxLevel) => {
    const state = get();
    const currentLevel = state.individualFireUpgrades[upgradeId] || 0;
    return { currentLevel, maxLevel, canUpgrade: currentLevel < maxLevel, isMaxed: currentLevel >= maxLevel };
  },

  purchaseIndividualShieldUpgrade: (upgradeId, cost, maxLevel) => {
    const state = get();
    const currentLevel = state.individualShieldUpgrades[upgradeId] || 0;
    if (currentLevel >= maxLevel || state.gold < cost) return false;
    
    // Shield gücünü hesapla (upgradeId'den index çıkar)
    const shieldIndex = parseInt(upgradeId.replace('shield_', ''), 10);
    const shield = GAME_CONSTANTS.WALL_SHIELDS[shieldIndex];
    const strengthBonus = shield ? shield.strength : 0;
    
    set({
      individualShieldUpgrades: { ...state.individualShieldUpgrades, [upgradeId]: currentLevel + 1 },
      gold: state.gold - cost,
      shieldUpgradesPurchased: state.shieldUpgradesPurchased + 1,
      totalGoldSpent: state.totalGoldSpent + cost,
      globalWallStrength: state.globalWallStrength + strengthBonus, // CRITICAL FIX: Shield gücünü de güncelle
    });
    
    return true;
  },

  getIndividualShieldUpgradeInfo: (upgradeId, maxLevel) => {
    const state = get();
    const currentLevel = state.individualShieldUpgrades[upgradeId] || 0;
    return { currentLevel, maxLevel, canUpgrade: currentLevel < maxLevel, isMaxed: currentLevel >= maxLevel };
  },

  purchaseIndividualDefenseUpgrade: (upgradeId, cost, maxLevel) => {
    const state = get();
    const currentLevel = state.individualDefenseUpgrades[upgradeId] || 0;
    if (currentLevel >= maxLevel || state.gold < cost) return false;
    set({
      individualDefenseUpgrades: { ...state.individualDefenseUpgrades, [upgradeId]: currentLevel + 1 },
      gold: state.gold - cost,
      defenseUpgradesPurchased: state.defenseUpgradesPurchased + 1,
      totalGoldSpent: state.totalGoldSpent + cost,
    });
    return true;
  },

  getIndividualDefenseUpgradeInfo: (upgradeId, maxLevel) => {
    const state = get();
    const currentLevel = state.individualDefenseUpgrades[upgradeId] || 0;
    return { currentLevel, maxLevel, canUpgrade: currentLevel < maxLevel, isMaxed: currentLevel >= maxLevel };
  },
});
