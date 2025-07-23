// PerformanceTest_WaveSpawn.ts
import { useGameStore } from '../models/store';

export class PerformanceTest_WaveSpawn {
  static async runPerformanceTest() {
    console.log('🚀 Starting Performance Test: Large Wave Spawn');
    // Set debug mode
    (window as unknown as Window & { GAME_CONSTANTS: { DEBUG_MODE: boolean } }).GAME_CONSTANTS.DEBUG_MODE = true;
    // Setup: spawn a large wave
    const store = useGameStore.getState();
    store.setStarted(true);
    store.currentWave = 50;
    store.enemies = [];
    store.towers = [];
    // Place a tower to allow wave to start
    store.buildTower(0, false, 'attack');
    // Start wave
    import('../game-systems/enemy/WaveSpawnManager').then(({ WaveSpawnManager }) => {
      WaveSpawnManager.startEnemyWave(50);
    });
    // Run for 10 seconds, log FPS/memory
    const fpsSamples: number[] = [];
    const memSamples: number[] = [];
    let lastFps = 0;
    let lastMem = 0;
    const start = performance.now();
    let running = true;
    function sample() {
      if (!running) return;
      // FPS: count frames in last second
      const now = performance.now();
      const win = window as unknown as { lastFpsLog?: number, lastFps?: number, lastMem?: number };
      if (win.lastFpsLog && now - win.lastFpsLog < 1200) {
        lastFps = win.lastFps || 0;
        lastMem = win.lastMem || 0;
      }
      fpsSamples.push(lastFps);
      memSamples.push(lastMem);
      if (now - start < 10000) {
        setTimeout(sample, 1000);
      } else {
        running = false;
        PerformanceTest_WaveSpawn.report(fpsSamples, memSamples);
      }
    }
    sample();
  }

  static report(fpsSamples: number[], memSamples: number[]) {
    const minFps = Math.min(...fpsSamples.filter(f => f > 0));
    const avgFps = fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length;
    const maxMem = Math.max(...memSamples);
    const minMem = Math.min(...memSamples);
    console.log('--- Performance Test Results ---');
    console.log('Min FPS:', minFps);
    console.log('Avg FPS:', avgFps.toFixed(1));
    console.log('Memory Usage (MB):', minMem, '→', maxMem);
    const passed = minFps > 30 && maxMem - minMem < 100;
    if (passed) {
      console.log('✅ Performance test PASSED');
    } else {
      console.log('❌ Performance test FAILED');
    }
  }
} 