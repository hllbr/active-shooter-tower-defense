import { useGameStore } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/constants';
import type { Enemy, WaveModifier } from '../../models/gameTypes';
import { spawnStrategy } from '../spawn-system';
import { getRandomSpawnPosition } from './index';
import BossManager from './BossManager';
import { EnemyBehaviorSystem } from './EnemyBehaviorSystem';
import { advancedEnemyPool } from '../memory/AdvancedEnemyPool';
import { dynamicDifficultyManager } from '../DynamicDifficultyManager';

/**
 * Factory class responsible for creating different types of enemies
 */
export class EnemyFactory {
  /**
   * Initialize the enemy factory and behavior system
   */
  static initialize(): void {
    EnemyBehaviorSystem.initialize();
  }

  /**
   * Creates an enemy with dynamic spawning integration and difficulty adjustment
   */
  static createEnemy(wave: number, type: keyof typeof GAME_CONSTANTS.ENEMY_TYPES = 'Basic'): Enemy {
    const enemies = useGameStore.getState().enemies;
    // Use dynamic spawn system for intelligent enemy type selection
    const dynamicType = spawnStrategy.selectEnemyType(wave, enemies);
    const finalType = type === 'Basic' ? dynamicType : type;

    // Check for advanced boss spawn (new system)
    const shouldSpawnAdvancedBoss = BossManager.shouldSpawnBoss(wave);
    if (shouldSpawnAdvancedBoss) {
      const position = getRandomSpawnPosition();
      const advancedBoss = BossManager.createBoss(wave, position);
      if (advancedBoss) {
        // Apply dynamic difficulty adjustment to boss
        return dynamicDifficultyManager.applyEnemyAdjustment(advancedBoss, true);
      }
    }

    // Special enemy spawn logic for waves 10+
    let isSpecial = false;
    if (wave >= 10) {
      // Base chance increases with wave level
      const baseChance = GAME_CONSTANTS.MICROBE_ENEMY.spawnChance;
      const waveBonus = Math.min(0.25, (wave - 10) * 0.002); // Max 25% chance at wave 100
      const totalChance = baseChance + waveBonus;
      isSpecial = Math.random() < totalChance;
    }

    let enemy: Enemy;

    if (isSpecial && finalType === 'Basic') {
      // Use pool for special enemy (Yadama/Microbe)
      const position = getRandomSpawnPosition();
      const microbe = GAME_CONSTANTS.MICROBE_ENEMY;
      enemy = advancedEnemyPool.createEnemy(
        position,
        microbe.health,
        microbe.speed,
        microbe.size,
        microbe.baseGoldDrop,
        microbe.color,
        8, // microbe damage
        'Basic',
        undefined // bossType
      );
      // ... set special properties as needed ...
    } else {
      // Use pool for standard enemy
      const position = getRandomSpawnPosition();
      const config = GAME_CONSTANTS.ENEMY_TYPES[finalType] || { hp: 100, damage: 10, color: '#ff0000', speed: 1 };
      enemy = advancedEnemyPool.createEnemy(
        position,
        config.hp,
        config.speed,
        20,
        10,
        config.color,
        config.damage,
        finalType,
        undefined // bossType
      );
      // ... set properties based on type, boss, etc. ...
    }

    // Apply dynamic difficulty adjustment to regular enemies
    return dynamicDifficultyManager.applyEnemyAdjustment(enemy, false);
  }

  /**
   * Creates a special microbe enemy
   */
  private static createSpecialEnemy(wave: number, id: string, currentWaveModifier?: WaveModifier): Enemy {
    const healthScaling = Math.min(200, 40 + (wave - 10) * 3); // Cap health at 200
    const speedScaling = Math.min(120, 60 + (wave - 10) * 1.5); // Cap speed at 120
    const goldScaling = Math.min(20, 5 + Math.floor((wave - 10) / 10)); // Increase gold every 10 waves
    
    let enemy: Enemy = {
      id,
      position: getRandomSpawnPosition(),
      size: GAME_CONSTANTS.MICROBE_ENEMY.size,
      isActive: true,
      health: healthScaling,
      maxHealth: healthScaling,
      speed: speedScaling * (currentWaveModifier?.speedMultiplier ?? 1),
      goldValue: goldScaling,
      color: GAME_CONSTANTS.MICROBE_ENEMY.color,
      frozenUntil: 0,
      isSpecial: true,
      lastGoldDrop: performance.now(),
      damage: GAME_CONSTANTS.ENEMY_TYPES.Basic.damage,
      behaviorTag: 'microbe',
      type: 'Microbe',
    } as Enemy;
    
    // Apply dynamic difficulty scaling
    enemy = spawnStrategy.applyDifficultyScaling(enemy, wave);
    return enemy;
  }

  /**
   * Creates a standard enemy (Basic, Tank, Scout, etc.)
   */
  private static createStandardEnemy(
    wave: number, 
    finalType: keyof typeof GAME_CONSTANTS.ENEMY_TYPES, 
    id: string, 
    currentWaveModifier?: WaveModifier, 
    shouldBeBoss: boolean = false
  ): Enemy {
    const def = GAME_CONSTANTS.ENEMY_TYPES[finalType];
    const health = def.hp + (finalType === 'Basic' ? (wave - 1) * GAME_CONSTANTS.ENEMY_HEALTH_INCREASE : 0);
    
    let enemy: Enemy = {
      id,
      position: getRandomSpawnPosition(),
      size: GAME_CONSTANTS.ENEMY_SIZE,
      isActive: true,
      health,
      maxHealth: health,
      speed: def.speed * (currentWaveModifier?.speedMultiplier ?? 1),
      goldValue: GAME_CONSTANTS.ENEMY_GOLD_DROP,
      color: def.color,
      frozenUntil: 0,
      isSpecial: false,
      damage: def.damage,
      behaviorTag: def.behaviorTag,
      type: finalType,
    } as Enemy;
    
    // Apply boss modifications if needed
    if (shouldBeBoss) {
      enemy = this.applyBossModifications(enemy);
    }
    
    // Apply dynamic difficulty scaling
    enemy = spawnStrategy.applyDifficultyScaling(enemy, wave);
    return enemy;
  }

  /**
   * Applies boss modifications to an enemy
   */
  private static applyBossModifications(enemy: Enemy): Enemy {
    enemy.health = Math.floor(enemy.health * 2.5); // Boss health multiplier
    enemy.maxHealth = enemy.health;
    enemy.goldValue = Math.floor(enemy.goldValue * 3.0); // Boss gold multiplier
    enemy.isSpecial = true;
    enemy.size = enemy.size * 1.3; // Slightly larger boss
    // Add boss visual indicator (darker color)
    enemy.color = enemy.color.replace('#', '#2d'); // Make darker
    return enemy;
  }
} 