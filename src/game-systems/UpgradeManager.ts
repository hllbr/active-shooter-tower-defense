import { useGameStore } from '../models/store';
// Logger import removed for production

/**
 * Upgrade category types
 */
export type UpgradeCategory = 'active' | 'passive' | 'conditional';

/**
 * Upgrade priority levels
 */
export type UpgradePriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Upgrade configuration interface
 */
export interface UpgradeConfig {
  id: string;
  name: string;
  description: string;
  category: UpgradeCategory;
  priority: UpgradePriority;
  baseCost: number;
  maxLevel: number;
  costMultiplier: number;
  effectType: string;
  effectValue: number;
  requirements?: {
    bulletLevel?: number;
    wallLevel?: number;
    currentWave?: number;
    gold?: number;
  };
  dependencies?: string[];
  synergies?: string[];
}

/**
 * Batch upgrade result
 */
export interface BatchUpgradeResult {
  success: boolean;
  upgradesApplied: string[];
  totalCost: number;
  errors: string[];
}

/**
 * Upgrade priority calculation result
 */
export interface UpgradePriorityResult {
  upgradeId: string;
  priority: number;
  costEfficiency: number;
  strategicValue: number;
  reason: string;
}

/**
 * Upgrade Manager with priority-based algorithms and batch support
 */
export class UpgradeManager {
  private static instance: UpgradeManager;
  private upgradeConfigs: Map<string, UpgradeConfig> = new Map();
  private upgradeHistory: Array<{
    upgradeId: string;
    level: number;
    cost: number;
    timestamp: number;
  }> = [];
  private readonly MAX_HISTORY_SIZE = 100;

  public static getInstance(): UpgradeManager {
    if (!UpgradeManager.instance) {
      UpgradeManager.instance = new UpgradeManager();
    }
    return UpgradeManager.instance;
  }

  /**
   * Initialize upgrade manager with external configs
   */
  public initialize(configs: UpgradeConfig[]): void {
    this.upgradeConfigs.clear();
    configs.forEach(config => {
      this.upgradeConfigs.set(config.id, config);
    });
    // UpgradeManager initialized
  }

  /**
   * Register a new upgrade configuration
   */
  public registerUpgrade(config: UpgradeConfig): void {
    this.upgradeConfigs.set(config.id, config);
          // Registered upgrade
  }

  /**
   * Get upgrade configuration by ID
   */
  public getUpgradeConfig(upgradeId: string): UpgradeConfig | null {
    return this.upgradeConfigs.get(upgradeId) || null;
  }

  /**
   * Calculate upgrade priorities for all available upgrades
   */
  public calculateUpgradePriorities(): UpgradePriorityResult[] {
    const { gold, bulletLevel, wallLevel, currentWave } = useGameStore.getState();
    const priorities: UpgradePriorityResult[] = [];

    for (const [, config] of this.upgradeConfigs) {
      const priority = this.calculateUpgradePriority(config, {
        gold,
        bulletLevel,
        wallLevel,
        currentWave
      });

      if (priority) {
        priorities.push(priority);
      }
    }

    // Sort by priority (highest first)
    return priorities.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calculate priority for a specific upgrade
   */
  private calculateUpgradePriority(
    config: UpgradeConfig,
    gameState: {
      gold: number;
      bulletLevel: number;
      wallLevel: number;
      currentWave: number;
    }
  ): UpgradePriorityResult | null {
    // Check requirements
    if (!this.checkUpgradeRequirements(config, gameState)) {
      return null;
    }

    // Calculate current level
    const currentLevel = this.getCurrentUpgradeLevel(config.id);
    if (currentLevel >= config.maxLevel) {
      return null; // Already maxed
    }

    // Calculate cost
    const cost = this.calculateUpgradeCost(config, currentLevel);
    if (cost > gameState.gold) {
      return null; // Can't afford
    }

    // Calculate priority factors
    const costEfficiency = this.calculateCostEfficiency(config, currentLevel, cost);
    const strategicValue = this.calculateStrategicValue(config, gameState);
    const categoryBonus = this.getCategoryBonus(config.category);
    const priorityBonus = this.getPriorityBonus(config.priority);

    // Calculate total priority
    const priority = (
      costEfficiency * 0.4 +
      strategicValue * 0.3 +
      categoryBonus * 0.2 +
      priorityBonus * 0.1
    );

    const reason = this.generateUpgradeReason(config, costEfficiency, strategicValue);

    return {
      upgradeId: config.id,
      priority,
      costEfficiency,
      strategicValue,
      reason
    };
  }

  /**
   * Check if upgrade requirements are met
   */
  private checkUpgradeRequirements(
    config: UpgradeConfig,
    gameState: {
      gold: number;
      bulletLevel: number;
      wallLevel: number;
      currentWave: number;
    }
  ): boolean {
    const { requirements } = config;
    if (!requirements) return true;

    if (requirements.bulletLevel && gameState.bulletLevel < requirements.bulletLevel) {
      return false;
    }

    if (requirements.wallLevel && gameState.wallLevel < requirements.wallLevel) {
      return false;
    }

    if (requirements.currentWave && gameState.currentWave < requirements.currentWave) {
      return false;
    }

    if (requirements.gold && gameState.gold < requirements.gold) {
      return false;
    }

    return true;
  }

  /**
   * Get current upgrade level
   */
  private getCurrentUpgradeLevel(upgradeId: string): number {
    const { energyUpgrades, individualFireUpgrades, individualShieldUpgrades } = useGameStore.getState();
    
    // Check different upgrade types
    if (energyUpgrades[upgradeId] !== undefined) {
      return energyUpgrades[upgradeId];
    }
    
    if (individualFireUpgrades[upgradeId] !== undefined) {
      return individualFireUpgrades[upgradeId];
    }
    
    if (individualShieldUpgrades[upgradeId] !== undefined) {
      return individualShieldUpgrades[upgradeId];
    }

    return 0;
  }

  /**
   * Calculate upgrade cost
   */
  private calculateUpgradeCost(config: UpgradeConfig, currentLevel: number): number {
    return Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel));
  }

  /**
   * Calculate cost efficiency (effect value per cost)
   */
  private calculateCostEfficiency(config: UpgradeConfig, currentLevel: number, cost: number): number {
    const effectValue = config.effectValue * (currentLevel + 1);
    return effectValue / cost;
  }

  /**
   * Calculate strategic value based on game state
   */
  private calculateStrategicValue(
    config: UpgradeConfig,
    gameState: {
      gold: number;
      bulletLevel: number;
      wallLevel: number;
      currentWave: number;
    }
  ): number {
    let strategicValue = 0;

    // Category-specific bonuses
    switch (config.category) {
      case 'active':
        strategicValue += 0.8; // High value for active abilities
        break;
      case 'passive':
        strategicValue += 0.6; // Medium value for passive bonuses
        break;
      case 'conditional':
        strategicValue += 0.4; // Lower value for conditional effects
        break;
    }

    // Priority-based bonuses
    switch (config.priority) {
      case 'critical':
        strategicValue += 1.0;
        break;
      case 'high':
        strategicValue += 0.7;
        break;
      case 'medium':
        strategicValue += 0.4;
        break;
      case 'low':
        strategicValue += 0.1;
        break;
    }

    // Wave-based scaling
    strategicValue += gameState.currentWave * 0.01;

    return Math.min(1.0, strategicValue);
  }

  /**
   * Get category bonus
   */
  private getCategoryBonus(category: UpgradeCategory): number {
    switch (category) {
      case 'active':
        return 0.8;
      case 'passive':
        return 0.6;
      case 'conditional':
        return 0.4;
      default:
        return 0.5;
    }
  }

  /**
   * Get priority bonus
   */
  private getPriorityBonus(priority: UpgradePriority): number {
    switch (priority) {
      case 'critical':
        return 1.0;
      case 'high':
        return 0.7;
      case 'medium':
        return 0.4;
      case 'low':
        return 0.1;
      default:
        return 0.5;
    }
  }

  /**
   * Generate upgrade reason for UI
   */
  private generateUpgradeReason(
    config: UpgradeConfig,
    costEfficiency: number,
    strategicValue: number
  ): string {
    const reasons: string[] = [];

    if (costEfficiency > 0.5) {
      reasons.push('Cost efficient');
    }

    if (strategicValue > 0.7) {
      reasons.push('High strategic value');
    }

    if (config.category === 'active') {
      reasons.push('Active ability');
    }

    if (config.priority === 'critical') {
      reasons.push('Critical priority');
    }

    return reasons.join(', ') || 'General upgrade';
  }

  /**
   * Apply single upgrade (atomic, FIFO)
   */
  public async applyUpgrade(upgradeId: string): Promise<boolean> {
    const config = this.getUpgradeConfig(upgradeId);
    if (!config) {
      // Upgrade config not found
      return false;
    }

    const currentLevel = this.getCurrentUpgradeLevel(upgradeId);
    if (currentLevel >= config.maxLevel) {
      // Upgrade already at max level
      return false;
    }

    const cost = this.calculateUpgradeCost(config, currentLevel);
    const { purchaseTransaction } = useGameStore.getState();

    // Use atomic, FIFO transaction
    const success = await purchaseTransaction(cost, () => {
      // Apply upgrade effects based on config
      this.applyUpgradeEffects(config, currentLevel + 1);
      // Record in history
      this.recordUpgrade(upgradeId, currentLevel + 1, cost);
    }, 'upgrade');

    if (success) {
      // Applied upgrade successfully
    } else {
              // Failed to apply upgrade
    }
    return success;
  }

  /**
   * Apply upgrade effects based on external config
   */
  private applyUpgradeEffects(config: UpgradeConfig, newLevel: number): void {
    const { setEnergyBoostLevel, setMaxActionsLevel, setEliteModuleLevel } = useGameStore.getState();

    switch (config.effectType) {
      case 'energy_boost':
        setEnergyBoostLevel(newLevel);
        break;
      case 'max_actions':
        setMaxActionsLevel(newLevel);
        break;
      case 'elite_module':
        setEliteModuleLevel(newLevel);
        break;
      case 'energy_upgrade':
        this.applyEnergyUpgrade(config.id, newLevel);
        break;
      case 'fire_upgrade':
        this.applyFireUpgrade(config.id, newLevel);
        break;
      case 'shield_upgrade':
        this.applyShieldUpgrade(config.id, newLevel);
        break;
      default:
        // Unknown effect type
    }
  }

  /**
   * Apply energy upgrade
   */
  private applyEnergyUpgrade(upgradeId: string, level: number): void {
    const { energyUpgrades } = useGameStore.getState();
    useGameStore.setState({
      energyUpgrades: {
        ...energyUpgrades,
        [upgradeId]: level
      }
    });
  }

  /**
   * Apply fire upgrade
   */
  private applyFireUpgrade(upgradeId: string, level: number): void {
    const { individualFireUpgrades } = useGameStore.getState();
    useGameStore.setState({
      individualFireUpgrades: {
        ...individualFireUpgrades,
        [upgradeId]: level
      }
    });
  }

  /**
   * Apply shield upgrade
   */
  private applyShieldUpgrade(upgradeId: string, level: number): void {
    const { individualShieldUpgrades, globalWallStrength } = useGameStore.getState();
    const config = this.getUpgradeConfig(upgradeId);
    
    if (config) {
      const strengthBonus = config.effectValue;
      useGameStore.setState({
        individualShieldUpgrades: {
          ...individualShieldUpgrades,
          [upgradeId]: level
        },
        globalWallStrength: globalWallStrength + strengthBonus
      });
    }
  }

  /**
   * Apply batch upgrades (atomic, FIFO)
   */
  public async applyBatchUpgrades(upgradeIds: string[]): Promise<BatchUpgradeResult> {
    const result: BatchUpgradeResult = {
      success: false,
      upgradesApplied: [],
      totalCost: 0,
      errors: []
    };

    // Calculate total cost first
    let totalCost = 0;
    for (const upgradeId of upgradeIds) {
      const config = this.getUpgradeConfig(upgradeId);
      if (!config) {
        result.errors.push(`Upgrade config not found: ${upgradeId}`);
        continue;
      }

      const currentLevel = this.getCurrentUpgradeLevel(upgradeId);
      if (currentLevel >= config.maxLevel) {
        result.errors.push(`Upgrade already at max level: ${upgradeId}`);
        continue;
      }

      const cost = this.calculateUpgradeCost(config, currentLevel);
      totalCost += cost;
    }

    // Check if we can afford all upgrades
    const { gold, purchaseTransaction } = useGameStore.getState();
    if (totalCost > gold) {
      result.errors.push(`Insufficient gold for batch upgrade. Required: ${totalCost}, Available: ${gold}`);
      return result;
    }

    // Use atomic, FIFO transaction for all upgrades
    const success = await purchaseTransaction(totalCost, () => {
      for (const upgradeId of upgradeIds) {
        const config = this.getUpgradeConfig(upgradeId);
        if (!config) continue;
        const currentLevel = this.getCurrentUpgradeLevel(upgradeId);
        if (currentLevel >= config.maxLevel) continue;
        this.applyUpgradeEffects(config, currentLevel + 1);
        this.recordUpgrade(upgradeId, currentLevel + 1, this.calculateUpgradeCost(config, currentLevel));
        result.upgradesApplied.push(upgradeId);
      }
    }, 'batch_upgrade');

    result.success = success && result.upgradesApplied.length > 0;
    result.totalCost = totalCost;

    if (success) {
      // Batch upgrade applied
    } else {
      result.errors.push('Batch upgrade transaction failed');
    }
    return result;
  }

  /**
   * Undo last upgrade
   */
  public undoUpgrade(): boolean {
    if (this.upgradeHistory.length === 0) {
      // No upgrade history to undo
      return false;
    }

    const lastUpgrade = this.upgradeHistory[this.upgradeHistory.length - 1];
    const config = this.getUpgradeConfig(lastUpgrade.upgradeId);
    
    if (!config) {
      // Upgrade config not found for undo
      return false;
    }

    // Refund gold
    const { addGold } = useGameStore.getState();
    addGold(lastUpgrade.cost, 'upgrade_undo');

    // Revert upgrade effects
    this.revertUpgradeEffects(config, lastUpgrade.level);

    // Remove from history
    this.upgradeHistory.pop();

          // Undid upgrade successfully
    return true;
  }

  /**
   * Revert upgrade effects
   */
  private revertUpgradeEffects(config: UpgradeConfig, level: number): void {
    const { setEnergyBoostLevel, setMaxActionsLevel, setEliteModuleLevel } = useGameStore.getState();

    switch (config.effectType) {
      case 'energy_boost':
        setEnergyBoostLevel(Math.max(0, level - 1));
        break;
      case 'max_actions':
        setMaxActionsLevel(Math.max(0, level - 1));
        break;
      case 'elite_module':
        setEliteModuleLevel(Math.max(0, level - 1));
        break;
      case 'energy_upgrade':
        this.revertEnergyUpgrade(config.id, level - 1);
        break;
      case 'fire_upgrade':
        this.revertFireUpgrade(config.id, level - 1);
        break;
      case 'shield_upgrade':
        this.revertShieldUpgrade(config.id, level - 1);
        break;
      default:
        // Unknown effect type for revert
    }
  }

  /**
   * Revert energy upgrade
   */
  private revertEnergyUpgrade(upgradeId: string, level: number): void {
    const { energyUpgrades } = useGameStore.getState();
    useGameStore.setState({
      energyUpgrades: {
        ...energyUpgrades,
        [upgradeId]: Math.max(0, level)
      }
    });
  }

  /**
   * Revert fire upgrade
   */
  private revertFireUpgrade(upgradeId: string, level: number): void {
    const { individualFireUpgrades } = useGameStore.getState();
    useGameStore.setState({
      individualFireUpgrades: {
        ...individualFireUpgrades,
        [upgradeId]: Math.max(0, level)
      }
    });
  }

  /**
   * Revert shield upgrade
   */
  private revertShieldUpgrade(upgradeId: string, level: number): void {
    const { individualShieldUpgrades, globalWallStrength } = useGameStore.getState();
    const config = this.getUpgradeConfig(upgradeId);
    
    if (config) {
      const strengthPenalty = config.effectValue;
      useGameStore.setState({
        individualShieldUpgrades: {
          ...individualShieldUpgrades,
          [upgradeId]: Math.max(0, level)
        },
        globalWallStrength: Math.max(0, globalWallStrength - strengthPenalty)
      });
    }
  }

  /**
   * Record upgrade in history
   */
  private recordUpgrade(upgradeId: string, level: number, cost: number): void {
    this.upgradeHistory.push({
      upgradeId,
      level,
      cost,
      timestamp: performance.now()
    });

    // Limit history size
    if (this.upgradeHistory.length > this.MAX_HISTORY_SIZE) {
      this.upgradeHistory.shift();
    }
  }

  /**
   * Get upgrade history
   */
  public getUpgradeHistory(): Array<{
    upgradeId: string;
    level: number;
    cost: number;
    timestamp: number;
  }> {
    return [...this.upgradeHistory];
  }

  /**
   * Clear upgrade history
   */
  public clearHistory(): void {
    this.upgradeHistory = [];
    // Upgrade history cleared
  }

  /**
   * Get recommended upgrades for UI
   */
  public getRecommendedUpgrades(count: number = 5): UpgradePriorityResult[] {
    return this.calculateUpgradePriorities().slice(0, count);
  }

  /**
   * Reset the upgrade manager
   */
  public reset(): void {
    this.upgradeConfigs.clear();
    this.upgradeHistory = [];
    // UpgradeManager reset
  }
}

// Export singleton instance
export const upgradeManager = UpgradeManager.getInstance(); 