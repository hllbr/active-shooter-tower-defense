/**
 * 🎯 Enhanced Particle System
 * High-performance particle effects with advanced visual feedback
 * Optimized for 60 FPS with minimal performance impact
 */

import { LifecycleManager } from '../memory/LifecycleManager';

export interface EnhancedParticle {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'hit_flash' | 'damage_spark' | 'explosion' | 'muzzle_flash' | 'smoke' | 'boss_death' | 'mine_explosion';
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  fadeType: 'linear' | 'ease_out' | 'pulse';
  glowIntensity: number;
}

export interface ParticleEffectConfig {
  count?: number;
  spread?: number;
  speed?: number;
  life?: number;
  size?: number;
  colors?: string[];
  rotationSpeed?: number;
  gravity?: number;
  fadeType?: 'linear' | 'ease_out' | 'pulse';
  glowIntensity?: number;
  sizeVariation?: number;
  speedVariation?: number;
}

export class EnhancedParticleSystem {
  private particles: EnhancedParticle[] = [];
  private maxParticles = 80; // Increased limit for enhanced effects
  private particleId = 0;
  private lifecycle = LifecycleManager.getInstance();
  private performanceMode = false; // Auto-detect performance mode

  // Enhanced configurations for different effect types
  private static readonly ENHANCED_CONFIGS: Record<string, ParticleEffectConfig> = {
    hit_flash: {
      count: 4,
      spread: 60,
      speed: 3,
      life: 300,
      size: 6,
      colors: ['#FFD700', '#FFA500', '#FF4500'],
      rotationSpeed: 0.2,
      gravity: 0.05,
      fadeType: 'ease_out',
      glowIntensity: 0.8,
      sizeVariation: 0.3,
      speedVariation: 0.4
    },
    damage_spark: {
      count: 6,
      spread: 90,
      speed: 4,
      life: 500,
      size: 4,
      colors: ['#EF4444', '#F87171', '#FCA5A5'],
      rotationSpeed: 0.3,
      gravity: 0.08,
      fadeType: 'linear',
      glowIntensity: 0.6,
      sizeVariation: 0.5,
      speedVariation: 0.6
    },
    explosion: {
      count: 12,
      spread: 360,
      speed: 5,
      life: 800,
      size: 8,
      colors: ['#F59E0B', '#FCD34D', '#EF4444', '#FF6B35'],
      rotationSpeed: 0.1,
      gravity: 0.12,
      fadeType: 'ease_out',
      glowIntensity: 1.0,
      sizeVariation: 0.7,
      speedVariation: 0.8
    },
    muzzle_flash: {
      count: 3,
      spread: 45,
      speed: 2,
      life: 150,
      size: 5,
      colors: ['#FFD700', '#FFA500', '#FFFFFF'],
      rotationSpeed: 0.5,
      gravity: 0.02,
      fadeType: 'ease_out',
      glowIntensity: 0.9,
      sizeVariation: 0.2,
      speedVariation: 0.3
    },
    smoke: {
      count: 5,
      spread: 30,
      speed: 1,
      life: 1200,
      size: 6,
      colors: ['#808080', '#A0A0A0', '#C0C0C0'],
      rotationSpeed: 0.05,
      gravity: -0.03, // Smoke rises
      fadeType: 'linear',
      glowIntensity: 0.3,
      sizeVariation: 0.4,
      speedVariation: 0.5
    },
    boss_death: {
      count: 20,
      spread: 360,
      speed: 8,
      life: 1500,
      size: 10,
      colors: ['#FFD700', '#FF4500', '#8A2BE2', '#00FFFF'],
      rotationSpeed: 0.2,
      gravity: 0.15,
      fadeType: 'pulse',
      glowIntensity: 1.2,
      sizeVariation: 0.8,
      speedVariation: 0.9
    },
    mine_explosion: {
      count: 15,
      spread: 360,
      speed: 6,
      life: 1000,
      size: 7,
      colors: ['#FF6B35', '#F59E0B', '#EF4444', '#FFD700'],
      rotationSpeed: 0.15,
      gravity: 0.1,
      fadeType: 'ease_out',
      glowIntensity: 1.1,
      sizeVariation: 0.6,
      speedVariation: 0.7
    }
  };

  /**
   * Create enhanced particle effect
   */
  createEffect(
    x: number,
    y: number,
    type: 'hit_flash' | 'damage_spark' | 'explosion' | 'muzzle_flash' | 'smoke' | 'boss_death' | 'mine_explosion',
    customConfig?: Partial<ParticleEffectConfig>
  ): void {
    // Performance check: don't exceed max particles
    if (this.particles.length >= this.maxParticles) {
      this.particles.splice(0, Math.max(1, this.particles.length - this.maxParticles + 15));
    }

    const config = { ...EnhancedParticleSystem.ENHANCED_CONFIGS[type], ...customConfig };
    const count = config.count || 3;
    const spread = config.spread || 45;
    const speed = config.speed || 2;
    const life = config.life || 800;
    const size = config.size || 5;
    const colors = config.colors || ['#FFF'];
    const rotationSpeed = config.rotationSpeed || 0;
    const gravity = config.gravity || 0;
    const fadeType = config.fadeType || 'linear';
    const glowIntensity = config.glowIntensity || 0.5;
    const sizeVariation = config.sizeVariation || 0.3;
    const speedVariation = config.speedVariation || 0.4;

    for (let i = 0; i < count; i++) {
      const angle = (spread * (Math.random() - 0.5)) * (Math.PI / 180);
      const velocity = speed * (1 - speedVariation * 0.5 + Math.random() * speedVariation);
      
      const particle: EnhancedParticle = {
        id: `enhanced_particle_${this.particleId++}`,
        x,
        y,
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity,
        life: life,
        maxLife: life,
        size: size * (1 - sizeVariation * 0.5 + Math.random() * sizeVariation),
        color: colors[Math.floor(Math.random() * colors.length)],
        type,
        opacity: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: rotationSpeed * (Math.random() - 0.5),
        gravity,
        fadeType,
        glowIntensity
      };

      this.lifecycle.track(particle.id, particle, 'enhanced_particle');
      this.particles.push(particle);
    }
  }

  /**
   * Create hit flash effect for enemy damage
   */
  createHitFlash(x: number, y: number, damage: number): void {
    const intensity = Math.min(1, damage / 50);
    this.createEffect(x, y, 'hit_flash', {
      count: Math.floor(3 + intensity * 3),
      size: 4 + intensity * 4,
      glowIntensity: 0.6 + intensity * 0.4
    });
  }

  /**
   * Create damage spark effect
   */
  createDamageSpark(x: number, y: number, damage: number): void {
    const intensity = Math.min(1, damage / 30);
    this.createEffect(x, y, 'damage_spark', {
      count: Math.floor(4 + intensity * 4),
      colors: damage > 40 ? ['#DC2626', '#EF4444', '#FF6B6B'] : ['#F87171', '#FCA5A5', '#FECACA']
    });
  }

  /**
   * Create enhanced explosion effect
   */
  createExplosion(x: number, y: number, radius: number): void {
    const intensity = Math.min(1, radius / 50);
    this.createEffect(x, y, 'explosion', {
      count: Math.floor(8 + intensity * 8),
      size: 6 + intensity * 6,
      speed: 4 + intensity * 3
    });
  }

  /**
   * Create muzzle flash effect
   */
  createMuzzleFlash(x: number, y: number, towerType: string): void {
    const colors = this.getTowerMuzzleColors(towerType);
    this.createEffect(x, y, 'muzzle_flash', { colors });
  }

  /**
   * Create smoke effect
   */
  createSmoke(x: number, y: number): void {
    this.createEffect(x, y, 'smoke');
  }

  /**
   * Create boss death effect
   */
  createBossDeath(x: number, y: number, bossType: string): void {
    const colors = this.getBossDeathColors(bossType);
    this.createEffect(x, y, 'boss_death', { colors });
  }

  /**
   * Create mine explosion effect
   */
  createMineExplosion(x: number, y: number, mineType: string): void {
    const colors = this.getMineExplosionColors(mineType);
    this.createEffect(x, y, 'mine_explosion', { colors });
  }

  /**
   * Get tower-specific muzzle flash colors
   */
  private getTowerMuzzleColors(towerType: string): string[] {
    switch (towerType) {
      case 'laser':
        return ['#00FFFF', '#0080FF', '#FFFFFF'];
      case 'flamethrower':
        return ['#FF4500', '#FF6B35', '#FFD700'];
      case 'mortar':
        return ['#8B4513', '#A0522D', '#CD853F'];
      case 'gatling':
        return ['#FFD700', '#FFA500', '#FFFFFF'];
      default:
        return ['#FFD700', '#FFA500', '#FFFFFF'];
    }
  }

  /**
   * Get boss-specific death colors
   */
  private getBossDeathColors(bossType: string): string[] {
    switch (bossType) {
      case 'demon':
        return ['#8A2BE2', '#FF4500', '#FFD700', '#FF0000'];
      case 'dragon':
        return ['#FF4500', '#FFD700', '#FF6B35', '#FF0000'];
      case 'golem':
        return ['#696969', '#8B4513', '#A0522D', '#CD853F'];
      case 'phoenix':
        return ['#FFD700', '#FF4500', '#FF6B35', '#FF0000'];
      default:
        return ['#FFD700', '#FF4500', '#8A2BE2', '#00FFFF'];
    }
  }

  /**
   * Get mine-specific explosion colors
   */
  private getMineExplosionColors(mineType: string): string[] {
    switch (mineType) {
      case 'emp':
        return ['#00FFFF', '#0080FF', '#FFFFFF', '#C0C0C0'];
      case 'sticky':
        return ['#8B4513', '#A0522D', '#CD853F', '#D2B48C'];
      case 'chain':
        return ['#FFD700', '#FFA500', '#FF4500', '#FF0000'];
      default:
        return ['#FF6B35', '#F59E0B', '#EF4444', '#FFD700'];
    }
  }

  /**
   * Destroy a particle and untrack it from the lifecycle manager
   */
  private destroyParticle(particle: EnhancedParticle): void {
    this.lifecycle.untrack(particle.id);
  }

  /**
   * Update all particles with enhanced physics
   */
  update(deltaTime: number): void {
    const normalizedDelta = deltaTime * 0.016; // 60fps normalized

    // Update particles in reverse order for safe removal
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update position with gravity
      particle.x += particle.velocityX * normalizedDelta;
      particle.y += particle.velocityY * normalizedDelta;
      particle.velocityY += particle.gravity * normalizedDelta;
      
      // Update rotation
      particle.rotation += particle.rotationSpeed * normalizedDelta;
      
      // Update life and opacity
      particle.life -= deltaTime;
      
      // Calculate opacity based on fade type
      const lifeRatio = particle.life / particle.maxLife;
      switch (particle.fadeType) {
        case 'linear':
          particle.opacity = Math.max(0, lifeRatio);
          break;
        case 'ease_out':
          particle.opacity = Math.max(0, lifeRatio * lifeRatio);
          break;
        case 'pulse':
          particle.opacity = Math.max(0, lifeRatio * (0.5 + 0.5 * Math.sin(lifeRatio * Math.PI * 4)));
          break;
      }
      
      if (particle.life <= 0) {
        this.destroyParticle(particle);
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Render particles with enhanced visual effects
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (this.particles.length === 0) return;

    ctx.save();
    
    for (const particle of this.particles) {
      ctx.globalAlpha = particle.opacity;
      
      // Apply glow effect
      if (particle.glowIntensity > 0) {
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = particle.glowIntensity * 10;
      }
      
      ctx.fillStyle = particle.color;
      
      // Draw particle with rotation
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      
      // Draw different shapes based on type
      switch (particle.type) {
        case 'hit_flash':
        case 'muzzle_flash':
          // Star shape for flash effects
          this.drawStar(ctx, 0, 0, particle.size, particle.size * 0.5, 4);
          break;
        case 'smoke':
          // Cloud shape for smoke
          this.drawCloud(ctx, 0, 0, particle.size);
          break;
        default:
          // Circle for most effects
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fill();
      }
      
      ctx.restore();
    }
    
    ctx.restore();
  }

  /**
   * Draw a star shape
   */
  private drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, outerRadius: number, innerRadius: number, points: number): void {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Draw a cloud shape
   */
  private drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.arc(x + radius * 0.5, y, radius * 0.7, 0, Math.PI * 2);
    ctx.arc(x - radius * 0.5, y, radius * 0.7, 0, Math.PI * 2);
    ctx.arc(x, y - radius * 0.3, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
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
    for (const particle of this.particles) {
      this.destroyParticle(particle);
    }
    this.particles.length = 0;
  }

  /**
   * Set performance mode
   */
  setPerformanceMode(enabled: boolean): void {
    this.performanceMode = enabled;
    if (enabled) {
      this.maxParticles = 40; // Reduce particle limit in performance mode
    } else {
      this.maxParticles = 80;
    }
  }
} 