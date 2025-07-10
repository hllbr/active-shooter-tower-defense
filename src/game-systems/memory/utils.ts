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
  
  const intervalId = setInterval(() => {
    const sample = memoryTester.sample();
    if (sample) {
      const analysis = memoryTester.analyzeTrend();
      
      if (GAME_CONSTANTS.DEBUG_MODE) {
        
        if (analysis.trend === 'rising') {
          // Memory trend tracked silently for performance
        }
      }
    }
  }, interval);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
}; 