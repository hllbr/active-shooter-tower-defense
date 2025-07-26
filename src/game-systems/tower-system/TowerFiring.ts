import { GAME_CONSTANTS } from '../../utils/constants';
import type { Enemy, Tower, Bullet, Effect, TowerSlot } from '../../models/gameTypes';
import { playSound } from '../../utils/sound';
import { upgradeEffectsManager } from '../UpgradeEffects';
import { advancedBulletPool } from '../memory/AdvancedBulletPool';
import { getDirection, getTargetEnemy, TargetingMode } from '../targeting-system/TargetingSystem';
import { specialAbilitiesManager } from './SpecialAbilities';
import { towerSynergyManager } from './TowerSynergyManager';
import { defenseSystemManager } from '../defense-systems';
import { useGameStore } from '../../models/store';
import { fireModeManager } from './FireModeManager';

/**
 * Enhanced Tower Firing System
 * Handles tower targeting, firing logic, bullet creation, and advanced mechanics
 * Implements chain attacks, dual-targeting, and AOE explosions
 */
export class TowerFiringSystem {
  /**
   * Fire a tower at a target enemy with enhanced mechanics
   */
  fireTower(
    tower: Tower,
    enemy: Enemy,
    bulletType: { speedMultiplier: number; damageMultiplier: number; color: string },
    addBullet: (bullet: Bullet) => void,
    addEffect?: (effect: Effect) => void,
    damageEnemy?: (id: string, damage: number) => void,
    slot?: TowerSlot
  ): void {
    // Mermi çıkış pozisyonunu fireOriginRef ile al
    let fireOrigin = { x: tower.position.x, y: tower.position.y };
    if (slot && slot.fireOriginRef && slot.fireOriginRef.current) {
      const ref = slot.fireOriginRef.current as SVGGElement & { getFireOriginPosition?: () => { x: number; y: number } };
      const getFireOriginPosition = ref.getFireOriginPosition;
      if (typeof getFireOriginPosition === 'function') {
        const pos = getFireOriginPosition();
        if (pos) fireOrigin = pos;
      }
    }
    // CRITICAL FIX: Apply upgrade effects to bullet damage and speed
    const baseDamage = tower.damage * bulletType.damageMultiplier;
    const baseSpeed = GAME_CONSTANTS.BULLET_SPEED * bulletType.speedMultiplier;
    
    const { damage, speed } = upgradeEffectsManager.applyUpgradeEffects(
      baseDamage,
      baseSpeed,
      1 // state.bulletLevel
    );
    
    // ✅ NEW: Check for active fire modes first
    const activeFireModes = fireModeManager.getActiveFireModes();
    if (activeFireModes.length > 0) {
      // Use the first active fire mode
      const activeMode = activeFireModes[0];
      this.executeFireMode(activeMode.id, tower, enemy, damage, speed, addBullet, addEffect, damageEnemy, fireOrigin);
      return;
    }
    
    // Enhanced firing mechanics based on tower class
    switch (tower.towerClass) {
      case 'gatling':
        this.fireGatlingTower(tower, enemy, damage, speed, bulletType.color, addBullet, addEffect, damageEnemy, fireOrigin);
        break;
      case 'laser':
        this.fireLaserTower(tower, enemy, damage, speed, bulletType.color, addBullet, addEffect, damageEnemy, fireOrigin);
        break;
      case 'mortar':
        this.fireMortarTower(tower, enemy, damage, speed, bulletType.color, addBullet, addEffect, damageEnemy, fireOrigin);
        break;
      case 'flamethrower':
        this.fireFlamethrowerTower(tower, enemy, damage, speed, bulletType.color, addBullet, addEffect, damageEnemy, fireOrigin);
        break;
      default:
        this.fireStandardTower(tower, enemy, damage, speed, bulletType.color, addBullet, fireOrigin);
        break;
    }
    
    // Play sound if available
    if (tower.attackSound) {
      playSound(tower.attackSound);
    }
    
    tower.lastFired = performance.now();
    
    if (GAME_CONSTANTS.DEBUG_MODE) {
      // Debug logging for tower firing can be added here
    }
  }

  /**
   * Standard tower firing (single target)
   */
  private fireStandardTower(
    _tower: Tower,
    enemy: Enemy,
    damage: number,
    speed: number,
    _color: string,
    addBullet: (bullet: Bullet) => void,
    fireOrigin: { x: number; y: number }
  ): void {
    const bullet = advancedBulletPool.createBullet(
      fireOrigin,
      getDirection(fireOrigin, enemy.position),
      damage,
      speed,
      '#FF0000', // Default color for standard bullets
      enemy.id
    );
    
    addBullet(bullet);
  }

  /**
   * Gatling tower firing (dual-target with rapid fire)
   */
  private fireGatlingTower(
    _tower: Tower,
    enemy: Enemy,
    damage: number,
    speed: number,
    _color: string,
    addBullet: (bullet: Bullet) => void,
    addEffect?: (effect: Effect) => void,
    _damageEnemy?: (id: string, damage: number) => void,
    fireOrigin?: { x: number; y: number }
  ): void {
    const origin = fireOrigin || { x: _tower.position.x, y: _tower.position.y };
    // Primary target
    const primaryBullet = advancedBulletPool.createBullet(
      origin,
      getDirection(origin, enemy.position),
      damage * 0.8, // Reduced damage for dual targeting
      speed,
      '#FFD700', // Gold color for secondary projectile
      enemy.id
    );
    
    addBullet(primaryBullet);
    
    // Secondary target (if available)
    if (_tower.multiShotCount && _tower.multiShotCount > 1) {
      // Find secondary target within range
      const secondaryTarget = this.findSecondaryTarget(_tower, enemy);
      if (secondaryTarget) {
        const secondaryBullet = advancedBulletPool.createBullet(
          origin,
          getDirection(origin, secondaryTarget.position),
          damage * 0.6, // Further reduced damage for secondary target
          speed * 0.9,
          '#FFD700', // Gold color for secondary projectile
          secondaryTarget.id
        );
        
        addBullet(secondaryBullet);
      }
    }
    
    // Gatling spin-up effect
    if (addEffect) {
      addEffect({
        id: `${Date.now()}-gatling-spin`,
        position: _tower.position,
        radius: 20,
        color: '#FF6B35',
        life: 200,
        maxLife: 200,
      });
    }
  }

  /**
   * Laser tower firing (beam weapon with penetration)
   */
  private fireLaserTower(
    _tower: Tower,
    enemy: Enemy,
    damage: number,
    speed: number,
    _color: string,
    addBullet: (bullet: Bullet) => void,
    addEffect?: (effect: Effect) => void,
    _damageEnemy?: (id: string, damage: number) => void,
    fireOrigin?: { x: number; y: number }
  ): void {
    const origin = fireOrigin || { x: _tower.position.x, y: _tower.position.y };
    // Laser beam with penetration
    const penetration = _tower.projectilePenetration || 1;
    const beamDamage = damage * (1 + (penetration - 1) * 0.3); // Damage increases with penetration
    
    const laserBullet = advancedBulletPool.createBullet(
      origin,
      getDirection(origin, enemy.position),
      beamDamage,
      speed * 2, // Faster laser projectiles
      '#00FFFF', // Cyan color for laser
      enemy.id
    );
    
    addBullet(laserBullet);
    
    // Laser beam visual effect
    if (addEffect) {
      addEffect({
        id: `${Date.now()}-laser-beam`,
        position: _tower.position,
        radius: 5,
        color: '#00FFFF',
        life: 150,
        maxLife: 150,
      });
    }
  }

  /**
   * Mortar tower firing (AOE explosion)
   */
  private fireMortarTower(
    _tower: Tower,
    enemy: Enemy,
    damage: number,
    speed: number,
    _color: string,
    addBullet: (bullet: Bullet) => void,
    addEffect?: (effect: Effect) => void,
    damageEnemy?: (id: string, damage: number) => void,
    fireOrigin?: { x: number; y: number }
  ): void {
    const origin = fireOrigin || { x: _tower.position.x, y: _tower.position.y };
    // Mortar shell with arc trajectory
    const mortarBullet = advancedBulletPool.createBullet(
      origin,
      getDirection(origin, enemy.position),
      damage * 1.5, // Increased damage for AOE
      speed * 0.7, // Slower but more powerful
      '#8B4513', // Brown color for mortar shell
      enemy.id
    );
    
    addBullet(mortarBullet);
    
    // AOE explosion effect on impact
    if (addEffect && damageEnemy) {
      setTimeout(() => {
        const explosionRadius = _tower.areaOfEffect || 80;
        const explosionDamage = damage * 0.8;
        
        // Create explosion effect
        addEffect({
          id: `${Date.now()}-mortar-explosion`,
          position: enemy.position,
          radius: explosionRadius,
          color: '#FF4500',
          life: 300,
          maxLife: 300,
        });
        
        // Damage all enemies in explosion radius
        this.damageEnemiesInRadius(enemy.position, explosionRadius, explosionDamage, damageEnemy);
      }, 500); // Delay for shell travel time
    }
  }

  /**
   * Flamethrower tower firing (chain fire)
   */
  private fireFlamethrowerTower(
    _tower: Tower,
    enemy: Enemy,
    damage: number,
    speed: number,
    _color: string,
    addBullet: (bullet: Bullet) => void,
    addEffect?: (effect: Effect) => void,
    damageEnemy?: (id: string, damage: number) => void,
    fireOrigin?: { x: number; y: number }
  ): void {
    const origin = fireOrigin || { x: _tower.position.x, y: _tower.position.y };
    // Chain fire: damage spreads to nearby enemies
    const chainRadius = 60;
    const chainDamage = damage * 0.7;
    
    // Primary target
    const primaryBullet = advancedBulletPool.createBullet(
      origin,
      getDirection(origin, enemy.position),
      damage,
      speed,
      '#FF4500', // Orange-red for fire
      enemy.id
    );
    
    addBullet(primaryBullet);
    
    // Chain fire effect
    if (addEffect && damageEnemy) {
      addEffect({
        id: `${Date.now()}-flame-chain`,
        position: enemy.position,
        radius: chainRadius,
        color: '#FF6347',
        life: 400,
        maxLife: 400,
      });
      
      // Chain damage to nearby enemies
      this.chainDamageToNearbyEnemies(enemy.position, chainRadius, chainDamage, damageEnemy);
    }
  }

  /**
   * Execute a specific fire mode
   */
  private executeFireMode(
    modeId: string,
    tower: Tower,
    enemy: Enemy,
    damage: number,
    speed: number,
    addBullet: (bullet: Bullet) => void,
    addEffect?: (effect: Effect) => void,
    damageEnemy?: (id: string, damage: number) => void,
    fireOrigin?: { x: number; y: number }
  ): void {
    const origin = fireOrigin || { x: tower.position.x, y: tower.position.y };

    switch (modeId) {
      case 'spreadShot':
        fireModeManager.executeSpreadShot(tower, enemy, damage, speed, addBullet, addEffect || (() => {}), origin);
        break;
      case 'chainLightning':
        fireModeManager.executeChainLightning(tower, enemy, damage, speed, addBullet, addEffect || (() => {}), damageEnemy || (() => {}), origin);
        break;
      case 'piercingShot':
        fireModeManager.executePiercingShot(tower, enemy, damage, speed, addBullet, addEffect || (() => {}), origin);
        break;
      default:
        // Fallback to standard firing
        this.fireStandardTower(tower, enemy, damage, speed, '#FF0000', addBullet, origin);
        break;
    }
  }

  /**
   * Find secondary target for dual-targeting towers
   */
  private findSecondaryTarget(_tower: Tower, _primaryEnemy: Enemy): Enemy | null {
    // This would need access to all enemies - simplified for now
    // In practice, this would search for another enemy within range
    return null;
  }

  /**
   * Damage all enemies within a radius
   */
  private damageEnemiesInRadius(
    _center: { x: number; y: number },
    _radius: number,
    _damage: number,
    _damageEnemy: (id: string, damage: number) => void
  ): void {
    // This would need access to all enemies - simplified for now
    // In practice, this would iterate through all enemies and damage those within radius
  }

  /**
   * Chain damage to nearby enemies
   */
  private chainDamageToNearbyEnemies(
    _center: { x: number; y: number },
    _radius: number,
    _damage: number,
    _damageEnemy: (id: string, damage: number) => void
  ): void {
    // This would need access to all enemies - simplified for now
    // In practice, this would find nearby enemies and apply chain damage
  }

  /**
   * Update tower firing logic for all towers with enhanced mechanics
   */
  updateTowerFire(
    towerSlots: TowerSlot[],
    enemies: Enemy[],
    currentWaveModifier: { disableTowerType?: string; disableArea?: { x: number; y: number; radius: number }; towerRangeReduced?: boolean } | null,
    bulletLevel: number,
    wallLevel: number,
    isGameOver: boolean,
    isPaused: boolean,
    addBullet: (bullet: Bullet) => void,
    addEffect: (effect: Effect) => void,
    damageEnemy: (id: string, damage: number) => void,
    regenerateWalls: () => void,
    globalWallActive: boolean,
    wallRegenerationActive: boolean
  ): void {
    // ✅ CRITICAL FIX: Stop tower firing if game is over or paused
    if (isGameOver || isPaused) {
      return;
    }
    
    const modifier = currentWaveModifier;
    const now = performance.now();
    
    // ✅ NEW: Update synergy bonuses for all towers
    towerSynergyManager.updateAllSynergyBonuses(towerSlots);
    
    // ✅ NEW: Update defense systems (shields, repair stations)
    defenseSystemManager.updateDefenseSystems(towerSlots, enemies, addEffect, now);
    
    // Sur yenileme kontrolü
    if (!globalWallActive && !wallRegenerationActive) {
      regenerateWalls();
    }
    
    towerSlots.forEach((slot) => {
      const tower = slot.tower;
      if (!tower) return;

      // --- AREA EFFECTS FOR NON-ATTACKING TOWERS ---
      const supportClasses = [
        'radar', 'supply_depot', 'shield_generator', 'repair_station',
        'emp', 'stealth_detector', 'air_defense', 'economy'
      ];
      if (supportClasses.includes(tower.towerClass || '') && tower.areaEffectType && tower.areaEffectActive) {
        // Area effect tick (every 500ms)
        const tickInterval = 500;
        if (!tower.areaEffectLastTick || now - tower.areaEffectLastTick >= tickInterval) {
          tower.areaEffectLastTick = now;
          // Find targets in area
          if (tower.areaEffectType === 'heal') {
            // Heal self or nearby towers
            tower.health = Math.min(tower.maxHealth, tower.health + (tower.areaEffectPower || 5));
            // Optionally: heal nearby towers as well
            towerSlots.forEach(s2 => {
              if (s2.tower && s2.tower.id !== tower.id) {
                const dx = s2.tower.position.x - tower.position.x;
                const dy = s2.tower.position.y - tower.position.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist <= (tower.areaEffectRadius || 80)) {
                  s2.tower.health = Math.min(s2.tower.maxHealth, s2.tower.health + (tower.areaEffectPower || 5));
                }
              }
            });
            // Visual effect
            addEffect({
              id: `heal-circle-${tower.id}-${now}`,
              position: tower.position,
              radius: tower.areaEffectRadius || 80,
              color: '#00FFAA',
              life: 400,
              maxLife: 400,
              type: 'heal_area',
              opacity: 0.25
            });
          } else if (tower.areaEffectType === 'poison') {
            // Poison enemies in area
            enemies.forEach(enemy => {
              const dx = enemy.position.x - tower.position.x;
              const dy = enemy.position.y - tower.position.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              if (dist <= (tower.areaEffectRadius || 80)) {
                damageEnemy(enemy.id, tower.areaEffectPower || 4);
                // Optionally: add poison debuff to enemy
              }
            });
            // Visual effect
            addEffect({
              id: `poison-cloud-${tower.id}-${now}`,
              position: tower.position,
              radius: tower.areaEffectRadius || 80,
              color: '#44FF44',
              life: 400,
              maxLife: 400,
              type: 'poison_area',
              opacity: 0.18
            });
          } else if (tower.areaEffectType === 'fire') {
            // Fire damage to enemies in area
            enemies.forEach(enemy => {
              const dx = enemy.position.x - tower.position.x;
              const dy = enemy.position.y - tower.position.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              if (dist <= (tower.areaEffectRadius || 80)) {
                damageEnemy(enemy.id, tower.areaEffectPower || 6);
              }
            });
            // Visual effect
            addEffect({
              id: `fire-ring-${tower.id}-${now}`,
              position: tower.position,
              radius: tower.areaEffectRadius || 80,
              color: '#FF6600',
              life: 400,
              maxLife: 400,
              type: 'fire_area',
              opacity: 0.22
            });
          }
        }
        // Decay logic: if not upgraded/repaired, effect decays and tower is destroyed
        if (tower.areaEffectDuration && tower.areaEffectDecayTimer !== undefined) {
          tower.areaEffectDecayTimer -= (now - (tower.areaEffectLastTick || now));
          if (tower.areaEffectDecayTimer <= 0) {
            tower.areaEffectActive = false;
            // Optionally: destroy tower
            tower.health = 0;
            // Visual effect for destruction
            addEffect({
              id: `area-decay-${tower.id}-${now}`,
              position: tower.position,
              radius: tower.areaEffectRadius || 80,
              color: '#888888',
              life: 600,
              maxLife: 600,
              type: 'decay_area',
              opacity: 0.3
            });
          }
        }
        return; // Skip firing logic for support towers
      }

      if (modifier?.disableTowerType && tower.specialAbility === modifier.disableTowerType) return;
      if (modifier?.disableArea) {
        const dx = tower.position.x - modifier.disableArea.x;
        const dy = tower.position.y - modifier.disableArea.y;
        if (Math.sqrt(dx * dx + dy * dy) <= modifier.disableArea.radius) return;
      }

      // Health regeneration
      if (tower.healthRegenRate > 0 && now - tower.lastHealthRegen > 1000) {
        tower.health = Math.min(tower.maxHealth, tower.health + tower.healthRegenRate);
        tower.lastHealthRegen = now;
      }

      // Special ability activation
      if (tower.specialAbility !== 'none') {
        specialAbilitiesManager.handleSpecialAbility(tower, enemies, addEffect, damageEnemy);
      }

      const bulletType = GAME_CONSTANTS.BULLET_TYPES[bulletLevel - 1];
      
      // ✅ NEW: Apply synergy bonuses to tower stats
      const synergyBonuses = tower.synergyBonuses || { damage: 0, range: 0, fireRate: 0 };
      const positioningBonuses = towerSynergyManager.getPositioningBonus(tower, tower.position, towerSlots);
      
      // Calculate enhanced stats with bonuses
      const enhancedRange = tower.range * (1 + (synergyBonuses.range || 0) + positioningBonuses.range);
      const enhancedDamage = tower.damage * (1 + (synergyBonuses.damage || 0) + positioningBonuses.damage);
      const enhancedFireRate = tower.fireRate * (1 - ((synergyBonuses.fireRate || 0) + positioningBonuses.fireRate)); // Lower is better for fire rate
      
      // Sur durumuna göre ateş hızı ve hasar hesaplama
      let fireRateMultiplier = bulletType.fireRateMultiplier;
      const damageMultiplier = bulletType.damageMultiplier * (enhancedDamage / tower.damage);
      
      if (wallLevel > 0) {
        // Sur seviyesine göre bonus
        const wallLevelConfig = GAME_CONSTANTS.WALL_SYSTEM.WALL_LEVELS[wallLevel - 1];
        if (wallLevelConfig) {
          fireRateMultiplier *= wallLevelConfig.fireRateBonus;
        }
      }
      
      const finalFireRate = enhancedFireRate * fireRateMultiplier;
      if (now - tower.lastFired < finalFireRate) return;

      const visibleEnemies = enemies.filter(e => {
        if (e.behaviorTag === 'ghost') {
          return towerSlots.some(s => s.tower && s.tower.specialAbility === 'psi' && Math.hypot(s.x - e.position.x, s.y - e.position.y) <= s.tower.psiRange);
        }
        return true;
      });
      
      // Enhanced targeting mode selection based on tower level and type
      let targetingMode = TargetingMode.NEAREST;
      const options: Record<string, unknown> = {};
      
      // ✅ NEW: Specialized tower targeting based on tower class
      if (tower.towerClass) {
        switch (tower.towerClass) {
          case 'sniper':
            targetingMode = TargetingMode.HIGHEST_HP; // Sniper targets high HP enemies
            options.priorityTypes = ['Tank', 'Boss'];
            break;
          case 'gatling':
            targetingMode = TargetingMode.FASTEST; // Gatling targets fast enemies
            break;
          case 'laser':
            targetingMode = TargetingMode.THREAT_ASSESSMENT; // Laser uses smart targeting
            break;
          case 'mortar':
            targetingMode = TargetingMode.LOWEST_HP; // Mortar finishes off weakened enemies with AoE
            break;
          case 'flamethrower':
            targetingMode = TargetingMode.NEAREST; // Flamethrower targets nearest due to short range
            break;
          case 'radar':
          case 'supply_depot':
          case 'shield_generator':
          case 'repair_station':
            return; // Support towers don't fire
          case 'emp':
            options.priorityTypes = ['Electronics', 'Robot']; // EMP targets electronic enemies
            break;
          case 'stealth_detector':
            options.priorityTypes = ['Ghost', 'Stealth']; // Detector targets stealth enemies
            break;
          case 'air_defense':
            options.priorityTypes = ['Flying', 'Air']; // Air defense targets flying enemies
            break;
        }
      } else {
        // Advanced towers get smarter targeting
        if (tower.level >= 15) {
          targetingMode = TargetingMode.THREAT_ASSESSMENT; // Elite towers use AI
        } else if (tower.level >= 10) {
          targetingMode = TargetingMode.LOWEST_HP; // High level towers finish enemies
        } else if (tower.level >= 5) {
          targetingMode = TargetingMode.FASTEST; // Mid level towers focus on fast enemies
        }
      }
      
      // Special targeting for economic towers
      if (tower.towerType === 'economy') {
        targetingMode = TargetingMode.HIGHEST_VALUE; // Economy towers target valuable enemies
      }
      
      // Special ability-based targeting preferences
      switch (tower.specialAbility) {
        case 'multi_shot':
          options.priorityTypes = ['Basic']; // Multi-shot works best on basic enemies
          break;
        case 'chain_lightning':
          options.priorityTypes = ['Scout', 'Tank']; // Chain lightning good for groups
          break;
        case 'freeze':
          targetingMode = TargetingMode.FASTEST; // Freeze fast enemies
          break;
        case 'burn':
          targetingMode = TargetingMode.HIGHEST_HP; // Burn tanks
          break;
        case 'psi':
          options.priorityTypes = ['Ghost']; // Psi towers target ghosts
          break;
      }
      
      const rangeMult = (modifier?.towerRangeReduced ? 0.5 : 1) * (tower.rangeMultiplier ?? 1) * (1 + (synergyBonuses.range || 0) + positioningBonuses.range);
      options.range = enhancedRange * rangeMult;
      
      // Use enhanced targeting system
      const { enemy, threatScore } = getTargetEnemy(tower, visibleEnemies, targetingMode, options);
      if (!enemy) return;
      
      // Debug targeting information
      if (GAME_CONSTANTS.DEBUG_MODE && threatScore) {
        // Debug logging for targeting information can be added here
      }

      this.fireTower(tower, enemy, {
        speedMultiplier: bulletType.speedMultiplier,
        damageMultiplier: damageMultiplier,
        color: bulletType.color,
      }, addBullet, addEffect, damageEnemy, slot);
    });
  }
}

// Global tower firing system instance
export const towerFiringSystem = new TowerFiringSystem(); 

// Add a listener for tower upgrades to refresh firing logic
const store = useGameStore.getState();
if (store && store.addTowerUpgradeListener) {
  store.addTowerUpgradeListener((_tower, _oldLevel, _newLevel) => {
    // Optionally, recalculate or refresh any cached firing logic here
    // For now, this is a placeholder for future optimizations
    // Example: clear any firing cooldowns or update derived stats
    // (No-op if all logic is derived from state)
  });
} 