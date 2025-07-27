import { GAME_CONSTANTS } from '../../../utils/constants';
import type { StateCreator } from 'zustand';
import type { Store } from '../index';
import type { TowerClass } from '../../gameTypes';
import { gameAnalytics } from '../../../game-systems/analytics/GameAnalyticsManager';

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
  unlockAllTowerTypes: () => void;
  unlockSkin: (skinName: string) => void;
  setFirstTowerInfo: (info: { towerClass: TowerClass; towerName: string; slotIndex: number }) => void;
  initializeAchievements: () => void;
  triggerAchievementEvent: (eventType: string, eventData?: unknown) => void;
  
  // ✅ NEW: Enhanced upgrade features
  undoUpgrade: () => boolean;
  applyBatchUpgrades: (upgradeIds: string[]) => { success: boolean; applied: string[]; errors: string[] };
  getUpgradeCategory: (upgradeId: string) => 'active' | 'passive' | 'conditional' | null;
  getUpgradeHistory: () => Array<{ upgradeId: string; level: number; cost: number; timestamp: number }>;
  clearUpgradeHistory: () => void;
  purchaseSupportTowerUpgrade: (upgradeId: string, cost: number, maxLevel: number) => boolean;
  getSupportTowerUpgradeInfo: (upgradeId: string, maxLevel: number) => { currentLevel: number; maxLevel: number; canUpgrade: boolean; isMaxed: boolean; };
}

export const createUpgradeSlice: StateCreator<Store, [], [], UpgradeSlice> = (set, get, _api) => ({
  upgradeBullet: (free) => set((state: Store) => {
    const cost = free ? 0 : GAME_CONSTANTS.BULLET_UPGRADE_COST;
    if (state.gold < cost) return {};
    
    const newLevel = Math.min(state.bulletLevel + 1, GAME_CONSTANTS.BULLET_TYPES.length - 1);
    
    // Track analytics event
    gameAnalytics.trackEvent('upgrade_purchased', {
      upgradeType: 'bullet',
      level: newLevel,
      cost,
      free,
      wave: state.currentWave
    });
    
    return {
      bulletLevel: newLevel,
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

  triggerAchievementEvent: (_eventType, _eventData) => {
    // Achievement event triggering logic can be added here
  },

  unlockTowerType: (towerType) => set((state: Store) => {
    if (state.unlockedTowerTypes && state.unlockedTowerTypes.includes(towerType)) return {};
    return { unlockedTowerTypes: [...(state.unlockedTowerTypes || []), towerType] };
  }),

  unlockSkin: (skinName) => set((state: Store) => {
    if (state.playerProfile.unlockedCosmetics.includes(skinName)) return {};
    return { playerProfile: { ...state.playerProfile, unlockedCosmetics: [...state.playerProfile.unlockedCosmetics, skinName] } };
  }),

  // ✅ NEW: Enhanced upgrade features implementation
  undoUpgrade: () => {
    // Simple undo implementation for now
    // Undo upgrade requested
    return false; // Placeholder - will be implemented with UpgradeManager
  },

  applyBatchUpgrades: (_upgradeIds) => {
    // Batch upgrade requested
    return {
      success: false,
      applied: [],
      errors: ['Batch upgrades not yet implemented']
    };
  },

  getUpgradeCategory: (upgradeId) => {
    // Simple category mapping
    if (upgradeId.includes('energy')) return 'passive';
    if (upgradeId.includes('fire')) return 'active';
    if (upgradeId.includes('shield')) return 'conditional';
    return null;
  },

  getUpgradeHistory: () => {
    return []; // Placeholder - will be implemented with UpgradeManager
  },

  clearUpgradeHistory: () => {
    // Clear upgrade history requested
  },

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

  unlockAllTowerTypes: () => set((_state: Store) => {
    const allTowerTypes = [
      'sniper', 'gatling', 'laser', 'mortar', 'flamethrower', 'radar',
      'supply_depot', 'shield_generator', 'repair_station', 'emp',
      'stealth_detector', 'air_defense'
    ];
    return { unlockedTowerTypes: allTowerTypes };
  }),

  setFirstTowerInfo: (info) => set((_state: Store) => ({
    firstTowerInfo: info
  })),

  purchaseSupportTowerUpgrade: (upgradeId, cost, maxLevel) => {
    const state = get();
    const currentLevel = state.supportTowerUpgrades[upgradeId] || 0;
    if (currentLevel >= maxLevel || state.gold < cost) return false;
    set({
      supportTowerUpgrades: { ...state.supportTowerUpgrades, [upgradeId]: currentLevel + 1 },
      gold: state.gold - cost,
      totalGoldSpent: state.totalGoldSpent + cost,
    });
    return true;
  },
  getSupportTowerUpgradeInfo: (upgradeId, maxLevel) => {
    const state = get();
    const currentLevel = state.supportTowerUpgrades[upgradeId] || 0;
    return { currentLevel, maxLevel, canUpgrade: currentLevel < maxLevel, isMaxed: currentLevel >= maxLevel };
  },
});
