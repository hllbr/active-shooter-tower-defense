import { WAVE_SPAWN_CONFIGS } from './waveConfigs';
import type { ISpawnStrategy, IPerformanceTracker } from './types';

export class DynamicSpawnController {
  private spawnInterval: number | null = null;
  private currentSpawnCount = 0;
  private waveStartTime = 0;

  constructor(
    private strategy: ISpawnStrategy,
    private tracker: IPerformanceTracker
  ) {}

  startWaveSpawning(waveNumber: number): void {
    this.stopWaveSpawning();
    this.currentSpawnCount = 0;
    this.waveStartTime = performance.now();

    this.scheduleNextSpawn(waveNumber);
  }

  stopWaveSpawning(): void {
    if (this.spawnInterval) {
      clearTimeout(this.spawnInterval);
      this.spawnInterval = null;
    }
  }

  onWaveComplete(waveNumber: number, towersUsed: number): void {
    const completionTime = performance.now() - this.waveStartTime;
    this.tracker.trackPlayerPerformance(waveNumber, completionTime, towersUsed);
  }

  private scheduleNextSpawn(waveNumber: number): void {
    const delay = this.strategy.calculateNextSpawnDelay(
      waveNumber,
      this.currentSpawnCount
    );

    this.spawnInterval = window.setTimeout(() => {
      this.spawnEnemy();
      this.currentSpawnCount++;
      const config = WAVE_SPAWN_CONFIGS[this.getWaveTier(waveNumber)];
      if (this.currentSpawnCount < config.maxEnemiesPerWave) {
        this.scheduleNextSpawn(waveNumber);
      }
    }, delay);
  }

  private spawnEnemy(): void {
    // Implementation will be handled in EnemySpawner
  }

  private getWaveTier(waveNumber: number): keyof typeof WAVE_SPAWN_CONFIGS {
    if (waveNumber <= 5) return 'easy';
    if (waveNumber <= 10) return 'medium';
    if (waveNumber <= 15) return 'hard';
    if (waveNumber <= 25) return 'extreme';
    return 'nightmare';
  }
}
