import { GamePauseManager } from '../game-systems/GamePauseManager';
import { useGameStore } from '../models/store';
import { WaveSpawnManager } from '../game-systems/enemy/WaveSpawnManager';
import { aiManager } from '../game-systems/ai-automation';

/**
 * Test suite for the pause system functionality
 */
export function testPauseSystem(): void {
  console.log('🧪 Testing Pause System...');
  
  const tests = [
    {
      name: 'Pause State Management',
      test: () => {
        // Test initial state
        if (GamePauseManager.isPaused()) {
          throw new Error('Game should not be paused initially');
        }
        
        // Test pause
        GamePauseManager.pauseGame();
        if (!GamePauseManager.isPaused()) {
          throw new Error('Game should be paused after pauseGame()');
        }
        
        // Test resume
        GamePauseManager.resumeGame();
        if (GamePauseManager.isPaused()) {
          throw new Error('Game should not be paused after resumeGame()');
        }
        
        return '✅ Pause state management working correctly';
      }
    },
    
    {
      name: 'Store Integration',
      test: () => {
        const store = useGameStore.getState();
        
        // Test setting pause through store
        store.setPaused(true);
        if (!GamePauseManager.isPaused()) {
          throw new Error('GamePauseManager should be paused when store isPaused is true');
        }
        
        // Test unpausing through store
        store.setPaused(false);
        if (GamePauseManager.isPaused()) {
          throw new Error('GamePauseManager should not be paused when store isPaused is false');
        }
        
        return '✅ Store integration working correctly';
      }
    },
    
    {
      name: 'Enemy Spawning Pause',
      test: () => {
        // Simulate active spawning
        const _wasSpawningActive = WaveSpawnManager.isSpawningActive();
        
        // Pause game
        GamePauseManager.pauseGame();
        
        // Check that spawning is stopped
        if (WaveSpawnManager.isSpawningActive()) {
          throw new Error('Enemy spawning should be stopped when game is paused');
        }
        
        // Resume game
        GamePauseManager.resumeGame();
        
        return '✅ Enemy spawning pause/resume working correctly';
      }
    },
    
    {
      name: 'AI Automation Pause',
      test: () => {
        // Get initial AI status
        const _initialStatus = aiManager.getAutomationStatus();
        
        // Pause game
        GamePauseManager.pauseGame();
        
        // Check that AI is paused
        const pausedStatus = aiManager.getAutomationStatus();
        if (pausedStatus.placement || pausedStatus.upgrade || pausedStatus.targeting) {
          throw new Error('AI automation should be paused when game is paused');
        }
        
        // Resume game
        GamePauseManager.resumeGame();
        
        return '✅ AI automation pause/resume working correctly';
      }
    },
    
    {
      name: 'Sound System Pause',
      test: () => {
        // Test that game scene sounds are blocked when paused
        const { playSound } = await import('../utils/sound/soundEffects');
        
        // Set game to paused state
        useGameStore.getState().setPaused(true);
        
        // Try to play a game scene sound
        let soundPlayed = false;
        const originalPlay = HTMLAudioElement.prototype.play;
        HTMLAudioElement.prototype.play = function() {
          soundPlayed = true;
          return Promise.resolve();
        };
        
        playSound('explosion-large'); // This is a game scene sound
        
        // Restore original play method
        HTMLAudioElement.prototype.play = originalPlay;
        
        // Sound should not be played when paused
        if (soundPlayed) {
          throw new Error('Game scene sounds should not play when game is paused');
        }
        
        // Unpause and test again
        useGameStore.getState().setPaused(false);
        
        return '✅ Sound system pause working correctly';
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
  
  console.log(`\n📊 Pause System Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All pause system tests passed!');
  } else {
    console.log('⚠️ Some pause system tests failed.');
  }
}

// Export for manual testing
export { testPauseSystem as testPauseSystemFunction }; 