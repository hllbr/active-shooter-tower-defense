import { GAME_CONSTANTS } from '../../utils/constants';
import type { DefenseTarget, Position, Enemy } from '../../models/gameTypes';
import { createManagedEffect } from '../effects-system/Effects';

/**
 * Defense Target Manager
 * Manages the player's base/energy core that enemies target when no towers are present
 */
export class DefenseTargetManager {
  private static instance: DefenseTargetManager;
  private defenseTarget: DefenseTarget | null = null;
  private lastUpdateTime = 0;
  private updateInterval = 16; // ~60fps

  private constructor() {}

  static getInstance(): DefenseTargetManager {
    if (!DefenseTargetManager.instance) {
      DefenseTargetManager.instance = new DefenseTargetManager();
    }
    return DefenseTargetManager.instance;
  }

  /**
   * Initialize the defense target system
   */
  initialize(): void {
    this.defenseTarget = this.createDefaultDefenseTarget();
  }

  /**
   * Create the default energy core defense target
   */
  private createDefaultDefenseTarget(): DefenseTarget {
    return {
      id: 'energy_core_001',
      type: 'energy_core',
      position: { x: GAME_CONSTANTS.CANVAS_WIDTH / 2, y: GAME_CONSTANTS.CANVAS_HEIGHT / 2 },
      size: 60,
      health: 1000,
      maxHealth: 1000,
      isActive: true,
      isVisible: true,
      isVulnerable: true,
      
      // Visual properties
      color: '#00ffff',
      glowIntensity: 0.8,
      pulseRate: 1.0,
      
      // Defense properties
      shieldStrength: 200,
      maxShieldStrength: 200,
      shieldRegenRate: 5,
      lastShieldRegen: 0,
      
      // Damage properties
      damageResistance: 0.1,
      criticalVulnerability: 0.05,
      
      // Effects
      activeEffects: [],
      lastDamaged: 0,
      
      // Visual indicators
      showDamageIndicator: false,
      damageIndicatorDuration: 1000,
      damageIndicatorStartTime: 0,
    };
  }

  /**
   * Get the current defense target
   */
  getDefenseTarget(): DefenseTarget | null {
    return this.defenseTarget;
  }

  /**
   * Update the defense target (called from game loop)
   */
  update(currentTime: number): void {
    if (!this.defenseTarget || currentTime - this.lastUpdateTime < this.updateInterval) {
      return;
    }

    this.lastUpdateTime = currentTime;

    // Update shield regeneration
    this.updateShieldRegeneration(currentTime);

    // Update visual effects
    this.updateVisualEffects(currentTime);

    // Update damage indicators
    this.updateDamageIndicators(currentTime);
  }

  /**
   * Update shield regeneration
   */
  private updateShieldRegeneration(currentTime: number): void {
    if (!this.defenseTarget) return;

    const { defenseTarget } = this;
    const timeSinceLastRegen = currentTime - defenseTarget.lastShieldRegen;
    const regenInterval = 1000; // Regenerate every second

    if (timeSinceLastRegen >= regenInterval && defenseTarget.shieldStrength < defenseTarget.maxShieldStrength) {
      const regenAmount = Math.min(
        defenseTarget.shieldRegenRate,
        defenseTarget.maxShieldStrength - defenseTarget.shieldStrength
      );
      
      defenseTarget.shieldStrength += regenAmount;
      defenseTarget.lastShieldRegen = currentTime;

      // Create shield regen effect
      this.createShieldRegenEffect(defenseTarget.position);
    }
  }

  /**
   * Update visual effects
   */
  private updateVisualEffects(currentTime: number): void {
    if (!this.defenseTarget) return;

    const { defenseTarget } = this;
    
    // Pulse effect
    const pulseTime = (currentTime / 1000) * defenseTarget.pulseRate;
    defenseTarget.glowIntensity = 0.6 + Math.sin(pulseTime) * 0.2;

    // Damage flash effect
    if (defenseTarget.showDamageIndicator) {
      const timeSinceDamage = currentTime - defenseTarget.damageIndicatorStartTime;
      const flashProgress = timeSinceDamage / defenseTarget.damageIndicatorDuration;
      
      if (flashProgress >= 1) {
        defenseTarget.showDamageIndicator = false;
      } else {
        // Flash effect
        const flashIntensity = Math.sin(flashProgress * Math.PI * 8) * 0.5;
        defenseTarget.color = `hsl(180, 100%, ${50 + flashIntensity * 50}%)`;
      }
    }
  }

  /**
   * Update damage indicators
   */
  private updateDamageIndicators(currentTime: number): void {
    if (!this.defenseTarget) return;

    const { defenseTarget } = this;
    
    if (defenseTarget.showDamageIndicator) {
      const timeSinceDamage = currentTime - defenseTarget.damageIndicatorStartTime;
      if (timeSinceDamage >= defenseTarget.damageIndicatorDuration) {
        defenseTarget.showDamageIndicator = false;
        defenseTarget.color = '#00ffff'; // Reset to default color
      }
    }
  }

  /**
   * Handle enemy collision with defense target
   */
  handleEnemyCollision(enemy: Enemy, currentTime: number): boolean {
    if (!this.defenseTarget || !this.defenseTarget.isActive) {
      return false;
    }

    const distance = this.calculateDistance(enemy.position, this.defenseTarget.position);
    const collisionThreshold = (enemy.size + this.defenseTarget.size) / 2;

    if (distance < collisionThreshold) {
      this.damageDefenseTarget(enemy.damage, currentTime);
      this.createCollisionEffect(enemy.position, enemy.type || 'basic');
      return true;
    }

    return false;
  }

  /**
   * Damage the defense target
   */
  private damageDefenseTarget(damage: number, currentTime: number): void {
    if (!this.defenseTarget) return;

    const { defenseTarget } = this;

    // Apply damage resistance
    const effectiveDamage = Math.max(1, Math.floor(damage * (1 - defenseTarget.damageResistance)));

    // Damage shield first
    if (defenseTarget.shieldStrength > 0) {
      const shieldDamage = Math.min(effectiveDamage, defenseTarget.shieldStrength);
      defenseTarget.shieldStrength -= shieldDamage;
      
      const remainingDamage = effectiveDamage - shieldDamage;
      if (remainingDamage > 0) {
        defenseTarget.health -= remainingDamage;
      }
    } else {
      // No shield, damage health directly
      defenseTarget.health -= effectiveDamage;
    }

    // Update damage indicators
    defenseTarget.lastDamaged = currentTime;
    defenseTarget.showDamageIndicator = true;
    defenseTarget.damageIndicatorStartTime = currentTime;

    // Create damage effect
    this.createDamageEffect(defenseTarget.position, effectiveDamage);

    // Check for destruction
    if (defenseTarget.health <= 0) {
      this.handleDefenseTargetDestruction();
    }
  }

  /**
   * Handle defense target destruction
   */
  private handleDefenseTargetDestruction(): void {
    if (!this.defenseTarget) return;

    this.defenseTarget.isActive = false;
    this.defenseTarget.health = 0;
    this.defenseTarget.shieldStrength = 0;

    // Create destruction effect
    this.createDestructionEffect(this.defenseTarget.position);

    // Trigger game over
    this.triggerGameOver();
  }

  /**
   * Trigger game over when defense target is destroyed
   */
  private triggerGameOver(): void {
    // Import and trigger game over
    import('../../models/store').then(({ useGameStore }) => {
      const store = useGameStore.getState();
      // Set game over state directly
      store.isGameOver = true;
    });

    // Play defeat sound
    import('../../utils/sound').then(({ playContextualSound }) => {
      playContextualSound('defeat');
    });
  }

  /**
   * Calculate distance between two positions
   */
  private calculateDistance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Create shield regeneration effect
   */
  private createShieldRegenEffect(position: Position): void {
    createManagedEffect('shield_regen', position, 800);
  }

  /**
   * Create damage effect
   */
  private createDamageEffect(position: Position, _damage: number): void {
    createManagedEffect('damage', position, 600);
  }

  /**
   * Create collision effect
   */
  private createCollisionEffect(position: Position, enemyType: string): void {
    const effectType = this.getCollisionEffectType(enemyType);
    createManagedEffect(effectType, position, 1000);
  }

  /**
   * Create destruction effect
   */
  private createDestructionEffect(position: Position): void {
    createManagedEffect('destruction', position, 2000);
  }

  /**
   * Get collision effect type based on enemy type
   */
  private getCollisionEffectType(enemyType: string): string {
    switch (enemyType) {
      case 'Tank':
      case 'TankBoss':
        return 'heavy_impact';
      case 'Ghost':
      case 'GhostBoss':
        return 'ghost_dissipate';
      case 'Boss':
        return 'boss_explosion';
      default:
        return 'enemy_explosion';
    }
  }

  /**
   * Get collision effect color based on effect type
   */
  private getCollisionEffectColor(effectType: string): string {
    switch (effectType) {
      case 'heavy_impact':
        return '#ff6600';
      case 'ghost_dissipate':
        return '#9933ff';
      case 'boss_explosion':
        return '#ff0000';
      default:
        return '#ff3333';
    }
  }

  /**
   * Check if defense target is vulnerable
   */
  isDefenseTargetVulnerable(): boolean {
    return this.defenseTarget?.isVulnerable ?? false;
  }

  /**
   * Get defense target position for enemy targeting
   */
  getDefenseTargetPosition(): Position | null {
    return this.defenseTarget?.position ?? null;
  }

  /**
   * Get defense target health percentage
   */
  getDefenseTargetHealthPercentage(): number {
    if (!this.defenseTarget) return 0;
    return (this.defenseTarget.health / this.defenseTarget.maxHealth) * 100;
  }

  /**
   * Get defense target shield percentage
   */
  getDefenseTargetShieldPercentage(): number {
    if (!this.defenseTarget) return 0;
    return (this.defenseTarget.shieldStrength / this.defenseTarget.maxShieldStrength) * 100;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.defenseTarget = null;
    this.lastUpdateTime = 0;
  }
}

// Export singleton instance
export const defenseTargetManager = DefenseTargetManager.getInstance(); 