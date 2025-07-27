import type { Enemy } from '../../models/gameTypes';
import { useGameStore } from '../../models/store';
import { playSound } from '../../utils/sound';


/**
 * Boss Phase Manager
 * Follows SOLID principles with single responsibility for phase transitions
 */
export class BossPhaseManager {
  private static phaseTransitionTimers: Map<string, number> = new Map();
  private static lastPhaseTransitions: Map<string, number> = new Map();

  /**
   * Initialize the phase manager
   */
  static initialize(): void {
    this.phaseTransitionTimers.clear();
    this.lastPhaseTransitions.clear();
  }

  /**
   * Check and handle phase transitions for a boss
   */
  static updateBossPhase(boss: Enemy): void {
    if (!this.isValidBoss(boss)) return;

    const healthPercentage = boss.health / boss.maxHealth;
    const currentPhase = boss.bossPhase || 1;
    const maxPhases = boss.maxBossPhases || 1;

    // Check for phase transitions
    for (let phase = currentPhase; phase < maxPhases; phase++) {
      const threshold = boss.phaseTransitionThresholds?.[phase - 1];
      if (threshold && healthPercentage <= threshold) {
        this.triggerPhaseTransition(boss, phase + 1);
        break;
      }
    }
  }

  /**
   * Trigger a phase transition with visual and audio cues
   */
  private static triggerPhaseTransition(boss: Enemy, newPhase: number): void {
    const now = performance.now();
    const lastTransition = this.lastPhaseTransitions.get(boss.id) || 0;

    // Prevent multiple transitions in short time (2 second cooldown)
    if (now - lastTransition < 2000) return;

    // Record transition time
    this.lastPhaseTransitions.set(boss.id, now);

    // Set cinematic state
    boss.cinematicState = 'phase_transition';
    boss.cinematicStartTime = now;
    boss.isInvulnerable = true;

    // Play phase transition sound
    this.playPhaseTransitionSound(boss.bossType);

    // Create visual effects
    this.createPhaseTransitionEffects(boss, newPhase);

    // Apply phase changes
    this.applyPhaseChanges(boss, newPhase);

    // Set timer to complete transition
    const transitionDuration = this.getPhaseTransitionDuration(boss.bossType);
    const timer = setTimeout(() => {
      this.completePhaseTransition(boss);
      this.phaseTransitionTimers.delete(boss.id);
    }, transitionDuration);

    this.phaseTransitionTimers.set(boss.id, timer);

    // Log phase transition
    // Boss phase logging removed for production optimization
  }

  /**
   * Apply phase-specific behavior changes
   */
  private static applyPhaseChanges(boss: Enemy, phase: number): void {
    switch (phase) {
      case 2:
        // Phase 2: Increase movement speed slightly
        boss.speed = Math.floor(boss.speed * 1.2);
        boss.damage = Math.floor(boss.damage * 1.3);
        this.updateBossColor(boss, phase);
        break;
      case 3:
        // Phase 3: Unlock special attacks
        boss.speed = Math.floor(boss.speed * 1.4);
        boss.damage = Math.floor(boss.damage * 1.6);
        boss.rageMode = true;
        this.updateBossColor(boss, phase);
        break;
      default:
        // Additional phases
        boss.speed = Math.floor(boss.speed * 1.1);
        boss.damage = Math.floor(boss.damage * 1.2);
        break;
    }

    // Update boss phase
    boss.bossPhase = phase;
  }

  /**
   * Update boss color based on phase
   */
  private static updateBossColor(boss: Enemy, phase: number): void {
    const baseColor = boss.color;
    const phaseColors = {
      1: baseColor,
      2: this.adjustColorBrightness(baseColor, 1.2),
      3: this.adjustColorBrightness(baseColor, 1.4)
    };

    boss.color = phaseColors[phase as keyof typeof phaseColors] || baseColor;
  }

  /**
   * Adjust color brightness
   */
  private static adjustColorBrightness(color: string, factor: number): string {
    // Simple color adjustment - in a real implementation, you'd use a proper color library
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      
      const newR = Math.min(255, Math.floor(r * factor));
      const newG = Math.min(255, Math.floor(g * factor));
      const newB = Math.min(255, Math.floor(b * factor));
      
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    return color;
  }

  /**
   * Create visual effects for phase transition
   */
  private static createPhaseTransitionEffects(boss: Enemy, phase: number): void {
    const { addEffect } = useGameStore.getState();

    // Screen shake effect
    this.triggerScreenShake(boss.bossType);

    // Glow pulse effect
    addEffect({
      id: `boss_phase_effect_${boss.id}`,
      position: boss.position,
      radius: boss.size * 3,
      color: this.getPhaseEffectColor(phase),
      life: this.getPhaseTransitionDuration(boss.bossType),
      maxLife: this.getPhaseTransitionDuration(boss.bossType),
      type: 'phase_transition',
      opacity: 0.9,
      scale: 3.0,
    });

    // Additional particle effects
    this.createPhaseParticles(boss, phase);
  }

  /**
   * Create particle effects for phase transition
   */
  private static createPhaseParticles(boss: Enemy, phase: number): void {
    const { addEffect } = useGameStore.getState();
    const particleCount = phase * 5; // More particles for higher phases

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = boss.size * 2;
      
      addEffect({
        id: `boss_particle_${boss.id}_${i}`,
        position: {
          x: boss.position.x + Math.cos(angle) * distance,
          y: boss.position.y + Math.sin(angle) * distance
        },
        radius: 3,
        color: this.getPhaseEffectColor(phase),
        life: 1000,
        maxLife: 1000,
        type: 'particle',
        opacity: 0.7,
        scale: 1.0,
      });
    }
  }

  /**
   * Get phase effect color
   */
  private static getPhaseEffectColor(phase: number): string {
    const colors = {
      1: '#ff6b35',
      2: '#ff4757',
      3: '#ff3838'
    };
    return colors[phase as keyof typeof colors] || '#ff6b35';
  }

  /**
   * Trigger screen shake effect
   */
  private static triggerScreenShake(bossType?: string): void {
    const intensity = bossType === 'legendary' ? 15 : bossType === 'major' ? 10 : 5;
    
    // Dispatch custom event for screen shake
    const event = new CustomEvent('screenShake', { 
      detail: { intensity, duration: 600 } 
    });
    window.dispatchEvent(event);
  }

  /**
   * Play phase transition sound
   */
  private static playPhaseTransitionSound(bossType?: string): void {
    const soundMap = {
      legendary: 'boss-phase-transition-legendary',
      major: 'boss-phase-transition-major',
      mini: 'boss-phase-transition-mini'
    };
    
    const soundName = soundMap[bossType as keyof typeof soundMap] || 'boss-phase-transition';
    playSound(soundName);
  }

  /**
   * Get phase transition duration based on boss type
   */
  private static getPhaseTransitionDuration(bossType?: string): number {
    const durations = {
      legendary: 3000,
      major: 2500,
      mini: 2000
    };
    return durations[bossType as keyof typeof durations] || 2000;
  }

  /**
   * Complete phase transition
   */
  private static completePhaseTransition(boss: Enemy): void {
    boss.isInvulnerable = false;
    boss.cinematicState = 'normal';
  }

  /**
   * Validate if enemy is a valid boss
   */
  private static isValidBoss(boss: Enemy): boolean {
    return !!(
      boss.bossType &&
      boss.health &&
      boss.maxHealth &&
      boss.phaseTransitionThresholds &&
      boss.phaseTransitionThresholds.length > 0
    );
  }

  /**
   * Clean up resources
   */
  static cleanup(): void {
    // Clear all timers
    this.phaseTransitionTimers.forEach(timer => clearTimeout(timer));
    this.phaseTransitionTimers.clear();
    this.lastPhaseTransitions.clear();
  }
} 