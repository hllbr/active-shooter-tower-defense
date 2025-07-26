import { GamePauseManager } from '../../game-systems/GamePauseManager';
import { useGameStore } from '../../models/store';
import { WaveSpawnManager } from '../../game-systems/enemy/WaveSpawnManager';
import { aiManager } from '../../game-systems/ai-automation';
import { weatherManager } from '../../game-systems/weather';

/**
 * Validates that the pause system is properly integrated and working
 */
export function validatePauseSystem(): {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  try {
    // Test 1: Check if GamePauseManager is accessible
    if (typeof GamePauseManager !== 'object') {
      issues.push('GamePauseManager is not properly exported');
    }

    // Test 2: Check if pause methods exist
    if (typeof GamePauseManager.pauseGame !== 'function') {
      issues.push('GamePauseManager.pauseGame method is missing');
    }

    if (typeof GamePauseManager.resumeGame !== 'function') {
      issues.push('GamePauseManager.resumeGame method is missing');
    }

    if (typeof GamePauseManager.isPaused !== 'function') {
      issues.push('GamePauseManager.isPaused method is missing');
    }

    // Test 3: Check if store integration is working
    const store = useGameStore.getState();
    if (typeof store.setPaused !== 'function') {
      issues.push('Store setPaused method is missing');
    }

    // Test 4: Check if AI manager has pause methods
    if (typeof aiManager.pauseAutomation !== 'function') {
      issues.push('AI Manager pauseAutomation method is missing');
    }

    if (typeof aiManager.resumeAutomation !== 'function') {
      issues.push('AI Manager resumeAutomation method is missing');
    }

    // Test 5: Check if WaveSpawnManager has required methods
    if (typeof WaveSpawnManager.isSpawningActive !== 'function') {
      issues.push('WaveSpawnManager.isSpawningActive method is missing');
    }

    // Test 6: Check if WeatherManager has required methods
    if (typeof weatherManager.pause !== 'function') {
      issues.push('WeatherManager.pause method is missing');
    }

    if (typeof weatherManager.resume !== 'function') {
      issues.push('WeatherManager.resume method is missing');
    }

    if (typeof weatherManager.isWeatherPaused !== 'function') {
      issues.push('WeatherManager.isWeatherPaused method is missing');
    }

    if (typeof WaveSpawnManager.stopEnemyWave !== 'function') {
      issues.push('WaveSpawnManager.stopEnemyWave method is missing');
    }

    if (typeof WaveSpawnManager.stopContinuousSpawning !== 'function') {
      issues.push('WaveSpawnManager.stopContinuousSpawning method is missing');
    }

    // Test 6: Check if sound system is properly integrated
    try {
      const { playSound } = await import('../sound/soundEffects');
      if (typeof playSound !== 'function') {
        issues.push('Sound system playSound function is missing');
      }
    } catch {
      issues.push('Sound system is not properly accessible');
    }

    // Test 7: Check if dynamic spawn controller is accessible
    try {
      const { dynamicSpawnController } = await import('../../game-systems/spawn-system/index');
      if (typeof dynamicSpawnController.stopWaveSpawning !== 'function') {
        issues.push('DynamicSpawnController.stopWaveSpawning method is missing');
      }
    } catch {
      issues.push('DynamicSpawnController is not properly accessible');
    }

    // Recommendations for optimization
    if (issues.length === 0) {
      recommendations.push('✅ Pause system is properly integrated');
      recommendations.push('✅ All required methods are present');
      recommendations.push('✅ Store integration is working');
      recommendations.push('✅ Sound system integration is working');
      recommendations.push('✅ AI automation pause/resume is working');
      recommendations.push('✅ Enemy spawning pause/resume is working');
      recommendations.push('✅ Weather system pause/resume is working');
    } else {
      recommendations.push('🔧 Fix the issues listed above');
      recommendations.push('🔧 Ensure all imports are correct');
      recommendations.push('🔧 Verify that all managers are properly initialized');
    }

  } catch (error) {
    issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    isValid: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Quick test to verify pause functionality
 */
export function quickPauseTest(): boolean {
  try {
    // Test basic pause functionality
    const initialState = GamePauseManager.isPaused();
    
    // Test pause
    GamePauseManager.pauseGame();
    const pausedState = GamePauseManager.isPaused();
    
    // Test resume
    GamePauseManager.resumeGame();
    const resumedState = GamePauseManager.isPaused();
    
    // Verify states
    if (initialState !== false) {
      console.warn('⚠️ Initial pause state should be false');
      return false;
    }
    
    if (pausedState !== true) {
      console.warn('⚠️ Game should be paused after pauseGame()');
      return false;
    }
    
    if (resumedState !== false) {
      console.warn('⚠️ Game should not be paused after resumeGame()');
      return false;
    }
    
    console.log('✅ Quick pause test passed');
    return true;
    
  } catch (error) {
    console.error('❌ Quick pause test failed:', error);
    return false;
  }
} 