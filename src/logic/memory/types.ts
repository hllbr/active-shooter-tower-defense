/**
 * 📊 Memory Testing Types
 */

export interface MemoryMetrics {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
}

export interface MemoryTestResult {
  passed: boolean;
  initialMemory: number;
  finalMemory: number;
  memoryGrowth: number;
  memoryGrowthPercent: number;
  iterations: number;
  duration: number;
  details: {
    effectPoolStats: Record<string, unknown>;
    bulletPoolStats: Record<string, unknown>;
    gcAvailable: boolean;
    memoryBeforeGC?: number;
    memoryAfterGC?: number;
  };
}

export interface MemoryTrendAnalysis {
  trend: 'rising' | 'falling' | 'stable' | 'unknown';
  averageGrowth: number;
  peakMemory: number;
  currentMemory: number;
} 