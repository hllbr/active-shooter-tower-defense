import { GAME_CONSTANTS } from '../../utils/constants';
import type { Enemy, Tower, Bullet, Effect, TowerSlot } from '../../models/gameTypes';
import { playSound } from '../../utils/sound';
import { upgradeEffectsManager } from '../UpgradeEffects';
import { bulletPool } from '../bullet-system/BulletPool';
import { getDirection, getTargetEnemy, TargetingMode } from '../targeting-system/TargetingSystem';
import { specialAbilitiesManager } from './SpecialAbilities';
import { towerSynergyManager } from './TowerSynergyManager';
import { defenseSystemManager } from '../defense-systems';

/**
 * Tower firing system
 * Handles tower targeting, firing logic, and bullet creation
 */
export class TowerFiringSystem {
  /**
   * Fire a tower at a target enemy
   */
  fireTower(
    tower: Tower,
    enemy: Enemy,
    bulletType: { speedMultiplier: number; damageMultiplier: number; color: string },
    addBullet: (bullet: Bullet) => void
  ): void {
    // CRITICAL FIX: Apply upgrade effects to bullet damage and speed
    const baseDamage = tower.damage * bulletType.damageMultiplier;
    const baseSpeed = GAME_CONSTANTS.BULLET_SPEED * bulletType.speedMultiplier;
    
    const { damage, speed } = upgradeEffectsManager.applyUpgradeEffects(
      baseDamage,
      baseSpeed,
      // Note: This will need to be passed from the calling context
      1 // state.bulletLevel
    );
    
    // Use bullet pool for memory efficiency
    const bullet = bulletPool.createBullet(
      { x: tower.position.x, y: tower.position.y },
      getDirection(tower.position, enemy.position),
      damage, // FIXED: Now uses upgraded damage
      speed,   // FIXED: Now uses upgraded speed
      bulletType.color,
      // Note: This will need to be passed from the calling context
      0, // state.bulletLevel - 1
      enemy.id
    );
    
    addBullet(bullet);
    
    // Play sound if available
    if (tower.attackSound) {
      playSound(tower.attackSound);
    }
    
    tower.lastFired = performance.now();
    
    if (GAME_CONSTANTS.DEBUG_MODE) {
      console.log(`🔫 Tower ${tower.id} fired upgraded bullet (${damage} dmg) at ${enemy.id}`);
    }
  }

  /**
   * Update tower firing logic for all towers
   */
  updateTowerFire(
    towerSlots: TowerSlot[],
    enemies: Enemy[],
    currentWaveModifier: { disableTowerType?: string; disableArea?: { x: number; y: number; radius: number }; towerRangeReduced?: boolean } | null,
    bulletLevel: number,
    wallLevel: number,
    isGameOver: boolean,
    addBullet: (bullet: Bullet) => void,
    addEffect: (effect: Effect) => void,
    damageEnemy: (id: string, damage: number) => void,
    regenerateWalls: () => void,
    globalWallActive: boolean,
    wallRegenerationActive: boolean
  ): void {
    // ✅ CRITICAL FIX: Stop tower firing if game is over
    if (isGameOver) {
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
      const damageMultiplier = bulletType.damageMultiplier * (enhancedDamage / tower.damage); // Use enhanced damage ratio
      
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
        console.log(`Tower ${tower.id} (L${tower.level}) targeting ${enemy.type} with threat score: ${threatScore.toFixed(1)}`);
      }

      this.fireTower(tower, enemy, {
        speedMultiplier: bulletType.speedMultiplier,
        damageMultiplier: damageMultiplier,
        color: bulletType.color,
      }, addBullet);
    });
  }
}

// Global tower firing system instance
export const towerFiringSystem = new TowerFiringSystem(); 