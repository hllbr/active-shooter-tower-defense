import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/constants';
import type { TowerUpgradeListener } from '../models/gameTypes';

// CRITICAL FIX: Real Fire Upgrade Effects System
export class UpgradeEffectsManager {
  private static instance: UpgradeEffectsManager;

  public static getInstance(): UpgradeEffectsManager {
    if (!UpgradeEffectsManager.instance) {
      UpgradeEffectsManager.instance = new UpgradeEffectsManager();
    }
    return UpgradeEffectsManager.instance;
  }

  // CRITICAL: Fire Upgrade damage multiplier calculation
  public getFireDamageMultiplier(fireUpgradesPurchased: number): number {
    // Each fire upgrade adds 15% damage increase
    return 1 + (fireUpgradesPurchased * 0.15);
  }

  // CRITICAL: Fire Upgrade speed multiplier calculation  
  public getFireSpeedMultiplier(fireUpgradesPurchased: number): number {
    // Each fire upgrade adds 8% speed increase
    return 1 + (fireUpgradesPurchased * 0.08);
  }

  // CRITICAL: Shield Upgrade strength multiplier calculation
  public getShieldStrengthMultiplier(shieldUpgradesPurchased: number): number {
    // Each shield upgrade adds 25% wall strength increase
    return 1 + (shieldUpgradesPurchased * 0.25);
  }

  // CRITICAL: Package persistent bonuses calculation
  public getPackageBonuses(packageTracker: Record<string, { purchaseCount?: number }>): {
    energyBonus: number;
    actionBonus: number;
    damageBonus: number;
    speedBonus: number;
  } {
    let energyBonus = 0;
    let actionBonus = 0;
    let damageBonus = 0;
    let speedBonus = 0;

    // Calculate permanent bonuses from purchased packages
    Object.values(packageTracker).forEach((tracker) => {
      const count = tracker.purchaseCount || 0;
      
      // Each package gives cumulative bonuses
      energyBonus += count * 20; // +20 max energy per package
      actionBonus += count * 1;  // +1 action per package
      damageBonus += count * 0.05; // +5% damage per package
      speedBonus += count * 0.03; // +3% speed per package
    });

    return { energyBonus, actionBonus, damageBonus, speedBonus };
  }

  // CRITICAL: Apply all upgrade effects to bullet
  public applyUpgradeEffects(baseDamage: number, baseSpeed: number, bulletLevel: number): {
    damage: number;
    speed: number;
  } {
    const state = useGameStore.getState();
    
    // Bullet type multipliers (already working)
    const bulletType = GAME_CONSTANTS.BULLET_TYPES[bulletLevel - 1];
    let damage = baseDamage * bulletType.damageMultiplier;
    let speed = baseSpeed * (bulletType.speedMultiplier || 1);

    // CRITICAL FIX: Apply fire upgrades multiplier
    const fireDamageMultiplier = this.getFireDamageMultiplier(state.fireUpgradesPurchased);
    const fireSpeedMultiplier = this.getFireSpeedMultiplier(state.fireUpgradesPurchased);
    
    damage *= fireDamageMultiplier;
    speed *= fireSpeedMultiplier;

    // CRITICAL FIX: Apply package bonuses
    const packageBonuses = this.getPackageBonuses(state.packageTracker);
    damage *= (1 + packageBonuses.damageBonus);
    speed *= (1 + packageBonuses.speedBonus);

    return { damage, speed };
  }

  // CRITICAL: Apply shield upgrades to wall strength
  public applyShieldUpgrades(baseWallStrength: number): number {
    const state = useGameStore.getState();
    const multiplier = this.getShieldStrengthMultiplier(state.shieldUpgradesPurchased);
    return Math.floor(baseWallStrength * multiplier);
  }
}

// Create singleton instance
export const upgradeEffectsManager = UpgradeEffectsManager.getInstance();

// Original visual effects system (keep for backward compatibility)
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
