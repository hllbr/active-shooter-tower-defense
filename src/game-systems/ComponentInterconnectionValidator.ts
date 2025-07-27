import { useGameStore } from '../models/store';
import { missionManager } from './MissionManager';
import { energyManager } from './EnergyManager';
import { gameAnalytics } from './analytics/GameAnalyticsManager';

/**
 * Component Interconnection Validation System
 * 
 * This system validates that all game systems work together properly:
 * - Mission rewards instantly reflect in upgrade and gameplay
 * - Energy system integrates with all other systems
 * - Gold system properly synchronizes across all components
 * - Upgrade system works with mission rewards and energy costs
 */
export class ComponentInterconnectionValidator {
  private static instance: ComponentInterconnectionValidator;
  private validationResults: Map<string, ValidationResult> = new Map();
  private testScenarios: TestScenario[] = [];

  private constructor() {
    this.initializeTestScenarios();
  }

  static getInstance(): ComponentInterconnectionValidator {
    if (!ComponentInterconnectionValidator.instance) {
      ComponentInterconnectionValidator.instance = new ComponentInterconnectionValidator();
    }
    return ComponentInterconnectionValidator.instance;
  }

  /**
   * Initialize comprehensive test scenarios
   */
  private initializeTestScenarios(): void {
    this.testScenarios = [
      // Early Game Scenarios (Waves 1-10)
      {
        name: 'Early Game Mission Integration',
        description: 'Test mission rewards in early game',
        waveRange: [1, 10],
        tests: [
          {
            name: 'Mission Gold Reward',
            test: () => this.testMissionGoldReward(),
            expected: 'Gold increases immediately after mission completion'
          },
          {
            name: 'Mission Energy Reward',
            test: () => this.testMissionEnergyReward(),
            expected: 'Energy increases immediately after mission completion'
          },
          {
            name: 'Mission Upgrade Reward',
            test: () => this.testMissionUpgradeReward(),
            expected: 'Upgrade applied immediately after mission completion'
          }
        ]
      },

      // Mid Game Scenarios (Waves 11-50)
      {
        name: 'Mid Game System Integration',
        description: 'Test system integration in mid game',
        waveRange: [11, 50],
        tests: [
          {
            name: 'Energy Cost Validation',
            test: () => this.testEnergyCostValidation(),
            expected: 'Energy costs properly deducted from all actions'
          },
          {
            name: 'Upgrade Mission Sync',
            test: () => this.testUpgradeMissionSync(),
            expected: 'Upgrade purchases update mission progress'
          },
          {
            name: 'Gold Economy Balance',
            test: () => this.testGoldEconomyBalance(),
            expected: 'Gold economy remains balanced across systems'
          }
        ]
      },

      // Late Game Scenarios (Waves 51+)
      {
        name: 'Late Game Progression Stability',
        description: 'Test progression stability in late game',
        waveRange: [51, 100],
        tests: [
          {
            name: 'High Wave Performance',
            test: () => this.testHighWavePerformance(),
            expected: 'Systems perform well under high wave load'
          },
          {
            name: 'Resource Scaling',
            test: () => this.testResourceScaling(),
            expected: 'Resources scale appropriately with wave progression'
          },
          {
            name: 'Mission Chain Stability',
            test: () => this.testMissionChainStability(),
            expected: 'Mission chain remains stable through high waves'
          }
        ]
      }
    ];
  }

  /**
   * Run comprehensive validation of all system interconnections
   */
  async runFullValidation(): Promise<ValidationReport> {
    // Validation started
    
    const report: ValidationReport = {
      timestamp: Date.now(),
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      results: [],
      summary: ''
    };

    // Run each test scenario
    for (const scenario of this.testScenarios) {
              // Running scenario: ${scenario.name}
      
      for (const test of scenario.tests) {
        report.totalTests++;
        
        try {
          const result = await test.test();
          
          if (result.success) {
            report.passedTests++;
            // ${test.name}: PASSED
          } else {
            report.failedTests++;
            // ${test.name}: FAILED - ${result.error}
          }
          
          report.results.push({
            scenario: scenario.name,
            test: test.name,
            success: result.success,
            error: result.error,
            details: result.details
          });
          
        } catch (error) {
          report.failedTests++;
          // ${test.name}: ERROR - ${error}
          
          report.results.push({
            scenario: scenario.name,
            test: test.name,
            success: false,
            error: error instanceof Error ? error.message : String(error),
            details: 'Test threw an exception'
          });
        }
      }
    }

    // Generate summary
    report.summary = this.generateSummary(report);
    
    // Validation Complete: ${report.passedTests}/${report.totalTests} tests passed
    // ${report.summary}
    
    return report;
  }

  /**
   * Test mission gold reward integration
   */
  private async testMissionGoldReward(): Promise<TestResult> {
    const state = useGameStore.getState();
    const initialGold = state.gold;
    
    // Simulate mission completion with gold reward
    const testMission = {
      id: 'test_gold_mission',
      reward: {
        type: 'gold' as const,
        amount: 100,
        description: 'Test gold reward'
      }
    };
    
    // Apply mission reward
    missionManager['applyMissionRewardToStore'](testMission as any);
    
    // Check if gold increased
    const newState = useGameStore.getState();
    const goldIncrease = newState.gold - initialGold;
    
    return {
      success: goldIncrease === 100,
      error: goldIncrease !== 100 ? `Expected gold increase of 100, got ${goldIncrease}` : undefined,
      details: `Gold: ${initialGold} → ${newState.gold} (+${goldIncrease})`
    };
  }

  /**
   * Test mission energy reward integration
   */
  private async testMissionEnergyReward(): Promise<TestResult> {
    const state = useGameStore.getState();
    const initialEnergy = state.energy;
    
    // Simulate mission completion with energy reward
    const testMission = {
      id: 'test_energy_mission',
      reward: {
        type: 'energy' as const,
        amount: 50,
        description: 'Test energy reward'
      }
    };
    
    // Apply mission reward
    missionManager['applyMissionRewardToStore'](testMission as any);
    
    // Check if energy increased
    const newState = useGameStore.getState();
    const energyIncrease = newState.energy - initialEnergy;
    
    return {
      success: energyIncrease === 50,
      error: energyIncrease !== 50 ? `Expected energy increase of 50, got ${energyIncrease}` : undefined,
      details: `Energy: ${initialEnergy} → ${newState.energy} (+${energyIncrease})`
    };
  }

  /**
   * Test mission upgrade reward integration
   */
  private async testMissionUpgradeReward(): Promise<TestResult> {
    const state = useGameStore.getState();
    const initialBulletLevel = state.bulletLevel;
    
    // Simulate mission completion with upgrade reward
    const testMission = {
      id: 'test_upgrade_mission',
      reward: {
        type: 'upgrade' as const,
        amount: 1,
        description: 'Test upgrade reward',
        special: 'bullet'
      }
    };
    
    // Apply mission reward
    missionManager['applyMissionRewardToStore'](testMission as any);
    
    // Check if bullet level increased
    const newState = useGameStore.getState();
    const levelIncrease = newState.bulletLevel - initialBulletLevel;
    
    return {
      success: levelIncrease === 1,
      error: levelIncrease !== 1 ? `Expected bullet level increase of 1, got ${levelIncrease}` : undefined,
      details: `Bullet Level: ${initialBulletLevel} → ${newState.bulletLevel} (+${levelIncrease})`
    };
  }

  /**
   * Test energy cost validation across all systems
   */
  private async testEnergyCostValidation(): Promise<TestResult> {
    const state = useGameStore.getState();
    const initialEnergy = state.energy;
    const initialGold = state.gold;
    
    // Test energy cost for tower building
    const canBuildTower = state.consumeEnergy(20, 'buildTower');
    
    // Test energy cost for upgrade
    const canUpgrade = state.consumeEnergy(30, 'upgradeTower');
    
    const newState = useGameStore.getState();
    const energyConsumed = initialEnergy - newState.energy;
    
    return {
      success: canBuildTower && canUpgrade && energyConsumed === 50,
      error: !canBuildTower || !canUpgrade || energyConsumed !== 50 
        ? `Energy consumption failed: canBuild=${canBuildTower}, canUpgrade=${canUpgrade}, consumed=${energyConsumed}` 
        : undefined,
      details: `Energy consumed: ${energyConsumed} (build: 20, upgrade: 30)`
    };
  }

  /**
   * Test upgrade and mission synchronization
   */
  private async testUpgradeMissionSync(): Promise<TestResult> {
    const state = useGameStore.getState();
    const initialMissionProgress = missionManager.getMissionProgress();
    
    // Simulate upgrade purchase
    const upgradeSuccess = state.purchaseIndividualFireUpgrade('fire_1', 100, 5);
    
    // Check if mission progress updated
    const newMissionProgress = missionManager.getMissionProgress();
    
    return {
      success: upgradeSuccess && newMissionProgress > initialMissionProgress,
      error: !upgradeSuccess || newMissionProgress <= initialMissionProgress 
        ? `Upgrade sync failed: success=${upgradeSuccess}, progress=${initialMissionProgress}→${newMissionProgress}` 
        : undefined,
      details: `Mission progress: ${initialMissionProgress} → ${newMissionProgress}`
    };
  }

  /**
   * Test gold economy balance across systems
   */
  private async testGoldEconomyBalance(): Promise<TestResult> {
    const state = useGameStore.getState();
    const initialGold = state.gold;
    const initialTotalEarned = state.totalGoldEarned;
    const initialTotalSpent = state.totalGoldSpent;
    
    // Simulate gold earning from enemy kill
    const enemy = { goldValue: 25, isSpecial: false, bossType: false, id: 'test_enemy' } as any;
    state.addEnemyKill(enemy);
    
    // Simulate gold spending on upgrade
    const upgradeCost = 100;
    const upgradeSuccess = state.purchaseIndividualFireUpgrade('fire_1', upgradeCost, 5);
    
    const newState = useGameStore.getState();
    const goldChange = newState.gold - initialGold;
    const earnedChange = newState.totalGoldEarned - initialTotalEarned;
    const spentChange = newState.totalGoldSpent - initialTotalSpent;
    
    // Verify economy balance
    const expectedGoldChange = 25 - upgradeCost; // Earned - Spent
    const balanceCorrect = goldChange === expectedGoldChange && 
                          earnedChange === 25 && 
                          spentChange === upgradeCost;
    
    return {
      success: balanceCorrect,
      error: !balanceCorrect 
        ? `Economy balance incorrect: gold=${goldChange}, earned=${earnedChange}, spent=${spentChange}` 
        : undefined,
      details: `Gold: ${initialGold} → ${newState.gold} (${goldChange}), Earned: +${earnedChange}, Spent: +${spentChange}`
    };
  }

  /**
   * Test high wave performance
   */
  private async testHighWavePerformance(): Promise<TestResult> {
    const startTime = performance.now();
    
    // Simulate high wave load
    const state = useGameStore.getState();
    const testIterations = 1000;
    
    for (let i = 0; i < testIterations; i++) {
      // Simulate enemy kill
      const enemy = { goldValue: 10, isSpecial: false, bossType: false, id: `test_enemy_${i}` } as any;
      state.addEnemyKill(enemy);
      
      // Simulate mission progress update
      missionManager.updateMissionProgress('enemy_killed');
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    const avgTimePerIteration = duration / testIterations;
    
    return {
      success: avgTimePerIteration < 1, // Less than 1ms per iteration
      error: avgTimePerIteration >= 1 
        ? `Performance too slow: ${avgTimePerIteration.toFixed(2)}ms per iteration` 
        : undefined,
      details: `Performance: ${avgTimePerIteration.toFixed(2)}ms per iteration (${testIterations} iterations)`
    };
  }

  /**
   * Test resource scaling with wave progression
   */
  private async testResourceScaling(): Promise<TestResult> {
    const state = useGameStore.getState();
    
    // Test different wave scenarios
    const testWaves = [1, 25, 50, 75, 100];
    const results: number[] = [];
    
    for (const wave of testWaves) {
      // Simulate enemy kill at different waves
      const enemy = { goldValue: 10, isSpecial: false, bossType: false, id: `test_enemy_wave_${wave}` } as any;
      
      // Temporarily set wave for testing
      useGameStore.setState({ currentWave: wave });
      
      const initialGold = useGameStore.getState().gold;
      state.addEnemyKill(enemy);
      const finalGold = useGameStore.getState().gold;
      
      results.push(finalGold - initialGold);
    }
    
    // Verify scaling (gold should increase with wave)
    const scalingCorrect = results.every((result, index) => {
      if (index === 0) return true; // First wave baseline
      return result >= results[index - 1]; // Each wave should be >= previous
    });
    
    return {
      success: scalingCorrect,
      error: !scalingCorrect 
        ? `Resource scaling incorrect: ${results.join(', ')}` 
        : undefined,
      details: `Gold rewards by wave: ${results.join(', ')}`
    };
  }

  /**
   * Test mission chain stability
   */
  private async testMissionChainStability(): Promise<TestResult> {
    const initialMission = missionManager.getCurrentMission();
    if (!initialMission) {
      return {
        success: false,
        error: 'No current mission available',
        details: 'Mission system not initialized'
      };
    }
    
    // Simulate multiple mission completions
    const completions = 10;
    const completedMissions: string[] = [];
    
    for (let i = 0; i < completions; i++) {
      const currentMission = missionManager.getCurrentMission();
      if (!currentMission) break;
      
      // Simulate mission completion
      currentMission.progress = currentMission.maxProgress;
      currentMission.completed = true;
      
      completedMissions.push(currentMission.id);
      
      // Move to next mission
      missionManager['currentMissionIndex'] = missionManager['findNextAvailableMission']();
    }
    
    const finalMission = missionManager.getCurrentMission();
    
    return {
      success: completedMissions.length === completions && finalMission !== null,
      error: completedMissions.length !== completions || finalMission === null
        ? `Mission chain unstable: completed ${completedMissions.length}/${completions}` 
        : undefined,
      details: `Completed missions: ${completedMissions.join(', ')}`
    };
  }

  /**
   * Generate validation summary
   */
  private generateSummary(report: ValidationReport): string {
    const passRate = ((report.passedTests / report.totalTests) * 100).toFixed(1);
    
    let summary = `\n📊 VALIDATION SUMMARY\n`;
    summary += `================================\n`;
    summary += `Total Tests: ${report.totalTests}\n`;
    summary += `Passed: ${report.passedTests}\n`;
    summary += `Failed: ${report.failedTests}\n`;
    summary += `Pass Rate: ${passRate}%\n\n`;
    
    if (report.failedTests > 0) {
      summary += `❌ FAILED TESTS:\n`;
      report.results
        .filter(r => !r.success)
        .forEach(result => {
          summary += `• ${result.scenario} - ${result.test}: ${result.error}\n`;
        });
    }
    
    if (report.passedTests === report.totalTests) {
      summary += `\n🎉 ALL SYSTEMS VALIDATED SUCCESSFULLY!\n`;
      summary += `Mission, upgrade, energy, and gold systems are working together properly.\n`;
    } else {
      summary += `\n⚠️  SOME ISSUES DETECTED\n`;
      summary += `Please review failed tests and fix system interconnections.\n`;
    }
    
    return summary;
  }
}

// Types for validation system
interface TestScenario {
  name: string;
  description: string;
  waveRange: [number, number];
  tests: TestCase[];
}

interface TestCase {
  name: string;
  test: () => Promise<TestResult>;
  expected: string;
}

interface TestResult {
  success: boolean;
  error?: string;
  details: string;
}

interface ValidationResult {
  scenario: string;
  test: string;
  success: boolean;
  error?: string;
  details: string;
}

interface ValidationReport {
  timestamp: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: ValidationResult[];
  summary: string;
}

// Export singleton instance
export const componentValidator = ComponentInterconnectionValidator.getInstance(); 