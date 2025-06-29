/**
 * 🛠️ Memory Testing Utilities
 */

import { GAME_CONSTANTS } from '../../utils/constants';
import { MemoryTester } from './MemoryTester';
import { MemoryLeakTester } from './MemoryLeakTester';

// =================== EXPORTS ===================

export const memoryTester = new MemoryTester();
export const memoryLeakTester = new MemoryLeakTester();

/**
 * Quick memory leak test function
 */
export const testMemoryLeaks = async (): Promise<boolean> => {
  const result = await memoryLeakTester.runComprehensiveTest();
  return result.overallPassed;
};

/**
 * Memory usage monitoring for development
 */
export const startMemoryMonitoring = (interval: number = 5000): () => void => {
  console.log('🔍 Starting memory monitoring...');
  
  const intervalId = setInterval(() => {
    const sample = memoryTester.sample();
    if (sample) {
      const analysis = memoryTester.analyzeTrend();
      
      if (GAME_CONSTANTS.DEBUG_MODE) {
        console.log(`💾 Memory: ${(sample.heapUsed / 1024 / 1024).toFixed(1)} MB, Trend: ${analysis.trend}`);
        
        if (analysis.trend === 'rising') {
          console.warn('⚠️ Memory usage is rising - potential leak detected');
        }
      }
    }
  }, interval);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    console.log('🔍 Memory monitoring stopped');
  };
}; 