/**
 * 🎯 Simplified Particle System
 * High-performance, minimal particle effects for optimal performance
 */

import { LifecycleManager } from '../memory/LifecycleManager';

export interface SimpleParticle {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'damage' | 'explosion' | 'heal' | 'slow' | 'freeze' | 'spark';
  opacity: number;
}

export interface ParticleConfig {
  count?: number;
  spread?: number;
  speed?: number;
  life?: number;
  size?: number;
  colors?: string[];
}

export class SimplifiedParticleSystem {
  private particles: SimpleParticle[] = [];
  private maxParticles = 50; // Strict limit for performance
  private particleId = 0;
  private lifecycle = LifecycleManager.getInstance();

  // Default configurations for different effect types
  private static readonly CONFIGS: Record<string, ParticleConfig> = {
    damage: {
      count: 3,
      spread: 45,
      speed: 2,
      life: 800,
      size: 8,
      colors: ['#EF4444', '#F87171']
    },
    explosion: {
      count: 6,
      spread: 360,
      speed: 3,
      life: 600,
      size: 6,
      colors: ['#F59E0B', '#FCD34D', '#EF4444']
    },
    heal: {
      count: 4,
      spread: 30,
      speed: 1,
      life: 1000,
      size: 5,
      colors: ['#10B981', '#34D399', '#6EE7B7']
    },
    slow: {
      count: 5,
      spread: 180,
      speed: 1.5,
      life: 1200,
      size: 4,
      colors: ['#3B82F6', '#60A5FA', '#93C5FD']
    },
    freeze: {
      count: 8,
      spread: 120,
      speed: 0.8,
      life: 1500,
      size: 3,
      colors: ['#06B6D4', '#67E8F9', '#A5F3FC']
    },
    spark: {
      count: 2,
      spread: 60,
      speed: 4,
      life: 400,
      size: 2,
      colors: ['#FDE047', '#FACC15']
    }
  };

  /**
   * Create simple particles at a location
   */
  createEffect(
    x: number, 
    y: number, 
    type: 'damage' | 'explosion' | 'heal' | 'slow' | 'freeze' | 'spark',
    customConfig?: Partial<ParticleConfig>
  ): void {
    // Performance check: don't exceed max particles
    if (this.particles.length >= this.maxParticles) {
      this.particles.splice(0, Math.max(1, this.particles.length - this.maxParticles + 10));
    }

    const config = { ...SimplifiedParticleSystem.CONFIGS[type], ...customConfig };
    const count = config.count || 3;
    const spread = config.spread || 45;
    const speed = config.speed || 2;
    const life = config.life || 800;
    const size = config.size || 5;
    const colors = config.colors || ['#FFF'];

    for (let i = 0; i < count; i++) {
      const angle = (spread * (Math.random() - 0.5)) * (Math.PI / 180);
      const velocity = speed * (0.5 + Math.random() * 0.5);
      
      const particle: SimpleParticle = {
        id: `particle_${this.particleId++}`,
        x,
        y,
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity - (type === 'heal' ? 1 : 0), // Heal particles float up
        life: life,
        maxLife: life,
        size: size + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        type,
        opacity: 1
      };

      this.lifecycle.track(particle.id, particle, 'particle');
      this.particles.push(particle);
    }
  }

  /**
   * Destroy a particle and untrack it from the lifecycle manager
   */
  private destroyParticle(particle: SimpleParticle): void {
    this.lifecycle.untrack(particle.id);
  }

  /**
   * Update all particles - highly optimized
   */
  update(deltaTime: number): void {
    // Update particles in reverse order for safe removal
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update position
      particle.x += particle.velocityX * deltaTime * 0.016; // 60fps normalized
      particle.y += particle.velocityY * deltaTime * 0.016;
      
      // Apply simple gravity to some types
      if (particle.type === 'explosion' || particle.type === 'damage') {
        particle.velocityY += 0.1 * deltaTime * 0.016;
      }
      
      // Update life and opacity
      particle.life -= deltaTime;
      particle.opacity = Math.max(0, particle.life / particle.maxLife);
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.destroyParticle(particle);
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Render particles with simple canvas drawing
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (this.particles.length === 0) return;

    ctx.save();
    
    for (const particle of this.particles) {
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = particle.color;
      
      // Simple circle rendering - fastest option
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  /**
   * Get particle count for debugging
   */
  getParticleCount(): number {
    return this.particles.length;
  }

  /**
   * Clear all particles
   */
  clear(): void {
    // Destroy all particles and untrack them
    for (const particle of this.particles) {
      this.destroyParticle(particle);
    }
    this.particles.length = 0;
  }

  /**
   * Preset effect creators for common game events
   */
  static createDamageEffect(x: number, y: number, damage: number): ParticleConfig {
    return {
      count: Math.min(8, Math.max(2, Math.floor(damage / 10))),
      colors: damage > 50 ? ['#DC2626', '#EF4444'] : ['#F87171', '#FCA5A5']
    };
  }

  static createExplosionEffect(x: number, y: number, radius: number): ParticleConfig {
    return {
      count: Math.min(12, Math.max(4, Math.floor(radius / 5))),
      spread: 360,
      speed: Math.min(5, Math.max(2, radius / 10))
    };
  }

  static createStatusEffect(type: 'slow' | 'freeze' | 'heal'): ParticleConfig {
    const configs = {
      slow: { colors: ['#3B82F6', '#60A5FA'], life: 1000 },
      freeze: { colors: ['#06B6D4', '#67E8F9'], life: 1200, count: 6 },
      heal: { colors: ['#10B981', '#34D399'], life: 800, count: 3 }
    };
    return configs[type];
  }
} 