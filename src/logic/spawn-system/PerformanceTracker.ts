import type { IPerformanceTracker } from './types';

export class PerformanceTracker implements IPerformanceTracker {
  private performanceHistory: Array<{
    wave: number;
    completionTime: number;
    towersUsed: number;
    score: number;
  }> = [];

  private readonly MAX_HISTORY = 10; // Keep last 10 waves

  trackPlayerPerformance(waveNumber: number, completionTime: number, towersUsed: number): void {
    const score = this.calculatePerformanceScore(completionTime, towersUsed, waveNumber);

    this.performanceHistory.push({
      wave: waveNumber,
      completionTime,
      towersUsed,
      score
    });

    if (this.performanceHistory.length > this.MAX_HISTORY) {
      this.performanceHistory.shift();
    }
  }

  getPerformanceScore(): number {
    if (this.performanceHistory.length === 0) return 0.5;

    const recentScores = this.performanceHistory.slice(-5);
    const averageScore = recentScores.reduce((sum, entry) => sum + entry.score, 0) / recentScores.length;

    return Math.max(0.0, Math.min(1.0, averageScore));
  }

  getAdaptiveDifficultyModifier(): number {
    const performanceScore = this.getPerformanceScore();

    if (performanceScore < 0.3) {
      return 0.7 + (performanceScore / 0.3) * 0.2;
    } else if (performanceScore < 0.7) {
      return 0.9 + ((performanceScore - 0.3) / 0.4) * 0.2;
    } else {
      return 1.1 + ((performanceScore - 0.7) / 0.3) * 0.2;
    }
  }

  private calculatePerformanceScore(completionTime: number, towersUsed: number, waveNumber: number): number {
    const expectedTime = 15000 + (waveNumber * 2000);
    const expectedTowers = Math.min(8, 2 + Math.floor(waveNumber / 3));

    const timeScore = Math.max(0, Math.min(1, expectedTime / completionTime));
    const efficiencyScore = Math.max(0, Math.min(1, expectedTowers / towersUsed));

    return (timeScore * 0.6) + (efficiencyScore * 0.4);
  }
}
