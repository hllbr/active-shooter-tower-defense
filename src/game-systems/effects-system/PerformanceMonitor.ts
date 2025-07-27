/**
 * 🎯 Performance Monitor for Enhanced Visual Effects
 * Monitors frame rate and adjusts effects accordingly to maintain 60 FPS
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  particleCount: number;
  isPerformanceMode: boolean;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private frameCount = 0;
  private lastTime = 0;
  private fpsHistory: number[] = [];
  private maxHistorySize = 60; // Track last 60 frames
  
  // Performance thresholds
  private static readonly TARGET_FPS = 60;
  private static readonly MIN_FPS = 50;
  private static readonly MAX_PARTICLES_NORMAL = 80;
  private static readonly MAX_PARTICLES_PERFORMANCE = 40;
  
  private constructor() {
    this.lastTime = performance.now();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Update performance metrics
   */
  update(): PerformanceMetrics {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    this.frameCount++;
    
    // Calculate FPS every second
    if (deltaTime >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.fpsHistory.push(fps);
      
      // Keep only recent history
      if (this.fpsHistory.length > this.maxHistorySize) {
        this.fpsHistory.shift();
      }
      
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
    
    const averageFps = this.getAverageFPS();
    const frameTime = 1000 / averageFps;
    const isPerformanceMode = averageFps < PerformanceMonitor.MIN_FPS;
    
    return {
      fps: averageFps,
      frameTime,
      particleCount: 0, // Will be updated by particle system
      isPerformanceMode
    };
  }

  /**
   * Get average FPS from recent history
   */
  private getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return PerformanceMonitor.TARGET_FPS;
    
    const sum = this.fpsHistory.reduce((acc, fps) => acc + fps, 0);
    return Math.round(sum / this.fpsHistory.length);
  }

  /**
   * Get recommended particle limit based on performance
   */
  getRecommendedParticleLimit(): number {
    const metrics = this.update();
    return metrics.isPerformanceMode 
      ? PerformanceMonitor.MAX_PARTICLES_PERFORMANCE 
      : PerformanceMonitor.MAX_PARTICLES_NORMAL;
  }

  /**
   * Check if effects should be reduced
   */
  shouldReduceEffects(): boolean {
    const metrics = this.update();
    return metrics.isPerformanceMode;
  }

  /**
   * Get current performance status
   */
  getPerformanceStatus(): 'excellent' | 'good' | 'poor' {
    const metrics = this.update();
    
    if (metrics.fps >= 58) return 'excellent';
    if (metrics.fps >= 50) return 'good';
    return 'poor';
  }

  /**
   * Get performance metrics for debugging
   */
  getMetrics(): PerformanceMetrics {
    return this.update();
  }

  /**
   * Reset performance monitoring
   */
  reset(): void {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsHistory = [];
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance(); 