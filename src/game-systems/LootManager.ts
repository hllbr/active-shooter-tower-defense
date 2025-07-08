import type { Enemy } from '../models/gameTypes';
import { useGameStore } from '../models/store';
import { playSound } from '../utils/sound/soundEffects';
import {
  determineRarity,
  determineLootType,
  calculateLootAmount,
  getLootName,
  getLootDescription,
  getRarityColor,
  getRarityScale,
  getPickupRadius,
  calculateLootValue,
  getLootVisualEffect
} from './loot/helpers/lootCalculations';

/**
 * Loot item interface for advanced loot system
 */
export interface LootItem {
  id: string;
  type: 'gold' | 'research_points' | 'upgrade_materials' | 'rare_components' | 'legendary_items' | 'achievements' | 'cosmetics' | 'experience';
  name: string;
  amount: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description: string;
  visualEffect?: string;
  position: { x: number; y: number };
  dropTime: number;
  autoPickup?: boolean;
  pickupRadius?: number;
  value?: number; // Gold equivalent value
}

/**
 * Loot drop configuration interface
 */
interface LootDropConfig {
  baseDropChance: number;
  rarityWeights: Record<string, number>;
  waveScaling: boolean;
  bossMultiplier: number;
  specialEnemyMultiplier: number;
}

/**
 * Advanced Loot Manager for comprehensive loot system
 */
export class LootManager {
  private static activeLootItems: Map<string, LootItem> = new Map();
  private static lootAnimationTimers: Map<string, number> = new Map();
  private static pickupRadius = 80;
  private static magnetRadius = 120;

  // Loot drop configuration
  private static lootConfig: LootDropConfig = {
    baseDropChance: 0.3, // 30% base chance for special loot
    rarityWeights: {
      common: 60,    // 60%
      uncommon: 25,  // 25%
      rare: 12,      // 12%
      epic: 3,       // 3%
      legendary: 0.5 // 0.5%
    },
    waveScaling: true,
    bossMultiplier: 5.0,
    specialEnemyMultiplier: 2.0
  };

  /**
   * Initialize loot system
   */
  static initialize() {
    this.activeLootItems.clear();
    this.lootAnimationTimers.clear();
  }

  /**
   * Handle enemy death and determine loot drops
   */
  static handleEnemyDeath(enemy: Enemy): void {
    // Always drop gold (existing system)
    this.dropGold(enemy);
    
    // Check for special loot drops
    const shouldDropSpecialLoot = this.shouldDropSpecialLoot(enemy);
    if (shouldDropSpecialLoot) {
      this.dropSpecialLoot(enemy);
    }
    
    // Handle boss-specific loot
    if (enemy.bossType && enemy.bossLootTable) {
      this.handleBossLoot(enemy);
    }
  }

  /**
   * Drop basic gold (enhanced with visual effects)
   */
  private static dropGold(enemy: Enemy): void {
    const { addGold, addEffect } = useGameStore.getState();
    
    // Enhanced gold drop with visual effect
    const goldAmount = this.calculateGoldDrop(enemy);
    addGold(goldAmount);
    
    // Create gold drop effect
    addEffect({
      id: `gold_drop_${enemy.id}`,
      position: enemy.position,
      radius: 15,
      color: '#ffd700',
      life: 1500,
      maxLife: 1500,
      type: 'gold_drop',
      opacity: 0.8,
      scale: 1.0,
    });
    
    // Play gold drop sound
    playSound('gold-drop');
  }

  /**
   * Calculate enhanced gold drop amount
   */
  private static calculateGoldDrop(enemy: Enemy): number {
    let baseGold = enemy.goldValue;
    
    // Wave scaling bonus
    const { currentWave } = useGameStore.getState();
    if (currentWave > 10) {
      baseGold *= 1 + (currentWave - 10) * 0.05; // 5% increase per wave after 10
    }
    
    // Special enemy bonus
    if (enemy.isSpecial) {
      baseGold *= this.lootConfig.specialEnemyMultiplier;
    }
    
    // Boss bonus
    if (enemy.bossType) {
      baseGold *= this.lootConfig.bossMultiplier;
    }
    
    return Math.floor(baseGold);
  }

  /**
   * Determine if enemy should drop special loot
   */
  private static shouldDropSpecialLoot(enemy: Enemy): boolean {
    let dropChance = this.lootConfig.baseDropChance;
    
    // Increase chance for special enemies
    if (enemy.isSpecial) {
      dropChance *= this.lootConfig.specialEnemyMultiplier;
    }
    
    // Bosses always drop special loot
    if (enemy.bossType) {
      return true;
    }
    
    // Wave scaling
    if (this.lootConfig.waveScaling) {
      const { currentWave } = useGameStore.getState();
      dropChance += (currentWave - 1) * 0.01; // 1% increase per wave
    }
    
    return Math.random() < dropChance;
  }

  /**
   * Drop special loot items
   */
  private static dropSpecialLoot(enemy: Enemy): void {
    const rarity = determineRarity(this.lootConfig.rarityWeights);
    const lootType = determineLootType(rarity);
    const amount = calculateLootAmount(lootType, rarity);
    
    const lootItem: LootItem = {
      id: `loot_${Date.now()}_${Math.random()}`,
      type: lootType,
      name: getLootName(lootType, rarity),
      amount,
      rarity,
      description: getLootDescription(lootType, rarity),
      visualEffect: getLootVisualEffect(rarity),
      position: {
        x: enemy.position.x + (Math.random() - 0.5) * 50,
        y: enemy.position.y + (Math.random() - 0.5) * 50,
      },
      dropTime: performance.now(),
      autoPickup: rarity === 'common',
      pickupRadius: getPickupRadius(rarity),
      value: calculateLootValue(lootType, amount),
    };
    
    this.createLootItem(lootItem);
  }

  /**
   * Handle boss-specific loot drops
   */
  private static handleBossLoot(enemy: Enemy): void {
    if (!enemy.bossLootTable) return;
    
    enemy.bossLootTable.forEach((lootEntry, index) => {
      if (Math.random() < lootEntry.dropChance) {
        const lootItem: LootItem = {
          id: `boss_loot_${enemy.id}_${index}`,
          type: lootEntry.itemType,
          name: lootEntry.itemName,
          amount: lootEntry.amount,
          rarity: lootEntry.rarity,
          description: lootEntry.description,
          visualEffect: lootEntry.visualEffect || getLootVisualEffect(lootEntry.rarity),
          position: {
            x: enemy.position.x + (Math.random() - 0.5) * 100,
            y: enemy.position.y + (Math.random() - 0.5) * 100,
          },
          dropTime: performance.now(),
          autoPickup: false, // Boss loot requires manual pickup
          pickupRadius: getPickupRadius(lootEntry.rarity),
          value: calculateLootValue(lootEntry.itemType, lootEntry.amount),
        };
        
        this.createLootItem(lootItem);
      }
    });
  }

  /**
   * Create and manage loot item
   */
  private static createLootItem(lootItem: LootItem): void {
    const { addEffect } = useGameStore.getState();
    
    // Add to active loot items
    this.activeLootItems.set(lootItem.id, lootItem);
    
    // Create visual effect
    addEffect({
      id: `loot_effect_${lootItem.id}`,
      position: lootItem.position,
      radius: lootItem.pickupRadius || 20,
      color: getRarityColor(lootItem.rarity),
      life: 10000, // 10 seconds visibility
      maxLife: 10000,
      type: 'loot_item',
      opacity: 0.9,
      scale: getRarityScale(lootItem.rarity),
    });
    
    // Auto-pickup for common items
    if (lootItem.autoPickup) {
      setTimeout(() => {
        this.pickupLootItem(lootItem.id);
      }, 1000);
    } else {
      // Show notification for valuable items
      if (lootItem.rarity !== 'common') {
        console.log(`Valuable loot dropped: ${lootItem.name} (${lootItem.rarity})`);
      }
    }
    
    // Play loot drop sound
    this.playLootDropSound(lootItem.rarity);
    
    // Set auto-expire timer
    const expireTimer = setTimeout(() => {
      this.expireLootItem(lootItem.id);
    }, 15000); // 15 seconds to pickup
    
    this.lootAnimationTimers.set(lootItem.id, expireTimer);
  }

  /**
   * Pickup loot item and apply effects
   */
  static pickupLootItem(lootId: string): boolean {
    const lootItem = this.activeLootItems.get(lootId);
    if (!lootItem) return false;
    
    const { addGold, addEffect } = useGameStore.getState();
    
    // Apply loot effects
    switch (lootItem.type) {
      case 'gold':
        addGold(lootItem.amount);
        break;
      case 'research_points':
        // Integrate with research system
        this.addResearchPoints(lootItem.amount);
        break;
      case 'upgrade_materials':
        this.addUpgradeMaterials(lootItem.amount);
        break;
      case 'rare_components':
        this.addRareComponents(lootItem.amount);
        break;
      case 'legendary_items':
        this.addLegendaryItem(lootItem.name);
        break;
      case 'experience':
        this.addExperience(lootItem.amount);
        break;
      default:
    }
    
    // Create pickup effect
    addEffect({
      id: `pickup_effect_${lootId}`,
      position: lootItem.position,
      radius: lootItem.pickupRadius! * 2,
      color: getRarityColor(lootItem.rarity),
      life: 800,
      maxLife: 800,
      type: 'loot_pickup',
      opacity: 1.0,
      scale: 2.0,
    });
    
    // Show pickup notification
    
    // Play pickup sound
    this.playLootPickupSound(lootItem.rarity);
    
    // Cleanup
    this.cleanupLootItem(lootId);
    
    return true;
  }

  /**
   * Update loot system (check for auto-pickup)
   */
  static update(): void {
    const { towers } = useGameStore.getState();
    
    // Check for magnet pickup (if player has magnet upgrade)
    this.activeLootItems.forEach((lootItem, lootId) => {
      if (lootItem.autoPickup) return;
      
      // Check distance to any tower for magnet effect
      const nearestTower = towers.find(tower => {
        const distance = Math.hypot(
          tower.position.x - lootItem.position.x,
          tower.position.y - lootItem.position.y
        );
        return distance <= this.magnetRadius;
      });
      
      if (nearestTower) {
        // Auto-pickup if near tower
        this.pickupLootItem(lootId);
      }
    });
  }

  /**
   * Determine loot rarity based on weights
   */

  /**
   * Play loot drop sound
   */
  private static playLootDropSound(rarity: string): void {
    const sounds: Record<string, string> = {
      common: 'loot-common',
      uncommon: 'loot-uncommon',
      rare: 'loot-rare',
      epic: 'loot-epic',
      legendary: 'loot-legendary'
    };
    
    playSound(sounds[rarity] || 'loot-common');
  }

  /**
   * Play loot pickup sound
   */
  private static playLootPickupSound(rarity: string): void {
    const sounds: Record<string, string> = {
      common: 'pickup-common',
      uncommon: 'pickup-uncommon',
      rare: 'pickup-rare',
      epic: 'pickup-epic',
      legendary: 'pickup-legendary'
    };
    
    playSound(sounds[rarity] || 'pickup-common');
  }

  /**
   * Helper methods for applying loot effects
   */
  private static addResearchPoints(_amount: number): void {
    // Integrate with research system when available
    console.log('Research points feature not yet implemented');
  }

  private static addUpgradeMaterials(_amount: number): void {
    // Integrate with upgrade materials system
    console.log('Upgrade materials feature not yet implemented');
  }

  private static addRareComponents(_amount: number): void {
    // Integrate with rare components system
    console.log('Rare components feature not yet implemented');
  }

  private static addLegendaryItem(_name: string): void {
    // Integrate with legendary items system
    console.log('Legendary items feature not yet implemented');
  }

  private static addExperience(_amount: number): void {
    // Integrate with experience system
    console.log('Experience system feature not yet implemented');
  }

  /**
   * Expire loot item if not picked up
   */
  private static expireLootItem(lootId: string): void {
    const { addEffect } = useGameStore.getState();
    const lootItem = this.activeLootItems.get(lootId);
    
    if (lootItem) {
      // Create expiration effect
      addEffect({
        id: `expire_effect_${lootId}`,
        position: lootItem.position,
        radius: 30,
        color: '#666666',
        life: 500,
        maxLife: 500,
        type: 'loot_expire',
        opacity: 0.5,
      });
    }
    
    this.cleanupLootItem(lootId);
  }

  /**
   * Cleanup loot item resources
   */
  private static cleanupLootItem(lootId: string): void {
    this.activeLootItems.delete(lootId);
    
    const timer = this.lootAnimationTimers.get(lootId);
    if (timer) {
      clearTimeout(timer);
      this.lootAnimationTimers.delete(lootId);
    }
  }

  /**
   * Get all active loot items
   */
  static getActiveLootItems(): Map<string, LootItem> {
    return new Map(this.activeLootItems);
  }

  /**
   * Check if position is near any loot item
   */
  static isNearLoot(position: { x: number; y: number }, radius: number = 50): boolean {
    for (const lootItem of this.activeLootItems.values()) {
      const distance = Math.hypot(
        position.x - lootItem.position.x,
        position.y - lootItem.position.y
      );
      if (distance <= radius) {
        return true;
      }
    }
    return false;
  }

  /**
   * Cleanup all loot resources
   */
  static cleanup(): void {
    // Clear all timers
    this.lootAnimationTimers.forEach(timer => clearTimeout(timer));
    
    // Clear all maps
    this.activeLootItems.clear();
    this.lootAnimationTimers.clear();
  }

  /**
   * Get loot statistics
   */
  static getLootStatistics(): {
    activeLootCount: number;
    totalValue: number;
    rarityBreakdown: Record<string, number>;
  } {
    const stats = {
      activeLootCount: this.activeLootItems.size,
      totalValue: 0,
      rarityBreakdown: {} as Record<string, number>
    };
    
    for (const lootItem of this.activeLootItems.values()) {
      stats.totalValue += lootItem.value || 0;
      stats.rarityBreakdown[lootItem.rarity] = (stats.rarityBreakdown[lootItem.rarity] || 0) + 1;
    }
    
    return stats;
  }
}

export default LootManager; 