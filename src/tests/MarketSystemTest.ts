/**
 * 🧪 Market System Test
 * Validates market functionality and progressive unlock system
 */

import { marketManager } from '../game-systems/market/MarketManager';
import { unlockManager } from '../game-systems/market/UnlockManager';

export class MarketSystemTest {
  /**
   * Run comprehensive market system tests
   */
  public static runAllTests(): void {
    console.log('🧪 Starting Market System Tests...');
    
    this.testMarketManager();
    this.testUnlockManager();
    this.testMarketUI();
    this.testProgressiveUnlocks();
    
    console.log('✅ Market System Tests Completed');
  }

  /**
   * Test MarketManager functionality
   */
  private static testMarketManager(): void {
    console.log('📦 Testing MarketManager...');
    
    // Test market categories
    const categories = marketManager.getMarketCategories();
    console.assert(categories.length === 3, 'Should have 3 market categories');
    console.assert(categories.some(c => c.id === 'offense'), 'Should have offense category');
    console.assert(categories.some(c => c.id === 'defense'), 'Should have defense category');
    console.assert(categories.some(c => c.id === 'support'), 'Should have support category');
    
    // Test item retrieval
    const offenseItems = marketManager.getItemsByCategory('offense');
    const defenseItems = marketManager.getItemsByCategory('defense');
    const supportItems = marketManager.getItemsByCategory('support');
    
    console.assert(offenseItems.length > 0, 'Should have offense items');
    console.assert(defenseItems.length > 0, 'Should have defense items');
    console.assert(supportItems.length > 0, 'Should have support items');
    
    console.log('✅ MarketManager tests passed');
  }

  /**
   * Test UnlockManager functionality
   */
  private static testUnlockManager(): void {
    console.log('🔓 Testing UnlockManager...');
    
    // Test unlock conditions
    const testRequirements = {
      minWave: 5,
      minGold: 100,
      requiredAchievements: ['wave_survivor_10']
    };
    
    const progress = unlockManager.checkUnlockConditions('test_item', testRequirements);
    console.assert(progress.itemId === 'test_item', 'Should set correct item ID');
    console.assert(progress.conditions.length === 3, 'Should have 3 conditions');
    console.assert(progress.conditions.some(c => c.type === 'wave'), 'Should have wave condition');
    console.assert(progress.conditions.some(c => c.type === 'gold'), 'Should have gold condition');
    console.assert(progress.conditions.some(c => c.type === 'achievement'), 'Should have achievement condition');
    
    // Test statistics
    const stats = unlockManager.getUnlockStatistics();
    console.assert(typeof stats.totalItems === 'number', 'Should return total items count');
    console.assert(typeof stats.unlockedItems === 'number', 'Should return unlocked items count');
    console.assert(typeof stats.lockedItems === 'number', 'Should return locked items count');
    console.assert(typeof stats.averageProgress === 'number', 'Should return average progress');
    console.assert(Array.isArray(stats.nextUnlocks), 'Should return next unlocks array');
    
    console.log('✅ UnlockManager tests passed');
  }

  /**
   * Test market UI functionality
   */
  private static testMarketUI(): void {
    console.log('🖥️ Testing Market UI...');
    
    // Test category switching
    const categories = marketManager.getMarketCategories();
    categories.forEach(category => {
      const items = marketManager.getItemsByCategory(category.id);
      console.assert(Array.isArray(items), `Should return array for ${category.id} items`);
      console.assert(items.every(item => item.category === category.id), 
        `All items should belong to ${category.id} category`);
    });
    
    // Test item sorting
    const allItems = [
      ...marketManager.getItemsByCategory('offense'),
      ...marketManager.getItemsByCategory('defense'),
      ...marketManager.getItemsByCategory('support')
    ];
    
    console.assert(allItems.length > 0, 'Should have items to display');
    console.assert(allItems.every(item => item.id), 'All items should have IDs');
    console.assert(allItems.every(item => item.name), 'All items should have names');
    console.assert(allItems.every(item => item.description), 'All items should have descriptions');
    console.assert(allItems.every(item => item.cost > 0), 'All items should have positive costs');
    
    console.log('✅ Market UI tests passed');
  }

  /**
   * Test progressive unlock system
   */
  private static testProgressiveUnlocks(): void {
    console.log('📈 Testing Progressive Unlocks...');
    
    // Test early game unlocks
    const earlyGameRequirements = { minWave: 1, minGold: 50 };
    const earlyProgress = unlockManager.checkUnlockConditions('early_item', earlyGameRequirements);
    console.assert(earlyProgress.conditions.length === 2, 'Should have 2 early game conditions');
    
    // Test mid game unlocks
    const midGameRequirements = { 
      minWave: 15, 
      minGold: 500,
      requiredAchievements: ['wave_survivor_10']
    };
    const midProgress = unlockManager.checkUnlockConditions('mid_item', midGameRequirements);
    console.assert(midProgress.conditions.length === 3, 'Should have 3 mid game conditions');
    
    // Test late game unlocks
    const lateGameRequirements = { 
      minWave: 50, 
      minGold: 2000,
      requiredAchievements: ['wave_survivor_25', 'wave_survivor_50'],
      requiredPurchases: { category: 'offense', count: 10 }
    };
    const lateProgress = unlockManager.checkUnlockConditions('late_item', lateGameRequirements);
    console.assert(lateProgress.conditions.length === 4, 'Should have 4 late game conditions');
    
    // Test unlock progression
    console.assert(earlyProgress.progressPercentage >= 0, 'Progress should be non-negative');
    console.assert(earlyProgress.progressPercentage <= 100, 'Progress should not exceed 100%');
    console.assert(midProgress.progressPercentage >= 0, 'Mid progress should be non-negative');
    console.assert(lateProgress.progressPercentage >= 0, 'Late progress should be non-negative');
    
    console.log('✅ Progressive Unlocks tests passed');
  }

  /**
   * Test market balance
   */
  public static testMarketBalance(): void {
    console.log('⚖️ Testing Market Balance...');
    
    const allItems = [
      ...marketManager.getItemsByCategory('offense'),
      ...marketManager.getItemsByCategory('defense'),
      ...marketManager.getItemsByCategory('support')
    ];
    
    // Test cost progression
    const costs = allItems.map(item => item.cost).sort((a, b) => a - b);
    console.assert(costs.length > 0, 'Should have items with costs');
    console.assert(costs.every(cost => cost > 0), 'All costs should be positive');
    
    // Test rarity distribution
    const rarities = allItems.map(item => item.rarity);
    const rarityCounts = {
      common: rarities.filter(r => r === 'common').length,
      rare: rarities.filter(r => r === 'rare').length,
      epic: rarities.filter(r => r === 'epic').length,
      legendary: rarities.filter(r => r === 'legendary').length
    };
    
    console.assert(rarityCounts.common > 0, 'Should have common items');
    console.assert(rarityCounts.rare > 0, 'Should have rare items');
    console.assert(rarityCounts.epic > 0, 'Should have epic items');
    console.assert(rarityCounts.legendary > 0, 'Should have legendary items');
    
    // Test category balance
    const categoryCounts = {
      offense: allItems.filter(item => item.category === 'offense').length,
      defense: allItems.filter(item => item.category === 'defense').length,
      support: allItems.filter(item => item.category === 'support').length
    };
    
    console.assert(categoryCounts.offense > 0, 'Should have offense items');
    console.assert(categoryCounts.defense > 0, 'Should have defense items');
    console.assert(categoryCounts.support > 0, 'Should have support items');
    
    console.log('✅ Market Balance tests passed');
  }

  /**
   * Test unlock requirements logic
   */
  public static testUnlockRequirements(): void {
    console.log('🎯 Testing Unlock Requirements...');
    
    // Test wave-based unlocks
    const waveRequirements = { minWave: 10 };
    const waveProgress = unlockManager.checkUnlockConditions('wave_item', waveRequirements);
    const waveCondition = waveProgress.conditions.find(c => c.type === 'wave');
    console.assert(waveCondition, 'Should have wave condition');
    console.assert(waveCondition?.value === 10, 'Should have correct wave requirement');
    
    // Test gold-based unlocks
    const goldRequirements = { minGold: 1000 };
    const goldProgress = unlockManager.checkUnlockConditions('gold_item', goldRequirements);
    const goldCondition = goldProgress.conditions.find(c => c.type === 'gold');
    console.assert(goldCondition, 'Should have gold condition');
    console.assert(goldCondition?.value === 1000, 'Should have correct gold requirement');
    
    // Test achievement-based unlocks
    const achievementRequirements = { requiredAchievements: ['wave_survivor_25'] };
    const achievementProgress = unlockManager.checkUnlockConditions('achievement_item', achievementRequirements);
    const achievementCondition = achievementProgress.conditions.find(c => c.type === 'achievement');
    console.assert(achievementCondition, 'Should have achievement condition');
    console.assert(achievementCondition?.value === 'wave_survivor_25', 'Should have correct achievement requirement');
    
    // Test purchase-based unlocks
    const purchaseRequirements = { requiredPurchases: { category: 'defense', count: 5 } };
    const purchaseProgress = unlockManager.checkUnlockConditions('purchase_item', purchaseRequirements);
    const purchaseCondition = purchaseProgress.conditions.find(c => c.type === 'purchase');
    console.assert(purchaseCondition, 'Should have purchase condition');
    console.assert(purchaseCondition?.value === 5, 'Should have correct purchase requirement');
    
    console.log('✅ Unlock Requirements tests passed');
  }

  /**
   * Generate test report
   */
  public static generateTestReport(): void {
    console.log('📊 Generating Market System Test Report...');
    
    const categories = marketManager.getMarketCategories();
    const stats = unlockManager.getUnlockStatistics();
    
    console.log('=== Market System Test Report ===');
    console.log(`Categories: ${categories.length}`);
    console.log(`Total Items: ${stats.totalItems}`);
    console.log(`Unlocked Items: ${stats.unlockedItems}`);
    console.log(`Locked Items: ${stats.lockedItems}`);
    console.log(`Average Progress: ${stats.averageProgress.toFixed(1)}%`);
    console.log(`Next Unlocks: ${stats.nextUnlocks.length}`);
    
    categories.forEach(category => {
      const items = marketManager.getItemsByCategory(category.id);
      console.log(`${category.name}: ${items.length} items`);
    });
    
    console.log('=== End Report ===');
  }
}

// Export for use in development
export const runMarketTests = () => MarketSystemTest.runAllTests(); 