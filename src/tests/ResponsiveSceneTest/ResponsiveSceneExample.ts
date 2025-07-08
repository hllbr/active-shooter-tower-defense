import { ResponsiveScene } from '../../game-systems/responsive';
import type { Tower, Enemy } from '../../models/gameTypes';
import { Logger } from '../../utils/Logger';

/**
 * Example usage of ResponsiveScene to verify responsive behavior
 */
export class ResponsiveSceneExample {
  static run(): void {
    const scene = new ResponsiveScene();

    const towers: Tower[] = [
      {
        id: 't1',
        position: { x: 1900, y: 1000 },
        size: 48,
        isActive: true,
        level: 1,
        range: 100,
        damage: 10,
        fireRate: 1000,
        lastFired: 0,
        health: 100,
        maxHealth: 100,
        wallStrength: 0,
        specialAbility: 'none',
        healthRegenRate: 0,
        lastHealthRegen: 0,
        specialCooldown: 0,
        lastSpecialUse: 0,
        multiShotCount: 0,
        chainLightningJumps: 0,
        freezeDuration: 0,
        burnDuration: 0,
        acidStack: 0,
        quantumState: false,
        nanoSwarmCount: 0,
        psiRange: 0,
        timeWarpSlow: 0,
        spaceGravity: 0,
        legendaryAura: false,
        divineProtection: false,
        cosmicEnergy: 0,
        infinityLoop: false,
        godModeActive: false
      }
    ];

    const enemies: Enemy[] = [];

    scene.setTowers(towers);
    scene.setEnemies(enemies);

    scene.updateForScreenSize(800, 600);
    scene.updateTowerPositions(800, 600);

    Logger.log('Updated tower position:', scene['towers'][0].position);

    const spawn = scene.getValidSpawnPoint(800, 600, 20);
    Logger.log('Calculated spawn point:', spawn);
  }
}
