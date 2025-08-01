/**
 * 🧠 Global Memory Manager - Main orchestrator for all memory management systems
 */

import { CleanupManager } from './CleanupManager';
import { EffectPool } from './EffectPool';
import { LifecycleManager } from './LifecycleManager';
import { MemoryMonitor } from './MemoryMonitor';
// import { GAME_CONSTANTS } from '../../utils/constants';

export class GlobalMemoryManager {
  private static instance: GlobalMemoryManager;
  private cleanupManager: CleanupManager;
  private effectPool: EffectPool;
  private lifecycleManager: LifecycleManager;
  private memoryMonitor: MemoryMonitor;
  private monitoringInterval: number | null = null;
  
  private constructor() {
    this.cleanupManager = CleanupManager.getInstance();
    this.effectPool = new EffectPool();
    this.lifecycleManager = LifecycleManager.getInstance();
    this.memoryMonitor = MemoryMonitor.getInstance();
  }
  
  static getInstance(): GlobalMemoryManager {
    if (!GlobalMemoryManager.instance) {
      GlobalMemoryManager.instance = new GlobalMemoryManager();
    }
    return GlobalMemoryManager.instance;
  }
  
  /**
   * Initialize memory monitoring
   */
  startMonitoring(interval: number = 5000): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    this.monitoringInterval = window.setInterval(() => {
      this.memoryMonitor.sample();
      this.lifecycleManager.cleanupStale();
      
      if (this.memoryMonitor.isMemoryHigh()) {
        this.performMaintenanceCleanup();
      }
    }, interval);
    
    this.cleanupManager.registerInterval(
      'memory-monitor',
      this.monitoringInterval,
      'Memory monitoring interval'
    );
  }
  
  /**
   * Stop memory monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      this.cleanupManager.unregister('memory-monitor');
    }
  }
  
  /**
   * Perform maintenance cleanup
   */
  performMaintenanceCleanup(): void {
    // Debug logging removed for production optimization
    
    // Clean up stale objects
    this.lifecycleManager.cleanupStale();
    
    // Release unused objects from pools
    this.effectPool.clear();
    
    // Force garbage collection if available
    this.memoryMonitor.forceGC();
  }
  
  /**
   * Full system cleanup
   */
  performFullCleanup(): void {
    this.stopMonitoring();
    this.cleanupManager.cleanup();
    this.effectPool.clear();
    this.performMaintenanceCleanup();
  }
  
  /**
   * Get comprehensive memory statistics
   */
  getStats(): {
    memory: ReturnType<MemoryMonitor['getStats']>;
    cleanup: ReturnType<CleanupManager['getDiagnostics']>;
    lifecycle: ReturnType<LifecycleManager['getStats']>;
    effects: ReturnType<EffectPool['getStats']>;
  } {
    return {
      memory: this.memoryMonitor.getStats(),
      cleanup: this.cleanupManager.getDiagnostics(),
      lifecycle: this.lifecycleManager.getStats(),
      effects: this.effectPool.getStats()
    };
  }
  
  // Public accessors
  get cleanup() { return this.cleanupManager; }
  get effects() { return this.effectPool; }
  get lifecycle() { return this.lifecycleManager; }
  get monitor() { return this.memoryMonitor; }
} 