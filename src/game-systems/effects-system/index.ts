/**
 * 🎯 Optimized Effects System
 * Exports simplified, high-performance effect components
 */

export { SimplifiedParticleSystem, type SimpleParticle, type ParticleConfig } from './SimplifiedParticleSystem';
export { EffectRenderer, type VisualEffect } from './EffectRenderer';
import { Effects } from '../Effects';

// Re-export existing pooled effects for backward compatibility
export { effectPool } from './EffectPool';
export { updateEffects, createManagedEffect, performMemoryCleanup } from './Effects';

// Performance monitoring utilities
export const EffectPerformance = {
  getParticleCount: () => Effects.getParticleCount(),
  getStats: () => Effects.getPerformanceStats(),
  clearAll: () => Effects.clearAllEffects()
};

// Simplified effect creators for common use cases
export const SimpleEffects = {
  // Combat effects
  shootingEffect: (fromX: number, fromY: number, toX: number, toY: number, towerType = 'basic') => 
    Effects.createShootingEffect(fromX, fromY, toX, toY, towerType),
  
  explosionEffect: (x: number, y: number, radius = 30) => 
    Effects.createExplosionEffect(x, y, radius),
  
  damageEffect: (x: number, y: number, damage: number) => 
    Effects.createEnemyDamageEffect(x, y, damage),
  
  // Tower effects
  towerPlacement: (x: number, y: number) => 
    Effects.createTowerPlacementEffect(x, y),
  
  // Status effects
  statusEffect: (x: number, y: number, type: 'slow' | 'freeze' | 'heal' | 'shield') => 
    Effects.createStatusEffect(x, y, type),
  
  // Weather effects
  weatherEffect: (x: number, y: number, weatherType: string) => 
    Effects.createWeatherEffect(x, y, weatherType),
  
  // Boss effects
  bossAbility: (x: number, y: number, abilityType: string) => 
    Effects.createBossAbilityEffect(x, y, abilityType)
}; 