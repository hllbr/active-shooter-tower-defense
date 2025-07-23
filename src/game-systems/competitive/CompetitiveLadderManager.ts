/**
 * 🏆 Competitive Ladder System Manager
 * Issue #63: Yeni Oyun Mekanikleri - Competitive Features
 */

import type { 
  PlayerRanking, 
  AllianceRanking, 
  SeasonInfo, 
  SeasonHistory,
  WeeklyReward,
  SeasonalReward,
  LifetimeAchievement
} from '../../models/gameTypes';

export interface CompetitiveLadder {
  seasons: {
    current: SeasonInfo;
    past: SeasonHistory[];
  };
  rankings: {
    global: PlayerRanking[];
    regional: Record<string, PlayerRanking[]>;
    alliance: AllianceRanking[];
  };
  categories: {
    survival: 'En yüksek wave';
    efficiency: 'En az kaynak kullanımı';
    speed: 'En hızlı completion';
    innovation: 'En yaratıcı stratejiler';
  };
  rewards: {
    weekly: WeeklyReward[];
    seasonal: SeasonalReward[];
    lifetime: LifetimeAchievement[];
  };
}

export class CompetitiveLadderManager {
  private static instance: CompetitiveLadderManager;
  private ladder!: CompetitiveLadder;
  private playerScores: Map<string, PlayerScore> = new Map();
  private lastRankingsUpdate: number = 0;
  private lastPlayerScoresChange: number = 0;

  private constructor() {
    this.initializeCompetitiveSystem();
  }

  public static getInstance(): CompetitiveLadderManager {
    if (!CompetitiveLadderManager.instance) {
      CompetitiveLadderManager.instance = new CompetitiveLadderManager();
    }
    return CompetitiveLadderManager.instance;
  }

  /**
   * Initialize competitive system
   */
  private initializeCompetitiveSystem(): void {
    this.ladder = {
      seasons: {
        current: {
          id: `season_${Date.now()}`,
          name: 'Season 1: Rise of the Defenders',
          startDate: Date.now(),
          endDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
          status: 'active',
          theme: 'defense_mastery',
          rewards: {
            gold: 1000,
            researchPoints: 500,
            cosmetics: ['season_1_badge'],
            titles: ['Season 1 Champion']
          }
        },
        past: []
      },
      rankings: {
        global: [],
        regional: {},
        alliance: []
      },
      categories: {
        survival: 'En yüksek wave',
        efficiency: 'En az kaynak kullanımı',
        speed: 'En hızlı completion',
        innovation: 'En yaratıcı stratejiler'
      },
      rewards: {
        weekly: [],
        seasonal: [],
        lifetime: []
      }
    };
  }

  /**
   * Submit player score for ranking
   */
  public submitScore(
    playerId: string,
    category: keyof CompetitiveLadder['categories'],
    score: number,
    metadata: {
      waveReached?: number;
      resourcesUsed?: number;
      completionTime?: number;
      strategyComplexity?: number;
    }
  ): boolean {
    const playerScore: PlayerScore = {
      playerId,
      category,
      score,
      timestamp: Date.now(),
      metadata,
      seasonId: this.ladder.seasons.current.id
    };

    this.playerScores.set(`${playerId}_${category}`, playerScore);
    this.lastPlayerScoresChange = Date.now();
    this.updateRankings();
    return true;
  }

  /**
   * Update all rankings
   */
  private updateRankings(): void {
    // Update global rankings
    this.ladder.rankings.global = this.calculateGlobalRankings();
    
    // Update regional rankings (simplified - could be based on player location)
    this.ladder.rankings.regional = this.calculateRegionalRankings();
    
    // Update alliance rankings
    this.ladder.rankings.alliance = this.calculateAllianceRankings();
    this.lastRankingsUpdate = Date.now();
  }

  /**
   * Calculate global player rankings
   */
  private calculateGlobalRankings(): PlayerRanking[] {
    const rankings: PlayerRanking[] = [];
    const playerTotals = new Map<string, number>();

    // Calculate total scores for each player across all categories
    for (const [key, score] of this.playerScores) {
      const [playerId] = key.split('_');
      const currentTotal = playerTotals.get(playerId) || 0;
      playerTotals.set(playerId, currentTotal + score.score);
    }

    // Convert to rankings
    let rank = 1;
    for (const [playerId, totalScore] of Array.from(playerTotals.entries()).sort((a, b) => b[1] - a[1])) {
      rankings.push({
        playerId,
        rank,
        score: totalScore,
        category: 'global',
        seasonId: this.ladder.seasons.current.id,
        lastUpdated: Date.now()
      });
      rank++;
    }

    return rankings;
  }

  /**
   * Calculate regional rankings
   */
  private calculateRegionalRankings(): Record<string, PlayerRanking[]> {
    // Simplified regional system - could be based on actual player locations
    const regions = ['NA', 'EU', 'ASIA', 'GLOBAL'];
    const regionalRankings: Record<string, PlayerRanking[]> = {};

    for (const region of regions) {
      regionalRankings[region] = this.calculateGlobalRankings().slice(0, 100); // Top 100 per region
    }

    return regionalRankings;
  }

  /**
   * Calculate alliance rankings
   */
  private calculateAllianceRankings(): AllianceRanking[] {
    // This would integrate with the Alliance system
    const allianceRankings: AllianceRanking[] = [
      {
        allianceId: 'default_alliance_1',
        allianceName: 'Elite Defenders',
        rank: 1,
        totalScore: 50000,
        memberCount: 25,
        averageScore: 2000,
        seasonId: this.ladder.seasons.current.id,
        lastUpdated: Date.now()
      }
    ];

    return allianceRankings;
  }

  /**
   * Get player rankings
   */
  public getPlayerRankings(
    category?: keyof CompetitiveLadder['categories'],
    limit: number = 100
  ): PlayerRanking[] {
    // Invalidate cache if playerScores changed since last update
    if (this.lastPlayerScoresChange > this.lastRankingsUpdate) {
      this.updateRankings();
    }
    if (category) {
      return this.ladder.rankings.global
        .filter(ranking => ranking.category === category)
        .slice(0, limit);
    }

    return this.ladder.rankings.global.slice(0, limit);
  }

  /**
   * Get player's current rank
   */
  public getPlayerRank(playerId: string, category?: keyof CompetitiveLadder['categories']): PlayerRanking | null {
    const rankings = this.getPlayerRankings(category);
    return rankings.find(ranking => ranking.playerId === playerId) || null;
  }

  /**
   * Get weekly rewards
   */
  public getWeeklyRewards(): WeeklyReward[] {
    const currentWeek = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    
    return [
      {
        id: `weekly_${currentWeek}`,
        name: 'Weekly Champion',
        description: 'Top performer of the week',
        rewards: {
          gold: 500,
          researchPoints: 100,
          cosmetics: ['weekly_champion_badge']
        },
        requirements: {
          minRank: 1,
          minScore: 1000
        }
      },
      {
        id: `weekly_participation_${currentWeek}`,
        name: 'Weekly Participant',
        description: 'Active participation reward',
        rewards: {
          gold: 100,
          researchPoints: 25,
          cosmetics: []
        },
        requirements: {
          minGames: 5,
          minScore: 100
        }
      }
    ];
  }

  /**
   * Get seasonal rewards
   */
  public getSeasonalRewards(): SeasonalReward[] {
    return [
      {
        id: 'season_1_champion',
        name: 'Season 1 Champion',
        description: 'Top performer of Season 1',
        rewards: {
          gold: 5000,
          researchPoints: 1000,
          cosmetics: ['season_1_champion_skin'],
          titles: ['Season 1 Champion']
        },
        requirements: {
          minRank: 1,
          minScore: 10000
        }
      },
      {
        id: 'season_1_participant',
        name: 'Season 1 Participant',
        description: 'Active Season 1 participant',
        rewards: {
          gold: 1000,
          researchPoints: 200,
          cosmetics: ['season_1_participant_badge'],
          titles: []
        },
        requirements: {
          minGames: 20,
          minScore: 1000
        }
      }
    ];
  }

  /**
   * Check if player qualifies for rewards
   */
  public checkRewardEligibility(
    playerId: string,
    rewardType: 'weekly' | 'seasonal'
  ): WeeklyReward[] | SeasonalReward[] {
    const playerRank = this.getPlayerRank(playerId);
    const playerScore = this.getPlayerScore(playerId);
    
    if (rewardType === 'weekly') {
      return this.getWeeklyRewards().filter(reward => {
        if (reward.requirements.minRank && playerRank) {
          return playerRank.rank <= reward.requirements.minRank;
        }
        if (reward.requirements.minScore && playerScore) {
          return playerScore.score >= reward.requirements.minScore;
        }
        return false;
      });
    } else {
      return this.getSeasonalRewards().filter(reward => {
        if (reward.requirements.minRank && playerRank) {
          return playerRank.rank <= reward.requirements.minRank;
        }
        if (reward.requirements.minScore && playerScore) {
          return playerScore.score >= reward.requirements.minScore;
        }
        return false;
      });
    }
  }

  /**
   * Get player score
   */
  private getPlayerScore(playerId: string): PlayerScore | null {
    // Get the highest score across all categories
    let bestScore: PlayerScore | null = null;
    
    for (const [key, score] of this.playerScores) {
      if (key.startsWith(playerId + '_')) {
        if (!bestScore || score.score > bestScore.score) {
          bestScore = score;
        }
      }
    }
    
    return bestScore;
  }

  /**
   * Get competitive statistics
   */
  public getCompetitiveStats(): {
    totalPlayers: number;
    activeSeason: SeasonInfo;
    topPlayer: PlayerRanking | null;
    averageScore: number;
  } {
    const totalPlayers = new Set(Array.from(this.playerScores.keys()).map(key => key.split('_')[0])).size;
    const scores = Array.from(this.playerScores.values()).map(score => score.score);
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return {
      totalPlayers,
      activeSeason: this.ladder.seasons.current,
      topPlayer: this.ladder.rankings.global[0] || null,
      averageScore
    };
  }
}

interface PlayerScore {
  playerId: string;
  category: keyof CompetitiveLadder['categories'];
  score: number;
  timestamp: number;
  metadata: {
    waveReached?: number;
    resourcesUsed?: number;
    completionTime?: number;
    strategyComplexity?: number;
  };
  seasonId: string;
} 