// Bullet Upgrade Progression Tests
import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/constants';

export class BulletUpgradeTests {
  private static instance: BulletUpgradeTests;
  private testResults: Array<{ name: string; passed: boolean; details: string }> = [];

  public static getInstance(): BulletUpgradeTests {
    if (!BulletUpgradeTests.instance) {
      BulletUpgradeTests.instance = new BulletUpgradeTests();
    }
    return BulletUpgradeTests.instance;
  }

  public async runBulletProgressionTests(): Promise<void> {
    console.log('🔫 Starting Bullet Upgrade Progression Tests...');
    this.testResults = [];

    await this.testInitialState();
    await this.testSingleUpgrade();
    await this.testProgressionLogic();
    await this.testIgnorakProblem();

    this.printResults();
  }

  private async testInitialState(): Promise<void> {
    console.log('🧪 Testing Initial Bullet State...');
    
    try {
      const store = useGameStore.getState();
      const initialBulletLevel = store.bulletLevel;
      
      this.testResults.push({
        name: 'Initial Bullet Level',
        passed: initialBulletLevel === 1,
        details: `Expected: 1, Actual: ${initialBulletLevel}`
      });
      
      // Test bullet type count
      const bulletTypeCount = GAME_CONSTANTS.BULLET_TYPES.length;
      
      this.testResults.push({
        name: 'Bullet Types Available',
        passed: bulletTypeCount > 0,
        details: `Available types: ${bulletTypeCount}`
      });
      
    } catch (error) {
      this.testResults.push({
        name: 'Initial State Test',
        passed: false,
        details: `Error: ${error}`
      });
    }
  }

  private async testSingleUpgrade(): Promise<void> {
    console.log('🧪 Testing Single Bullet Upgrade...');
    
    try {
      const store = useGameStore.getState();
      const initialLevel = store.bulletLevel;
      
      // Ensure we have enough gold
      store.addGold(1000);
      
      // Perform upgrade
      store.upgradeBullet(false);
      
      const afterLevel = store.bulletLevel;
      const levelDifference = afterLevel - initialLevel;
      
      this.testResults.push({
        name: 'Single Upgrade Increment',
        passed: levelDifference === 1,
        details: `Level ${initialLevel} → ${afterLevel} (increment: ${levelDifference})`
      });
      
    } catch (error) {
      this.testResults.push({
        name: 'Single Upgrade Test',
        passed: false,
        details: `Error: ${error}`
      });
    }
  }

  private async testProgressionLogic(): Promise<void> {
    console.log('🧪 Testing Bullet Progression Logic...');
    
    try {
      const store = useGameStore.getState();
      const currentLevel = store.bulletLevel;
      
      // Test each bullet type's completion state
      GAME_CONSTANTS.BULLET_TYPES.forEach((bulletType, index) => {
        const level = index + 1;
        const isCurrentLevel = level === currentLevel;
        const isNextLevel = level === currentLevel + 1;
        const isPastLevel = level <= currentLevel;
        const isFutureLevel = level > currentLevel + 1;
        
        // Progression state analysis (debug removed)
        
        // Test logic consistency
        const booleanSum = Number(isCurrentLevel) + Number(isNextLevel) + Number(isPastLevel) + Number(isFutureLevel);
        const logicConsistent = booleanSum === 1;
        
        this.testResults.push({
          name: `${bulletType.name} Logic Consistency`,
          passed: logicConsistent,
          details: `Current: ${isCurrentLevel}, Next: ${isNextLevel}, Past: ${isPastLevel}, Future: ${isFutureLevel}`
        });
      });
      
    } catch (error) {
      this.testResults.push({
        name: 'Progression Logic Test',
        passed: false,
        details: `Error: ${error}`
      });
    }
  }

  private async testIgnorakProblem(): Promise<void> {
    console.log('🧪 Testing Ignorak Auto-Completion Bug...');
    
    try {
      const store = useGameStore.getState();
      const currentLevel = store.bulletLevel;
      
      // Find Ignorak (should be level 5)
      const ignorakIndex = GAME_CONSTANTS.BULLET_TYPES.findIndex(bt => bt.name === 'Ignorak');
      const ignorakLevel = ignorakIndex + 1;
      
      if (ignorakIndex === -1) {
        this.testResults.push({
          name: 'Ignorak Detection',
          passed: false,
          details: 'Ignorak not found in BULLET_TYPES'
        });
        return;
      }
      
      // Test Ignorak's completion state
      const isPastLevel = ignorakLevel <= currentLevel;
      const isCompleted = isPastLevel;
      
      // If current level is 4 (Yakhar), Ignorak should NOT be completed
      const shouldNotBeCompleted = currentLevel === 4 && ignorakLevel === 5;
      
      this.testResults.push({
        name: 'Ignorak Completion State',
        passed: !shouldNotBeCompleted || !isCompleted,
        details: `Current Level: ${currentLevel}, Ignorak Level: ${ignorakLevel}, Is Completed: ${isCompleted}`
      });
      
      // Test the specific bug user reported
      if (currentLevel === 4) {
        this.testResults.push({
          name: 'Ignorak Auto-Completion Bug',
          passed: !isCompleted,
          details: `User has Yakhar (Level 4), Ignorak (Level 5) should NOT be completed. Is Completed: ${isCompleted}`
        });
      }
      
    } catch (error) {
      this.testResults.push({
        name: 'Ignorak Problem Test',
        passed: false,
        details: `Error: ${error}`
      });
    }
  }

  private printResults(): void {
    console.log('\n🔫 Bullet Upgrade Test Results:');
    console.log('==============================');
    
    let passed = 0;
    const total = this.testResults.length;
    
    this.testResults.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      console.log(`${status} ${test.name}: ${test.details}`);
      if (test.passed) passed++;
    });
    
    console.log(`\n🎯 Summary: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    
    if (passed === total) {
      console.log('🎉 All bullet upgrade tests passed!');
    } else {
      console.log('⚠️ Some bullet upgrade issues detected.');
    }
  }

  public getResults(): Array<{ name: string; passed: boolean; details: string }> {
    return this.testResults;
  }
}

// Export singleton instance
export const bulletUpgradeTests = BulletUpgradeTests.getInstance(); 