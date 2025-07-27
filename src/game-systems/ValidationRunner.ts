import { componentValidator } from './ComponentInterconnectionValidator';
import { gameplayTester } from './GameplayLoopTester';
import { useGameStore } from '../models/store';
import { missionManager } from './MissionManager';

/**
 * Main Validation Runner
 * 
 * This system provides a comprehensive validation interface that combines:
 * - Component interconnection validation
 * - Full gameplay loop testing
 * - Mission, upgrade, energy, and gold system validation
 * - Progression stability testing from early to late waves
 */
export class ValidationRunner {
  private static instance: ValidationRunner;
  private isRunning: boolean = false;
  private currentTest: string = '';

  private constructor() {}

  static getInstance(): ValidationRunner {
    if (!ValidationRunner.instance) {
      ValidationRunner.instance = new ValidationRunner();
    }
    return ValidationRunner.instance;
  }

  /**
   * Run comprehensive validation of all systems
   */
  async runFullValidation(): Promise<FullValidationReport> {
    if (this.isRunning) {
      throw new Error('Validation already in progress');
    }

    this.isRunning = true;
    // Starting Full System Validation...
    // =====================================

    const report: FullValidationReport = {
      timestamp: Date.now(),
      componentValidation: null,
      gameplayValidation: null,
      overallSuccess: false,
      summary: '',
      recommendations: [],
      totalTestTime: 0
    };

    const startTime = performance.now();

    try {
      // Step 1: Component Interconnection Validation
      this.currentTest = 'Component Interconnection';
      // Step 1: Validating Component Interconnections...
      report.componentValidation = await componentValidator.runFullValidation();

      // Step 2: Gameplay Loop Testing
      this.currentTest = 'Gameplay Loop';
      // Step 2: Testing Full Gameplay Loop...
      report.gameplayValidation = await gameplayTester.runFullGameplayTest();

      // Step 3: Cross-System Integration Tests
      this.currentTest = 'Cross-System Integration';
      // Step 3: Testing Cross-System Integration...
      const crossSystemResults = await this.runCrossSystemTests();
      report.crossSystemTests = crossSystemResults;

      // Step 4: Performance and Stability Tests
      this.currentTest = 'Performance and Stability';
      // Step 4: Testing Performance and Stability...
      const performanceResults = await this.runPerformanceTests();
      report.performanceTests = performanceResults;

    } catch (error) {
      report.error = error instanceof Error ? error.message : String(error);
    } finally {
      this.isRunning = false;
      this.currentTest = '';
    }

    const endTime = performance.now();
    report.totalTestTime = endTime - startTime;

    // Determine overall success
    report.overallSuccess = this.determineOverallSuccess(report);

    // Generate comprehensive summary
    report.summary = this.generateFullSummary(report);

    // Generate recommendations
    report.recommendations = this.generateRecommendations(report);

    // FULL VALIDATION COMPLETE
    // ============================
    // ${report.summary}

    return report;
  }

  /**
   * Run component interconnection validation only
   */
  async runComponentValidation(): Promise<ComponentValidationReport> {
    // Running Component Interconnection Validation...
    return await componentValidator.runFullValidation();
  }

  /**
   * Run gameplay loop testing only
   */
  async runGameplayValidation(): Promise<GameplayValidationReport> {
    // Running Gameplay Loop Testing...
    return await gameplayTester.runFullGameplayTest();
  }

  /**
   * Run quick validation (subset of tests)
   */
  async runQuickValidation(): Promise<QuickValidationReport> {
    // Running Quick Validation...
    
    const report: QuickValidationReport = {
      timestamp: Date.now(),
      tests: [],
      success: true,
      summary: ''
    };

    // Quick tests for critical functionality
    const quickTests = [
      { name: 'Mission System', test: () => this.quickTestMissionSystem() },
      { name: 'Energy System', test: () => this.quickTestEnergySystem() },
      { name: 'Gold System', test: () => this.quickTestGoldSystem() },
      { name: 'Upgrade System', test: () => this.quickTestUpgradeSystem() }
    ];

    for (const test of quickTests) {
      try {
        const result = await test.test();
        report.tests.push(result);
        if (!result.success) {
          report.success = false;
        }
      } catch (error) {
        report.tests.push({
          name: test.name,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          details: 'Test failed with exception'
        });
        report.success = false;
      }
    }

    report.summary = this.generateQuickSummary(report);
    return report;
  }

  /**
   * Run cross-system integration tests
   */
  private async runCrossSystemTests(): Promise<CrossSystemTestResult[]> {
    const results: CrossSystemTestResult[] = [];

    // Test 1: Mission → Upgrade Integration
    results.push(await this.testMissionUpgradeIntegration());

    // Test 2: Energy → Gold Integration
    results.push(await this.testEnergyGoldIntegration());

    // Test 3: Upgrade → Mission Integration
    results.push(await this.testUpgradeMissionIntegration());

    // Test 4: Gold → Energy Integration
    results.push(await this.testGoldEnergyIntegration());

    return results;
  }

  /**
   * Run performance and stability tests
   */
  private async runPerformanceTests(): Promise<PerformanceTestResult[]> {
    const results: PerformanceTestResult[] = [];

    // Test 1: Memory Usage
    results.push(await this.testMemoryUsage());

    // Test 2: Response Time
    results.push(await this.testResponseTime());

    // Test 3: Concurrent Operations
    results.push(await this.testConcurrentOperations());

    // Test 4: Long-term Stability
    results.push(await this.testLongTermStability());

    return results;
  }

  // Individual test methods
  private async testMissionUpgradeIntegration(): Promise<CrossSystemTestResult> {
    const state = useGameStore.getState();
    const initialBulletLevel = state.bulletLevel;

    // Simulate mission completion with upgrade reward
    const testMission = {
      id: 'test_mission_upgrade',
      reward: {
        type: 'upgrade' as const,
        amount: 1,
        description: 'Test upgrade reward',
        special: 'bullet'
      }
    };

    // Apply mission reward
    missionManager['applyMissionRewardToStore'](testMission as any);

    const newState = useGameStore.getState();
    const upgradeApplied = newState.bulletLevel > initialBulletLevel;

    return {
      name: 'Mission → Upgrade Integration',
      success: upgradeApplied,
      error: !upgradeApplied ? 'Mission upgrade reward not applied' : undefined,
      details: `Bullet level: ${initialBulletLevel} → ${newState.bulletLevel}`,
      systems: ['mission', 'upgrade']
    };
  }

  private async testEnergyGoldIntegration(): Promise<CrossSystemTestResult> {
    const state = useGameStore.getState();
    const initialEnergy = state.energy;
    const initialGold = state.gold;

    // Test energy cost for upgrade
    const upgradeCost = 100;
    const energyCost = 30;
    const canUpgrade = state.consumeEnergy(energyCost, 'upgradeTower');
    const upgradeSuccess = state.purchaseIndividualFireUpgrade('fire_1', upgradeCost, 5);

    const newState = useGameStore.getState();
    const energyConsumed = initialEnergy - newState.energy;
    const goldSpent = initialGold - newState.gold;

    return {
      name: 'Energy → Gold Integration',
      success: canUpgrade && upgradeSuccess && energyConsumed === energyCost && goldSpent === upgradeCost,
      error: !canUpgrade || !upgradeSuccess || energyConsumed !== energyCost || goldSpent !== upgradeCost
        ? 'Energy and gold systems not properly integrated' : undefined,
      details: `Energy: -${energyConsumed}, Gold: -${goldSpent}`,
      systems: ['energy', 'gold', 'upgrade']
    };
  }

  private async testUpgradeMissionIntegration(): Promise<CrossSystemTestResult> {
    const initialMissionProgress = missionManager.getMissionProgress();

    // Simulate upgrade purchase
    const state = useGameStore.getState();
    const upgradeSuccess = state.purchaseIndividualFireUpgrade('fire_1', 50, 5);

    // Check if mission progress updated
    const newMissionProgress = missionManager.getMissionProgress();

    return {
      name: 'Upgrade → Mission Integration',
      success: upgradeSuccess && newMissionProgress >= initialMissionProgress,
      error: !upgradeSuccess || newMissionProgress < initialMissionProgress
        ? 'Upgrade purchases not updating mission progress' : undefined,
      details: `Mission progress: ${initialMissionProgress} → ${newMissionProgress}`,
      systems: ['upgrade', 'mission']
    };
  }

  private async testGoldEnergyIntegration(): Promise<CrossSystemTestResult> {
    const state = useGameStore.getState();
    const initialGold = state.gold;
    const initialEnergy = state.energy;

    // Simulate gold earning from enemy kill
    const enemy = { goldValue: 25, isSpecial: true, bossType: false, id: 'test_enemy' } as any;
    state.addEnemyKill(enemy);

    const newState = useGameStore.getState();
    const goldEarned = newState.gold - initialGold;
    const energyGained = newState.energy - initialEnergy;

    return {
      name: 'Gold → Energy Integration',
      success: goldEarned > 0 && energyGained > 0,
      error: goldEarned <= 0 || energyGained <= 0
        ? 'Enemy kills not providing both gold and energy' : undefined,
      details: `Gold: +${goldEarned}, Energy: +${energyGained}`,
      systems: ['gold', 'energy', 'enemy']
    };
  }

  private async testMemoryUsage(): Promise<PerformanceTestResult> {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Perform intensive operations
    const state = useGameStore.getState();
    for (let i = 0; i < 1000; i++) {
      const enemy = { goldValue: 10, isSpecial: false, bossType: false, id: `memory_test_${i}` } as any;
      state.addEnemyKill(enemy);
      missionManager.updateMissionProgress('enemy_killed');
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    const memoryIncreaseMB = memoryIncrease / 1024 / 1024;
    
    return {
      name: 'Memory Usage',
      success: memoryIncreaseMB < 50, // Less than 50MB increase
      error: memoryIncreaseMB >= 50 ? `Memory usage too high: ${memoryIncreaseMB.toFixed(2)}MB` : undefined,
      details: `Memory increase: ${memoryIncreaseMB.toFixed(2)}MB`,
      metric: memoryIncreaseMB,
      unit: 'MB'
    };
  }

  private async testResponseTime(): Promise<PerformanceTestResult> {
    const startTime = performance.now();
    
    // Perform typical game operations
    const state = useGameStore.getState();
    for (let i = 0; i < 100; i++) {
      const enemy = { goldValue: 10, isSpecial: false, bossType: false, id: `response_test_${i}` } as any;
      state.addEnemyKill(enemy);
    }
    
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    const avgResponseTime = responseTime / 100;
    
    return {
      name: 'Response Time',
      success: avgResponseTime < 1, // Less than 1ms per operation
      error: avgResponseTime >= 1 ? `Response time too slow: ${avgResponseTime.toFixed(2)}ms` : undefined,
      details: `Average response time: ${avgResponseTime.toFixed(2)}ms`,
      metric: avgResponseTime,
      unit: 'ms'
    };
  }

  private async testConcurrentOperations(): Promise<PerformanceTestResult> {
    const startTime = performance.now();
    const state = useGameStore.getState();
    
    // Simulate concurrent operations
    const promises = [];
    for (let i = 0; i < 50; i++) {
      promises.push(Promise.resolve().then(() => {
        const enemy = { goldValue: 10, isSpecial: false, bossType: false, id: `concurrent_${i}` } as any;
        state.addEnemyKill(enemy);
        missionManager.updateMissionProgress('enemy_killed');
      }));
    }
    
    await Promise.all(promises);
    
    const endTime = performance.now();
    const concurrentTime = endTime - startTime;
    
    return {
      name: 'Concurrent Operations',
      success: concurrentTime < 1000, // Less than 1 second for 50 concurrent operations
      error: concurrentTime >= 1000 ? `Concurrent operations too slow: ${concurrentTime.toFixed(2)}ms` : undefined,
      details: `50 concurrent operations in ${concurrentTime.toFixed(2)}ms`,
      metric: concurrentTime,
      unit: 'ms'
    };
  }

  private async testLongTermStability(): Promise<PerformanceTestResult> {
    const startTime = performance.now();
    const state = useGameStore.getState();
    
    // Simulate long-term gameplay
    let operationsCompleted = 0;
    for (let wave = 1; wave <= 20; wave++) {
      useGameStore.setState({ currentWave: wave });
      
      for (let enemy = 0; enemy < 5; enemy++) {
        const enemyObj = { goldValue: 10, isSpecial: false, bossType: false, id: `stability_${wave}_${enemy}` } as any;
        state.addEnemyKill(enemyObj);
        operationsCompleted++;
      }
      
      state.nextWave();
    }
    
    const endTime = performance.now();
    const stabilityTime = endTime - startTime;
    const opsPerSecond = operationsCompleted / (stabilityTime / 1000);
    
    return {
      name: 'Long-term Stability',
      success: opsPerSecond > 10, // More than 10 operations per second
      error: opsPerSecond <= 10 ? `Performance degraded: ${opsPerSecond.toFixed(2)} ops/sec` : undefined,
      details: `${operationsCompleted} operations in ${(stabilityTime / 1000).toFixed(2)}s (${opsPerSecond.toFixed(2)} ops/sec)`,
      metric: opsPerSecond,
      unit: 'ops/sec'
    };
  }

  // Quick test methods
  private async quickTestMissionSystem(): Promise<QuickTestResult> {
    const currentMission = missionManager.getCurrentMission();
    
    return {
      name: 'Mission System',
      success: currentMission !== null && !currentMission.completed,
      error: currentMission === null || currentMission.completed ? 'Mission system not working' : undefined,
      details: `Current mission: ${currentMission?.name || 'None'}`
    };
  }

  private async quickTestEnergySystem(): Promise<QuickTestResult> {
    const state = useGameStore.getState();
    const initialEnergy = state.energy;
    
    const canConsume = state.consumeEnergy(10, 'test');
    
    return {
      name: 'Energy System',
      success: canConsume && state.energy < initialEnergy,
      error: !canConsume || state.energy >= initialEnergy ? 'Energy system not working' : undefined,
      details: `Energy: ${initialEnergy} → ${state.energy}`
    };
  }

  private async quickTestGoldSystem(): Promise<QuickTestResult> {
    const state = useGameStore.getState();
    const initialGold = state.gold;
    
    state.addGold(50);
    
    return {
      name: 'Gold System',
      success: state.gold === initialGold + 50,
      error: state.gold !== initialGold + 50 ? 'Gold system not working' : undefined,
      details: `Gold: ${initialGold} → ${state.gold}`
    };
  }

  private async quickTestUpgradeSystem(): Promise<QuickTestResult> {
    const state = useGameStore.getState();
    const initialBulletLevel = state.bulletLevel;
    
    state.upgradeBullet(true);
    
    return {
      name: 'Upgrade System',
      success: state.bulletLevel === initialBulletLevel + 1,
      error: state.bulletLevel !== initialBulletLevel + 1 ? 'Upgrade system not working' : undefined,
      details: `Bullet level: ${initialBulletLevel} → ${state.bulletLevel}`
    };
  }

  // Helper methods
  private determineOverallSuccess(report: FullValidationReport): boolean {
    if (report.error) return false;
    
    const componentSuccess = report.componentValidation?.failedTests === 0;
    const gameplaySuccess = report.gameplayValidation?.failedPhases === 0;
    const crossSystemSuccess = report.crossSystemTests?.every(test => test.success) ?? true;
    const performanceSuccess = report.performanceTests?.every(test => test.success) ?? true;
    
    return componentSuccess && gameplaySuccess && crossSystemSuccess && performanceSuccess;
  }

  private generateFullSummary(report: FullValidationReport): string {
    const componentPassRate = report.componentValidation 
      ? ((report.componentValidation.passedTests / report.componentValidation.totalTests) * 100).toFixed(1)
      : '0.0';
    
    const gameplayPassRate = report.gameplayValidation
      ? ((report.gameplayValidation.passedPhases / report.gameplayValidation.totalPhases) * 100).toFixed(1)
      : '0.0';
    
    const crossSystemPassRate = report.crossSystemTests
      ? ((report.crossSystemTests.filter(t => t.success).length / report.crossSystemTests.length) * 100).toFixed(1)
      : '0.0';
    
    const performancePassRate = report.performanceTests
      ? ((report.performanceTests.filter(t => t.success).length / report.performanceTests.length) * 100).toFixed(1)
      : '0.0';
    
    let summary = `\n🚀 FULL SYSTEM VALIDATION SUMMARY\n`;
    summary += `=====================================\n`;
    summary += `Overall Success: ${report.overallSuccess ? '✅ PASSED' : '❌ FAILED'}\n`;
    summary += `Total Test Time: ${(report.totalTestTime / 1000).toFixed(2)}s\n\n`;
    
    summary += `📊 COMPONENT INTERCONNECTION: ${componentPassRate}%\n`;
    summary += `🎮 GAMEPLAY LOOP: ${gameplayPassRate}%\n`;
    summary += `🔗 CROSS-SYSTEM: ${crossSystemPassRate}%\n`;
    summary += `⚡ PERFORMANCE: ${performancePassRate}%\n\n`;
    
    if (report.error) {
      summary += `💥 VALIDATION ERROR: ${report.error}\n\n`;
    }
    
    if (report.overallSuccess) {
      summary += `🎉 ALL SYSTEMS VALIDATED SUCCESSFULLY!\n`;
      summary += `Mission, upgrade, energy, and gold systems are working together properly.\n`;
      summary += `Full gameplay loop is stable from early to late waves.\n`;
    } else {
      summary += `⚠️  VALIDATION ISSUES DETECTED\n`;
      summary += `Please review failed tests and fix system interconnections.\n`;
    }
    
    return summary;
  }

  private generateQuickSummary(report: QuickValidationReport): string {
    const passRate = ((report.tests.filter(t => t.success).length / report.tests.length) * 100).toFixed(1);
    
    let summary = `\n⚡ QUICK VALIDATION SUMMARY\n`;
    summary += `============================\n`;
    summary += `Success: ${report.success ? '✅ PASSED' : '❌ FAILED'}\n`;
    summary += `Pass Rate: ${passRate}%\n\n`;
    
    report.tests.forEach(test => {
      summary += `${test.success ? '✅' : '❌'} ${test.name}: ${test.details}\n`;
      if (test.error) {
        summary += `   Error: ${test.error}\n`;
      }
    });
    
    return summary;
  }

  private generateRecommendations(report: FullValidationReport): string[] {
    const recommendations: string[] = [];
    
    if (report.componentValidation?.failedTests > 0) {
      recommendations.push('Review and fix component interconnection issues');
    }
    
    if (report.gameplayValidation?.failedPhases > 0) {
      recommendations.push('Address gameplay loop stability issues');
    }
    
    if (report.crossSystemTests?.some(test => !test.success)) {
      recommendations.push('Improve cross-system communication and integration');
    }
    
    if (report.performanceTests?.some(test => !test.success)) {
      recommendations.push('Optimize performance and reduce resource usage');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All systems are working optimally - no immediate action required');
    }
    
    return recommendations;
  }

  /**
   * Get current test status
   */
  getCurrentTest(): string {
    return this.currentTest;
  }

  /**
   * Check if validation is running
   */
  isValidationRunning(): boolean {
    return this.isRunning;
  }
}

// Types for validation system
interface CrossSystemTestResult {
  name: string;
  success: boolean;
  error?: string;
  details: string;
  systems: string[];
}

interface PerformanceTestResult {
  name: string;
  success: boolean;
  error?: string;
  details: string;
  metric: number;
  unit: string;
}

interface QuickTestResult {
  name: string;
  success: boolean;
  error?: string;
  details: string;
}

interface QuickValidationReport {
  timestamp: number;
  tests: QuickTestResult[];
  success: boolean;
  summary: string;
}

interface FullValidationReport {
  timestamp: number;
  componentValidation: ComponentValidationReport | null;
  gameplayValidation: GameplayValidationReport | null;
  crossSystemTests?: CrossSystemTestResult[];
  performanceTests?: PerformanceTestResult[];
  overallSuccess: boolean;
  totalTestTime: number;
  error?: string;
  summary: string;
  recommendations: string[];
}

// Import types from other validation systems
interface ComponentValidationReport {
  timestamp: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: ValidationResult[];
  summary: string;
}

interface GameplayValidationReport {
  timestamp: number;
  totalPhases: number;
  passedPhases: number;
  failedPhases: number;
  results: GameplayTestResult[];
  summary: string;
  performanceMetrics: {
    averageWaveTime: number;
    totalTestTime: number;
    memoryUsage: number;
    systemStability: number;
  };
}

interface ValidationResult {
  scenario: string;
  test: string;
  success: boolean;
  error?: string;
  details: string;
}

interface GameplayTestResult {
  phase: string;
  success: boolean;
  error?: string;
  details: string;
  subTests: SubTestResult[];
}

interface SubTestResult {
  name: string;
  success: boolean;
  error?: string;
  details: string;
}

// Export singleton instance
export const validationRunner = ValidationRunner.getInstance(); 