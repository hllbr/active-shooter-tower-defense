import type { Enemy, Effect, BossLootEntry } from '../../models/gameTypes';
import { selectBossForWave, type BossDefinition } from './BossDefinitions';
import { useGameStore } from '../../models/store';
import { soundEffects } from '../../utils/sound';

/**
 * Advanced Boss Manager for multi-phase boss encounters
 */
export class BossManager {
  private static activeBosses: Map<string, BossDefinition> = new Map();
  private static cinematicTimers: Map<string, NodeJS.Timeout> = new Map();
  private static bossAbilityTimers: Map<string, NodeJS.Timeout> = new Map();
  private static minionSpawnTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Initialize boss system
   */
  static initialize() {
    this.activeBosses.clear();
    this.cinematicTimers.clear();
    this.bossAbilityTimers.clear();
    this.minionSpawnTimers.clear();
  }

  /**
   * Check if a boss should spawn for the current wave
   */
  static shouldSpawnBoss(wave: number): boolean {
    const bossDefinition = selectBossForWave(wave);
    return bossDefinition !== null;
  }

  /**
   * Create a boss enemy with full advanced mechanics
   */
  static createBoss(wave: number, position: { x: number; y: number }): Enemy | null {
    const bossDefinition = selectBossForWave(wave);
    if (!bossDefinition) return null;

    const id = `boss_${Date.now()}_${Math.random()}`;
    const stats = bossDefinition.baseStats;
    
    // Calculate wave-scaled stats
    const waveMultiplier = Math.max(1, 1 + (wave - bossDefinition.spawnRequirements.minWave) * 0.1);
    const scaledHealth = Math.floor(stats.health * waveMultiplier);
    
    // Create boss enemy with advanced properties
    const bossEnemy: Enemy = {
      id,
      position,
      size: stats.size,
      isActive: true,
      health: scaledHealth,
      maxHealth: scaledHealth,
      speed: stats.speed,
      goldValue: Math.floor(stats.goldValue * waveMultiplier),
      color: stats.color,
      damage: Math.floor(stats.damage * waveMultiplier),
      isSpecial: true,
      type: bossDefinition.name,
      behaviorTag: 'boss',
      
      // Boss-specific properties
      bossType: bossDefinition.bossType,
      bossPhase: 1,
      maxBossPhases: bossDefinition.phases.length,
      phaseTransitionThresholds: bossDefinition.phases.map(p => p.healthThreshold),
      bossAbilities: bossDefinition.phases[0].abilities,
      lastAbilityUse: 0,
      abilityCooldowns: {},
      cinematicState: 'entrance',
      cinematicStartTime: performance.now(),
      bossLootTable: bossDefinition.lootTable,
      isInvulnerable: true, // Start invulnerable during entrance
      entranceComplete: false,
      bossSpecialEffects: [],
      canSpawnMinions: bossDefinition.specialMechanics.canSpawnMinions,
      lastMinionSpawn: 0,
      environmentalEffects: bossDefinition.specialMechanics.environmentalEffects,
      shieldStrength: bossDefinition.specialMechanics.hasShield ? scaledHealth * 0.3 : 0,
      shieldRegenRate: bossDefinition.specialMechanics.hasShield ? 10 : 0,
      rageMode: false,
      fleeThreshold: bossDefinition.specialMechanics.canFlee ? 0.1 : 0,
      isFleeing: false,
    };

    // Initialize ability cooldowns
    bossDefinition.phases[0].abilities.forEach(ability => {
      bossEnemy.abilityCooldowns![ability] = 0;
    });

    // Register boss and start entrance cinematic
    this.activeBosses.set(id, bossDefinition);
    this.startEntranceCinematic(bossEnemy, bossDefinition);

    return bossEnemy;
  }

  /**
   * Start boss entrance cinematic
   */
  private static startEntranceCinematic(boss: Enemy, definition: BossDefinition) {
    const { addEffect, showNotification } = useGameStore.getState();
    
    // Play entrance sound
    soundEffects.playSound('boss-entrance');
    
    // Show entrance message
    showNotification?.({
      id: `boss_entrance_${boss.id}`,
      type: 'warning',
      message: definition.cinematicData.entranceText,
      timestamp: Date.now(),
      duration: definition.cinematicData.entranceDuration,
    });

    // Create entrance visual effects
    addEffect({
      id: `boss_entrance_effect_${boss.id}`,
      position: boss.position,
      radius: boss.size * 2,
      color: '#ff0000',
      life: definition.cinematicData.entranceDuration,
      maxLife: definition.cinematicData.entranceDuration,
      type: 'boss_entrance',
      opacity: 0.8,
      scale: 2.0,
    });

    // Set timer to complete entrance
    const timer = setTimeout(() => {
      boss.isInvulnerable = false;
      boss.entranceComplete = true;
      boss.cinematicState = 'normal';
      this.startBossAbilityLoop(boss, definition);
      this.cinematicTimers.delete(boss.id);
    }, definition.cinematicData.entranceDuration);

    this.cinematicTimers.set(boss.id, timer);
  }

  /**
   * Start boss ability loop
   */
  private static startBossAbilityLoop(boss: Enemy, definition: BossDefinition) {
    const abilityLoop = () => {
      if (!boss.isActive || boss.isFleeing) return;

      const currentPhase = this.getCurrentPhase(boss, definition);
      if (currentPhase) {
        this.executeRandomAbility(boss, currentPhase, definition);
      }

      // Schedule next ability
      const cooldownTime = 3000 + Math.random() * 2000; // 3-5 seconds
      const timer = setTimeout(abilityLoop, cooldownTime);
      this.bossAbilityTimers.set(boss.id, timer);
    };

    abilityLoop();
  }

  /**
   * Update boss state and handle phase transitions
   */
  static updateBoss(boss: Enemy): void {
    const definition = this.activeBosses.get(boss.id);
    if (!definition) return;

    // Check for phase transitions
    this.checkPhaseTransition(boss, definition);

    // Update shield regeneration
    if (definition.specialMechanics.hasShield && boss.shieldStrength! > 0) {
      boss.shieldStrength! = Math.min(
        boss.maxHealth * 0.3,
        boss.shieldStrength! + boss.shieldRegenRate! * 0.016
      );
    }

    // Check for rage mode activation
    if (definition.specialMechanics.hasRageMode && !boss.rageMode) {
      if (boss.health / boss.maxHealth < 0.3) {
        this.activateRageMode(boss, definition);
      }
    }

    // Check for flee condition
    if (definition.specialMechanics.canFlee && !boss.isFleeing) {
      if (boss.health / boss.maxHealth < boss.fleeThreshold!) {
        this.initiateFlee(boss, definition);
      }
    }

    // Handle minion spawning
    if (boss.canSpawnMinions && boss.cinematicState === 'normal') {
      this.handleMinionSpawning(boss, definition);
    }
  }

  /**
   * Check and handle phase transitions
   */
  private static checkPhaseTransition(boss: Enemy, definition: BossDefinition) {
    const currentPhase = boss.bossPhase || 1;
    const nextPhase = currentPhase + 1;
    
    if (nextPhase <= definition.phases.length) {
      const nextPhaseData = definition.phases[nextPhase - 1];
      const healthPercentage = boss.health / boss.maxHealth;
      
      if (healthPercentage <= nextPhaseData.healthThreshold) {
        this.triggerPhaseTransition(boss, definition, nextPhase);
      }
    }
  }

  /**
   * Trigger boss phase transition
   */
  private static triggerPhaseTransition(boss: Enemy, definition: BossDefinition, newPhase: number) {
    const { addEffect, showNotification } = useGameStore.getState();
    const phaseData = definition.phases[newPhase - 1];
    
    // Stop current abilities
    const currentTimer = this.bossAbilityTimers.get(boss.id);
    if (currentTimer) {
      clearTimeout(currentTimer);
      this.bossAbilityTimers.delete(boss.id);
    }

    // Set cinematic state
    boss.cinematicState = 'phase_transition';
    boss.cinematicStartTime = performance.now();
    boss.isInvulnerable = true;

    // Play phase transition sound
    soundEffects.playSound('boss-phase-transition');

    // Show phase transition message
    showNotification?.({
      id: `boss_phase_${boss.id}`,
      type: 'warning',
      message: `${definition.name} enters ${phaseData.name}!`,
      timestamp: Date.now(),
      duration: definition.cinematicData.phaseTransitionDuration,
    });

    // Create phase transition effect
    addEffect({
      id: `boss_phase_effect_${boss.id}`,
      position: boss.position,
      radius: boss.size * 3,
      color: '#9333ea',
      life: definition.cinematicData.phaseTransitionDuration,
      maxLife: definition.cinematicData.phaseTransitionDuration,
      type: 'phase_transition',
      opacity: 0.9,
      scale: 3.0,
    });

    // Apply phase changes
    boss.bossPhase = newPhase;
    boss.bossAbilities = phaseData.abilities;
    
    // Apply behavior changes
    if (phaseData.behaviorChanges) {
      const changes = phaseData.behaviorChanges;
      if (changes.speedMultiplier) {
        boss.speed = Math.floor(boss.speed * changes.speedMultiplier);
      }
      if (changes.damageMultiplier) {
        boss.damage = Math.floor(boss.damage * changes.damageMultiplier);
      }
      if (changes.newBehaviorTag) {
        boss.behaviorTag = changes.newBehaviorTag;
      }
    }

    // Set timer to complete phase transition
    const timer = setTimeout(() => {
      boss.isInvulnerable = false;
      boss.cinematicState = 'normal';
      this.startBossAbilityLoop(boss, definition);
      this.cinematicTimers.delete(boss.id);
    }, definition.cinematicData.phaseTransitionDuration);

    this.cinematicTimers.set(boss.id, timer);
  }

  /**
   * Execute a random boss ability
   */
  private static executeRandomAbility(boss: Enemy, phaseData: { abilities: string[] }, definition: BossDefinition) {
    const availableAbilities = phaseData.abilities.filter((ability: string) => {
      const cooldown = boss.abilityCooldowns![ability] || 0;
      return performance.now() - cooldown > 5000; // 5 second cooldown
    });

    if (availableAbilities.length === 0) return;

    const selectedAbility = availableAbilities[Math.floor(Math.random() * availableAbilities.length)];
    this.executeBossAbility(boss, selectedAbility, definition);
    
    // Set cooldown
    boss.abilityCooldowns![selectedAbility] = performance.now();
  }

  /**
   * Execute specific boss ability
   */
  private static executeBossAbility(boss: Enemy, ability: string, definition: BossDefinition) {
    // Note: Some abilities may require different game state properties
    const gameState = useGameStore.getState();
    
    switch (ability) {
      case 'charge_attack':
        this.executeChargeAttack(boss, definition);
        break;
      case 'ground_slam':
        this.executeGroundSlam(boss, definition);
        break;
      case 'missile_barrage':
        this.executeMissileBarrage(boss, definition);
        break;
      case 'bombing_run':
        this.executeBombingRun(boss, definition);
        break;
      case 'shield_regeneration':
        this.executeShieldRegeneration(boss, definition);
        break;
      case 'spawn_repair_drones':
        this.executeSpawnMinions(boss, definition, ['repair_drone']);
        break;
      case 'quantum_tunneling':
        this.executeQuantumTunneling(boss, definition);
        break;
      case 'reality_tear':
        this.executeRealityTear(boss, definition);
        break;
      default:
        console.warn(`Unknown boss ability: ${ability}`);
    }
  }

  /**
   * Execute charge attack ability
   */
  private static executeChargeAttack(boss: Enemy, definition: BossDefinition) {
    const { addEffect, towerSlots } = useGameStore.getState();
    
    // Find nearest tower
    const nearestTower = towerSlots
      .filter(slot => slot.tower)
      .reduce((nearest, slot) => {
        const distance = Math.hypot(slot.x - boss.position.x, slot.y - boss.position.y);
        return !nearest || distance < nearest.distance ? { slot, distance } : nearest;
      }, null as any);

    if (nearestTower) {
      // Create charge effect
      addEffect({
        id: `charge_effect_${boss.id}`,
        position: boss.position,
        radius: boss.size * 2,
        color: '#ff4444',
        life: 1000,
        maxLife: 1000,
        type: 'charge_attack',
      });

      // Boost speed temporarily
      const originalSpeed = boss.speed;
      boss.speed = boss.speed * 3;
      
      setTimeout(() => {
        boss.speed = originalSpeed;
      }, 1000);

      soundEffects.playSound('boss-charge');
    }
  }

  /**
   * Execute ground slam ability
   */
  private static executeGroundSlam(boss: Enemy, definition: BossDefinition) {
    const { addEffect, towerSlots, damageTower } = useGameStore.getState();
    
    // Create ground slam effect
    addEffect({
      id: `ground_slam_${boss.id}`,
      position: boss.position,
      radius: 150,
      color: '#8b4513',
      life: 2000,
      maxLife: 2000,
      type: 'ground_slam',
      opacity: 0.7,
    });

    // Damage all towers in radius
    towerSlots.forEach((slot, index) => {
      if (slot.tower) {
        const distance = Math.hypot(slot.x - boss.position.x, slot.y - boss.position.y);
        if (distance <= 150) {
          damageTower(index, boss.damage * 2);
        }
      }
    });

    soundEffects.playSound('boss-ground-slam');
  }

  /**
   * Handle boss defeat and loot distribution
   */
  static handleBossDefeat(boss: Enemy): void {
    const definition = this.activeBosses.get(boss.id);
    if (!definition) return;

    this.startDefeatCinematic(boss, definition);
    this.distributeLoot(boss, definition);
    this.cleanupBoss(boss.id);
  }

  /**
   * Start boss defeat cinematic
   */
  private static startDefeatCinematic(boss: Enemy, definition: BossDefinition) {
    const { addEffect, showNotification } = useGameStore.getState();
    
    boss.cinematicState = 'defeat';
    boss.cinematicStartTime = performance.now();
    
    // Play defeat sound
    soundEffects.playSound('boss-defeat');
    
    // Show defeat message
    showNotification?.({
      id: `boss_defeat_${boss.id}`,
      type: 'success',
      message: definition.cinematicData.defeatText,
      timestamp: Date.now(),
      duration: definition.cinematicData.defeatDuration,
    });

    // Create defeat effect
    addEffect({
      id: `boss_defeat_effect_${boss.id}`,
      position: boss.position,
      radius: boss.size * 4,
      color: '#ffd700',
      life: definition.cinematicData.defeatDuration,
      maxLife: definition.cinematicData.defeatDuration,
      type: 'boss_defeat',
      opacity: 1.0,
      scale: 4.0,
    });
  }

  /**
   * Distribute boss loot
   */
  private static distributeLoot(boss: Enemy, definition: BossDefinition) {
    
    definition.lootTable.forEach((lootEntry, index) => {
      if (Math.random() < lootEntry.dropChance) {
        // Distribute loot based on type
        this.distributeLootItem(boss, lootEntry, index);
      }
    });
  }

  /**
   * Distribute individual loot item
   */
  private static distributeLootItem(boss: Enemy, lootEntry: BossLootEntry, index: number) {
    const { addGold, addEffect, showNotification } = useGameStore.getState();
    
    switch (lootEntry.itemType) {
      case 'gold':
        addGold(lootEntry.amount);
        break;
      case 'research_points':
        // Add research points (integrate with research system)
        break;
      case 'achievements':
        // Trigger achievement (integrate with achievement system)
        break;
      default:
        console.log(`Boss loot: ${lootEntry.itemName} x${lootEntry.amount}`);
    }

    // Create loot drop effect
    addEffect({
      id: `loot_drop_${boss.id}_${index}`,
      position: {
        x: boss.position.x + (Math.random() - 0.5) * 100,
        y: boss.position.y + (Math.random() - 0.5) * 100,
      },
      radius: 20,
      color: this.getLootColor(lootEntry.rarity),
      life: 3000,
      maxLife: 3000,
      type: 'loot_drop',
      opacity: 0.9,
    });

    // Show loot notification
    showNotification?.({
      id: `loot_${boss.id}_${index}`,
      type: 'success',
      message: `${lootEntry.itemName} acquired!`,
      timestamp: Date.now(),
      duration: 3000,
    });
  }

  /**
   * Get loot color based on rarity
   */
  private static getLootColor(rarity: string): string {
    switch (rarity) {
      case 'common': return '#ffffff';
      case 'uncommon': return '#00ff00';
      case 'rare': return '#0080ff';
      case 'epic': return '#9933ff';
      case 'legendary': return '#ff8000';
      default: return '#ffffff';
    }
  }

  /**
   * Clean up boss resources
   */
  private static cleanupBoss(bossId: string) {
    this.activeBosses.delete(bossId);
    
    // Clear timers
    const cinematicTimer = this.cinematicTimers.get(bossId);
    if (cinematicTimer) {
      clearTimeout(cinematicTimer);
      this.cinematicTimers.delete(bossId);
    }
    
    const abilityTimer = this.bossAbilityTimers.get(bossId);
    if (abilityTimer) {
      clearTimeout(abilityTimer);
      this.bossAbilityTimers.delete(bossId);
    }
    
    const minionTimer = this.minionSpawnTimers.get(bossId);
    if (minionTimer) {
      clearTimeout(minionTimer);
      this.minionSpawnTimers.delete(bossId);
    }
  }

  /**
   * Get current phase data for boss
   */
  private static getCurrentPhase(boss: Enemy, definition: BossDefinition) {
    const currentPhase = boss.bossPhase || 1;
    return definition.phases[currentPhase - 1];
  }

  /**
   * Execute additional abilities (placeholder implementations)
   */
  private static executeMissileBarrage(boss: Enemy, definition: BossDefinition) {
    // Implementation for missile barrage
    soundEffects.playSound('boss-missile');
  }

  private static executeBombingRun(boss: Enemy, definition: BossDefinition) {
    // Implementation for bombing run
    soundEffects.playSound('boss-bombing');
  }

  private static executeShieldRegeneration(boss: Enemy, definition: BossDefinition) {
    if (boss.shieldStrength !== undefined) {
      boss.shieldStrength = Math.min(boss.maxHealth * 0.3, boss.shieldStrength + 200);
    }
  }

  private static executeSpawnMinions(boss: Enemy, definition: BossDefinition, minionTypes: string[]) {
    // Implementation for spawning minions
    soundEffects.playSound('boss-spawn-minions');
  }

  private static executeQuantumTunneling(boss: Enemy, definition: BossDefinition) {
    // Implementation for quantum tunneling
    boss.position.x = Math.random() * window.innerWidth;
    boss.position.y = Math.random() * window.innerHeight;
  }

  private static executeRealityTear(boss: Enemy, definition: BossDefinition) {
    // Implementation for reality tear
    soundEffects.playSound('boss-reality-tear');
  }

  private static activateRageMode(boss: Enemy, definition: BossDefinition) {
    boss.rageMode = true;
    boss.speed = Math.floor(boss.speed * 1.5);
    boss.damage = Math.floor(boss.damage * 2.0);
  }

  private static initiateFlee(boss: Enemy, definition: BossDefinition) {
    boss.isFleeing = true;
    boss.speed = Math.floor(boss.speed * 2.0);
    boss.behaviorTag = 'fleeing';
  }

  private static handleMinionSpawning(boss: Enemy, definition: BossDefinition) {
    // Implementation for handling minion spawning
    const now = performance.now();
    if (now - boss.lastMinionSpawn! > 10000) { // 10 seconds
      boss.lastMinionSpawn = now;
      // Spawn minions logic
    }
  }

  /**
   * Get all active bosses
   */
  static getActiveBosses(): Map<string, BossDefinition> {
    return new Map(this.activeBosses);
  }

  /**
   * Check if boss is in cinematic state
   */
  static isBossInCinematic(bossId: string): boolean {
    return this.cinematicTimers.has(bossId);
  }

  /**
   * Cleanup all boss resources
   */
  static cleanup() {
    // Clear all timers
    this.cinematicTimers.forEach(timer => clearTimeout(timer));
    this.bossAbilityTimers.forEach(timer => clearTimeout(timer));
    this.minionSpawnTimers.forEach(timer => clearTimeout(timer));
    
    // Clear all maps
    this.activeBosses.clear();
    this.cinematicTimers.clear();
    this.bossAbilityTimers.clear();
    this.minionSpawnTimers.clear();
  }
}

export default BossManager; 