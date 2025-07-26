// GAME_CONSTANTS is not used in this file
import type { Tower, Enemy, Bullet, Effect } from '../../models/gameTypes';
import { advancedBulletPool } from '../memory/AdvancedBulletPool';
import { getDirection } from '../targeting-system/TargetingSystem';
import { useGameStore } from '../../models/store';

export interface FireMode {
  id: string;
  name: string;
  description: string;
  unlockCondition: {
    type: 'wave' | 'market';
    value: number | string;
  };
  isUnlocked: boolean;
  isActive: boolean;
}

export interface FireModeConfig {
  spreadShot: {
    bulletCount: number;
    spreadAngle: number;
    damageReduction: number;
    color: string;
  };
  chainLightning: {
    maxJumps: number;
    damageReduction: number;
    jumpRange: number;
    color: string;
  };
  piercingShot: {
    maxTargets: number;
    damageReduction: number;
    color: string;
  };
}

/**
 * Fire Mode Manager
 * Handles multi-fire options with unlock conditions and SOLID principles
 */
export class FireModeManager {
  private fireModes: Map<string, FireMode> = new Map();
  private config: FireModeConfig;

  constructor() {
    this.initializeFireModes();
    this.config = {
      spreadShot: {
        bulletCount: 5,
        spreadAngle: 60, // degrees
        damageReduction: 0.6,
        color: '#FFD700'
      },
      chainLightning: {
        maxJumps: 3,
        damageReduction: 0.7,
        jumpRange: 120,
        color: '#00FFFF'
      },
      piercingShot: {
        maxTargets: 5,
        damageReduction: 0.8,
        color: '#FF00FF'
      }
    };
  }

  private initializeFireModes(): void {
    this.fireModes.set('spreadShot', {
      id: 'spreadShot',
      name: 'Spread Shot',
      description: 'Fires 3-5 smaller bullets in a spread pattern',
      unlockCondition: { type: 'wave', value: 5 },
      isUnlocked: false,
      isActive: false
    });

    this.fireModes.set('chainLightning', {
      id: 'chainLightning',
      name: 'Chain Lightning',
      description: 'Damages one target, then jumps to 2-3 nearby enemies',
      unlockCondition: { type: 'wave', value: 15 },
      isUnlocked: false,
      isActive: false
    });

    this.fireModes.set('piercingShot', {
      id: 'piercingShot',
      name: 'Piercing Shot',
      description: 'Bullets pass through multiple enemies in a straight line',
      unlockCondition: { type: 'market', value: 'piercing_shot_unlock' },
      isUnlocked: false,
      isActive: false
    });
  }

  /**
   * Check unlock conditions for all fire modes
   */
  public updateUnlockStatus(): void {
    const gameState = useGameStore.getState();
    
    this.fireModes.forEach((mode, _key) => {
      if (mode.unlockCondition.type === 'wave') {
        mode.isUnlocked = gameState.currentWave >= mode.unlockCondition.value;
      } else if (mode.unlockCondition.type === 'market') {
        // Check if player has purchased the unlock
        mode.isUnlocked = this.checkMarketUnlock(mode.unlockCondition.value as string);
      }
    });
  }

  private checkMarketUnlock(_unlockId: string): boolean {
    // This would integrate with the market system
    // For now, return false - needs market integration
    return false;
  }

  /**
   * Get available fire modes for a tower
   */
  public getAvailableFireModes(_tower: Tower): FireMode[] {
    this.updateUnlockStatus();
    return Array.from(this.fireModes.values()).filter(mode => mode.isUnlocked);
  }

  /**
   * Execute spread shot firing
   */
  public executeSpreadShot(
    tower: Tower,
    target: Enemy,
    baseDamage: number,
    baseSpeed: number,
    addBullet: (bullet: Bullet) => void,
    addEffect: (effect: Effect) => void,
    fireOrigin: { x: number; y: number }
  ): void {
    const config = this.config.spreadShot;
    const angleStep = config.spreadAngle / (config.bulletCount - 1);
    const startAngle = -config.spreadAngle / 2;

    for (let i = 0; i < config.bulletCount; i++) {
      const angle = startAngle + (angleStep * i);
      const radians = (angle * Math.PI) / 180;
      
      // Calculate direction with spread
      const baseDirection = getDirection(fireOrigin, target.position);
      const spreadDirection = {
        x: baseDirection.x * Math.cos(radians) - baseDirection.y * Math.sin(radians),
        y: baseDirection.x * Math.sin(radians) + baseDirection.y * Math.cos(radians)
      };

      const bullet = advancedBulletPool.createBullet(
        fireOrigin,
        spreadDirection,
        baseDamage * config.damageReduction,
        baseSpeed,
        config.color,
        target.id
      );

      addBullet(bullet);
    }

    // Add spread effect
    addEffect({
      id: `spread-${Date.now()}`,
      position: fireOrigin,
      radius: 30,
      color: config.color,
      life: 300,
      maxLife: 300,
      type: 'spread_shot'
    });
  }

  /**
   * Execute chain lightning firing
   */
  public executeChainLightning(
    tower: Tower,
    target: Enemy,
    baseDamage: number,
    baseSpeed: number,
    addBullet: (bullet: Bullet) => void,
    addEffect: (effect: Effect) => void,
    damageEnemy: (id: string, damage: number) => void,
    fireOrigin: { x: number; y: number }
  ): void {
    const config = this.config.chainLightning;
    const enemies = useGameStore.getState().enemies;
    
    // Primary target
    const primaryBullet = advancedBulletPool.createBullet(
      fireOrigin,
      getDirection(fireOrigin, target.position),
      baseDamage,
      baseSpeed,
      config.color,
      target.id
    );
    addBullet(primaryBullet);

    // Chain lightning effect
    let currentTarget = target;
    let remainingJumps = config.maxJumps;
    let currentDamage = baseDamage * config.damageReduction;

    while (remainingJumps > 0) {
      const nextTarget = this.findNextChainTarget(currentTarget, enemies, config.jumpRange);
      if (!nextTarget) break;

      // Create lightning bolt effect
      addEffect({
        id: `lightning-${Date.now()}-${remainingJumps}`,
        position: currentTarget.position,
        radius: 5,
        color: config.color,
        life: 200,
        maxLife: 200,
        type: 'chain_lightning',
        targetPosition: nextTarget.position
      });

      // Damage the target
      damageEnemy(nextTarget.id, currentDamage);

      currentTarget = nextTarget;
      currentDamage *= config.damageReduction;
      remainingJumps--;
    }
  }

  /**
   * Execute piercing shot firing
   */
  public executePiercingShot(
    tower: Tower,
    target: Enemy,
    baseDamage: number,
    baseSpeed: number,
    addBullet: (bullet: Bullet) => void,
    addEffect: (effect: Effect) => void,
    fireOrigin: { x: number; y: number }
  ): void {
    const config = this.config.piercingShot;
    const direction = getDirection(fireOrigin, target.position);
    
    // Create piercing bullet with special properties
    const piercingBullet = advancedBulletPool.createBullet(
      fireOrigin,
      direction,
      baseDamage * config.damageReduction,
      baseSpeed,
      config.color,
      target.id
    );

    // Add piercing properties
    piercingBullet.piercing = true;
    piercingBullet.maxTargets = config.maxTargets;
    piercingBullet.targetsHit = 0;

    addBullet(piercingBullet);

    // Add piercing effect
    addEffect({
      id: `piercing-${Date.now()}`,
      position: fireOrigin,
      radius: 20,
      color: config.color,
      life: 250,
      maxLife: 250,
      type: 'piercing_shot'
    });
  }

  /**
   * Find next target for chain lightning
   */
  private findNextChainTarget(
    currentTarget: Enemy,
    enemies: Enemy[],
    jumpRange: number
  ): Enemy | null {
    let bestTarget: Enemy | null = null;
    let bestDistance = jumpRange;

    for (const enemy of enemies) {
      if (enemy.id === currentTarget.id || enemy.health <= 0) continue;

      const dx = enemy.position.x - currentTarget.position.x;
      const dy = enemy.position.y - currentTarget.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= jumpRange && distance < bestDistance) {
        bestTarget = enemy;
        bestDistance = distance;
      }
    }

    return bestTarget;
  }

  /**
   * Toggle fire mode activation
   */
  public toggleFireMode(modeId: string): boolean {
    const mode = this.fireModes.get(modeId);
    if (mode && mode.isUnlocked) {
      mode.isActive = !mode.isActive;
      return mode.isActive;
    }
    return false;
  }

  /**
   * Get active fire modes
   */
  public getActiveFireModes(): FireMode[] {
    return Array.from(this.fireModes.values()).filter(mode => mode.isActive);
  }

  /**
   * Check if a specific fire mode is unlocked
   */
  public isFireModeUnlocked(modeId: string): boolean {
    const mode = this.fireModes.get(modeId);
    return mode ? mode.isUnlocked : false;
  }

  /**
   * Get fire mode configuration
   */
  public getFireModeConfig(): FireModeConfig {
    return this.config;
  }
}

// Global fire mode manager instance
export const fireModeManager = new FireModeManager(); 