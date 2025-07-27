// GAME_CONSTANTS is not used in this file
import type { Mine, Enemy, Effect, Position } from '../../models/gameTypes';
import { useGameStore } from '../../models/store';
import { playSound } from '../../utils/sound';

export interface AdvancedMineType {
  id: string;
  name: string;
  description: string;
  unlockCondition: {
    type: 'mission' | 'market';
    value: string;
  };
  isUnlocked: boolean;
  cost: number;
  damage: number;
  radius: number;
  duration?: number;
  effects: string[];
  icon: string;
}

export interface MineEffect {
  id: string;
  type: 'emp' | 'stun' | 'slow' | 'chain_reaction';
  duration: number;
  intensity: number;
  targetId: string;
}

/**
 * Advanced Mine Manager
 * Handles advanced mine types with unlock conditions and SOLID principles
 */
export class AdvancedMineManager {
  private advancedMineTypes: Map<string, AdvancedMineType> = new Map();
  private activeEffects: Map<string, MineEffect> = new Map();

  constructor() {
    this.initializeAdvancedMineTypes();
  }

  private initializeAdvancedMineTypes(): void {
    // EMP Mine - unlocked via mission rewards
    this.advancedMineTypes.set('emp', {
      id: 'emp',
      name: 'EMP Mine',
      description: 'Stuns enemies for a short duration',
      unlockCondition: { type: 'mission', value: 'emp_mine_unlock' },
      isUnlocked: false,
      cost: 200,
      damage: 30,
      radius: 80,
      duration: 3000, // 3 seconds stun
      effects: ['stun', 'disable_electronics'],
      icon: '⚡'
    });

    // Sticky Mine - unlocked via mission rewards
    this.advancedMineTypes.set('sticky', {
      id: 'sticky',
      name: 'Sticky Mine',
      description: 'Attaches to slow-moving enemies and explodes after delay',
      unlockCondition: { type: 'mission', value: 'sticky_mine_unlock' },
      isUnlocked: false,
      cost: 150,
      damage: 80,
      radius: 60,
      duration: 2000, // 2 seconds delay
      effects: ['attach', 'delayed_explosion'],
      icon: '🕷️'
    });

    // Chain Reaction Mine - unlocked via market purchase
    this.advancedMineTypes.set('chainReaction', {
      id: 'chainReaction',
      name: 'Chain Reaction Mine',
      description: 'Triggers nearby mines for chain explosion effect',
      unlockCondition: { type: 'market', value: 'chain_reaction_mine_unlock' },
      isUnlocked: false,
      cost: 300,
      damage: 50,
      radius: 100,
      effects: ['chain_reaction', 'area_damage'],
      icon: '💥'
    });
  }

  /**
   * Check unlock conditions for all advanced mine types
   */
  public updateUnlockStatus(): void {
    // gameState is not used in this method
    
    this.advancedMineTypes.forEach((mineType, _key) => {
      if (mineType.unlockCondition.type === 'mission') {
        mineType.isUnlocked = this.checkMissionUnlock(mineType.unlockCondition.value);
      } else if (mineType.unlockCondition.type === 'market') {
        mineType.isUnlocked = this.checkMarketUnlock(mineType.unlockCondition.value);
      }
    });
  }

  private checkMissionUnlock(_missionId: string): boolean {
    // This would integrate with the mission system
    // For now, return false - needs mission integration
    return false;
  }

  private checkMarketUnlock(_unlockId: string): boolean {
    // This would integrate with the market system
    // For now, return false - needs market integration
    return false;
  }

  /**
   * Get available advanced mine types
   */
  public getAvailableMineTypes(): AdvancedMineType[] {
    this.updateUnlockStatus();
    return Array.from(this.advancedMineTypes.values()).filter(type => type.isUnlocked);
  }

  /**
   * Create an advanced mine
   */
  public createAdvancedMine(
    typeId: string,
    position: Position,
    addMine: (mine: Mine) => void,
    addEffect: (effect: Effect) => void
  ): Mine | null {
    const mineType = this.advancedMineTypes.get(typeId);
    if (!mineType || !mineType.isUnlocked) return null;

    const gameState = useGameStore.getState();
    if (gameState.gold < mineType.cost) return null;

    const mine: Mine = {
      id: `advanced-mine-${typeId}-${Date.now()}`,
      position,
      size: 20,
      damage: mineType.damage,
      radius: mineType.radius,
      mineType: 'utility',
      mineSubtype: typeId as 'emp' | 'sticky' | 'chainReaction',
      triggerCondition: 'proximity',
      isActive: true,
      placedAt: Date.now(),
      duration: mineType.duration,
      remainingDuration: mineType.duration,
      effects: mineType.effects
    };

    addMine(mine);

    // Add placement effect
    addEffect({
      id: `mine-place-${mine.id}`,
      position,
      radius: mineType.radius,
      color: '#FFD700',
      life: 500,
      maxLife: 500,
      type: 'mine_placement'
    });

    // Deduct gold
    useGameStore.setState({ gold: gameState.gold - mineType.cost });

    return mine;
  }

  /**
   * Handle mine explosion with advanced effects
   */
  public handleMineExplosion(
    mine: Mine,
    enemies: Enemy[],
    addEffect: (effect: Effect) => void,
    damageEnemy: (id: string, damage: number) => void,
    removeMine: (mineId: string) => void
  ): void {
    const mineType = this.advancedMineTypes.get(mine.mineSubtype || '');
    if (!mineType) return;

    // Create explosion effect
    addEffect({
      id: `explosion-${mine.id}`,
      position: mine.position,
      radius: mine.radius,
      color: '#FF4500',
      life: 400,
      maxLife: 400,
      type: 'mine_explosion'
    });

    // Apply effects based on mine type
    switch (mine.mineSubtype) {
      case 'emp':
        this.handleEMPExplosion(mine, enemies, addEffect, damageEnemy);
        break;
      case 'sticky':
        this.handleStickyExplosion(mine, enemies, addEffect, damageEnemy);
        break;
      case 'chainReaction':
        this.handleChainReactionExplosion(mine, enemies, addEffect, damageEnemy);
        break;
    }

    removeMine(mine.id);
  }

  /**
   * Handle EMP mine explosion
   */
  private handleEMPExplosion(
    mine: Mine,
    enemies: Enemy[],
    addEffect: (effect: Effect) => void,
    damageEnemy: (id: string, damage: number) => void
  ): void {
    const empDuration = mine.duration || 3000;
    
    enemies.forEach(enemy => {
      const dx = enemy.position.x - mine.position.x;
      const dy = enemy.position.y - mine.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= mine.radius) {
        // Apply damage
        damageEnemy(enemy.id, mine.damage);

        // Apply EMP effect
        const effectId = `emp-${enemy.id}-${Date.now()}`;
        this.activeEffects.set(effectId, {
          id: effectId,
          type: 'emp',
          duration: empDuration,
          intensity: 1.0,
          targetId: enemy.id
        });

        // Add EMP visual effect
        addEffect({
          id: effectId,
          position: enemy.position,
          radius: 15,
          color: '#00FFFF',
          life: empDuration,
          maxLife: empDuration,
          type: 'emp_effect'
        });

        // Stun the enemy
        enemy.frozenUntil = Date.now() + empDuration;
      }
    });

    playSound('emp-explosion');
  }

  /**
   * Handle sticky mine explosion
   */
  private handleStickyExplosion(
    mine: Mine,
    enemies: Enemy[],
    addEffect: (effect: Effect) => void,
    damageEnemy: (id: string, damage: number) => void
  ): void {
    // Find the closest enemy to attach to
    let closestEnemy: Enemy | null = null;
    let closestDistance = Infinity;

    enemies.forEach(enemy => {
      const dx = enemy.position.x - mine.position.x;
      const dy = enemy.position.y - mine.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= mine.radius && distance < closestDistance) {
        closestEnemy = enemy;
        closestDistance = distance;
      }
    });

    if (closestEnemy) {
      // Attach sticky mine to enemy
      const stickyEffectId = `sticky-${closestEnemy.id}-${Date.now()}`;
      const stickyDuration = mine.duration || 2000;

      this.activeEffects.set(stickyEffectId, {
        id: stickyEffectId,
        type: 'stun',
        duration: stickyDuration,
        intensity: 1.0,
        targetId: closestEnemy.id
      });

      // Add sticky visual effect
      addEffect({
        id: stickyEffectId,
        position: closestEnemy.position,
        radius: 10,
        color: '#8B4513',
        life: stickyDuration,
        maxLife: stickyDuration,
        type: 'sticky_effect'
      });

      // Delayed explosion
      setTimeout(() => {
        damageEnemy(closestEnemy!.id, mine.damage);
        
        addEffect({
          id: `sticky-explosion-${closestEnemy!.id}`,
          position: closestEnemy!.position,
          radius: mine.radius,
          color: '#FF4500',
          life: 300,
          maxLife: 300,
          type: 'sticky_explosion'
        });

        this.activeEffects.delete(stickyEffectId);
        playSound('sticky-explosion');
      }, stickyDuration);
    }
  }

  /**
   * Handle chain reaction mine explosion
   */
  private handleChainReactionExplosion(
    mine: Mine,
    enemies: Enemy[],
    addEffect: (effect: Effect) => void,
    damageEnemy: (id: string, damage: number) => void
  ): void {
    const gameState = useGameStore.getState();
    const nearbyMines = gameState.mines.filter(otherMine => {
      if (otherMine.id === mine.id) return false;
      
      const dx = otherMine.position.x - mine.position.x;
      const dy = otherMine.position.y - mine.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      return distance <= mine.radius;
    });

    // Damage enemies in radius
    enemies.forEach(enemy => {
      const dx = enemy.position.x - mine.position.x;
      const dy = enemy.position.y - mine.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= mine.radius) {
        damageEnemy(enemy.id, mine.damage);
      }
    });

    // Trigger chain reaction
    if (nearbyMines.length > 0) {
      addEffect({
        id: `chain-reaction-${mine.id}`,
        position: mine.position,
        radius: mine.radius * 2,
        color: '#FFD700',
        life: 600,
        maxLife: 600,
        type: 'chain_reaction'
      });

      // Trigger nearby mines with delay
      nearbyMines.forEach((nearbyMine, index) => {
        setTimeout(() => {
          this.handleMineExplosion(
            nearbyMine,
            enemies,
            addEffect,
            damageEnemy,
            gameState.removeMine
          );
        }, 100 * (index + 1)); // Staggered explosions
      });
    }

    playSound('chain-explosion');
  }

  /**
   * Update active mine effects
   */
  public updateMineEffects(deltaTime: number): void {
    // now is not used in this method
    const expiredEffects: string[] = [];

    this.activeEffects.forEach((effect, effectId) => {
      effect.duration -= deltaTime;
      if (effect.duration <= 0) {
        expiredEffects.push(effectId);
      }
    });

    expiredEffects.forEach(effectId => {
      this.activeEffects.delete(effectId);
    });
  }

  /**
   * Get mine type information
   */
  public getMineType(typeId: string): AdvancedMineType | null {
    return this.advancedMineTypes.get(typeId) || null;
  }

  /**
   * Check if a specific mine type is unlocked
   */
  public isMineTypeUnlocked(typeId: string): boolean {
    const mineType = this.advancedMineTypes.get(typeId);
    return mineType ? mineType.isUnlocked : false;
  }

  /**
   * Get all advanced mine types
   */
  public getAllMineTypes(): AdvancedMineType[] {
    return Array.from(this.advancedMineTypes.values());
  }
}

// Global advanced mine manager instance
export const advancedMineManager = new AdvancedMineManager(); 