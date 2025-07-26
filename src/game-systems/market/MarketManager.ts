/**
 * 🏪 Market Manager
 * Centralized market system with progressive unlocks and categorization
 * Follows SOLID principles for maintainability and extensibility
 */

import { Logger } from '../../utils/Logger';
import type { WeatherEffectCard } from './WeatherEffectMarket';
import { unlockManager } from './UnlockManager';

export interface MarketItem {
  id: string;
  name: string;
  description: string;
  category: MarketCategory;
  icon: string;
  cost: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockRequirements: UnlockRequirements;
  isUnlocked: boolean;
  isOwned: boolean;
  originalItem: WeatherEffectCard | unknown; // Reference to original item
}

export type MarketCategory = 'offense' | 'defense' | 'support';

export interface UnlockRequirements {
  minWave?: number;
  minLevel?: number;
  minGold?: number;
  requiredAchievements?: string[];
  requiredMissions?: string[];
  requiredPurchases?: {
    category: string;
    count: number;
  };
}

export interface MarketCategoryInfo {
  id: MarketCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  itemCount: number;
}

export class MarketManager {
  private static instance: MarketManager | null = null;
  private marketItems: Map<string, MarketItem> = new Map();
  // Removed unused unlockProgress map

  private constructor() {
    this.initializeMarketItems();
  }

  public static getInstance(): MarketManager {
    if (!MarketManager.instance) {
      MarketManager.instance = new MarketManager();
    }
    return MarketManager.instance;
  }

  /**
   * Initialize market items with progressive unlock requirements
   */
  private initializeMarketItems(): void {
    // Import weather effect cards and convert to market items
    import('./WeatherEffectMarket').then(({ WEATHER_EFFECT_CARDS }) => {
      WEATHER_EFFECT_CARDS.forEach(card => {
        const marketItem: MarketItem = {
          id: card.id,
          name: card.name,
          description: card.description,
          category: this.mapEffectTypeToCategory(card.effectType),
          icon: card.icon,
          cost: card.cost,
          rarity: card.rarity,
          unlockRequirements: this.generateUnlockRequirements(card),
          isUnlocked: false,
          isOwned: false,
          originalItem: card
        };
        
        this.marketItems.set(card.id, marketItem);
      });
    });
  }

  /**
   * Map effect type to market category
   */
  private mapEffectTypeToCategory(effectType: string): MarketCategory {
    switch (effectType) {
      case 'offensive':
        return 'offense';
      case 'defensive':
        return 'defense';
      case 'utility':
        return 'support';
      default:
        return 'support';
    }
  }

  /**
   * Generate progressive unlock requirements based on item properties
   */
  private generateUnlockRequirements(card: WeatherEffectCard): UnlockRequirements {
    const requirements: UnlockRequirements = {};

    // Base requirements on rarity and cost
    switch (card.rarity) {
      case 'common':
        requirements.minWave = 1;
        requirements.minGold = Math.floor(card.cost * 0.5);
        break;
      case 'rare':
        requirements.minWave = 5;
        requirements.minGold = Math.floor(card.cost * 0.7);
        break;
      case 'epic':
        requirements.minWave = 15;
        requirements.minGold = Math.floor(card.cost * 0.8);
        break;
      case 'legendary':
        requirements.minWave = 30;
        requirements.minGold = Math.floor(card.cost * 0.9);
        break;
    }

    // Special requirements for specific items
    switch (card.id) {
      case 'lightning_storm':
        requirements.requiredAchievements = ['wave_survivor_10'];
        break;
      case 'frost_wave':
        requirements.requiredAchievements = ['wave_survivor_25'];
        break;
      case 'time_slow':
        requirements.requiredAchievements = ['wave_survivor_50'];
        break;
      case 'healing_rain':
        requirements.requiredPurchases = {
          category: 'defense',
          count: 3
        };
        break;
    }

    return requirements;
  }

  /**
   * Get market categories with item counts
   */
  public getMarketCategories(): MarketCategoryInfo[] {
    const categories: MarketCategoryInfo[] = [
      {
        id: 'offense',
        name: 'Offense (Firepower)',
        description: 'Attack and damage-focused items',
        icon: '⚔️',
        color: '#EF4444',
        itemCount: 0
      },
      {
        id: 'defense',
        name: 'Defense',
        description: 'Protection and survival items',
        icon: '🛡️',
        color: '#10B981',
        itemCount: 0
      },
      {
        id: 'support',
        name: 'Support',
        description: 'Utility and enhancement items',
        icon: '🔧',
        color: '#8B5CF6',
        itemCount: 0
      }
    ];

    // Calculate item counts
    this.marketItems.forEach(item => {
      const category = categories.find(c => c.id === item.category);
      if (category) {
        category.itemCount++;
      }
    });

    return categories;
  }

  /**
   * Get items for a specific category
   */
  public getItemsByCategory(category: MarketCategory): MarketItem[] {
    const items: MarketItem[] = [];
    
    this.marketItems.forEach(item => {
      if (item.category === category) {
        items.push(item);
      }
    });

    return items.sort((a, b) => {
      // Sort by unlock status, then by rarity, then by cost
      if (a.isUnlocked !== b.isUnlocked) {
        return a.isUnlocked ? -1 : 1;
      }
      
      const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
      const rarityDiff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
      if (rarityDiff !== 0) return rarityDiff;
      
      return a.cost - b.cost;
    });
  }

  /**
   * Check if an item is unlocked based on current game state
   */
  public checkItemUnlock(itemId: string): boolean {
    const item = this.marketItems.get(itemId);
    if (!item) return false;

    const progress = unlockManager.checkUnlockConditions(itemId, item.unlockRequirements);
    return progress.allConditionsMet;
  }

  /**
   * Update unlock status for all items
   */
  public updateUnlockStatus(): void {
    this.marketItems.forEach((item, itemId) => {
      const isUnlocked = this.checkItemUnlock(itemId);
      item.isUnlocked = isUnlocked;
      
      // Check if item is owned
      if (item.originalItem && 'id' in item.originalItem) {
        // This would need to be integrated with the existing weather market
        // For now, we'll assume items are not owned initially
        item.isOwned = false;
      }
    });
  }

  /**
   * Get unlock requirements text for display
   */
  public getUnlockRequirementsText(itemId: string): string[] {
    const progress = unlockManager.getUnlockProgress(itemId);
    if (!progress || progress.allConditionsMet) return [];

    return progress.conditions
      .filter(condition => !condition.isMet)
      .map(condition => {
        if (condition.currentValue !== undefined) {
          return `${condition.description} (Current: ${condition.currentValue})`;
        }
        return condition.description;
      });
  }

  /**
   * Purchase an item (delegates to appropriate system)
   */
  public purchaseItem(itemId: string): boolean {
    const item = this.marketItems.get(itemId);
    if (!item || !item.isUnlocked || item.isOwned) {
      return false;
    }

    // Delegate to weather market for weather items
    if (item.originalItem && 'effectType' in item.originalItem) {
      import('./WeatherEffectMarket').then(({ weatherEffectMarket }) => {
        const success = weatherEffectMarket.purchaseCard(itemId);
        if (success) {
          item.isOwned = true;
          Logger.log(`Market item purchased: ${item.name}`);
        }
      });
      return true;
    }

    return false;
  }

  /**
   * Get rarity color for UI
   */
  public static getRarityColor(rarity: string): string {
    switch (rarity) {
      case 'common': return '#9CA3AF';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return '#9CA3AF';
    }
  }

  /**
   * Get category color for UI
   */
  public static getCategoryColor(category: MarketCategory): string {
    switch (category) {
      case 'offense': return '#EF4444';
      case 'defense': return '#10B981';
      case 'support': return '#8B5CF6';
      default: return '#6B7280';
    }
  }
}

// Export singleton instance
export const marketManager = MarketManager.getInstance(); 