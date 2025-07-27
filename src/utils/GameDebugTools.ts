/**
 * 🛠️ Game Debug Tools
 * Essential debugging tools excluded from production builds
 * This module is only used during development and testing
 */

// Development-only debug utilities
export class GameDebugTools {
  private static instance: GameDebugTools;
  private isEnabled: boolean = false;

  private constructor() {
    // Only enable in development mode
    this.isEnabled = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  }

  public static getInstance(): GameDebugTools {
    if (!GameDebugTools.instance) {
      GameDebugTools.instance = new GameDebugTools();
    }
    return GameDebugTools.instance;
  }

  public log(message: string, data?: unknown): void {
    if (this.isEnabled) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }

  public warn(message: string, data?: unknown): void {
    if (this.isEnabled) {
      console.warn(`[DEBUG] ${message}`, data || '');
    }
  }

  public error(message: string, data?: unknown): void {
    if (this.isEnabled) {
      console.error(`[DEBUG] ${message}`, data || '');
    }
  }

  public assert(condition: boolean, message: string): void {
    if (this.isEnabled && !condition) {
      console.assert(condition, `[DEBUG] ${message}`);
    }
  }

  public performance(label: string, fn: () => void): void {
    if (this.isEnabled) {
      console.time(`[DEBUG] ${label}`);
      fn();
      console.timeEnd(`[DEBUG] ${label}`);
    } else {
      fn();
    }
  }

  public memoryUsage(): void {
    if (this.isEnabled && 'memory' in performance) {
      const memory = (performance as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      this.log('Memory Usage', {
        used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`
      });
    }
  }

  public gameStateSnapshot(): void {
    if (this.isEnabled) {
      // This would capture a snapshot of the current game state
      // Implementation depends on the game state structure
      this.log('Game State Snapshot captured');
    }
  }
}

// Export singleton instance
export const gameDebugTools = GameDebugTools.getInstance(); 