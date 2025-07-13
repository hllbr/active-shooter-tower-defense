import { enhancedAudioManager } from './EnhancedAudioManager';
import { getSettings } from '../settings';

/**
 * Test suite for enhanced audio system
 */
export class AudioSystemTest {
  private testResults: string[] = [];

  /**
   * Run all audio system tests
   */
  async runAllTests(): Promise<string[]> {
    this.testResults = [];
    
    this.log('🎵 Starting Enhanced Audio System Tests...');
    
    // Test 1: Volume transitions
    await this.testVolumeTransitions();
    
    // Test 2: Debouncing
    await this.testDebouncing();
    
    // Test 3: Mute functionality
    await this.testMuteFunctionality();
    
    // Test 4: State management
    this.testStateManagement();
    
    this.log('✅ All tests completed!');
    return this.testResults;
  }

  /**
   * Test smooth volume transitions
   */
  private async testVolumeTransitions(): Promise<void> {
    this.log('🔊 Testing volume transitions...');
    
    const _initialState = enhancedAudioManager.getCurrentState();
    const testVolume = 0.5;
    
    // Test SFX volume transition
    enhancedAudioManager.updateSFXVolume(testVolume);
    
    // Wait for transition to complete
    await this.wait(350); // Slightly longer than 300ms transition
    
    const finalState = enhancedAudioManager.getCurrentState();
    
    if (Math.abs(finalState.sfxVolume - testVolume) < 0.01) {
      this.log('✅ SFX volume transition successful');
    } else {
      this.log('❌ SFX volume transition failed');
    }
    
    // Test music volume transition
    enhancedAudioManager.updateMusicVolume(0.8);
    await this.wait(350);
    
    const musicState = enhancedAudioManager.getCurrentState();
    if (Math.abs(musicState.musicVolume - 0.8) < 0.01) {
      this.log('✅ Music volume transition successful');
    } else {
      this.log('❌ Music volume transition failed');
    }
  }

  /**
   * Test debouncing functionality
   */
  private async testDebouncing(): Promise<void> {
    this.log('⏱️ Testing debouncing...');
    
    let callCount = 0;
    const originalUpdateSFX = enhancedAudioManager.updateSFXVolume.bind(enhancedAudioManager);
    
    // Mock the update function to count calls
    enhancedAudioManager.updateSFXVolume = (volume: number) => {
      callCount++;
      originalUpdateSFX(volume);
    };
    
    // Rapid volume changes
    enhancedAudioManager.updateSFXVolume(0.1);
    enhancedAudioManager.updateSFXVolume(0.2);
    enhancedAudioManager.updateSFXVolume(0.3);
    enhancedAudioManager.updateSFXVolume(0.4);
    enhancedAudioManager.updateSFXVolume(0.5);
    
    // Wait for debounce delay
    await this.wait(150);
    
    // Should only have one call due to debouncing
    if (callCount <= 2) { // Allow for 1-2 calls due to timing
      this.log('✅ Debouncing working correctly');
    } else {
      this.log('❌ Debouncing not working - too many calls');
    }
    
    // Restore original function
    enhancedAudioManager.updateSFXVolume = originalUpdateSFX;
  }

  /**
   * Test mute functionality
   */
  private async testMuteFunctionality(): Promise<void> {
    this.log('🔇 Testing mute functionality...');
    
    const initialState = enhancedAudioManager.getCurrentState();
    
    // Test mute toggle
    enhancedAudioManager.toggleMute();
    
    const mutedState = enhancedAudioManager.getCurrentState();
    if (mutedState.mute !== initialState.mute) {
      this.log('✅ Mute toggle successful');
    } else {
      this.log('❌ Mute toggle failed');
    }
    
    // Test unmute
    enhancedAudioManager.toggleMute();
    const unmutedState = enhancedAudioManager.getCurrentState();
    if (unmutedState.mute === initialState.mute) {
      this.log('✅ Unmute toggle successful');
    } else {
      this.log('❌ Unmute toggle failed');
    }
  }

  /**
   * Test state management
   */
  private testStateManagement(): void {
    this.log('📊 Testing state management...');
    
    const state = enhancedAudioManager.getCurrentState();
    
    // Check state structure
    const hasRequiredProps = 
      typeof state.sfxVolume === 'number' &&
      typeof state.musicVolume === 'number' &&
      typeof state.mute === 'boolean' &&
      typeof state.isTransitioning === 'boolean';
    
    if (hasRequiredProps) {
      this.log('✅ State management working correctly');
    } else {
      this.log('❌ State management failed - missing properties');
    }
    
    // Check volume ranges
    const validRanges = 
      state.sfxVolume >= 0 && state.sfxVolume <= 1 &&
      state.musicVolume >= 0 && state.musicVolume <= 1;
    
    if (validRanges) {
      this.log('✅ Volume ranges valid');
    } else {
      this.log('❌ Volume ranges invalid');
    }
  }

  /**
   * Test settings integration
   */
  private testSettingsIntegration(): void {
    this.log('⚙️ Testing settings integration...');
    
    const settings = getSettings();
    const state = enhancedAudioManager.getCurrentState();
    
    // Check if state reflects settings
    const settingsMatch = 
      Math.abs(settings.sfxVolume - state.sfxVolume) < 0.01 &&
      Math.abs(settings.musicVolume - state.musicVolume) < 0.01 &&
      settings.mute === state.mute;
    
    if (settingsMatch) {
      this.log('✅ Settings integration working');
    } else {
      this.log('❌ Settings integration failed');
    }
  }

  /**
   * Utility function to wait
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log test results
   */
  private log(message: string): void {
    this.testResults.push(message);
    console.log(message);
  }

  /**
   * Get test results
   */
  getResults(): string[] {
    return [...this.testResults];
  }
}

// Export test instance
export const audioSystemTest = new AudioSystemTest(); 