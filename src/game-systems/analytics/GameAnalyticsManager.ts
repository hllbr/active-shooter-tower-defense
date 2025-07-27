/**
 * 🎯 Game Analytics & Player Behavior Tracking System
 * TASK 27: Track basic player actions locally with optional export
 */

import { useGameStore } from '../../models/store';
import type { GameState } from '../../models/gameTypes';

// Analytics event types
export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: number;
  sessionId: string;
  data: Record<string, unknown>;
  metadata?: {
    wave?: number;
    gold?: number;
    energy?: number;
    towers?: number;
    enemies?: number;
  };
}

export type AnalyticsEventType = 
  | 'game_start'
  | 'game_end'
  | 'wave_start'
  | 'wave_complete'
  | 'wave_fail'
  | 'tower_built'
  | 'tower_destroyed'
  | 'tower_upgraded'
  | 'enemy_killed'
  | 'enemy_spawned'
  | 'upgrade_purchased'
  | 'gold_earned'
  | 'gold_spent'
  | 'energy_used'
  | 'mission_completed'
  | 'mission_failed'
  | 'achievement_unlocked'
  | 'dice_rolled'
  | 'mine_deployed'
  | 'mine_triggered'
  | 'boss_spawned'
  | 'boss_defeated'
  | 'fire_hazard_triggered'
  | 'weather_changed'
  | 'slot_unlocked'
  | 'action_used'
  | 'preparation_time_used'
  | 'wave_preview_shown'
  | 'settings_changed'
  | 'accessibility_mode_changed';

// Session data
export interface AnalyticsSession {
  id: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  events: AnalyticsEvent[];
  summary: SessionSummary;
}

export interface SessionSummary {
  totalWavesCompleted: number;
  totalWavesFailed: number;
  totalTowersBuilt: number;
  totalTowersLost: number;
  totalEnemiesKilled: number;
  totalGoldEarned: number;
  totalGoldSpent: number;
  totalUpgradesPurchased: number;
  totalMissionsCompleted: number;
  totalMissionsFailed: number;
  totalPlaytime: number;
  averageWaveTime: number;
  bestWaveTime: number;
  worstWaveTime: number;
  efficiencyScore: number;
  survivalStreak: number;
  perfectWaves: number;
  bossEncounters: number;
  bossDefeats: number;
  fireHazards: number;
  weatherEvents: number;
  diceRolls: number;
  minesDeployed: number;
  minesTriggered: number;
  actionsUsed: number;
  preparationTimeUsed: number;
}

// Analytics configuration
export interface AnalyticsConfig {
  enabled: boolean;
  maxEventsPerSession: number;
  maxSessionsStored: number;
  autoExport: boolean;
  exportFormat: 'json' | 'csv';
  trackPerformance: boolean;
  trackAccessibility: boolean;
  trackDetailedEvents: boolean;
}

export class GameAnalyticsManager {
  private static instance: GameAnalyticsManager;
  private currentSession: AnalyticsSession | null = null;
  private sessions: AnalyticsSession[] = [];
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private isProcessing = false;

  private constructor() {
    this.config = this.loadConfig();
    this.sessions = this.loadSessions();
    // Defer event listener setup to avoid circular dependency
    setTimeout(() => this.setupEventListeners(), 0);
  }

  public static getInstance(): GameAnalyticsManager {
    if (!GameAnalyticsManager.instance) {
      GameAnalyticsManager.instance = new GameAnalyticsManager();
    }
    return GameAnalyticsManager.instance;
  }

  /**
   * Initialize analytics for a new game session
   */
  public startSession(): void {
    if (!this.config.enabled) return;

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      id: sessionId,
      startTime: Date.now(),
      events: [],
      summary: {
        totalWavesCompleted: 0,
        totalWavesFailed: 0,
        totalTowersBuilt: 0,
        totalTowersLost: 0,
        totalEnemiesKilled: 0,
        totalGoldEarned: 0,
        totalGoldSpent: 0,
        totalUpgradesPurchased: 0,
        totalMissionsCompleted: 0,
        totalMissionsFailed: 0,
        totalPlaytime: 0,
        averageWaveTime: 0,
        bestWaveTime: Infinity,
        worstWaveTime: 0,
        efficiencyScore: 0,
        survivalStreak: 0,
        perfectWaves: 0,
        bossEncounters: 0,
        bossDefeats: 0,
        fireHazards: 0,
        weatherEvents: 0,
        diceRolls: 0,
        minesDeployed: 0,
        minesTriggered: 0,
        actionsUsed: 0,
        preparationTimeUsed: 0,
      }
    };

    this.trackEvent('game_start', {
      gameVersion: '1.0.0',
      timestamp: Date.now()
    });
  }

  /**
   * End current session and save data
   */
  public endSession(): void {
    if (!this.config.enabled || !this.currentSession) return;

    this.currentSession.endTime = Date.now();
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;

    // Calculate final summary
    this.calculateSessionSummary();

    // Track game end event
    this.trackEvent('game_end', {
      duration: this.currentSession.duration,
      finalWave: useGameStore.getState().currentWave,
      finalGold: useGameStore.getState().gold,
      finalTowers: useGameStore.getState().towers.length
    });

    // Add session to history
    this.sessions.push(this.currentSession);

    // Clean up old sessions
    if (this.sessions.length > this.config.maxSessionsStored) {
      this.sessions = this.sessions.slice(-this.config.maxSessionsStored);
    }

    // Save sessions
    this.saveSessions();

    // Auto-export if enabled
    if (this.config.autoExport) {
      this.exportSessionData();
    }

    this.currentSession = null;
  }

  /**
   * Track an analytics event
   */
  public trackEvent(type: AnalyticsEventType, data: Record<string, unknown> = {}): void {
    if (!this.config.enabled || !this.currentSession) return;

    const state = useGameStore.getState();
    
    const event: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: Date.now(),
      sessionId: this.currentSession.id,
      data,
      metadata: {
        wave: state.currentWave,
        gold: state.gold,
        energy: state.energy,
        towers: state.towers.length,
        enemies: state.enemies.length
      }
    };

    // Add to current session
    this.currentSession.events.push(event);

    // Limit events per session
    if (this.currentSession.events.length > this.config.maxEventsPerSession) {
      this.currentSession.events = this.currentSession.events.slice(-this.config.maxEventsPerSession);
    }

    // Add to processing queue
    this.eventQueue.push(event);
    this.processEventQueue();
  }

  /**
   * Process event queue asynchronously to avoid performance impact
   */
  private async processEventQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) return;

    this.isProcessing = true;

    // Process events in batches to avoid blocking
    const batchSize = 10;
    const batch = this.eventQueue.splice(0, batchSize);

    // Process batch
    for (const event of batch) {
      this.processEvent(event);
    }

    this.isProcessing = false;

    // Process remaining events if any
    if (this.eventQueue.length > 0) {
      setTimeout(() => this.processEventQueue(), 0);
    }
  }

  /**
   * Process individual event and update session summary
   */
  private processEvent(event: AnalyticsEvent): void {
    if (!this.currentSession) return;

    const { summary } = this.currentSession;

    switch (event.type) {
      case 'wave_complete':
        summary.totalWavesCompleted++;
        summary.survivalStreak++;
        if (event.data.perfectWave) {
          summary.perfectWaves++;
        }
        if (event.data.waveTime) {
          const waveTime = event.data.waveTime as number;
          summary.averageWaveTime = (summary.averageWaveTime * (summary.totalWavesCompleted - 1) + waveTime) / summary.totalWavesCompleted;
          summary.bestWaveTime = Math.min(summary.bestWaveTime, waveTime);
          summary.worstWaveTime = Math.max(summary.worstWaveTime, waveTime);
        }
        break;

      case 'wave_fail':
        summary.totalWavesFailed++;
        summary.survivalStreak = 0;
        break;

      case 'tower_built':
        summary.totalTowersBuilt++;
        break;

      case 'tower_destroyed':
        summary.totalTowersLost++;
        summary.survivalStreak = 0;
        break;

      case 'enemy_killed':
        summary.totalEnemiesKilled++;
        break;

      case 'gold_earned':
        summary.totalGoldEarned += event.data.amount as number || 0;
        break;

      case 'gold_spent':
        summary.totalGoldSpent += event.data.amount as number || 0;
        break;

      case 'upgrade_purchased':
        summary.totalUpgradesPurchased++;
        break;

      case 'mission_completed':
        summary.totalMissionsCompleted++;
        break;

      case 'mission_failed':
        summary.totalMissionsFailed++;
        break;

      case 'boss_spawned':
        summary.bossEncounters++;
        break;

      case 'boss_defeated':
        summary.bossDefeats++;
        break;

      case 'fire_hazard_triggered':
        summary.fireHazards++;
        break;

      case 'weather_changed':
        summary.weatherEvents++;
        break;

      case 'dice_rolled':
        summary.diceRolls++;
        break;

      case 'mine_deployed':
        summary.minesDeployed++;
        break;

      case 'mine_triggered':
        summary.minesTriggered++;
        break;

      case 'action_used':
        summary.actionsUsed++;
        break;

      case 'preparation_time_used':
        summary.preparationTimeUsed += event.data.timeUsed as number || 0;
        break;
    }

    // Calculate efficiency score
    this.calculateEfficiencyScore();
  }

  /**
   * Calculate efficiency score based on performance metrics
   */
  private calculateEfficiencyScore(): void {
    if (!this.currentSession) return;

    const { summary } = this.currentSession;
    const totalWaves = summary.totalWavesCompleted + summary.totalWavesFailed;
    
    if (totalWaves === 0) return;

    // Base efficiency from wave completion rate
    const completionRate = summary.totalWavesCompleted / totalWaves;
    
    // Bonus for perfect waves
    const perfectWaveBonus = summary.perfectWaves / Math.max(1, summary.totalWavesCompleted);
    
    // Bonus for survival streak
    const streakBonus = Math.min(summary.survivalStreak / 10, 0.2);
    
    // Penalty for tower losses
    const towerLossPenalty = Math.min(summary.totalTowersLost / 5, 0.3);
    
    // Calculate final score (0-100)
    summary.efficiencyScore = Math.max(0, Math.min(100, 
      (completionRate * 60) + 
      (perfectWaveBonus * 20) + 
      (streakBonus * 20) - 
      (towerLossPenalty * 100)
    ));
  }

  /**
   * Calculate final session summary
   */
  private calculateSessionSummary(): void {
    if (!this.currentSession) return;

    const { summary } = this.currentSession;
    
    // Calculate total playtime
    if (this.currentSession.endTime) {
      summary.totalPlaytime = this.currentSession.endTime - this.currentSession.startTime;
    }

    // Final efficiency calculation
    this.calculateEfficiencyScore();
  }

  /**
   * Get current session data
   */
  public getCurrentSession(): AnalyticsSession | null {
    return this.currentSession;
  }

  /**
   * Get all session history
   */
  public getAllSessions(): AnalyticsSession[] {
    return [...this.sessions];
  }

  /**
   * Get session by ID
   */
  public getSession(sessionId: string): AnalyticsSession | null {
    return this.sessions.find(s => s.id === sessionId) || null;
  }

  /**
   * Get aggregated statistics across all sessions
   */
  public getAggregatedStats(): {
    totalSessions: number;
    totalPlaytime: number;
    averageSessionLength: number;
    totalWavesCompleted: number;
    totalTowersBuilt: number;
    totalEnemiesKilled: number;
    averageEfficiencyScore: number;
    bestEfficiencyScore: number;
    totalMissionsCompleted: number;
    totalBossDefeats: number;
    mostCommonEvents: Array<{ type: AnalyticsEventType; count: number }>;
  } {
    if (this.sessions.length === 0) {
      return {
        totalSessions: 0,
        totalPlaytime: 0,
        averageSessionLength: 0,
        totalWavesCompleted: 0,
        totalTowersBuilt: 0,
        totalEnemiesKilled: 0,
        averageEfficiencyScore: 0,
        bestEfficiencyScore: 0,
        totalMissionsCompleted: 0,
        totalBossDefeats: 0,
        mostCommonEvents: []
      };
    }

    const totalPlaytime = this.sessions.reduce((sum, s) => sum + (s.summary.totalPlaytime || 0), 0);
    const totalWavesCompleted = this.sessions.reduce((sum, s) => sum + s.summary.totalWavesCompleted, 0);
    const totalTowersBuilt = this.sessions.reduce((sum, s) => sum + s.summary.totalTowersBuilt, 0);
    const totalEnemiesKilled = this.sessions.reduce((sum, s) => sum + s.summary.totalEnemiesKilled, 0);
    const totalMissionsCompleted = this.sessions.reduce((sum, s) => sum + s.summary.totalMissionsCompleted, 0);
    const totalBossDefeats = this.sessions.reduce((sum, s) => sum + s.summary.bossDefeats, 0);

    const efficiencyScores = this.sessions.map(s => s.summary.efficiencyScore).filter(score => score > 0);
    const averageEfficiencyScore = efficiencyScores.length > 0 
      ? efficiencyScores.reduce((sum, score) => sum + score, 0) / efficiencyScores.length 
      : 0;
    const bestEfficiencyScore = Math.max(...efficiencyScores, 0);

    // Count event types
    const eventCounts = new Map<AnalyticsEventType, number>();
    this.sessions.forEach(session => {
      session.events.forEach(event => {
        eventCounts.set(event.type, (eventCounts.get(event.type) || 0) + 1);
      });
    });

    const mostCommonEvents = Array.from(eventCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalSessions: this.sessions.length,
      totalPlaytime,
      averageSessionLength: totalPlaytime / this.sessions.length,
      totalWavesCompleted,
      totalTowersBuilt,
      totalEnemiesKilled,
      averageEfficiencyScore,
      bestEfficiencyScore,
      totalMissionsCompleted,
      totalBossDefeats,
      mostCommonEvents
    };
  }

  /**
   * Export session data
   */
  public exportSessionData(format: 'json' | 'csv' = 'json'): string {
    const data = {
      sessions: this.sessions,
      aggregatedStats: this.getAggregatedStats(),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    if (format === 'csv') {
      return this.convertToCSV(data);
    }

    return JSON.stringify(data, null, 2);
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(_data: { 
    sessions: AnalyticsSession[]; 
    aggregatedStats: {
      totalSessions: number;
      totalPlaytime: number;
      averageSessionLength: number;
      totalWavesCompleted: number;
      totalTowersBuilt: number;
      totalEnemiesKilled: number;
      averageEfficiencyScore: number;
      bestEfficiencyScore: number;
      totalMissionsCompleted: number;
      totalBossDefeats: number;
      mostCommonEvents: Array<{ type: AnalyticsEventType; count: number }>;
    }; 
    exportDate: string; 
    version: string 
  }): string {
    // Simple CSV conversion for session summaries
    const headers = [
      'Session ID',
      'Start Time',
      'Duration',
      'Waves Completed',
      'Waves Failed',
      'Towers Built',
      'Towers Lost',
      'Enemies Killed',
      'Gold Earned',
      'Gold Spent',
      'Efficiency Score',
      'Perfect Waves',
      'Boss Defeats'
    ];

    const rows = this.sessions.map(session => [
      session.id,
      new Date(session.startTime).toISOString(),
      session.duration || 0,
      session.summary.totalWavesCompleted,
      session.summary.totalWavesFailed,
      session.summary.totalTowersBuilt,
      session.summary.totalTowersLost,
      session.summary.totalEnemiesKilled,
      session.summary.totalGoldEarned,
      session.summary.totalGoldSpent,
      session.summary.efficiencyScore.toFixed(2),
      session.summary.perfectWaves,
      session.summary.bossDefeats
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  /**
   * Update analytics configuration
   */
  public updateConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  /**
   * Get current configuration
   */
  public getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  /**
   * Clear all analytics data
   */
  public clearData(): void {
    this.sessions = [];
    this.currentSession = null;
    this.eventQueue = [];
    this.saveSessions();
  }

  /**
   * Setup event listeners for automatic tracking
   */
  private setupEventListeners(): void {
    if (!this.config.enabled) return;

    // Listen to store changes for automatic event tracking
    const unsubscribe = useGameStore.subscribe((state, prevState) => {
      this.handleStateChange(state, prevState);
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.endSession();
      unsubscribe();
    });
  }

  /**
   * Handle state changes for automatic event tracking
   */
  private handleStateChange(state: GameState, prevState: GameState): void {
    if (!this.config.enabled || !this.currentSession) return;

    // Track wave completion
    if (state.currentWave > prevState.currentWave) {
      this.trackEvent('wave_complete', {
        waveNumber: prevState.currentWave,
        waveTime: state.waveStartTime ? Date.now() - state.waveStartTime : 0,
        perfectWave: !state.lostTowerThisWave,
        enemiesKilled: state.enemiesKilled,
        towersRemaining: state.towers.length
      });
    }

    // Track tower destruction
    if (state.towers.length < prevState.towers.length) {
      this.trackEvent('tower_destroyed', {
        towersRemaining: state.towers.length,
        wave: state.currentWave
      });
    }

    // Track enemy kills
    if (state.totalEnemiesKilled > prevState.totalEnemiesKilled) {
      this.trackEvent('enemy_killed', {
        totalKills: state.totalEnemiesKilled,
        wave: state.currentWave
      });
    }

    // Track gold changes
    if (state.gold > prevState.gold) {
      this.trackEvent('gold_earned', {
        amount: state.gold - prevState.gold,
        totalGold: state.gold
      });
    } else if (state.gold < prevState.gold) {
      this.trackEvent('gold_spent', {
        amount: prevState.gold - state.gold,
        totalGold: state.gold
      });
    }
  }

  /**
   * Load configuration from localStorage
   */
  private loadConfig(): AnalyticsConfig {
    try {
      const stored = localStorage.getItem('game_analytics_config');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Failed to load analytics config silently
    }

    return {
      enabled: true,
      maxEventsPerSession: 1000,
      maxSessionsStored: 50,
      autoExport: false,
      exportFormat: 'json',
      trackPerformance: true,
      trackAccessibility: true,
      trackDetailedEvents: true
    };
  }

  /**
   * Save configuration to localStorage
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('game_analytics_config', JSON.stringify(this.config));
    } catch {
      // Failed to save analytics config silently
    }
  }

  /**
   * Load sessions from localStorage
   */
  private loadSessions(): AnalyticsSession[] {
    try {
      const stored = localStorage.getItem('game_analytics_sessions');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Failed to load analytics sessions silently
    }

    return [];
  }

  /**
   * Save sessions to localStorage
   */
  private saveSessions(): void {
    try {
      localStorage.setItem('game_analytics_sessions', JSON.stringify(this.sessions));
    } catch {
      // Failed to save analytics sessions silently
    }
  }
}

// Export singleton instance
export const gameAnalytics = GameAnalyticsManager.getInstance(); 