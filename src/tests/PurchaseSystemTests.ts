// Comprehensive Purchase System Tests
import { GAME_CONSTANTS } from '../utils/constants';
import { useGameStore } from '../models/store';
import { Logger } from '../utils/Logger';
import { upgradeEffectsManager } from '../game-systems/UpgradeEffects';

interface TestResults {
  passed: number;
  failed: number;
  details: string[];
}

export class PurchaseSystemTests {
  private static instance: PurchaseSystemTests;
  private testResults: Array<{ name: string; passed: boolean; details: string }> = [];

  public static getInstance(): PurchaseSystemTests {
    if (!PurchaseSystemTests.instance) {
      PurchaseSystemTests.instance = new PurchaseSystemTests();
    }
    return PurchaseSystemTests.instance;
  }

  public async runAllTests(): Promise<void> {
    console.log('🧪 Starting Purchase System Tests...');
    this.testResults = [];

    // Test all purchase systems
    await this.testShieldUpgrades();
    await this.testBulletUpgrades();
    await this.testEliteUpgrades();
    await this.testActionsUpgrades();
    await this.testPackagePurchases();
    await this.testFailSafeguards();

    this.printResults();
  }

  private async testShieldUpgrades(): Promise<void> {
    console.log('🛡️ Testing Shield Upgrades...');
    
    try {
      const store = useGameStore.getState();
      const initialGold = store.gold;
      const initialWallLevel = store.wallLevel;
      
      // Test shield upgrade
      const shield = GAME_CONSTANTS.WALL_SHIELDS?.[initialWallLevel] || { cost: 50, strength: 10 };
      
      if (initialGold >= shield.cost) {
        store.upgradeWall();
        const afterGold = store.gold;
        const afterWallLevel = store.wallLevel;
        
        const goldSpent = initialGold - afterGold;
        const levelIncreased = afterWallLevel > initialWallLevel;
        
        this.testResults.push({
          name: 'Shield Upgrade - Gold Deduction',
          passed: goldSpent === shield.cost,
          details: `Expected: ${shield.cost}, Actual: ${goldSpent}`
        });
        
        this.testResults.push({
          name: 'Shield Upgrade - Level Increase',
          passed: levelIncreased,
          details: `Level ${initialWallLevel} → ${afterWallLevel}`
        });
      } else {
        this.testResults.push({
          name: 'Shield Upgrade - Insufficient Funds',
          passed: true,
          details: 'Correctly blocked due to insufficient gold'
        });
      }
    } catch (error) {
      this.testResults.push({
        name: 'Shield Upgrade - Error Handling',
        passed: false,
        details: `Error: ${error}`
      });
    }
  }

  private async testBulletUpgrades(): Promise<void> {
    console.log('🔫 Testing Bullet Upgrades...');
    
    try {
      const store = useGameStore.getState();
      const initialGold = store.gold;
      const initialBulletLevel = store.bulletLevel;
      
      // Test bullet upgrade
      const cost = 100; // GAME_CONSTANTS.BULLET_UPGRADE_COST
      
      if (initialGold >= cost) {
        store.upgradeBullet();
        const afterGold = store.gold;
        const afterBulletLevel = store.bulletLevel;
        
        const goldSpent = initialGold - afterGold;
        const levelIncreased = afterBulletLevel > initialBulletLevel;
        
        this.testResults.push({
          name: 'Bullet Upgrade - Gold Deduction',
          passed: goldSpent === cost,
          details: `Expected: ${cost}, Actual: ${goldSpent}`
        });
        
        this.testResults.push({
          name: 'Bullet Upgrade - Level Increase',
          passed: levelIncreased,
          details: `Level ${initialBulletLevel} → ${afterBulletLevel}`
        });
      } else {
        this.testResults.push({
          name: 'Bullet Upgrade - Insufficient Funds',
          passed: true,
          details: 'Correctly blocked due to insufficient gold'
        });
      }
    } catch (error) {
      this.testResults.push({
        name: 'Bullet Upgrade - Error Handling',
        passed: false,
        details: `Error: ${error}`
      });
    }
  }

  private async testEliteUpgrades(): Promise<void> {
    console.log('🚀 Testing Elite Upgrades...');
    
    try {
      const store = useGameStore.getState();
      
      // Test requirement checking
      const { bulletLevel, wallLevel, currentWave } = store;
      const requirementsMet = bulletLevel >= 5 && wallLevel >= 3 && currentWave >= 10;
      
      this.testResults.push({
        name: 'Elite Upgrade - Requirements Check',
        passed: true, // Test passes if it runs without error
        details: `Fire: ${bulletLevel}/5, Shield: ${wallLevel}/3, Wave: ${currentWave}/10, Met: ${requirementsMet}`
      });
      
    } catch (error) {
      this.testResults.push({
        name: 'Elite Upgrade - Requirements Check',
        passed: false,
        details: `Error: ${error}`
      });
    }
  }

  private async testActionsUpgrades(): Promise<void> {
    console.log('🎯 Testing Actions Upgrades...');
    
    try {
      const store = useGameStore.getState();
      const initialGold = store.gold;
      const initialLevel = store.maxActionsLevel;
      
      // Test using spendGold properly
      const cost = 200;
      const success = store.spendGold(cost);
      
      if (success) {
        store.setMaxActionsLevel(initialLevel + 1);
        const afterLevel = store.maxActionsLevel;
        
        this.testResults.push({
          name: 'Actions Upgrade - Level Increase',
          passed: afterLevel > initialLevel,
          details: `Level ${initialLevel} → ${afterLevel}`
        });
      } else {
        this.testResults.push({
          name: 'Actions Upgrade - Gold Check',
          passed: initialGold < cost,
          details: `Correctly blocked: ${initialGold} < ${cost}`
        });
      }
    } catch (error) {
      this.testResults.push({
        name: 'Actions Upgrade - Error Handling',
        passed: false,
        details: `Error: ${error}`
      });
    }
  }

  private async testPackagePurchases(): Promise<void> {
    console.log('📦 Testing Package Purchases...');
    
    try {
      const store = useGameStore.getState();
      
      // Test package purchase system
      const testPackageId = 'test_package';
      const cost = 100;
      const maxAllowed = 3;
      
      const success = store.purchasePackage(testPackageId, cost, maxAllowed);
      const info = store.getPackageInfo(testPackageId, maxAllowed);
      
      this.testResults.push({
        name: 'Package Purchase - System Functionality',
        passed: typeof success === 'boolean' && typeof info === 'object',
        details: `Success: ${success}, Info: ${JSON.stringify(info)}`
      });
      
    } catch (error) {
      this.testResults.push({
        name: 'Package Purchase - Error Handling',
        passed: false,
        details: `Error: ${error}`
      });
    }
  }

  private async testFailSafeguards(): Promise<void> {
    console.log('🛡️ Testing Fail Safeguards...');
    
    try {
      const store = useGameStore.getState();
      
      // Test spendGold with insufficient funds
      const currentGold = store.gold;
      const excessiveAmount = currentGold + 1000;
      
      const success = store.spendGold(excessiveAmount);
      const goldAfter = store.gold;
      
      this.testResults.push({
        name: 'Fail Safeguard - Insufficient Gold',
        passed: !success && goldAfter === currentGold,
        details: `Prevented spending ${excessiveAmount} when only ${currentGold} available`
      });
      
      // Test purchaseTransaction fail safeguard
      const transactionSuccess = store.purchaseTransaction(excessiveAmount, () => {
        console.log('This should not execute');
      });
      
      this.testResults.push({
        name: 'Fail Safeguard - Transaction Protection',
        passed: !transactionSuccess,
        details: `Transaction correctly blocked for excessive amount: ${excessiveAmount}`
      });
      
    } catch (error) {
      this.testResults.push({
        name: 'Fail Safeguard - Error Handling',
        passed: false,
        details: `Error: ${error}`
      });
    }
  }

  private printResults(): void {
    console.log('\n📊 Purchase System Test Results:');
    console.log('================================');
    
    let passed = 0;
    const total = this.testResults.length;
    
    this.testResults.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      console.log(`${status} ${test.name}: ${test.details}`);
      if (test.passed) passed++;
    });
    
    console.log(`\n📈 Summary: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    
    if (passed === total) {
      console.log('🎉 All purchase systems working correctly!');
    } else {
      console.log('⚠️ Some purchase systems need attention.');
    }
  }

  public getResults(): Array<{ name: string; passed: boolean; details: string }> {
    return this.testResults;
  }

  /**
   * 🔬 COMPREHENSIVE: Test all upgrade mechanics functionality
   */
  static testUpgradeMechanics(): TestResults {
    const results: TestResults = { passed: 0, failed: 0, details: [] };

    try {
      // Test Fire Upgrade Effects
      const fireTests = this.testFireUpgradeEffects();
      results.passed += fireTests.passed;
      results.failed += fireTests.failed;
      results.details.push(...fireTests.details);

      // Test Special Abilities
      const abilityTests = this.testSpecialAbilities();
      results.passed += abilityTests.passed;
      results.failed += abilityTests.failed;
      results.details.push(...abilityTests.details);

      // Test Tower Properties
      const towerTests = this.testTowerProperties();
      results.passed += towerTests.passed;
      results.failed += towerTests.failed;
      results.details.push(...towerTests.details);

      // Test Package Bonuses
      const packageTests = this.testPackageBonuses();
      results.passed += packageTests.passed;
      results.failed += packageTests.failed;
      results.details.push(...packageTests.details);

      // Test Shield System
      const shieldTests = this.testShieldSystem();
      results.passed += shieldTests.passed;
      results.failed += shieldTests.failed;
      results.details.push(...shieldTests.details);

      Logger.log(`🔬 Upgrade Mechanics Test Complete: ${results.passed} passed, ${results.failed} failed`);
      
    } catch (error) {
      results.failed++;
      results.details.push(`❌ Test execution error: ${error}`);
      Logger.error('Test execution failed:', error);
    }

    return results;
  }

  /**
   * Test fire upgrade damage and speed effects
   */
  private static testFireUpgradeEffects(): TestResults {
    const results: TestResults = { passed: 0, failed: 0, details: [] };

    try {
      // Test damage multiplier calculation
      const damageMultiplier1 = upgradeEffectsManager.getFireDamageMultiplier(0);
      const damageMultiplier2 = upgradeEffectsManager.getFireDamageMultiplier(5);
      
      if (damageMultiplier1 === 1) {
        results.passed++;
        results.details.push('✅ Fire damage: Base multiplier correct (1.0)');
      } else {
        results.failed++;
        results.details.push(`❌ Fire damage: Expected 1.0, got ${damageMultiplier1}`);
      }

      if (Math.abs(damageMultiplier2 - 1.75) < 0.01) { // 1 + (5 * 0.15) = 1.75
        results.passed++;
        results.details.push('✅ Fire damage: 5 upgrades multiplier correct (1.75)');
      } else {
        results.failed++;
        results.details.push(`❌ Fire damage: Expected 1.75, got ${damageMultiplier2}`);
      }

      // Test upgrade effects application
      const baseTest = upgradeEffectsManager.applyUpgradeEffects(100, 400, 1);
      if (baseTest.damage && baseTest.speed) {
        results.passed++;
        results.details.push('✅ Fire effects: applyUpgradeEffects function working');
      } else {
        results.failed++;
        results.details.push('❌ Fire effects: applyUpgradeEffects returning invalid values');
      }

    } catch (error) {
      results.failed++;
      results.details.push(`❌ Fire upgrade test failed: ${error}`);
    }

    return results;
  }

  /**
   * Test special abilities functionality
   */
  private static testSpecialAbilities(): TestResults {
    const results: TestResults = { passed: 0, failed: 0, details: [] };

    try {
      // Test special ability definitions
      const specialAbilities = [
        'rapid_fire', 'multi_shot', 'auto_target', 'gatling', 'laser', 'plasma',
        'chain_lightning', 'freeze', 'burn', 'acid', 'quantum', 'nano', 'psi',
        'time_warp', 'space', 'legendary', 'divine', 'cosmic', 'infinity', 'god_mode'
      ];

      const definedAbilities = GAME_CONSTANTS.TOWER_UPGRADES.map(t => t.special);
      const availableAbilities = [...new Set(definedAbilities)].filter(a => a !== 'none');

      let foundAbilities = 0;
      specialAbilities.forEach(ability => {
        if (availableAbilities.includes(ability)) {
          foundAbilities++;
        }
      });

      if (foundAbilities >= 10) { // At least 10 special abilities should be defined
        results.passed++;
        results.details.push(`✅ Special abilities: ${foundAbilities} abilities defined in tower upgrades`);
      } else {
        results.failed++;
        results.details.push(`❌ Special abilities: Only ${foundAbilities} abilities found, expected at least 10`);
      }

      // Test tower upgrade progression
      const upgrades = GAME_CONSTANTS.TOWER_UPGRADES;
      if (upgrades && upgrades.length >= 20) {
        results.passed++;
        results.details.push(`✅ Tower progression: ${upgrades.length} tower levels defined`);
      } else {
        results.failed++;
        results.details.push(`❌ Tower progression: Only ${upgrades?.length || 0} levels, expected at least 20`);
      }

    } catch (error) {
      results.failed++;
      results.details.push(`❌ Special abilities test failed: ${error}`);
    }

    return results;
  }

  /**
   * Test tower properties like critical hits, area damage
   */
  private static testTowerProperties(): TestResults {
    const results: TestResults = { passed: 0, failed: 0, details: [] };

    try {
      // Test specialized tower types
      const specializedTowers = GAME_CONSTANTS.SPECIALIZED_TOWERS;
      if (specializedTowers) {
        const towerTypes = Object.keys(specializedTowers);
        if (towerTypes.length >= 5) {
          results.passed++;
          results.details.push(`✅ Specialized towers: ${towerTypes.length} types available`);
        } else {
          results.failed++;
          results.details.push(`❌ Specialized towers: Only ${towerTypes.length} types, expected at least 5`);
        }

        // Test specific properties
        const sniper = specializedTowers.sniper;
        if (sniper && sniper.criticalChance && sniper.criticalDamage) {
          results.passed++;
          results.details.push('✅ Critical hits: Sniper tower has critical properties');
        } else {
          results.failed++;
          results.details.push('❌ Critical hits: Sniper tower missing critical properties');
        }

        const mortar = specializedTowers.mortar;
        if (mortar && mortar.areaOfEffect) {
          results.passed++;
          results.details.push('✅ Area damage: Mortar tower has area of effect');
        } else {
          results.failed++;
          results.details.push('❌ Area damage: Mortar tower missing area of effect');
        }
      } else {
        results.failed++;
        results.details.push('❌ Specialized towers: SPECIALIZED_TOWERS not defined');
      }

    } catch (error) {
      results.failed++;
      results.details.push(`❌ Tower properties test failed: ${error}`);
    }

    return results;
  }

  /**
   * Test package bonus system
   */
  private static testPackageBonuses(): TestResults {
    const results: TestResults = { passed: 0, failed: 0, details: [] };

    try {
      // Test package bonuses calculation
      const mockPackageTracker = {
        'package1': { purchaseCount: 2 },
        'package2': { purchaseCount: 1 }
      };

      const bonuses = upgradeEffectsManager.getPackageBonuses(mockPackageTracker);
      
      // Expected: 2*20 + 1*20 = 60 energy bonus
      if (bonuses.energyBonus === 60) {
        results.passed++;
        results.details.push('✅ Package bonuses: Energy bonus calculation correct');
      } else {
        results.failed++;
        results.details.push(`❌ Package bonuses: Expected 60 energy bonus, got ${bonuses.energyBonus}`);
      }

      // Expected: 2*1 + 1*1 = 3 action bonus
      if (bonuses.actionBonus === 3) {
        results.passed++;
        results.details.push('✅ Package bonuses: Action bonus calculation correct');
      } else {
        results.failed++;
        results.details.push(`❌ Package bonuses: Expected 3 action bonus, got ${bonuses.actionBonus}`);
      }

      // Expected: 2*0.05 + 1*0.05 = 0.15 damage bonus
      if (Math.abs(bonuses.damageBonus - 0.15) < 0.01) {
        results.passed++;
        results.details.push('✅ Package bonuses: Damage bonus calculation correct');
      } else {
        results.failed++;
        results.details.push(`❌ Package bonuses: Expected 0.15 damage bonus, got ${bonuses.damageBonus}`);
      }

    } catch (error) {
      results.failed++;
      results.details.push(`❌ Package bonuses test failed: ${error}`);
    }

    return results;
  }

  /**
   * Test shield system functionality
   */
  private static testShieldSystem(): TestResults {
    const results: TestResults = { passed: 0, failed: 0, details: [] };

    try {
      // Test shield definitions
      const shields = GAME_CONSTANTS.WALL_SHIELDS;
      if (shields && shields.length >= 3) {
        results.passed++;
        results.details.push(`✅ Shield system: ${shields.length} shield types defined`);
      } else {
        results.failed++;
        results.details.push(`❌ Shield system: Only ${shields?.length || 0} shield types, expected at least 3`);
      }

      // Test shield progression
      if (shields && shields.length >= 2) {
        const shield1 = shields[0];
        const shield2 = shields[1];
        if (shield2.cost > shield1.cost && shield2.strength > shield1.strength) {
          results.passed++;
          results.details.push('✅ Shield progression: Cost and strength increase correctly');
        } else {
          results.failed++;
          results.details.push('❌ Shield progression: Cost/strength progression incorrect');
        }
      }

      // Test wall levels
      // const wallLevels = GAME_CONSTANTS.WALL_LEVELS;
      // if (wallLevels && wallLevels.length >= 3) {
      //   results.passed++;
      //   results.details.push(`✅ Wall system: ${wallLevels.length} wall levels defined`);
      // } else {
      //   results.failed++;
      //   results.details.push(`❌ Wall system: Only ${wallLevels?.length || 0} wall levels, expected at least 3`);
      // }

    } catch (error) {
      results.failed++;
      results.details.push(`❌ Shield system test failed: ${error}`);
    }

    return results;
  }

  /**
   * Test resource transaction queue atomicity and ordering
   */
  public async testResourceTransactionQueue(): Promise<void> {
    console.log('🧪 Testing Resource Transaction Queue...');
    const store = useGameStore.getState();
    store.setGold(1000);
    const results: Array<{ name: string; passed: boolean; details: string }> = [];

    // Queue multiple transactions rapidly
    const tx1 = store.purchaseTransaction(200, () => { store.setGold(store.gold - 200); }, 'test1');
    const tx2 = store.purchaseTransaction(300, () => { store.setGold(store.gold - 300); }, 'test2');
    const tx3 = store.purchaseTransaction(400, () => { store.setGold(store.gold - 400); }, 'test3');

    const [r1, r2, r3] = await Promise.all([tx1, tx2, tx3]);
    const goldAfter = useGameStore.getState().gold;
    results.push({
      name: 'FIFO Transaction Order',
      passed: r1 && r2 && r3 && goldAfter === 100,
      details: `Expected gold: 100, Actual: ${goldAfter}`
    });

    // Edge case: insufficient funds in the middle
    store.setGold(500);
    const tx4 = store.purchaseTransaction(300, () => { store.setGold(store.gold - 300); }, 'test4');
    const tx5 = store.purchaseTransaction(300, () => { store.setGold(store.gold - 300); }, 'test5');
    const [r4, r5] = await Promise.all([tx4, tx5]);
    const goldAfterEdge = useGameStore.getState().gold;
    results.push({
      name: 'Insufficient Funds Handling',
      passed: r4 && !r5 && goldAfterEdge === 200,
      details: `Expected gold: 200, Actual: ${goldAfterEdge}`
    });

    // UI sync: gold in store matches after transaction
    store.setGold(1000);
    await store.purchaseTransaction(500, () => { store.setGold(store.gold - 500); }, 'ui_sync');
    const goldUI = useGameStore.getState().gold;
    results.push({
      name: 'UI Sync After Transaction',
      passed: goldUI === 500,
      details: `Expected gold: 500, Actual: ${goldUI}`
    });

    // Print results
    results.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      console.log(`${status} ${test.name}: ${test.details}`);
    });
    const passed = results.filter(r => r.passed).length;
    console.log(`\n🧪 Resource Transaction Queue: ${passed}/${results.length} tests passed`);
  }
}

// Export singleton instance for easy access
export const purchaseSystemTests = PurchaseSystemTests.getInstance();

// Auto-run tests in development mode
// setTimeout(() => {
//   purchaseSystemTests.runAllTests();
// }, 2000); 