import type { Tower, TowerSlot, Enemy, Position } from '../../models/gameTypes';
import { GAME_CONSTANTS } from '../../utils/constants';
import { towerSynergyManager } from '../tower-system/TowerSynergyManager';
import { defenseSystemManager } from '../defense-systems';

interface PlacementSuggestion {
  slotIndex: number;
  towerClass: string;
  reason: string;
  priority: number;
  expectedEffectiveness: number;
}

interface TargetingRecommendation {
  tower: Tower;
  preferredTargetType: string[];
  targetingMode: string;
  reason: string;
}

interface ThreatAnalysis {
  threatLevel: number;
  primaryThreats: string[];
  recommendedCounters: string[];
  weakestPoint: Position;
}

interface DefenseSuggestion {
  type: string;
  position: Position;
  reason: string;
  priority: number;
}

/**
 * AI Manager for tower defense automation
 * Provides intelligent tower placement and targeting suggestions for Issue #54
 */
export class AIManager {
  private static instance: AIManager;
  
  public static getInstance(): AIManager {
    if (!AIManager.instance) {
      AIManager.instance = new AIManager();
    }
    return AIManager.instance;
  }

  /**
   * Analyze current game state and provide tower placement suggestions
   */
  public getTowerPlacementSuggestions(
    towerSlots: TowerSlot[],
    enemies: Enemy[],
    gold: number,
    currentWave: number
  ): PlacementSuggestion[] {
    const suggestions: PlacementSuggestion[] = [];
    
    // Analyze threats and determine counter strategies
    const threatAnalysis = this.analyzeThreatLevel(enemies, currentWave);
    
    // Find available slots
    const availableSlots = towerSlots.filter(slot => slot.unlocked && !slot.tower);
    
    for (let i = 0; i < availableSlots.length; i++) {
      const slot = availableSlots[i];
      const slotIndex = towerSlots.indexOf(slot);
      
      // Analyze each slot for optimal tower placement
      const slotSuggestions = this.analyzeSlotPlacement(
        slot,
        slotIndex,
        towerSlots,
        threatAnalysis,
        gold
      );
      
      suggestions.push(...slotSuggestions);
    }
    
    // Sort by priority and effectiveness
    return suggestions
      .sort((a, b) => (b.priority * b.expectedEffectiveness) - (a.priority * a.expectedEffectiveness))
      .slice(0, 5); // Return top 5 suggestions
  }

  /**
   * Analyze slot for optimal tower placement
   */
  private analyzeSlotPlacement(
    slot: TowerSlot,
    slotIndex: number,
    allSlots: TowerSlot[],
    threatAnalysis: ThreatAnalysis,
    gold: number
  ): PlacementSuggestion[] {
    const suggestions: PlacementSuggestion[] = [];
    const position = { x: slot.x, y: slot.y };
    
    // Analyze synergy potential
    const synergyAnalysis = this.analyzeSynergyPotential(position, allSlots);
    
    // Analyze strategic position value
    const strategicValue = this.analyzeStrategicPosition(position, allSlots);
    
    // Consider each specialized tower type
    Object.entries(GAME_CONSTANTS.SPECIALIZED_TOWERS).forEach(([towerClass, towerConfig]) => {
      if (gold < towerConfig.cost) return;
      
      const effectiveness = this.calculateTowerEffectiveness(
        towerClass,
        towerConfig,
        position,
        threatAnalysis,
        synergyAnalysis,
        strategicValue
      );
      
      if (effectiveness > 0.3) { // Only suggest if reasonably effective
        suggestions.push({
          slotIndex,
          towerClass,
          reason: this.generatePlacementReason(towerClass, effectiveness, synergyAnalysis, strategicValue),
          priority: this.calculatePriority(towerClass, threatAnalysis, effectiveness),
          expectedEffectiveness: effectiveness
        });
      }
    });
    
    return suggestions;
  }

  /**
   * Analyze threat level and enemy composition
   */
  private analyzeThreatLevel(enemies: Enemy[], currentWave: number): ThreatAnalysis {
    const enemyTypes = enemies.map(e => e.type).filter(type => type !== undefined);
    const enemyCounts = this.countEnemyTypes(enemyTypes);
    
    // Determine primary threats
    const primaryThreats = Object.entries(enemyCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);
    
    // Calculate overall threat level
    const threatLevel = Math.min(1.0, (enemies.length / (currentWave * 5)) + (currentWave / 50));
    
    // Find weakest defensive point
    const weakestPoint = this.findWeakestDefensePoint(enemies);
    
    // Recommend counters based on enemy types
    const recommendedCounters = this.getCounterStrategies(primaryThreats);
    
    return {
      threatLevel,
      primaryThreats,
      recommendedCounters,
      weakestPoint
    };
  }

  /**
   * Analyze synergy potential for a position
   */
  private analyzeSynergyPotential(position: Position, allSlots: TowerSlot[]): {
    nearbyTowers: Tower[];
    synergyScore: number;
    bestSynergyPartners: string[];
  } {
    const nearbyTowers = allSlots
      .filter(slot => slot.tower)
      .map(slot => slot.tower!)
      .filter(tower => {
        const distance = Math.hypot(position.x - tower.position.x, position.y - tower.position.y);
        return distance <= 200; // Synergy range
      });
    
    // Calculate synergy score based on nearby towers
    let synergyScore = 0;
    const synergyPartners: string[] = [];
    
    for (const tower of nearbyTowers) {
      if (tower.towerClass) {
        // Check potential synergies with different tower types
        Object.keys(GAME_CONSTANTS.SPECIALIZED_TOWERS).forEach(towerClass => {
          const synergyBonus = towerSynergyManager.calculateSynergyBonuses(
            { ...tower, towerClass: towerClass as Tower['towerClass'] } as Tower,
            allSlots
          );
          const totalBonus = synergyBonus.damage + synergyBonus.range + synergyBonus.fireRate;
          if (totalBonus > 0.2) {
            synergyScore += totalBonus;
            if (!synergyPartners.includes(towerClass)) {
              synergyPartners.push(towerClass);
            }
          }
        });
      }
    }
    
    return {
      nearbyTowers,
      synergyScore,
      bestSynergyPartners: synergyPartners.slice(0, 3)
    };
  }

  /**
   * Analyze strategic position value
   */
  private analyzeStrategicPosition(position: Position, allSlots: TowerSlot[]): {
    isChokepoint: boolean;
    isHighGround: boolean;
    coverageScore: number;
    defensiveValue: number;
  } {
    // Simple chokepoint detection (center areas)
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const distanceFromCenter = Math.hypot(position.x - centerX, position.y - centerY);
    const isChokepoint = distanceFromCenter < 150;
    
    // High ground detection (upper areas)
    const isHighGround = position.y < window.innerHeight * 0.3;
    
    // Coverage score (how well this position covers approaches)
    const coverageScore = this.calculateCoverageScore(position, allSlots);
    
    // Defensive value (how well protected this position is)
    const defensiveValue = this.calculateDefensiveValue(position, allSlots);
    
    return {
      isChokepoint,
      isHighGround,
      coverageScore,
      defensiveValue
    };
  }

  /**
   * Calculate tower effectiveness for a specific position
   */
  private calculateTowerEffectiveness(
    towerClass: string,
    towerConfig: { cost: number; areaOfEffect?: number },
    position: Position,
    threatAnalysis: ThreatAnalysis,
    synergyAnalysis: { synergyScore: number },
    strategicValue: { isChokepoint: boolean; isHighGround: boolean; coverageScore: number; defensiveValue: number }
  ): number {
    let effectiveness = 0.5; // Base effectiveness
    
    // Adjust for threat counters
    if (threatAnalysis.recommendedCounters.includes(towerClass)) {
      effectiveness += 0.3;
    }
    
    // Adjust for synergy potential
    effectiveness += synergyAnalysis.synergyScore * 0.2;
    
    // Adjust for strategic position
    if (strategicValue.isChokepoint && towerConfig.areaOfEffect) {
      effectiveness += 0.2; // AoE weapons are good at chokepoints
    }
    
    if (strategicValue.isHighGround && towerClass === 'sniper') {
      effectiveness += 0.25; // Snipers benefit from high ground
    }
    
    // Adjust for coverage
    effectiveness += strategicValue.coverageScore * 0.15;
    
    // Adjust for defensive value
    effectiveness += strategicValue.defensiveValue * 0.1;
    
    return Math.min(1.0, effectiveness);
  }

  /**
   * Generate adaptive targeting recommendations
   */
  public getTargetingRecommendations(
    towerSlots: TowerSlot[],
    enemies: Enemy[]
  ): TargetingRecommendation[] {
    const recommendations: TargetingRecommendation[] = [];
    const threatAnalysis = this.analyzeThreatLevel(enemies, 1);
    
    for (const slot of towerSlots) {
      if (!slot.tower) continue;
      
      const tower = slot.tower;
      const recommendation = this.generateTargetingRecommendation(tower, threatAnalysis, enemies);
      
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }
    
    return recommendations;
  }

  /**
   * Generate targeting recommendation for a specific tower
   */
  private generateTargetingRecommendation(
    tower: Tower,
    threatAnalysis: ThreatAnalysis,
    _enemies: Enemy[]
  ): TargetingRecommendation | null {
    if (!tower.towerClass) return null;
    
    let preferredTargets: string[] = [];
    let targetingMode = 'NEAREST';
    let reason = '';
    
    switch (tower.towerClass) {
      case 'sniper':
        preferredTargets = ['Tank', 'Boss'];
        targetingMode = 'HIGHEST_HP';
        reason = 'Focus on high-value targets with precision shots';
        break;
        
      case 'gatling':
        preferredTargets = ['Scout', 'Basic'];
        targetingMode = 'FASTEST';
        reason = 'Suppress fast-moving enemies with rapid fire';
        break;
        
      case 'mortar':
        preferredTargets = ['Group', 'Cluster'];
        targetingMode = 'LOWEST_HP';
        reason = 'Finish off weakened enemies with area damage';
        break;
        
      case 'emp':
        preferredTargets = ['Electronics', 'Shielded'];
        targetingMode = 'THREAT_ASSESSMENT';
        reason = 'Disable electronic enemies and shields';
        break;
        
      default:
        // Adaptive targeting based on current threats
        if (threatAnalysis.primaryThreats.length > 0) {
          preferredTargets = threatAnalysis.primaryThreats;
          targetingMode = 'THREAT_ASSESSMENT';
          reason = 'Adapt to current threat composition';
        }
    }
    
    return {
      tower,
      preferredTargetType: preferredTargets,
      targetingMode,
      reason
    };
  }

  /**
   * Get AI recommendations for current game state
   */
  public getAIRecommendations(
    towerSlots: TowerSlot[],
    enemies: Enemy[],
    gold: number,
    currentWave: number
  ): {
    placement: PlacementSuggestion[];
    targeting: TargetingRecommendation[];
    defense: DefenseSuggestion[];
    priority: string;
  } {
    const placementSuggestions = this.getTowerPlacementSuggestions(towerSlots, enemies, gold, currentWave);
    const targetingRecommendations = this.getTargetingRecommendations(towerSlots, enemies);
    const defenseSuggestions = defenseSystemManager.getDefenseRecommendations(towerSlots, enemies);
    
    // Determine overall strategy priority
    const threatAnalysis = this.analyzeThreatLevel(enemies, currentWave);
    let priority = 'BALANCED';
    
    if (threatAnalysis.threatLevel > 0.7) {
      priority = 'DEFENSE';
    } else if (gold > 1000 && placementSuggestions.length > 0) {
      priority = 'EXPANSION';
    } else if (enemies.length > 10) {
      priority = 'DAMAGE';
    }
    
    return {
      placement: placementSuggestions,
      targeting: targetingRecommendations,
      defense: defenseSuggestions,
      priority
    };
  }

  // Helper methods
  private countEnemyTypes(enemyTypes: string[]): Record<string, number> {
    return enemyTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private findWeakestDefensePoint(enemies: Enemy[]): Position {
    // Find the point with highest enemy concentration
    const centerX = enemies.reduce((sum, e) => sum + e.position.x, 0) / enemies.length || 0;
    const centerY = enemies.reduce((sum, e) => sum + e.position.y, 0) / enemies.length || 0;
    
    return { x: centerX, y: centerY };
  }

  private getCounterStrategies(primaryThreats: string[]): string[] {
    const counters: string[] = [];
    
    for (const threat of primaryThreats) {
      switch (threat) {
        case 'Tank':
          counters.push('sniper', 'laser');
          break;
        case 'Scout':
          counters.push('gatling', 'flamethrower');
          break;
        case 'Flying':
          counters.push('air_defense');
          break;
        case 'Group':
          counters.push('mortar', 'flamethrower');
          break;
        default:
          counters.push('gatling'); // Default to versatile option
      }
    }
    
    return [...new Set(counters)]; // Remove duplicates
  }

  private calculateCoverageScore(position: Position, allSlots: TowerSlot[]): number {
    // Simple coverage calculation based on distance to existing towers
    const nearbyTowers = allSlots.filter(slot => slot.tower).length;
    const avgDistance = allSlots
      .filter(slot => slot.tower)
      .reduce((sum, slot) => {
        const distance = Math.hypot(position.x - slot.x, position.y - slot.y);
        return sum + distance;
      }, 0) / (nearbyTowers || 1);
    
    return Math.max(0, 1 - (avgDistance / 300)); // Normalize to 0-1
  }

  private calculateDefensiveValue(position: Position, allSlots: TowerSlot[]): number {
    // Check for nearby defensive towers
    const nearbyDefenses = allSlots.filter(slot => {
      if (!slot.tower) return false;
      const distance = Math.hypot(position.x - slot.x, position.y - slot.y);
      return distance <= 150 && 
             (slot.tower.towerClass === 'shield_generator' || 
              slot.tower.towerClass === 'repair_station');
    });
    
    return Math.min(1.0, nearbyDefenses.length * 0.3);
  }

  private generatePlacementReason(
    towerClass: string,
    effectiveness: number,
    synergyAnalysis: { synergyScore: number },
    strategicValue: { isChokepoint: boolean; isHighGround: boolean; coverageScore: number; defensiveValue: number }
  ): string {
    const reasons: string[] = [];
    
    if (effectiveness > 0.8) {
      reasons.push('Highly effective placement');
    }
    
    if (synergyAnalysis.synergyScore > 0.3) {
      reasons.push(`Good synergy with nearby towers`);
    }
    
    if (strategicValue.isChokepoint) {
      reasons.push('Strategic chokepoint control');
    }
    
    if (strategicValue.isHighGround) {
      reasons.push('Advantageous high ground position');
    }
    
    return reasons.join(', ') || 'Recommended placement';
  }

  private calculatePriority(
    towerClass: string,
    threatAnalysis: ThreatAnalysis,
    effectiveness: number
  ): number {
    let priority = effectiveness * 10;
    
    if (threatAnalysis.recommendedCounters.includes(towerClass)) {
      priority += 5;
    }
    
    if (threatAnalysis.threatLevel > 0.7) {
      priority += 3;
    }
    
    return Math.round(priority);
  }
}

// Global AI manager instance
export const aiManager = AIManager.getInstance(); 