/**
 * 🛠️ Memory Testing Utilities
 */

// import { GAME_CONSTANTS } from '../../utils/constants';
import { GlobalMemoryManager } from './GlobalMemoryManager';
import { MemoryMonitor } from './MemoryMonitor';

// =================== EXPORTS ===================

export const globalMemoryManager = GlobalMemoryManager.getInstance();
export const memoryMonitor = MemoryMonitor.getInstance();

/**
 * Quick memory usage check function
 */
export const checkMemoryUsage = (): { used: number; total: number; percentage: number } => {
  const stats = memoryMonitor.getStats();
  const used = stats.current || 0;
  const total = 100 * 1024 * 1024; // Assume 100MB total for browser
  return {
    used,
    total,
    percentage: (used / total) * 100
  };
};

/**
 * Memory usage monitoring for development
 */
export const startMemoryMonitoring = (interval: number = 5000): () => void => {
  
  const intervalId = setInterval(() => {
    const _usage = checkMemoryUsage();
    
    // Memory monitoring removed for production optimization
    
    // Take memory sample
    memoryMonitor.sample();
  }, interval);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
};

/**
 * Get memory statistics
 */
export const getMemoryStats = () => {
  return memoryMonitor.getStats();
};

/**
 * Force garbage collection if available
 */
export const forceCleanup = () => {
  globalMemoryManager.performMaintenanceCleanup();
  return checkMemoryUsage();
}; 