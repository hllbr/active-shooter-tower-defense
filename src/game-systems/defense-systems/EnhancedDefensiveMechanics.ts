/**
 * 🛡️ Enhanced Defensive Mechanics System
 * Implements advanced trench and wall mechanics with level progression
 */

// import { useGameStore } from '../../models/store'; // Unused import removed
import { SimplifiedParticleSystem } from '../effects-system/SimplifiedParticleSystem';
import { playSound } from '../../utils/sound';

export interface TrenchLevel {
  level: number;
  slowPercentage: number;
  microStunDuration: number;
  visualDepth: number;
  mudIntensity: number;
  spikeCount: number;
  cost: number;
  name: string;
  description: string;
}

export interface WallLevel {
  level: number;
  maxHealth: number;
  material: string;
  crackThresholds: {
    small: number; // 50% HP
    medium: number; // 25% HP
    large: number; // 10% HP
  };
  visualEffects: {
    cracks: string;
    debris: string;
    destruction: string;
  };
  cost: number;
  name: string;
  description: string;
}

export interface DefensiveStructure {
  id: string;
  type: 'trench' | 'wall';
  level: number;
  health: number;
  maxHealth: number;
  position: { x: number; y: number };
  lastDamageTime: number;
  visualState: DefensiveVisualState;
  missionRewards: string[];
}

export interface DefensiveVisualState {
  crackLevel: number; // 0-3: none, small, medium, large
  mudSplashActive: boolean;
  mudSplashTimer: number;
  debrisActive: boolean;
  debrisTimer: number;
  upgradeProgress: number; // 0-1 for upgrade animations
  depthEffect: number; // 0-1 for trench depth
}

export class EnhancedDefensiveMechanics {
  private static instance: EnhancedDefensiveMechanics;
  private particleSystem: SimplifiedParticleSystem;
  private visualStates: Map<string, DefensiveVisualState>;
  private screenShakeState: { active: boolean; intensity: number; endTime: number };

  // Trench level configurations
  private readonly TRENCH_LEVELS: TrenchLevel[] = [
    {
      level: 1,
      slowPercentage: 20,
      microStunDuration: 0,
      visualDepth: 0.3,
      mudIntensity: 0.5,
      spikeCount: 0,
      cost: 150,
      name: 'Basic Trench',
      description: '20% slow, basic mud trench'
    },
    {
      level: 2,
      slowPercentage: 30,
      microStunDuration: 0,
      visualDepth: 0.6,
      mudIntensity: 0.8,
      spikeCount: 2,
      cost: 300,
      name: 'Stone-Lined Trench',
      description: '30% slow, stone-lined with spikes'
    },
    {
      level: 3,
      slowPercentage: 40,
      microStunDuration: 1000, // 1 second
      visualDepth: 1.0,
      mudIntensity: 1.0,
      spikeCount: 4,
      cost: 600,
      name: 'Deep Stone Trench',
      description: '40% slow + 1s micro-stun, deep stone trench'
    }
  ];

  // Wall level configurations
  private readonly WALL_LEVELS: WallLevel[] = [
    {
      level: 1,
      maxHealth: 100,
      material: 'wooden',
      crackThresholds: { small: 50, medium: 25, large: 10 },
      visualEffects: {
        cracks: 'wood_cracks',
        debris: 'wood_debris',
        destruction: 'wood_collapse'
      },
      cost: 200,
      name: 'Wooden Barrier',
      description: '100 HP wooden barrier'
    },
    {
      level: 2,
      maxHealth: 200,
      material: 'stone',
      crackThresholds: { small: 50, medium: 25, large: 10 },
      visualEffects: {
        cracks: 'stone_cracks',
        debris: 'stone_debris',
        destruction: 'stone_collapse'
      },
      cost: 400,
      name: 'Stone Wall',
      description: '200 HP stone wall'
    },
    {
      level: 3,
      maxHealth: 350,
      material: 'reinforced',
      crackThresholds: { small: 50, medium: 25, large: 10 },
      visualEffects: {
        cracks: 'metal_cracks',
        debris: 'metal_debris',
        destruction: 'metal_collapse'
      },
      cost: 800,
      name: 'Reinforced Wall',
      description: '350 HP reinforced stone + metal'
    }
  ];

  private constructor() {
    this.particleSystem = new SimplifiedParticleSystem();
    this.visualStates = new Map();
    this.screenShakeState = { active: false, intensity: 0, endTime: 0 };
  }

  public static getInstance(): EnhancedDefensiveMechanics {
    if (!EnhancedDefensiveMechanics.instance) {
      EnhancedDefensiveMechanics.instance = new EnhancedDefensiveMechanics();
    }
    return EnhancedDefensiveMechanics.instance;
  }

  /**
   * Handle enemy collision with defensive structures
   */
  handleDefensiveCollision(
    enemy: { position: { x: number; y: number }; type?: string; bossType?: string; velocityX?: number; velocityY?: number; frozenUntil?: number; speed?: number },
    slot: { tower?: { wallStrength: number; health: number; maxHealth: number }; modifier?: { type: string; level?: number } },
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
    if (slot.tower?.wallStrength > 0) {
      this.handleWallCollision(enemy, slot, slotIdx, actions, isSpecialEnemy);
    }

    // Handle trench collision
    if (slot.modifier?.type === 'trench') {
      this.handleTrenchCollision(enemy, slot, isSpecialEnemy);
    }
  }

  /**
   * Handle wall collision with enhanced mechanics
   */
  private handleWallCollision(
    enemy: { position: { x: number; y: number }; type?: string; velocityX?: number; velocityY?: number; frozenUntil?: number },
    slot: { tower?: { wallStrength: number; health: number; maxHealth: number } },
    slotIdx: number,
    actions: { hitWall: (slotIdx: number) => void },
    isSpecialEnemy: boolean
  ): void {
    const { position, type } = enemy;
    const wallStrength = slot.tower?.wallStrength || 0;
    const wallLevel = this.getWallLevel(wallStrength);
    const wallConfig = this.WALL_LEVELS[wallLevel - 1];
    
    if (!wallConfig) return;

    const healthPercentage = (wallStrength / wallConfig.maxHealth) * 100;

    // Apply knockback only for special enemies
    if (isSpecialEnemy) {
      this.applyKnockbackEffect(enemy, type || 'Basic');
    }

    // Damage the wall
    actions.hitWall(slotIdx);

    // Create visual effects based on wall health
    this.createWallDamageEffects(position, healthPercentage, wallConfig, isSpecialEnemy);

    // Update wall visual state
    this.updateWallVisualState(slotIdx, healthPercentage, wallConfig);

    // Check for wall destruction
    if (wallStrength <= 1) {
      this.createWallDestructionEffects(position, wallConfig);
      this.triggerScreenShake(300);
      
      // Update mission progress for wall destruction
      this.updateMissionProgress('wall_destroyed', { wallLevel });
    }
  }

  /**
   * Handle trench collision with enhanced mechanics
   */
  private handleTrenchCollision(
    enemy: { position: { x: number; y: number }; speed?: number; frozenUntil?: number },
    slot: { modifier?: { type: string; level?: number } },
    _isSpecialEnemy: boolean
  ): void {
    const trenchLevel = slot.modifier?.level || 1;
    const _trenchConfig = this.TRENCH_LEVELS[trenchLevel - 1];
    
    if (!_trenchConfig) return;

    // Apply slow effect
    const slowMultiplier = 1 - (_trenchConfig.slowPercentage / 100);
    if (enemy.speed) {
      enemy.speed *= slowMultiplier;
    }

    // Apply micro-stun for level 3+ trenches
    if (_trenchConfig.microStunDuration > 0) {
      enemy.frozenUntil = performance.now() + _trenchConfig.microStunDuration;
    }

    // Create visual effects
    this.createTrenchEffects(enemy.position, _trenchConfig);

    // Update trench visual state
    this.updateTrenchVisualState('trench', _trenchConfig);

    // Update mission progress for trench usage
    this.updateMissionProgress('enemy_in_trench', { trenchLevel });
  }

  /**
   * Get wall level based on current strength
   */
  private getWallLevel(wallStrength: number): number {
    for (let i = this.WALL_LEVELS.length - 1; i >= 0; i--) {
      if (wallStrength >= this.WALL_LEVELS[i].maxHealth * 0.1) { // At least 10% of max health
        return this.WALL_LEVELS[i].level;
      }
    }
    return 1;
  }

  /**
   * Create wall damage effects
   */
  private createWallDamageEffects(
    position: { x: number; y: number },
    healthPercentage: number,
    wallConfig: WallLevel,
    isSpecialEnemy: boolean
  ): void {
    const effectIntensity = isSpecialEnemy ? 2 : 1;

    if (healthPercentage <= wallConfig.crackThresholds.large) {
      // Large cracks + falling debris
      this.particleSystem.createParticleEffect(position, {
        type: 'debris',
        count: 8 * effectIntensity,
        color: '#8B4513',
        size: { min: 2, max: 6 },
        velocity: { x: { min: -3, max: 3 }, y: { min: -5, max: -1 } },
        life: { min: 800, max: 1200 }
      });
    } else if (healthPercentage <= wallConfig.crackThresholds.medium) {
      // Medium cracks with debris
      this.particleSystem.createParticleEffect(position, {
        type: 'debris',
        count: 4 * effectIntensity,
        color: '#A0522D',
        size: { min: 1, max: 4 },
        velocity: { x: { min: -2, max: 2 }, y: { min: -3, max: -1 } },
        life: { min: 600, max: 1000 }
      });
    } else if (healthPercentage <= wallConfig.crackThresholds.small) {
      // Small cracks
      this.particleSystem.createParticleEffect(position, {
        type: 'dust',
        count: 3 * effectIntensity,
        color: '#D2B48C',
        size: { min: 1, max: 3 },
        velocity: { x: { min: -1, max: 1 }, y: { min: -2, max: 0 } },
        life: { min: 400, max: 800 }
      });
    }
  }

  /**
   * Create wall destruction effects
   */
  private createWallDestructionEffects(
    position: { x: number; y: number },
    _wallConfig: WallLevel
  ): void {
    // Dust cloud with expanding radius
    this.particleSystem.createParticleEffect(position, {
      type: 'explosion',
      count: 15,
      color: '#8B7355',
      size: { min: 3, max: 8 },
      velocity: { x: { min: -8, max: 8 }, y: { min: -8, max: 8 } },
      life: { min: 1000, max: 2000 }
    });

    // Rock particles scattered in all directions
    this.particleSystem.createParticleEffect(position, {
      type: 'debris',
      count: 12,
      color: '#696969',
      size: { min: 2, max: 6 },
      velocity: { x: { min: -6, max: 6 }, y: { min: -6, max: 6 } },
      life: { min: 800, max: 1500 }
    });

    // Play destruction sound
    playSound('wall-destruction');
  }

  /**
   * Create trench effects
   */
  private createTrenchEffects(
    position: { x: number; y: number },
    _trenchConfig: TrenchLevel
  ): void {
    // Mud splash animation
    this.particleSystem.createParticleEffect(position, {
      type: 'splash',
      count: 6,
      color: '#8B4513',
      size: { min: 2, max: 5 },
      velocity: { x: { min: -3, max: 3 }, y: { min: -4, max: 0 } },
      life: { min: 500, max: 1000 }
    });

    // Dust particles for environmental feedback
    this.particleSystem.createParticleEffect(position, {
      type: 'dust',
      count: 4,
      color: '#D2B48C',
      size: { min: 1, max: 3 },
      velocity: { x: { min: -2, max: 2 }, y: { min: -2, max: 0 } },
      life: { min: 300, max: 700 }
    });

    // Play mud splash sound
    playSound('mud-splash');
  }

  /**
   * Update wall visual state
   */
  private updateWallVisualState(
    slotIdx: number,
    healthPercentage: number,
    wallConfig: WallLevel
  ): void {
    const stateId = `wall_${slotIdx}`;
    let visualState = this.visualStates.get(stateId);

    if (!visualState) {
      visualState = {
        crackLevel: 0,
        mudSplashActive: false,
        mudSplashTimer: 0,
        debrisActive: false,
        debrisTimer: 0,
        upgradeProgress: 0,
        depthEffect: 0
      };
      this.visualStates.set(stateId, visualState);
    }

    // Update crack level based on health
    if (healthPercentage <= wallConfig.crackThresholds.large) {
      visualState.crackLevel = 3; // Large cracks
      visualState.debrisActive = true;
      visualState.debrisTimer = performance.now() + 2000;
    } else if (healthPercentage <= wallConfig.crackThresholds.medium) {
      visualState.crackLevel = 2; // Medium cracks
      visualState.debrisActive = true;
      visualState.debrisTimer = performance.now() + 1500;
    } else if (healthPercentage <= wallConfig.crackThresholds.small) {
      visualState.crackLevel = 1; // Small cracks
    } else {
      visualState.crackLevel = 0; // No cracks
    }
  }

  /**
   * Update trench visual state
   */
  private updateTrenchVisualState(
    trenchId: string,
    trenchConfig: TrenchLevel
  ): void {
    let visualState = this.visualStates.get(trenchId);

    if (!visualState) {
      visualState = {
        crackLevel: 0,
        mudSplashActive: false,
        mudSplashTimer: 0,
        debrisActive: false,
        debrisTimer: 0,
        upgradeProgress: 0,
        depthEffect: 0
      };
      this.visualStates.set(trenchId, visualState);
    }

    // Activate mud splash effect
    visualState.mudSplashActive = true;
    visualState.mudSplashTimer = performance.now() + 1000;
    visualState.depthEffect = trenchConfig.visualDepth;
  }

  /**
   * Get visual state for a defensive structure
   */
  getVisualState(id: string): DefensiveVisualState | null {
    return this.visualStates.get(id) || null;
  }

  /**
   * Get screen shake state
   */
  getScreenShakeState(): { active: boolean; intensity: number } {
    if (this.screenShakeState.active && performance.now() > this.screenShakeState.endTime) {
      this.screenShakeState.active = false;
      this.screenShakeState.intensity = 0;
    }
    return {
      active: this.screenShakeState.active,
      intensity: this.screenShakeState.intensity
    };
  }

  /**
   * Trigger screen shake
   */
  private triggerScreenShake(intensity: number): void {
    this.screenShakeState.active = true;
    this.screenShakeState.intensity = intensity;
    this.screenShakeState.endTime = performance.now() + 500;
  }

  /**
   * Apply knockback effect for special enemies
   */
  private applyKnockbackEffect(enemy: { velocityX?: number; velocityY?: number; frozenUntil?: number }, enemyType: string): void {
    const knockbackConfigs = {
      'Tank': { force: 60, stunDuration: 800 },
      'Golem': { force: 90, stunDuration: 1500 },
      'Demon': { force: 75, stunDuration: 1200 },
      'Phoenix': { force: 80, stunDuration: 1000 }
    };

    const config = knockbackConfigs[enemyType as keyof typeof knockbackConfigs];
    if (config) {
      // Apply knockback force
      enemy.velocityX = (enemy.velocityX || 0) * 0.5;
      enemy.velocityY = (enemy.velocityY || 0) * 0.5;
      
      // Apply stun
      enemy.frozenUntil = performance.now() + config.stunDuration;
    }
  }

  /**
   * Check if enemy is special (gets knockback)
   */
  private isSpecialEnemy(enemyType: string, bossType?: string): boolean {
    const specialEnemies = ['Tank', 'TankBoss', 'Demon', 'Golem', 'Phoenix'];
    const bossEnemies = ['DemonLord', 'DragonKing', 'LichKing', 'steel_behemoth', 'iron_colossus', 'quantum_nightmare'];
    
    return specialEnemies.includes(enemyType) || 
           (bossType && bossEnemies.includes(bossType));
  }

  /**
   * Update mission progress for defensive actions
   */
  private updateMissionProgress(
    eventType: string,
    eventData?: { wallLevel?: number; trenchLevel?: number }
  ): void {
    // Import mission manager and update progress
    import('../MissionManager').then(({ missionManager }) => {
      missionManager.updateMissionProgress(eventType, eventData);
    }).catch(() => {
      // Mission manager not available, continue silently
    });
  }

  /**
   * Get trench level configuration
   */
  getTrenchLevel(level: number): TrenchLevel | null {
    return this.TRENCH_LEVELS[level - 1] || null;
  }

  /**
   * Get wall level configuration
   */
  getWallLevel(level: number): WallLevel | null {
    return this.WALL_LEVELS[level - 1] || null;
  }

  /**
   * Get all trench levels
   */
  getAllTrenchLevels(): TrenchLevel[] {
    return [...this.TRENCH_LEVELS];
  }

  /**
   * Get all wall levels
   */
  getAllWallLevels(): WallLevel[] {
    return [...this.WALL_LEVELS];
  }

  /**
   * Create upgrade effect for defensive structures
   */
  createUpgradeEffect(
    position: { x: number; y: number },
    type: 'trench' | 'wall',
    newLevel: number
  ): void {
    const config = type === 'trench' ? 
      this.getTrenchLevel(newLevel) : 
      this.getWallLevel(newLevel);

    if (!config) return;

    // Create upgrade particle effect
    this.particleSystem.createParticleEffect(position, {
      type: 'upgrade',
      count: 12,
      color: type === 'trench' ? '#8B4513' : '#C0C0C0',
      size: { min: 2, max: 6 },
      velocity: { x: { min: -4, max: 4 }, y: { min: -6, max: -2 } },
      life: { min: 800, max: 1500 }
    });

    // Play upgrade sound
    playSound('defensive-upgrade');
  }

  /**
   * Clean up expired visual states
   */
  cleanup(): void {
    const now = performance.now();
    
    for (const [_id, state] of this.visualStates.entries()) {
      if (state.mudSplashActive && now > state.mudSplashTimer) {
        state.mudSplashActive = false;
      }
      if (state.debrisActive && now > state.debrisTimer) {
        state.debrisActive = false;
      }
    }
  }
}

export const enhancedDefensiveMechanics = EnhancedDefensiveMechanics.getInstance(); 