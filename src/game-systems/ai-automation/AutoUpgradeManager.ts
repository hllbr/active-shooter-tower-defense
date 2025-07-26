import { useGameStore } from '../../models/store';
import type { Tower, TowerSlot } from '../../models/gameTypes';
import { GAME_CONSTANTS } from '../../utils/constants';


/**
 * Tower upgrade priority calculation result
 */
interface UpgradePriority {
  tower: Tower;
  slotIndex: number;
  priority: number;
  potentialDamageIncrease: number;
  costEfficiency: number;
  reason: string;
}

/**
 * Auto Upgrade Manager with priority algorithm
 * Implements intelligent tower upgrading based on damage potential
 */
export class AutoUpgradeManager {
  private static instance: AutoUpgradeManager;
  private isActive: boolean = false;
  private lastManualIntervention: number = 0;
  private readonly MANUAL_INTERVENTION_COOLDOWN = 5000; // 5 seconds
  private readonly MIN_UPGRADE_INTERVAL = 2000; // 2 seconds between upgrades
  private lastUpgradeTime: number = 0;

  public static getInstance(): AutoUpgradeManager {
    if (!AutoUpgradeManager.instance) {
      AutoUpgradeManager.instance = new AutoUpgradeManager();
    }
    return AutoUpgradeManager.instance;
  }

  /**
   * Enable/disable auto upgrade system
   */
  public setActive(active: boolean): void {
    this.isActive = active;
    // Auto Upgrade logging removed for production optimization
  }

  /**
   * Check if auto upgrade is active
   */
  public isAutoUpgradeActive(): boolean {
    return this.isActive;
  }

  /**
   * Handle manual intervention to temporarily disable automation
   */
  public handleManualIntervention(): void {
    this.lastManualIntervention = performance.now();
    if (this.isActive) {
      this.setActive(false);
      // Auto upgrade logging removed for production optimization
      
      // Re-enable after cooldown
      setTimeout(() => {
        if (performance.now() - this.lastManualIntervention >= this.MANUAL_INTERVENTION_COOLDOWN) {
          this.setActive(true);
          // Auto upgrade logging removed for production optimization
        }
      }, this.MANUAL_INTERVENTION_COOLDOWN);
    }
  }

  /**
   * Calculate upgrade priorities for all towers
   */
  public calculateUpgradePriorities(towerSlots: TowerSlot[]): UpgradePriority[] {
    const priorities: UpgradePriority[] = [];
    const { gold } = useGameStore.getState();

    for (let i = 0; i < towerSlots.length; i++) {
      const slot = towerSlots[i];
      if (!slot.tower || slot.tower.towerType === 'economy') continue;

      const priority = this.calculateTowerUpgradePriority(slot.tower, i, gold);
      if (priority) {
        priorities.push(priority);
      }
    }

    // Sort by priority (highest first)
    return priorities.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calculate upgrade priority for a specific tower
   */
  private calculateTowerUpgradePriority(
    tower: Tower, 
    slotIndex: number, 
    availableGold: number
  ): UpgradePriority | null {
    // Skip if tower is at max level
    if (tower.level >= 25) return null;

    // Calculate upgrade cost
    const upgradeCost = this.calculateUpgradeCost(tower);
    if (upgradeCost > availableGold) return null;

    // Calculate potential damage increase
    const potentialDamageIncrease = this.calculatePotentialDamageIncrease(tower);
    
    // Calculate cost efficiency (damage increase per gold spent)
    const costEfficiency = potentialDamageIncrease / upgradeCost;

    // Base priority calculation
    let priority = 0;

    // Damage potential multiplier
    priority += potentialDamageIncrease * 10;

    // Cost efficiency multiplier
    priority += costEfficiency * 100;

    // Tower class specific bonuses
    priority += this.calculateClassSpecificPriority(tower);

    // Level-based priority (higher levels get priority)
    priority += tower.level * 2;

    // Specialized tower bonuses
    if (tower.towerClass) {
      priority += this.calculateSpecializedTowerPriority(tower);
    }

    // Synergy bonuses
    priority += this.calculateSynergyPriority(tower, slotIndex);

    const reason = this.generateUpgradeReason(tower, potentialDamageIncrease, costEfficiency);

    return {
      tower,
      slotIndex,
      priority,
      potentialDamageIncrease,
      costEfficiency,
      reason
    };
  }

  /**
   * Calculate upgrade cost for a tower
   */
  private calculateUpgradeCost(tower: Tower): number {
    const baseCost = GAME_CONSTANTS.TOWER_UPGRADE_COST || 50;
    const levelMultiplier = Math.pow(1.2, tower.level);
    return Math.floor(baseCost * levelMultiplier);
  }

  /**
   * Calculate potential damage increase from upgrade
   */
  private calculatePotentialDamageIncrease(tower: Tower): number {
    const baseDamageIncrease = 5; // Base damage increase per level
    const levelMultiplier = 1 + (tower.level * 0.1); // Damage scales with level
    
    let damageIncrease = baseDamageIncrease * levelMultiplier;

    // Specialized tower damage calculations
    if (tower.towerClass) {
      damageIncrease = this.calculateSpecializedDamageIncrease(tower, damageIncrease);
    }

    return damageIncrease;
  }

  /**
   * Calculate specialized damage increase for different tower classes
   */
  private calculateSpecializedDamageIncrease(tower: Tower, baseIncrease: number): number {
    switch (tower.towerClass) {
      case 'sniper':
        return baseIncrease * 1.5; // High single-target damage
      case 'gatling':
        return baseIncrease * 0.8; // Lower damage but high fire rate
      case 'laser':
        return baseIncrease * 1.2; // Good damage with penetration
      case 'mortar':
        return baseIncrease * 1.3; // AoE damage
      case 'flamethrower':
        return baseIncrease * 1.1; // DoT damage
      case 'emp':
        return baseIncrease * 0.7; // Utility tower, lower damage
      default:
        return baseIncrease;
    }
  }

  /**
   * Calculate class-specific priority bonuses
   */
  private calculateClassSpecificPriority(tower: Tower): number {
    let bonus = 0;

    // Priority for high-damage towers
    if (tower.damage > 50) {
      bonus += 20;
    }

    // Priority for towers with special abilities
    if (tower.specialAbility) {
      bonus += 15;
    }

    // Priority for towers with high fire rate
    if (tower.fireRate > 2) {
      bonus += 10;
    }

    return bonus;
  }

  /**
   * Calculate specialized tower priority
   */
  private calculateSpecializedTowerPriority(tower: Tower): number {
    let bonus = 0;

    switch (tower.towerClass) {
      case 'sniper':
        bonus += 25; // High priority for precision damage
        break;
      case 'gatling':
        bonus += 15; // Good for crowd control
        break;
      case 'laser':
        bonus += 20; // Good for armored enemies
        break;
      case 'mortar':
        bonus += 18; // Good for groups
        break;
      case 'flamethrower':
        bonus += 12; // Good for area denial
        break;
      case 'emp':
        bonus += 8; // Utility tower, lower priority
        break;
    }

    return bonus;
  }

  /**
   * Calculate synergy priority with nearby towers
   */
  private calculateSynergyPriority(tower: Tower, slotIndex: number): number {
    const { towerSlots } = useGameStore.getState();
    let synergyBonus = 0;

    // Check nearby towers for synergy
    for (let i = 0; i < towerSlots.length; i++) {
      if (i === slotIndex || !towerSlots[i].tower) continue;

      const nearbyTower = towerSlots[i].tower!;
      const distance = Math.hypot(
        tower.position.x - nearbyTower.position.x,
        tower.position.y - nearbyTower.position.y
      );

      if (distance <= 200) { // Synergy range
        // Bonus for same tower class
        if (tower.towerClass === nearbyTower.towerClass) {
          synergyBonus += 10;
        }

        // Bonus for complementary tower types
        if (this.areTowersComplementary(tower, nearbyTower)) {
          synergyBonus += 15;
        }
      }
    }

    return synergyBonus;
  }

  /**
   * Check if two towers are complementary
   */
  private areTowersComplementary(tower1: Tower, tower2: Tower): boolean {
    const complementaryPairs = [
      ['sniper', 'gatling'], // Precision + Rapid fire
      ['laser', 'mortar'],   // Single target + AoE
      ['flamethrower', 'emp'], // Damage + Utility
      ['radar', 'sniper'],   // Detection + Precision
      ['shield_generator', 'repair_station'] // Defense + Support
    ];

    return complementaryPairs.some(pair => 
      (tower1.towerClass === pair[0] && tower2.towerClass === pair[1]) ||
      (tower1.towerClass === pair[1] && tower2.towerClass === pair[0])
    );
  }

  /**
   * Generate upgrade reason for UI display
   */
  private generateUpgradeReason(
    tower: Tower, 
    damageIncrease: number, 
    costEfficiency: number
  ): string {
    const reasons: string[] = [];

    if (damageIncrease > 10) {
      reasons.push('High damage increase');
    }

    if (costEfficiency > 0.5) {
      reasons.push('Cost efficient');
    }

    if (tower.towerClass) {
      reasons.push(`${tower.towerClass} specialization`);
    }

    if (tower.level >= 20) {
      reasons.push('Near max level');
    }

    return reasons.join(', ') || 'General upgrade';
  }

  /**
   * Execute auto upgrade for the highest priority tower (atomic, FIFO)
   */
  public async executeAutoUpgrade(): Promise<boolean> {
    if (!this.isActive) return false;

    // Check cooldown
    if (performance.now() - this.lastUpgradeTime < this.MIN_UPGRADE_INTERVAL) {
      return false;
    }

    const { towerSlots, purchaseTransaction } = useGameStore.getState();
    const priorities = this.calculateUpgradePriorities(towerSlots);

    if (priorities.length === 0) return false;

    const topPriority = priorities[0];

    // Double-check affordability
    const upgradeCost = this.calculateUpgradeCost(topPriority.tower);
    if (upgradeCost > useGameStore.getState().gold) {
      return false;
    }

    // Use atomic, FIFO transaction
    const success = await purchaseTransaction(upgradeCost, () => {
      this.applyUpgrade(topPriority.tower);
      this.lastUpgradeTime = performance.now();
    }, 'auto_upgrade');

    if (success) {
      // Auto upgrade logging removed for production optimization
      return true;
    }

    return false;
  }

  /**
   * Check if we can afford to upgrade a tower
   */
  private canAfford(tower: Tower): boolean {
    const { gold } = useGameStore.getState();
    const upgradeCost = this.calculateUpgradeCost(tower);
    return gold >= upgradeCost;
  }

  /**
   * Apply upgrade effects to a tower
   */
  private applyUpgrade(tower: Tower): void {
    const damageIncrease = this.calculatePotentialDamageIncrease(tower);
    
    // Update tower stats
    tower.level += 1;
    tower.damage += damageIncrease;
    
    // Apply specialized upgrades
    if (tower.towerClass) {
      this.applySpecializedUpgrade(tower);
    }

    // Trigger upgrade listeners
    const { towerUpgradeListeners } = useGameStore.getState();
    towerUpgradeListeners.forEach(listener => {
      try {
        listener(tower, tower.level - 1, tower.level);
      } catch (error) {
        // Error logging removed for production optimization
      }
    });
  }

  /**
   * Apply specialized upgrade effects
   */
  private applySpecializedUpgrade(tower: Tower): void {
    switch (tower.towerClass) {
      case 'sniper':
        tower.criticalChance = (tower.criticalChance || 0.1) + 0.02;
        tower.criticalDamage = (tower.criticalDamage || 2) + 0.1;
        break;
      case 'gatling':
        tower.fireRate += 0.1;
        tower.spinUpLevel = (tower.spinUpLevel || 0) + 1;
        break;
      case 'laser':
        tower.beamFocusMultiplier = (tower.beamFocusMultiplier || 1) + 0.1;
        tower.projectilePenetration = (tower.projectilePenetration || 1) + 1;
        break;
      case 'mortar':
        tower.areaOfEffect = (tower.areaOfEffect || 50) + 5;
        break;
      case 'flamethrower':
        tower.burnDuration = (tower.burnDuration || 1000) + 200;
        break;
      case 'emp':
        tower.empDuration = (tower.empDuration || 2000) + 500;
        break;
    }
  }

  /**
   * Get current upgrade recommendations for UI
   */
  public getUpgradeRecommendations(): UpgradePriority[] {
    const { towerSlots } = useGameStore.getState();
    return this.calculateUpgradePriorities(towerSlots).slice(0, 3);
  }

  /**
   * Reset the auto upgrade manager
   */
  public reset(): void {
    this.isActive = false;
    this.lastManualIntervention = 0;
    this.lastUpgradeTime = 0;
  }
}

// Export singleton instance
export const autoUpgradeManager = AutoUpgradeManager.getInstance(); 