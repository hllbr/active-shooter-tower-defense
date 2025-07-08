import React from 'react';

/**
 * 🚀 Performance Monitoring System
 * Tracks and reports performance metrics for the game
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  renderCount: number;
  lastUpdate: number;
}

export interface PerformanceReport {
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
  averageFrameTime: number;
  memoryTrend: 'stable' | 'increasing' | 'decreasing';
  recommendations: string[];
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private isMonitoring = false;
  private frameCount = 0;
  private lastFrameTime = performance.now();
  private maxMetrics = 100; // Keep last 100 measurements

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.metrics = [];
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    
    this.measureFrame();
    
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      // Development monitoring can be enabled here
    }
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      // Development monitoring cleanup can be added here
    }
  }

  private measureFrame(): void {
    if (!this.isMonitoring) return;

    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    const fps = 1000 / frameTime;

    // Get memory usage if available
    const memoryUsage = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;

    this.metrics.push({
      fps,
      frameTime,
      memoryUsage,
      renderCount: this.frameCount,
      lastUpdate: now
    });

    // Keep only the last maxMetrics measurements
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    this.frameCount++;
    this.lastFrameTime = now;

    // Schedule next measurement
    requestAnimationFrame(() => this.measureFrame());
  }

  getCurrentMetrics(): PerformanceMetrics | null {
    if (this.metrics.length === 0) return null;
    return this.metrics[this.metrics.length - 1];
  }

  getReport(): PerformanceReport {
    if (this.metrics.length === 0) {
      return {
        averageFPS: 0,
        minFPS: 0,
        maxFPS: 0,
        averageFrameTime: 0,
        memoryTrend: 'stable',
        recommendations: ['No performance data available']
      };
    }

    const fpsValues = this.metrics.map(m => m.fps);
    const frameTimeValues = this.metrics.map(m => m.frameTime);
    const memoryValues = this.metrics.map(m => m.memoryUsage);

    const averageFPS = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;
    const minFPS = Math.min(...fpsValues);
    const maxFPS = Math.max(...fpsValues);
    const averageFrameTime = frameTimeValues.reduce((a, b) => a + b, 0) / frameTimeValues.length;

    // Determine memory trend
    const recentMemory = memoryValues.slice(-10);
    const earlyMemory = memoryValues.slice(0, 10);
    const memoryTrend = recentMemory.length > 0 && earlyMemory.length > 0
      ? recentMemory[recentMemory.length - 1] > earlyMemory[0] * 1.1 ? 'increasing'
      : recentMemory[recentMemory.length - 1] < earlyMemory[0] * 0.9 ? 'decreasing'
      : 'stable'
      : 'stable';

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (averageFPS < 50) {
      recommendations.push('⚠️ FPS is below optimal (50+). Consider reducing visual effects.');
    }
    
    if (averageFrameTime > 16.67) {
      recommendations.push('⚠️ Frame time is above 16.67ms. Check for expensive operations.');
    }
    
    if (memoryTrend === 'increasing') {
      recommendations.push('⚠️ Memory usage is increasing. Check for memory leaks.');
    }
    
    if (averageFPS >= 55 && averageFrameTime < 16.67 && memoryTrend === 'stable') {
      recommendations.push('✅ Performance is optimal!');
    }

    return {
      averageFPS,
      minFPS,
      maxFPS,
      averageFrameTime,
      memoryTrend,
      recommendations
    };
  }

  // Performance optimization helpers
  static debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => func(...args), wait);
    };
  }

  static throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Memory optimization helpers
  static createObjectPool<T>(
    createFn: () => T,
    resetFn: (obj: T) => void,
    maxSize: number = 100
  ) {
    const pool: T[] = [];
    
    return {
      get: (): T => {
        return pool.pop() || createFn();
      },
      release: (obj: T): void => {
        if (pool.length < maxSize) {
          resetFn(obj);
          pool.push(obj);
        }
      },
      clear: (): void => {
        pool.length = 0;
      }
    };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitoring = (enabled: boolean = false) => {
  React.useEffect(() => {
    if (enabled) {
      performanceMonitor.startMonitoring();
      return () => performanceMonitor.stopMonitoring();
    }
  }, [enabled]);

  return {
    getCurrentMetrics: performanceMonitor.getCurrentMetrics.bind(performanceMonitor),
    getReport: performanceMonitor.getReport.bind(performanceMonitor)
  };
};

// Export performance utilities
export const { debounce, throttle, createObjectPool } = PerformanceMonitor; 