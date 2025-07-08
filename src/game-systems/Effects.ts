/**
 * 🎆 Simplified Effects System
 * High-performance effects with minimal overhead
 */

import { playSound } from '../utils/sound/soundEffects';
import { EffectRenderer } from './effects-system/EffectRenderer';

export interface VisualEffect {
  id: string;
  type: string;
  x: number;
  y: number;
  timeRemaining: number;
  duration: number;
  size: number;
  color: string;
  intensity: number;
}

export class Effects {
  private static instance: Effects | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationId: number | null = null;
  private lastTime = 0;
  private effectRenderer: EffectRenderer;
  private activeEffects: VisualEffect[] = [];
  private effectId = 0;

  private constructor() {
    this.effectRenderer = new EffectRenderer();
    this.initCanvas();
  }

  static getInstance(): Effects {
    if (!Effects.instance) {
      Effects.instance = new Effects();
    }
    return Effects.instance;
  }

  private initCanvas(): void {
    this.canvas = document.getElementById('effects-canvas') as HTMLCanvasElement;
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'effects-canvas';
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '100';
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      document.body.appendChild(this.canvas);
    }
    
    this.ctx = this.canvas.getContext('2d');
    
    // Handle resize
    window.addEventListener('resize', () => {
      if (this.canvas) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      }
    });
  }

  private startAnimation(): void {
    if (!this.animationId) {
      this.lastTime = performance.now();
      this.animationId = requestAnimationFrame((time) => this.render(time));
    }
  }

  private render(currentTime: number): void {
    if (!this.ctx || !this.canvas) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and render simplified effects
    this.effectRenderer.update(deltaTime);
    this.effectRenderer.render(this.ctx);

    // Update and render traditional effects
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i];
      effect.timeRemaining -= deltaTime;

      if (effect.timeRemaining <= 0) {
        this.activeEffects.splice(i, 1);
        continue;
      }

      this.renderEffect(effect, deltaTime);
    }

    // Continue animation if there are active effects or particles
    if (this.activeEffects.length > 0 || this.effectRenderer.getParticleCount() > 0) {
      this.animationId = requestAnimationFrame((time) => this.render(time));
    } else {
      this.animationId = null;
    }
  }

  private renderEffect(effect: VisualEffect, _deltaTime: number): void {
    if (!this.ctx) return;

    const progress = 1 - (effect.timeRemaining / effect.duration);
    const alpha = Math.sin(progress * Math.PI);
    
    this.ctx.save();
    this.ctx.globalAlpha = alpha * effect.intensity;
    this.ctx.fillStyle = effect.color;
    
    // Simple circle effect
    const size = effect.size * (1 + progress * 0.3);
    this.ctx.beginPath();
    this.ctx.arc(effect.x, effect.y, size, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }

  private createEffect(type: string, x: number, y: number, duration: number, options: {
    size: number;
    color: string;
    intensity: number;
  }): void {
    const effect: VisualEffect = {
      id: `effect_${this.effectId++}`,
      type,
      x,
      y,
      timeRemaining: duration,
      duration,
      size: options.size,
      color: options.color,
      intensity: options.intensity
    };

    this.activeEffects.push(effect);
    this.startAnimation();
  }

  // === PUBLIC STATIC METHODS ===

  // Shooting effect for towers - simplified
  static createShootingEffect(fromX: number, fromY: number, toX: number, toY: number, towerType = 'basic'): void {
    const instance = Effects.getInstance();
    
    // Use simplified effect renderer
    instance.effectRenderer.createShootingEffect(fromX, fromY, toX, toY, towerType);
    
    // Start animation if not running
    instance.startAnimation();
    
    // Sound effect
    playSound('tower-attack-sniper');
  }

  // Explosion effect - simplified
  static createExplosionEffect(x: number, y: number, radius = 30): void {
    const instance = Effects.getInstance();
    
    // Use simplified effect renderer
    instance.effectRenderer.createExplosionEffect(x, y, radius);
    
    // Start animation if not running
    instance.startAnimation();
    
    playSound('explosion-large');
  }

  // Tower placement effect - simplified
  static createTowerPlacementEffect(x: number, y: number): void {
    const instance = Effects.getInstance();
    
    // Use simplified effect renderer
    instance.effectRenderer.createTowerPlacementEffect(x, y);
    
    // Start animation if not running
    instance.startAnimation();
    
    playSound('tower-create-sound');
  }

  // Enemy damage effect - simplified  
  static createEnemyDamageEffect(x: number, y: number, damage: number): void {
    const instance = Effects.getInstance();
    
    // Use simplified effect renderer
    instance.effectRenderer.createEnemyDamageEffect(x, y, damage);
    
    // Start animation if not running
    instance.startAnimation();
  }

  // Status effect (slow, freeze, etc.) - simplified
  static createStatusEffect(x: number, y: number, type: 'slow' | 'freeze' | 'heal' | 'shield'): void {
    const instance = Effects.getInstance();
    
    // Use simplified effect renderer for basic types
    if (type === 'slow' || type === 'freeze' || type === 'heal') {
      instance.effectRenderer.createStatusEffect(x, y, type);
    } else {
      // Shield effect using traditional method
      instance.createEffect('status', x, y, 500, {
        size: 20,
        color: '#FFD700',
        intensity: 0.8
      });
    }
    
    // Start animation if not running
    instance.startAnimation();
    
    // Play appropriate sound
    const sounds = {
      slow: 'slow-effect',
      freeze: 'freeze-effect',
      heal: 'pickup-common',
      shield: 'shield-activate'
    };
    playSound(sounds[type]);
  }

  // Weather effect
  static createWeatherEffect(x: number, y: number, weatherType: string): void {
    const instance = Effects.getInstance();
    
    // Use simplified effect renderer
    instance.effectRenderer.createWeatherEffect(x, y, weatherType);
    
    // Start animation if not running
    instance.startAnimation();
  }

  // Boss ability effect
  static createBossAbilityEffect(x: number, y: number, abilityType: string): void {
    const instance = Effects.getInstance();
    
    // Use simplified effect renderer
    instance.effectRenderer.createBossAbilityEffect(x, y, abilityType);
    
    // Start animation if not running
    instance.startAnimation();
  }

  // Get particle count for performance monitoring
  static getParticleCount(): number {
    const instance = Effects.getInstance();
    return instance.effectRenderer.getParticleCount();
  }

  // Clear all effects including particles
  static clearAllEffects(): void {
    const instance = Effects.getInstance();
    instance.activeEffects.length = 0;
    instance.effectRenderer.clear();
  }

  // Performance monitoring
  static getPerformanceStats(): {
    activeEffects: number;
    particleCount: number;
    isAnimating: boolean;
  } {
    const instance = Effects.getInstance();
    return {
      activeEffects: instance.activeEffects.length,
      particleCount: instance.effectRenderer.getParticleCount(),
      isAnimating: instance.animationId !== null
    };
  }
} 