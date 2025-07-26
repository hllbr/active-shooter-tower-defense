/**
 * 🌦️ Weather System Test Suite
 * Tests for weather system pause/resume functionality
 */

import { weatherManager } from '../game-systems/weather';
import { GamePauseManager } from '../game-systems/GamePauseManager';
import { useGameStore } from '../models/store';

/**
 * Test suite for the weather system functionality
 */
export function testWeatherSystem(): void {
  console.log('🌦️ Testing Weather System...');
  
  const tests = [
    {
      name: 'Weather Manager Initialization',
      test: () => {
        const status = weatherManager.getStatus();
        
        if (status.isPaused !== false) {
          throw new Error('Weather manager should not be paused initially');
        }
        
        if (status.currentWeather !== 'clear') {
          throw new Error('Weather should start as clear');
        }
        
        return '✅ Weather manager initialization working correctly';
      }
    },
    
    {
      name: 'Weather Effect Addition',
      test: () => {
        const effectId = weatherManager.addWeatherEffect('rain', 0.5, 10000);
        
        if (!effectId) {
          throw new Error('Weather effect should return an ID');
        }
        
        const activeEffects = weatherManager.getActiveEffects();
        const effect = activeEffects.find(e => e.id === effectId);
        
        if (!effect) {
          throw new Error('Added weather effect should be in active effects');
        }
        
        if (effect.type !== 'rain') {
          throw new Error('Weather effect type should match added type');
        }
        
        return '✅ Weather effect addition working correctly';
      }
    },
    
    {
      name: 'Weather System Pause',
      test: () => {
        // Add a weather effect first
        weatherManager.addWeatherEffect('storm', 0.7, 15000);
        
        // Pause the weather system
        weatherManager.pause();
        
        if (!weatherManager.isWeatherPaused()) {
          throw new Error('Weather system should be paused after pause()');
        }
        
        const status = weatherManager.getStatus();
        if (!status.isPaused) {
          throw new Error('Weather status should show as paused');
        }
        
        return '✅ Weather system pause working correctly';
      }
    },
    
    {
      name: 'Weather System Resume',
      test: () => {
        // Resume the weather system
        weatherManager.resume();
        
        if (weatherManager.isWeatherPaused()) {
          throw new Error('Weather system should not be paused after resume()');
        }
        
        const status = weatherManager.getStatus();
        if (status.isPaused) {
          throw new Error('Weather status should show as not paused');
        }
        
        return '✅ Weather system resume working correctly';
      }
    },
    
    {
      name: 'Game Pause Integration',
      test: () => {
        // Add a weather effect
        weatherManager.addWeatherEffect('fog', 0.3, 8000);
        
        // Pause the game (which should pause weather)
        GamePauseManager.pauseGame();
        
        if (!weatherManager.isWeatherPaused()) {
          throw new Error('Weather should be paused when game is paused');
        }
        
        // Resume the game (which should resume weather)
        GamePauseManager.resumeGame();
        
        if (weatherManager.isWeatherPaused()) {
          throw new Error('Weather should be resumed when game is resumed');
        }
        
        return '✅ Game pause integration working correctly';
      }
    },
    
    {
      name: 'Store Integration',
      test: () => {
        const store = useGameStore.getState();
        
        // Add a weather effect
        weatherManager.addWeatherEffect('rain', 0.6, 12000);
        
        // Check that store weather state is updated
        const weatherState = store.weatherState;
        if (weatherState.currentWeather !== 'rain') {
          throw new Error('Store weather state should be updated by weather manager');
        }
        
        return '✅ Store integration working correctly';
      }
    },
    
    {
      name: 'Weather Effect Cleanup',
      test: () => {
        // Add a weather effect
        const effectId = weatherManager.addWeatherEffect('snow', 0.4, 5000);
        
        // Remove the effect
        const removed = weatherManager.removeWeatherEffect(effectId);
        
        if (!removed) {
          throw new Error('Weather effect removal should return true');
        }
        
        const activeEffects = weatherManager.getActiveEffects();
        const effect = activeEffects.find(e => e.id === effectId);
        
        if (effect) {
          throw new Error('Removed weather effect should not be in active effects');
        }
        
        return '✅ Weather effect cleanup working correctly';
      }
    },
    
    {
      name: 'Pause State Persistence',
      test: () => {
        // Add a weather effect
        weatherManager.addWeatherEffect('storm', 0.8, 20000);
        
        // Pause the system
        weatherManager.pause();
        
        // Check that effects are paused
        const activeEffects = weatherManager.getActiveEffects();
        const pausedEffects = activeEffects.filter(e => e.isPaused);
        
        if (pausedEffects.length !== activeEffects.length) {
          throw new Error('All active effects should be paused when system is paused');
        }
        
        // Resume the system
        weatherManager.resume();
        
        // Check that effects are resumed
        const resumedEffects = weatherManager.getActiveEffects();
        const stillPausedEffects = resumedEffects.filter(e => e.isPaused);
        
        if (stillPausedEffects.length > 0) {
          throw new Error('All effects should be resumed when system is resumed');
        }
        
        return '✅ Pause state persistence working correctly';
      }
    }
  ];
  
  let passed = 0;
  const total = tests.length;
  
  tests.forEach(test => {
    try {
      const result = test.test();
      console.log(`✅ ${test.name}: ${result}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  console.log(`\n📊 Weather System Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All weather system tests passed!');
  } else {
    console.log('⚠️ Some weather system tests failed.');
  }
}

/**
 * Quick test for weather pause functionality
 */
export function quickWeatherPauseTest(): boolean {
  try {
    // Test basic pause functionality
    const initialState = weatherManager.isWeatherPaused();
    
    // Test pause
    weatherManager.pause();
    const pausedState = weatherManager.isWeatherPaused();
    
    // Test resume
    weatherManager.resume();
    const resumedState = weatherManager.isWeatherPaused();
    
    // Verify states
    if (initialState !== false) {
      console.warn('⚠️ Initial weather pause state should be false');
      return false;
    }
    
    if (pausedState !== true) {
      console.warn('⚠️ Weather should be paused after pause()');
      return false;
    }
    
    if (resumedState !== false) {
      console.warn('⚠️ Weather should not be paused after resume()');
      return false;
    }
    
    console.log('✅ Quick weather pause test passed');
    return true;
    
  } catch (error) {
    console.error('❌ Quick weather pause test failed:', error);
    return false;
  }
}

/**
 * Test weather system integration with game pause
 */
export function testWeatherGamePauseIntegration(): boolean {
  try {
    // Add a weather effect
    weatherManager.addWeatherEffect('rain', 0.5, 10000);
    
    // Pause game
    GamePauseManager.pauseGame();
    
    if (!weatherManager.isWeatherPaused()) {
      console.warn('⚠️ Weather should be paused when game is paused');
      return false;
    }
    
    // Resume game
    GamePauseManager.resumeGame();
    
    if (weatherManager.isWeatherPaused()) {
      console.warn('⚠️ Weather should be resumed when game is resumed');
      return false;
    }
    
    console.log('✅ Weather game pause integration test passed');
    return true;
    
  } catch (error) {
    console.error('❌ Weather game pause integration test failed:', error);
    return false;
  }
} 