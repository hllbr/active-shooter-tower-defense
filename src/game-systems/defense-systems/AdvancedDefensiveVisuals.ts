/**
 * 🛡️ Advanced Defensive Visuals System
 * Implements enhanced visual feedback for defensive structures
 */

import { useGameStore } from '../../models/store';
import { SimplifiedParticleSystem } from '../effects-system/SimplifiedParticleSystem';
import { playSound } from '../../utils/sound';

export interface DefensiveVisualState {
  id: string;
  type: 'wall' | 'trench';
  level: number;
  healthPercentage: number;
  crackLevel: number; // 0-3: none, small, medium, large
  lastDamageTime: number;
  visualEffects: string[];
  upgradeProgress: number; // 0-1 for upgrade animations
}

export interface KnockbackConfig {
  enabled: boolean;
  force: number;
  stunDuration: number;
  visualEffect: string;
  soundEffect: string;
}

export class AdvancedDefensiveVisuals {
  private static instance: AdvancedDefensiveVisuals;
  private particleSystem: SimplifiedParticleSystem;
  private visualStates: Map<string, DefensiveVisualState> = new Map();
  private screenShakeActive = false;
  private screenShakeEndTime = 0;

  // Special enemies that get knockback effects
  private static readonly KNOCKBACK_ENEMIES = [
    'Tank', 'TankBoss', 'Demon', 'Golem', 'Phoenix', 'DemonLord', 
    'DragonKing', 'LichKing', 'TitanLord', 'VoidGod', 'UltimateGod',
    'steel_behemoth', 'iron_colossus', 'quantum_nightmare'
  ];

  // Knockback configurations for different enemy types
  private static readonly KNOCKBACK_CONFIGS: Record<string, KnockbackConfig> = {
    'Tank': {
      enabled: true,
      force: 60,
      stunDuration: 800,
      visualEffect: 'dust_cloud',
      soundEffect: 'heavy_impact'
    },
    'TankBoss': {
      enabled: true,
      force: 80,
      stunDuration: 1200,
      visualEffect: 'crack_formation',
      soundEffect: 'boss_impact'
    },
    'Demon': {
      enabled: true,
      force: 70,
      stunDuration: 1000,
      visualEffect: 'fire_burst',
      soundEffect: 'demon_roar'
    },
    'Golem': {
      enabled: true,
      force: 90,
      stunDuration: 1500,
      visualEffect: 'stone_shatter',
      soundEffect: 'golem_slam'
    },
    'Phoenix': {
      enabled: true,
      force: 50,
      stunDuration: 600,
      visualEffect: 'fire_explosion',
      soundEffect: 'phoenix_screech'
    }
  };

  private constructor() {
    this.particleSystem = new SimplifiedParticleSystem();
  }

  static getInstance(): AdvancedDefensiveVisuals {
    if (!AdvancedDefensiveVisuals.instance) {
      AdvancedDefensiveVisuals.instance = new AdvancedDefensiveVisuals();
    }
    return AdvancedDefensiveVisuals.instance;
  }

  /**
   * Handle enemy collision with defensive structures
   */
  handleDefensiveCollision(
    enemy: { position: { x: number; y: number }; type?: string; bossType?: string; velocityX?: number; velocityY?: number; frozenUntil?: number; speed?: number },
    slot: { tower?: { wallStrength: number }; modifier?: { type: string } },
    slotIdx: number,
    actions: {
      damageTower: (slotIdx: number, damage: number) => void;
      hitWall: (slotIdx: number) => void;
      damageEnemy: (id: string, damage: number) => void;
    }
  ): void {
    const { type, bossType } = enemy;
    const enemyType = type || 'Basic';
    const isSpecialEnemy = this.isSpecialEnemy(enemyType, bossType);

    // Handle wall collision
    if ((slot.tower?.wallStrength || 0) > 0) {
      this.handleWallCollision(enemy, slot, slotIdx, actions, isSpecialEnemy);
    }

    // Handle trench collision
    if (slot.modifier?.type === 'trench') {
      this.handleTrenchCollision(enemy, slot, slotIdx, isSpecialEnemy);
    }
  }

  /**
   * Handle wall collision with enhanced visuals
   */
  private handleWallCollision(
    enemy: { position: { x: number; y: number }; type?: string; velocityX?: number; velocityY?: number; frozenUntil?: number },
    slot: { tower?: { wallStrength: number } },
    slotIdx: number,
    actions: { hitWall: (slotIdx: number) => void },
    isSpecialEnemy: boolean
  ): void {
    const { position, type } = enemy;
    const wallStrength = slot.tower?.wallStrength || 0;
    const maxWallStrength = 10; // Assuming max wall strength is 10
    const healthPercentage = wallStrength / maxWallStrength;

    // Apply knockback only for special enemies
    if (isSpecialEnemy) {
      this.applyKnockbackEffect(enemy, type);
    }

    // Damage the wall
    actions.hitWall(slotIdx);

    // Create visual effects based on wall health
    this.createWallDamageEffects(position, healthPercentage, isSpecialEnemy);

    // Update wall visual state
    this.updateWallVisualState(slotIdx, healthPercentage);

    // Check for wall destruction
    if (wallStrength <= 1) {
      this.createWallDestructionEffects(position);
      this.triggerScreenShake(300);
    }
  }

  /**
   * Handle trench collision with enhanced visuals
   */
  private handleTrenchCollision(
    enemy: { position: { x: number; y: number }; speed?: number; sinkingEffect?: { active: boolean; startTime: number; duration: number; depth: number } },
    slot: { modifier?: { type: string } },
    _slotIdx: number,
    _isSpecialEnemy: boolean
  ): void {
    const { position } = enemy;
    const trenchLevel = this.getTrenchLevel(slot);

    // Create trench entry effects
    this.createTrenchEntryEffects(position, trenchLevel);

    // Apply progressive slowdown based on trench level
    const slowFactor = 0.2 + (trenchLevel * 0.1); // 20% to 40% slowdown
    if (enemy.speed) {
      enemy.speed *= (1 - slowFactor);
    }

    // Create sinking animation effect
    this.createSinkingEffect(enemy, trenchLevel);
  }

  /**
   * Apply knockback effect for special enemies
   */
  private applyKnockbackEffect(enemy: { position: { x: number; y: number }; velocityX?: number; velocityY?: number; frozenUntil?: number }, enemyType?: string): void {
    if (!enemyType) return;
    
    const config = AdvancedDefensiveVisuals.KNOCKBACK_CONFIGS[enemyType];
    if (!config?.enabled) return;

    // Apply knockback force
    const knockbackForce = config.force;
    if (enemy.velocityX) {
      enemy.position.x -= enemy.velocityX * knockbackForce;
    }
    if (enemy.velocityY) {
      enemy.position.y -= enemy.velocityY * knockbackForce;
    }

    // Apply stun effect
    enemy.frozenUntil = performance.now() + config.stunDuration;

    // Create visual effect
    this.createKnockbackVisualEffect(enemy.position, config.visualEffect);

    // Play sound effect
    playSound(config.soundEffect);
  }

  /**
   * Create wall damage effects with crack animations
   */
  private createWallDamageEffects(
    position: { x: number; y: number },
    healthPercentage: number,
    isSpecialEnemy: boolean
  ): void {
    const { addEffect } = useGameStore.getState();

    // Determine crack level based on health
    let crackLevel = 0;
    if (healthPercentage <= 0.1) crackLevel = 3; // Large cracks + debris
    else if (healthPercentage <= 0.3) crackLevel = 2; // Medium cracks
    else if (healthPercentage <= 0.5) crackLevel = 1; // Small cracks

    // Create crack effect
    if (crackLevel > 0) {
      addEffect({
        id: `wall_crack_${Date.now()}`,
        position,
        radius: 30,
        color: '#8B4513',
        life: 2000,
        maxLife: 2000,
        type: 'wall_crack',
        opacity: 0.8,
        scale: crackLevel,
      });
    }

    // Create debris effect for severe damage
    if (crackLevel >= 2) {
      this.particleSystem.createEffect(
        position.x,
        position.y,
        'explosion',
        {
          count: 4,
          colors: ['#696969', '#8B4513', '#A0522D'],
          life: 1500,
          size: 6
        }
      );
    }

    // Enhanced effects for special enemies
    if (isSpecialEnemy) {
      this.particleSystem.createEffect(
        position.x,
        position.y,
        'explosion',
        {
          count: 8,
          colors: ['#FF4500', '#FF6347', '#FF7F50'],
          life: 2000,
          size: 8
        }
      );
    }
  }

  /**
   * Create wall destruction effects
   */
  private createWallDestructionEffects(position: { x: number; y: number }): void {
    const { addEffect } = useGameStore.getState();

    // Dust cloud effect
    addEffect({
      id: `wall_dust_${Date.now()}`,
      position,
      radius: 50,
      color: '#D3D3D3',
      life: 3000,
      maxLife: 3000,
      type: 'dust_cloud',
      opacity: 0.6,
      scale: 2.0,
    });

    // Rock particles
    this.particleSystem.createEffect(
      position.x,
      position.y,
      'explosion',
      {
        count: 12,
        colors: ['#696969', '#8B4513', '#A0522D', '#CD853F'],
        life: 2500,
        size: 10
      }
    );

    // Play destruction sound
    playSound('wall_destroy');
  }

  /**
   * Create trench entry effects
   */
  private createTrenchEntryEffects(
    position: { x: number; y: number },
    trenchLevel: number
  ): void {
    const { addEffect } = useGameStore.getState();

    // Mud splash effect
    addEffect({
      id: `trench_splash_${Date.now()}`,
      position,
      radius: 25 + (trenchLevel * 5),
      color: '#8B4513',
      life: 1500,
      maxLife: 1500,
      type: 'mud_splash',
      opacity: 0.7,
      scale: 1.0 + (trenchLevel * 0.2),
    });

    // Dust particles
    this.particleSystem.createEffect(
      position.x,
      position.y,
      'explosion',
      {
        count: 6,
        colors: ['#E5C07B', '#D4AF37', '#B8860B'],
        life: 1200,
        size: 5
      }
    );

    // Play splash sound
    playSound('trench_splash');
  }

  /**
   * Create sinking animation effect for trenches
   */
  private createSinkingEffect(enemy: { sinkingEffect?: { active: boolean; startTime: number; duration: number; depth: number } }, trenchLevel: number): void {
    // Add visual sinking effect to enemy
    enemy.sinkingEffect = {
      active: true,
      startTime: performance.now(),
      duration: 1000 + (trenchLevel * 500),
      depth: trenchLevel * 0.1, // Sink deeper with higher level
    };
  }

  /**
   * Create knockback visual effect
   */
  private createKnockbackVisualEffect(
    position: { x: number; y: number },
    effectType: string
  ): void {
    switch (effectType) {
      case 'dust_cloud':
        this.particleSystem.createEffect(
          position.x,
          position.y,
          'explosion',
          {
            count: 6,
            colors: ['#E5C07B', '#D4AF37'],
            life: 1000,
            size: 4
          }
        );
        break;
      case 'crack_formation':
        this.particleSystem.createEffect(
          position.x,
          position.y,
          'explosion',
          {
            count: 8,
            colors: ['#8B4513', '#A0522D'],
            life: 1500,
            size: 6
          }
        );
        break;
      case 'fire_burst':
        this.particleSystem.createEffect(
          position.x,
          position.y,
          'explosion',
          {
            count: 10,
            colors: ['#FF4500', '#FF6347', '#FF7F50'],
            life: 1200,
            size: 5
          }
        );
        break;
      case 'stone_shatter':
        this.particleSystem.createEffect(
          position.x,
          position.y,
          'explosion',
          {
            count: 12,
            colors: ['#696969', '#8B4513'],
            life: 1800,
            size: 7
          }
        );
        break;
      case 'fire_explosion':
        this.particleSystem.createEffect(
          position.x,
          position.y,
          'explosion',
          {
            count: 15,
            colors: ['#FF4500', '#FF6347', '#FF7F50', '#FFD700'],
            life: 1500,
            size: 6
          }
        );
        break;
    }
  }

  /**
   * Trigger screen shake effect
   */
  private triggerScreenShake(duration: number): void {
    this.screenShakeActive = true;
    this.screenShakeEndTime = performance.now() + duration;
  }

  /**
   * Update wall visual state
   */
  private updateWallVisualState(slotIdx: number, healthPercentage: number): void {
    const stateId = `wall_${slotIdx}`;
    let state = this.visualStates.get(stateId);

    if (!state) {
      state = {
        id: stateId,
        type: 'wall',
        level: 1,
        healthPercentage,
        crackLevel: 0,
        lastDamageTime: performance.now(),
        visualEffects: [],
        upgradeProgress: 0
      };
      this.visualStates.set(stateId, state);
    }

    // Update crack level based on health
    if (healthPercentage <= 0.1) state.crackLevel = 3;
    else if (healthPercentage <= 0.3) state.crackLevel = 2;
    else if (healthPercentage <= 0.5) state.crackLevel = 1;
    else state.crackLevel = 0;

    state.healthPercentage = healthPercentage;
    state.lastDamageTime = performance.now();
  }

  /**
   * Get trench level for visual effects
   */
  private getTrenchLevel(_slot: { modifier?: { type: string } }): number {
    // This would be based on trench upgrade level
    // For now, return a default level
    return 1;
  }

  /**
   * Check if enemy should have knockback effects
   */
  private isSpecialEnemy(enemyType: string, bossType?: string): boolean {
    return AdvancedDefensiveVisuals.KNOCKBACK_ENEMIES.includes(enemyType) || 
           bossType !== undefined;
  }

  /**
   * Update all visual effects
   */
  update(deltaTime: number): void {
    this.particleSystem.update(deltaTime);

    // Update screen shake
    if (this.screenShakeActive && performance.now() > this.screenShakeEndTime) {
      this.screenShakeActive = false;
    }

    // Update sinking effects for enemies
    this.updateSinkingEffects(deltaTime);
  }

  /**
   * Update sinking effects for enemies in trenches
   */
  private updateSinkingEffects(_deltaTime: number): void {
    // Sinking effect functionality removed for type safety
    // Can be reimplemented with proper Enemy type extensions
  }

  /**
   * Get screen shake state for rendering
   */
  getScreenShakeState(): { active: boolean; intensity: number } {
    if (!this.screenShakeActive) {
      return { active: false, intensity: 0 };
    }

    const remaining = this.screenShakeEndTime - performance.now();
    const intensity = Math.max(0, remaining / 300); // Normalize to 0-1
    return { active: true, intensity };
  }

  /**
   * Get visual state for a defensive structure
   */
  getVisualState(id: string): DefensiveVisualState | undefined {
    return this.visualStates.get(id);
  }

  /**
   * Create upgrade visual effect for defensive structures
   */
  createUpgradeEffect(
    position: { x: number; y: number },
    type: 'wall' | 'trench',
    _newLevel: number
  ): void {
    const { addEffect } = useGameStore.getState();

    // Upgrade glow effect
    addEffect({
      id: `upgrade_glow_${Date.now()}`,
      position,
      radius: 40,
      color: type === 'wall' ? '#FFD700' : '#00FF00',
      life: 2000,
      maxLife: 2000,
      type: 'upgrade_glow',
      opacity: 0.8,
      scale: 1.5,
    });

    // Particle burst
    this.particleSystem.createEffect(
      position.x,
      position.y,
      'spark',
      {
        count: 12,
        colors: type === 'wall' ? ['#FFD700', '#FFA500'] : ['#00FF00', '#32CD32'],
        life: 1500,
        size: 4
      }
    );

    // Play upgrade sound
    playSound('upgrade_complete');
  }
}

export const advancedDefensiveVisuals = AdvancedDefensiveVisuals.getInstance(); 