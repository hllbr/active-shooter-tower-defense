import type { Enemy, Effect, BossLootEntry } from '../models/gameTypes';
import { useGameStore } from '../models/store';
import { soundEffects } from '../utils/sound';

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
  private static lootAnimationTimers: Map<string, NodeJS.Timeout> = new Map();
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
    soundEffects.playSound('gold-drop');
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
    const rarity = this.determineRarity();
    const lootType = this.determineLootType(rarity);
    const amount = this.calculateLootAmount(lootType, rarity);
    
    const lootItem: LootItem = {
      id: `loot_${Date.now()}_${Math.random()}`,
      type: lootType,
      name: this.getLootName(lootType, rarity),
      amount,
      rarity,
      description: this.getLootDescription(lootType, rarity),
      visualEffect: this.getLootVisualEffect(rarity),
      position: {
        x: enemy.position.x + (Math.random() - 0.5) * 50,
        y: enemy.position.y + (Math.random() - 0.5) * 50,
      },
      dropTime: performance.now(),
      autoPickup: rarity === 'common',
      pickupRadius: this.getPickupRadius(rarity),
      value: this.calculateLootValue(lootType, amount, rarity),
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
          visualEffect: lootEntry.visualEffect || this.getLootVisualEffect(lootEntry.rarity),
          position: {
            x: enemy.position.x + (Math.random() - 0.5) * 100,
            y: enemy.position.y + (Math.random() - 0.5) * 100,
          },
          dropTime: performance.now(),
          autoPickup: false, // Boss loot requires manual pickup
          pickupRadius: this.getPickupRadius(lootEntry.rarity),
          value: this.calculateLootValue(lootEntry.itemType, lootEntry.amount, lootEntry.rarity),
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
      color: this.getRarityColor(lootItem.rarity),
      life: 10000, // 10 seconds visibility
      maxLife: 10000,
      type: 'loot_item',
      opacity: 0.9,
      scale: this.getRarityScale(lootItem.rarity),
    });
    
    // Auto-pickup for common items
    if (lootItem.autoPickup) {
      setTimeout(() => {
        this.pickupLootItem(lootItem.id);
      }, 1000);
    } else {
      // Show notification for valuable items
      if (lootItem.rarity !== 'common') {
        console.log(`Loot dropped: ${lootItem.name}`);
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
        console.log(`Unknown loot type: ${lootItem.type}`);
    }
    
    // Create pickup effect
    addEffect({
      id: `pickup_effect_${lootId}`,
      position: lootItem.position,
      radius: lootItem.pickupRadius! * 2,
      color: this.getRarityColor(lootItem.rarity),
      life: 800,
      maxLife: 800,
      type: 'loot_pickup',
      opacity: 1.0,
      scale: 2.0,
    });
    
    // Show pickup notification
    console.log(`Loot picked up: +${lootItem.amount} ${lootItem.name}`);
    
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
  private static determineRarity(): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const [rarity, weight] of Object.entries(this.lootConfig.rarityWeights)) {
      cumulative += weight;
      if (random <= cumulative) {
        return rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
      }
    }
    
    return 'common';
  }

  /**
   * Determine loot type based on rarity
   */
  private static determineLootType(rarity: string): LootItem['type'] {
    const typesByRarity: Record<string, LootItem['type'][]> = {
      common: ['gold', 'experience'],
      uncommon: ['research_points', 'upgrade_materials'],
      rare: ['rare_components', 'upgrade_materials'],
      epic: ['rare_components', 'legendary_items'],
      legendary: ['legendary_items', 'cosmetics']
    };
    
    const availableTypes = typesByRarity[rarity] || ['gold'];
    return availableTypes[Math.floor(Math.random() * availableTypes.length)];
  }

  /**
   * Calculate loot amount based on type and rarity
   */
  private static calculateLootAmount(type: LootItem['type'], rarity: string): number {
    const baseAmounts: Record<LootItem['type'], number> = {
      gold: 50,
      research_points: 10,
      upgrade_materials: 1,
      rare_components: 1,
      legendary_items: 1,
      achievements: 1,
      cosmetics: 1,
      experience: 25
    };
    
    const rarityMultipliers: Record<string, number> = {
      common: 1,
      uncommon: 2,
      rare: 4,
      epic: 8,
      legendary: 15
    };
    
    const baseAmount = baseAmounts[type] || 1;
    const multiplier = rarityMultipliers[rarity] || 1;
    
    return Math.floor(baseAmount * multiplier);
  }

  /**
   * Get loot name based on type and rarity
   */
  private static getLootName(type: LootItem['type'], rarity: string): string {
    const names: Record<LootItem['type'], Record<string, string>> = {
      gold: {
        common: 'Gold Coins',
        uncommon: 'Gold Purse',
        rare: 'Gold Chest',
        epic: 'Gold Treasury',
        legendary: 'Gold Vault'
      },
      research_points: {
        common: 'Research Notes',
        uncommon: 'Research Data',
        rare: 'Advanced Research',
        epic: 'Breakthrough Research',
        legendary: 'Revolutionary Discovery'
      },
      upgrade_materials: {
        common: 'Basic Materials',
        uncommon: 'Quality Materials',
        rare: 'Advanced Materials',
        epic: 'Master Materials',
        legendary: 'Legendary Materials'
      },
      rare_components: {
        common: 'Component',
        uncommon: 'Quality Component',
        rare: 'Rare Component',
        epic: 'Epic Component',
        legendary: 'Legendary Component'
      },
      legendary_items: {
        common: 'Item',
        uncommon: 'Quality Item',
        rare: 'Rare Item',
        epic: 'Epic Item',
        legendary: 'Legendary Artifact'
      },
      achievements: {
        common: 'Achievement',
        uncommon: 'Achievement',
        rare: 'Achievement',
        epic: 'Achievement',
        legendary: 'Legendary Achievement'
      },
      cosmetics: {
        common: 'Cosmetic',
        uncommon: 'Quality Cosmetic',
        rare: 'Rare Cosmetic',
        epic: 'Epic Cosmetic',
        legendary: 'Legendary Cosmetic'
      },
      experience: {
        common: 'Experience',
        uncommon: 'Bonus Experience',
        rare: 'Major Experience',
        epic: 'Massive Experience',
        legendary: 'Ultimate Experience'
      }
    };
    
    return names[type]?.[rarity] || 'Unknown Item';
  }

  /**
   * Get loot description
   */
  private static getLootDescription(type: LootItem['type'], rarity: string): string {
    return `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ${type.replace('_', ' ')}`;
  }

  /**
   * Get rarity color
   */
  private static getRarityColor(rarity: string): string {
    const colors: Record<string, string> = {
      common: '#ffffff',
      uncommon: '#00ff00',
      rare: '#0080ff',
      epic: '#9933ff',
      legendary: '#ff8000'
    };
    
    return colors[rarity] || '#ffffff';
  }

  /**
   * Get rarity scale for visual effects
   */
  private static getRarityScale(rarity: string): number {
    const scales: Record<string, number> = {
      common: 1.0,
      uncommon: 1.2,
      rare: 1.4,
      epic: 1.6,
      legendary: 2.0
    };
    
    return scales[rarity] || 1.0;
  }

  /**
   * Get pickup radius based on rarity
   */
  private static getPickupRadius(rarity: string): number {
    const radii: Record<string, number> = {
      common: 40,
      uncommon: 50,
      rare: 60,
      epic: 70,
      legendary: 80
    };
    
    return radii[rarity] || 40;
  }

  /**
   * Calculate loot value (gold equivalent)
   */
  private static calculateLootValue(type: LootItem['type'], amount: number, _rarity: string): number {
    const typeValues: Record<LootItem['type'], number> = {
      gold: 1,
      research_points: 5,
      upgrade_materials: 20,
      rare_components: 50,
      legendary_items: 200,
      achievements: 0,
      cosmetics: 0,
      experience: 2
    };
    
    return (typeValues[type] || 0) * amount;
  }

  /**
   * Get visual effect name
   */
  private static getLootVisualEffect(rarity: string): string {
    const effects: Record<string, string> = {
      common: 'simple_glow',
      uncommon: 'green_sparkle',
      rare: 'blue_aura',
      epic: 'purple_energy',
      legendary: 'golden_explosion'
    };
    
    return effects[rarity] || 'simple_glow';
  }

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
    
    soundEffects.playSound(sounds[rarity] || 'loot-common');
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
    
    soundEffects.playSound(sounds[rarity] || 'pickup-common');
  }

  /**
   * Helper methods for applying loot effects
   */
  private static addResearchPoints(amount: number): void {
    // Integrate with research system when available
    console.log(`+${amount} Research Points`);
  }

  private static addUpgradeMaterials(amount: number): void {
    // Integrate with upgrade materials system
    console.log(`+${amount} Upgrade Materials`);
  }

  private static addRareComponents(amount: number): void {
    // Integrate with rare components system
    console.log(`+${amount} Rare Components`);
  }

  private static addLegendaryItem(name: string): void {
    // Integrate with legendary items system
    console.log(`Acquired: ${name}`);
  }

  private static addExperience(amount: number): void {
    // Integrate with experience system
    console.log(`+${amount} Experience`);
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