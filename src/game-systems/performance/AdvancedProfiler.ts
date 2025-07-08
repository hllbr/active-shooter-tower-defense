/**
 * 🔍 Advanced Performance Profiler
 * Comprehensive performance monitoring and analysis system
 */



export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'fps' | 'memory' | 'render' | 'collision' | 'game-logic' | 'user-input';
  severity: 'info' | 'warning' | 'critical';
}

export interface PerformanceSnapshot {
  timestamp: number;
  fps: number;
  frameTime: number;
  memoryUsage: number;
  objectCounts: {
    enemies: number;
    bullets: number;
    effects: number;
    towers: number;
  };
  renderTime: number;
  collisionTime: number;
  gameLogicTime: number;
}

export interface PerformanceThresholds {
  minFPS: number;
  maxFrameTime: number;
  maxMemoryGrowth: number;
  maxRenderTime: number;
  maxCollisionTime: number;
}

/**
 * Advanced performance profiler with intelligent analysis
 */
export class AdvancedPerformanceProfiler {
  private metrics: PerformanceMetric[] = [];
  private snapshots: PerformanceSnapshot[] = [];
  private maxHistoryLength = 1000;
  private isMonitoring = false;
  private lastFrameTime = performance.now();
  private frameCount = 0;
  
  // Performance thresholds for alerts
  private thresholds: PerformanceThresholds = {
    minFPS: 30,
    maxFrameTime: 33, // ~30 FPS
    maxMemoryGrowth: 50 * 1024 * 1024, // 50MB growth
    maxRenderTime: 10,
    maxCollisionTime: 5
  };
  
  // Timing helpers
  private timers = new Map<string, number>();
  private frameTimings = {
    render: 0,
    collision: 0,
    gameLogic: 0,
    total: 0
  };
  
  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
  }
  
  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
  }
  
  /**
   * Start timing a specific operation
   */
  startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }
  
  /**
   * End timing and record the duration
   */
  endTimer(name: string, category: PerformanceMetric['category'] = 'game-logic'): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.timers.delete(name);
    
    this.recordMetric({
      name,
      value: duration,
      timestamp: performance.now(),
      category,
      severity: this.getSeverityForDuration(duration, category)
    });
    
    return duration;
  }
  
  /**
   * Record a custom performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    if (!this.isMonitoring) return;
    
    this.metrics.push(metric);
    
    // Trim history if needed
    if (this.metrics.length > this.maxHistoryLength) {
      this.metrics = this.metrics.slice(-this.maxHistoryLength);
    }
    
    // Alert if metric is critical
    if (metric.severity === 'critical') {
      this.alertCriticalMetric(metric);
    }
  }
  
  /**
   * Record frame timing information
   */
  recordFrameTiming(type: keyof typeof this.frameTimings, duration: number): void {
    this.frameTimings[type] = duration;
  }
  
  /**
   * Capture a complete performance snapshot
   */
  captureSnapshot(objectCounts: PerformanceSnapshot['objectCounts']): void {
    if (!this.isMonitoring) return;
    
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    const fps = frameTime > 0 ? 1000 / frameTime : 0;
    
    // Get memory usage if available
    const memoryUsage = this.getMemoryUsage();
    
    const snapshot: PerformanceSnapshot = {
      timestamp: now,
      fps,
      frameTime,
      memoryUsage,
      objectCounts,
      renderTime: this.frameTimings.render,
      collisionTime: this.frameTimings.collision,
      gameLogicTime: this.frameTimings.gameLogic
    };
    
    this.snapshots.push(snapshot);
    
    // Trim snapshots history
    if (this.snapshots.length > this.maxHistoryLength) {
      this.snapshots = this.snapshots.slice(-this.maxHistoryLength);
    }
    
    // Analyze performance for potential issues
    this.analyzeSnapshot(snapshot);
    
    this.frameCount++;
    this.lastFrameTime = now;
  }
  
  /**
   * Get memory usage in bytes
   */
  private getMemoryUsage(): number {
    const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
    return memory?.usedJSHeapSize || 0;
  }
  
  /**
   * Determine severity level for a duration based on category
   */
  private getSeverityForDuration(duration: number, category: PerformanceMetric['category']): PerformanceMetric['severity'] {
    switch (category) {
      case 'render':
        if (duration > this.thresholds.maxRenderTime) return 'critical';
        if (duration > this.thresholds.maxRenderTime * 0.7) return 'warning';
        return 'info';
      
      case 'collision':
        if (duration > this.thresholds.maxCollisionTime) return 'critical';
        if (duration > this.thresholds.maxCollisionTime * 0.7) return 'warning';
        return 'info';
      
      case 'fps':
        if (duration < this.thresholds.minFPS) return 'critical';
        if (duration < this.thresholds.minFPS * 1.2) return 'warning';
        return 'info';
      
      default:
        if (duration > 20) return 'critical';
        if (duration > 10) return 'warning';
        return 'info';
    }
  }
  
  /**
   * Analyze snapshot for performance issues
   */
  private analyzeSnapshot(snapshot: PerformanceSnapshot): void {
    // FPS analysis
    if (snapshot.fps < this.thresholds.minFPS) {
      this.recordMetric({
        name: 'Low FPS Alert',
        value: snapshot.fps,
        timestamp: snapshot.timestamp,
        category: 'fps',
        severity: 'critical'
      });
    }
    
    // Frame time analysis
    if (snapshot.frameTime > this.thresholds.maxFrameTime) {
      this.recordMetric({
        name: 'High Frame Time',
        value: snapshot.frameTime,
        timestamp: snapshot.timestamp,
        category: 'render',
        severity: 'warning'
      });
    }
    
    // Memory growth analysis
    if (this.snapshots.length > 10) {
      const oldSnapshot = this.snapshots[this.snapshots.length - 10];
      const memoryGrowth = snapshot.memoryUsage - oldSnapshot.memoryUsage;
      
      if (memoryGrowth > this.thresholds.maxMemoryGrowth) {
        this.recordMetric({
          name: 'Memory Growth Alert',
          value: memoryGrowth,
          timestamp: snapshot.timestamp,
          category: 'memory',
          severity: 'critical'
        });
      }
    }
    
    // Object count analysis
    const totalObjects = Object.values(snapshot.objectCounts).reduce((sum, count) => sum + count, 0);
    if (totalObjects > 200) {
      this.recordMetric({
        name: 'High Object Count',
        value: totalObjects,
        timestamp: snapshot.timestamp,
        category: 'game-logic',
        severity: 'warning'
      });
    }
  }
  
  /**
   * Alert for critical performance metrics
   */
  private alertCriticalMetric(_metric: PerformanceMetric): void {
    // Critical metrics are now tracked silently for performance
  }
  
  /**
   * Get performance statistics
   */
  getStats(): {
    averageFPS: number;
    averageFrameTime: number;
    averageMemoryUsage: number;
    criticalMetricsCount: number;
    warningMetricsCount: number;
    recentPerformanceScore: number;
  } {
    if (this.snapshots.length === 0) {
      return {
        averageFPS: 0,
        averageFrameTime: 0,
        averageMemoryUsage: 0,
        criticalMetricsCount: 0,
        warningMetricsCount: 0,
        recentPerformanceScore: 0
      };
    }
    
    const recentSnapshots = this.snapshots.slice(-60); // Last 60 frames
    const recentMetrics = this.metrics.slice(-100); // Last 100 metrics
    
    const averageFPS = recentSnapshots.reduce((sum, s) => sum + s.fps, 0) / recentSnapshots.length;
    const averageFrameTime = recentSnapshots.reduce((sum, s) => sum + s.frameTime, 0) / recentSnapshots.length;
    const averageMemoryUsage = recentSnapshots.reduce((sum, s) => sum + s.memoryUsage, 0) / recentSnapshots.length;
    
    const criticalMetricsCount = recentMetrics.filter(m => m.severity === 'critical').length;
    const warningMetricsCount = recentMetrics.filter(m => m.severity === 'warning').length;
    
    // Calculate performance score (0-100)
    let score = 100;
    score -= criticalMetricsCount * 10; // -10 for each critical issue
    score -= warningMetricsCount * 5; // -5 for each warning
    score = Math.max(0, Math.min(100, score));
    
    return {
      averageFPS,
      averageFrameTime,
      averageMemoryUsage,
      criticalMetricsCount,
      warningMetricsCount,
      recentPerformanceScore: score
    };
  }
  
  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const stats = this.getStats();
    const recommendations: string[] = [];
    
    if (stats.averageFPS < 30) {
      recommendations.push('🎯 Consider reducing visual effects or object count to improve FPS');
    }
    
    if (stats.averageFrameTime > 33) {
      recommendations.push('⚡ Optimize rendering pipeline - frame time is too high');
    }
    
    if (stats.criticalMetricsCount > 0) {
      recommendations.push('🚨 Address critical performance issues immediately');
    }
    
    if (stats.averageMemoryUsage > 100 * 1024 * 1024) { // 100MB
      recommendations.push('💾 Consider implementing more aggressive memory cleanup');
    }
    
    const recentSnapshots = this.snapshots.slice(-30);
    if (recentSnapshots.length > 10) {
      const objectCounts = recentSnapshots.map(s => Object.values(s.objectCounts).reduce((sum, count) => sum + count, 0));
      const avgObjectCount = objectCounts.reduce((sum, count) => sum + count, 0) / objectCounts.length;
      
      if (avgObjectCount > 150) {
        recommendations.push('🎮 High object count detected - consider object pooling optimization');
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ Performance is optimal - no recommendations at this time');
    }
    
    return recommendations;
  }
  
  /**
   * Generate comprehensive performance report
   */
  generateReport(): string {
    const stats = this.getStats();
    const recommendations = this.getRecommendations();
    
    const recentSnapshots = this.snapshots.slice(-60);
    const avgObjectCount = recentSnapshots.length > 0 ?
      recentSnapshots.reduce((sum, s) => sum + Object.values(s.objectCounts).reduce((a, b) => a + b, 0), 0) / recentSnapshots.length : 0;
    
    return `
🔍 Advanced Performance Report
==============================

📊 Performance Metrics:
- Average FPS: ${stats.averageFPS.toFixed(1)}
- Average Frame Time: ${stats.averageFrameTime.toFixed(2)}ms
- Memory Usage: ${(stats.averageMemoryUsage / 1024 / 1024).toFixed(1)}MB
- Performance Score: ${stats.recentPerformanceScore}/100

⚠️  Issues:
- Critical Issues: ${stats.criticalMetricsCount}
- Warnings: ${stats.warningMetricsCount}

🎮 Game Objects:
- Average Object Count: ${avgObjectCount.toFixed(1)}

💡 Recommendations:
${recommendations.map(r => `- ${r}`).join('\n')}

📈 Monitoring Status: ${this.isMonitoring ? 'Active' : 'Inactive'}
Total Snapshots: ${this.snapshots.length}
Total Metrics: ${this.metrics.length}
    `.trim();
  }
  
  /**
   * Clear all performance data
   */
  clear(): void {
    this.metrics.length = 0;
    this.snapshots.length = 0;
    this.frameCount = 0;
    this.timers.clear();
  }
  
  /**
   * Export performance data for analysis
   */
  exportData(): {
    metrics: PerformanceMetric[];
    snapshots: PerformanceSnapshot[];
    stats: {
      averageFPS: number;
      averageFrameTime: number;
      averageMemoryUsage: number;
      criticalMetricsCount: number;
      warningMetricsCount: number;
      recentPerformanceScore: number;
    };
  } {
    return {
      metrics: [...this.metrics],
      snapshots: [...this.snapshots],
      stats: this.getStats()
    };
  }
}

// Global profiler instance
export const advancedProfiler = new AdvancedPerformanceProfiler(); 