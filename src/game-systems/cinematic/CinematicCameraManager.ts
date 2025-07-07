// import { useGameStore } from '../../models/store';

export interface CameraState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  shakeIntensity: number;
  shakeDuration: number;
  shakeStartTime: number;
  isShaking: boolean;
  targetX: number;
  targetY: number;
  targetScale: number;
  targetRotation: number;
  transitionDuration: number;
  transitionStartTime: number;
  isTransitioning: boolean;
}

export interface CinematicEvent {
  id: string;
  type: 'zoom' | 'shake' | 'slow_motion' | 'flythrough' | 'focus' | 'dramatic_angle';
  duration: number;
  intensity?: number;
  targetPosition?: { x: number; y: number };
  targetScale?: number;
  targetRotation?: number;
  startTime: number;
  isActive: boolean;
}

export class CinematicCameraManager {
  private static instance: CinematicCameraManager;
  private cameraState: CameraState;
  private cinematicEvents: Map<string, CinematicEvent> = new Map();
  private gameTime: number = 0;

  private constructor() {
    this.cameraState = {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      shakeIntensity: 0,
      shakeDuration: 0,
      shakeStartTime: 0,
      isShaking: false,
      targetX: 0,
      targetY: 0,
      targetScale: 1,
      targetRotation: 0,
      transitionDuration: 0,
      transitionStartTime: 0,
      isTransitioning: false,
    };
  }

  public static getInstance(): CinematicCameraManager {
    if (!CinematicCameraManager.instance) {
      CinematicCameraManager.instance = new CinematicCameraManager();
    }
    return CinematicCameraManager.instance;
  }

  /**
   * Update camera state
   */
  public update(currentTime: number): void {
    this.gameTime = currentTime;
    this.updateShake(currentTime);
    this.updateTransitions(currentTime);
    this.updateCinematicEvents(currentTime);
  }

  /**
   * Trigger camera shake
   */
  public triggerShake(intensity: number, duration: number): void {
    this.cameraState.shakeIntensity = intensity;
    this.cameraState.shakeDuration = duration;
    this.cameraState.shakeStartTime = this.gameTime;
    this.cameraState.isShaking = true;
  }

  /**
   * Trigger dramatic zoom
   */
  public triggerZoom(targetScale: number, duration: number, targetPosition?: { x: number; y: number }): void {
    this.startTransition({
      targetScale,
      targetPosition,
      duration,
      type: 'zoom'
    });
  }

  /**
   * Trigger slow motion effect
   */
  public triggerSlowMotion(duration: number, timeScale: number = 0.3): void {
    const event: CinematicEvent = {
      id: `slow_motion_${Date.now()}`,
      type: 'slow_motion',
      duration,
      intensity: timeScale,
      startTime: this.gameTime,
      isActive: true,
    };

    this.cinematicEvents.set(event.id, event);
    
    // Apply slow motion effect through game state
    // Note: Game time scale will be handled by the game loop
    console.log(`🎬 Cinematic: Slow motion activated for ${duration}ms with scale ${timeScale}`);

    // Reset after duration
    setTimeout(() => {
      console.log('🎬 Cinematic: Slow motion deactivated');
      this.cinematicEvents.delete(event.id);
    }, duration);
  }

  /**
   * Trigger dramatic angle change
   */
  public triggerDramaticAngle(targetRotation: number, duration: number): void {
    this.startTransition({
      targetRotation,
      duration,
      type: 'dramatic_angle'
    });
  }

  /**
   * Focus camera on specific position
   */
  public focusOnPosition(x: number, y: number, scale: number = 1.2, duration: number = 2000): void {
    this.startTransition({
      targetPosition: { x, y },
      targetScale: scale,
      duration,
      type: 'focus'
    });
  }

  /**
   * Trigger boss entrance cinematic
   */
  public triggerBossEntrance(bossPosition: { x: number; y: number }): void {
    // Dramatic zoom out
    this.triggerZoom(0.7, 1000, { x: 960, y: 540 });
    
    // Shake effect
    setTimeout(() => {
      this.triggerShake(15, 2000);
    }, 500);
    
    // Focus on boss
    setTimeout(() => {
      this.focusOnPosition(bossPosition.x, bossPosition.y, 1.5, 1500);
    }, 1500);
  }

  /**
   * Trigger victory cinematic
   */
  public triggerVictoryCinematic(): void {
    // Slow motion
    this.triggerSlowMotion(3000, 0.5);
    
    // Dramatic zoom out
    setTimeout(() => {
      this.triggerZoom(0.8, 2000, { x: 960, y: 540 });
    }, 500);
    
    // Shake celebration
    setTimeout(() => {
      this.triggerShake(10, 1000);
    }, 1500);
  }

  /**
   * Trigger defeat cinematic
   */
  public triggerDefeatCinematic(): void {
    // Dramatic angle
    this.triggerDramaticAngle(5, 2000);
    
    // Slow motion
    setTimeout(() => {
      this.triggerSlowMotion(4000, 0.3);
    }, 500);
    
    // Zoom in on last tower
    setTimeout(() => {
      this.focusOnPosition(960, 540, 1.8, 3000);
    }, 1000);
  }

  /**
   * Trigger last tower focus
   */
  public triggerLastTowerFocus(towerPosition: { x: number; y: number }): void {
    this.focusOnPosition(towerPosition.x, towerPosition.y, 1.6, 2000);
    
    // Subtle shake
    setTimeout(() => {
      this.triggerShake(8, 1500);
    }, 1000);
  }

  /**
   * Trigger achievement celebration
   */
  public triggerAchievementCelebration(achievementPosition: { x: number; y: number }): void {
    // Quick zoom to achievement
    this.focusOnPosition(achievementPosition.x, achievementPosition.y, 1.4, 800);
    
    // Celebration shake
    setTimeout(() => {
      this.triggerShake(12, 1200);
    }, 400);
    
    // Return to normal
    setTimeout(() => {
      this.triggerZoom(1.0, 1000, { x: 960, y: 540 });
    }, 1200);
  }

  /**
   * Get current camera transform
   */
  public getCameraTransform(): string {
    const { x, y, scale, rotation, shakeIntensity, isShaking } = this.cameraState;
    
    let shakeX = 0;
    let shakeY = 0;
    
    if (isShaking && shakeIntensity > 0) {
      const shakeProgress = (this.gameTime - this.cameraState.shakeStartTime) / this.cameraState.shakeDuration;
      const shakeDecay = Math.max(0, 1 - shakeProgress);
      const shakeAmount = shakeIntensity * shakeDecay;
      
      shakeX = (Math.random() - 0.5) * shakeAmount;
      shakeY = (Math.random() - 0.5) * shakeAmount;
    }

    return `translate(${x + shakeX}px, ${y + shakeY}px) scale(${scale}) rotate(${rotation}deg)`;
  }

  /**
   * Reset camera to default state
   */
  public resetCamera(): void {
    this.startTransition({
      targetPosition: { x: 0, y: 0 },
      targetScale: 1,
      targetRotation: 0,
      duration: 1000,
      type: 'reset'
    });
  }

  /**
   * Update shake effect
   */
  private updateShake(currentTime: number): void {
    if (!this.cameraState.isShaking) return;

    const shakeProgress = (currentTime - this.cameraState.shakeStartTime) / this.cameraState.shakeDuration;
    
    if (shakeProgress >= 1) {
      this.cameraState.isShaking = false;
      this.cameraState.shakeIntensity = 0;
    }
  }

  /**
   * Update camera transitions
   */
  private updateTransitions(currentTime: number): void {
    if (!this.cameraState.isTransitioning) return;

    const transitionProgress = (currentTime - this.cameraState.transitionStartTime) / this.cameraState.transitionDuration;
    
    if (transitionProgress >= 1) {
      // Transition complete
      this.cameraState.x = this.cameraState.targetX;
      this.cameraState.y = this.cameraState.targetY;
      this.cameraState.scale = this.cameraState.targetScale;
      this.cameraState.rotation = this.cameraState.targetRotation;
      this.cameraState.isTransitioning = false;
    } else {
      // Ease transition
      const easeProgress = this.easeInOutCubic(transitionProgress);
      this.cameraState.x = this.lerp(this.cameraState.x, this.cameraState.targetX, easeProgress);
      this.cameraState.y = this.lerp(this.cameraState.y, this.cameraState.targetY, easeProgress);
      this.cameraState.scale = this.lerp(this.cameraState.scale, this.cameraState.targetScale, easeProgress);
      this.cameraState.rotation = this.lerp(this.cameraState.rotation, this.cameraState.targetRotation, easeProgress);
    }
  }

  /**
   * Update cinematic events
   */
  private updateCinematicEvents(currentTime: number): void {
    for (const [id, event] of this.cinematicEvents) {
      const eventProgress = (currentTime - event.startTime) / event.duration;
      
      if (eventProgress >= 1) {
        this.cinematicEvents.delete(id);
      }
    }
  }

  /**
   * Start camera transition
   */
  private startTransition(params: {
    targetPosition?: { x: number; y: number };
    targetScale?: number;
    targetRotation?: number;
    duration: number;
    type: string;
  }): void {
    const { targetPosition, targetScale, targetRotation, duration } = params;
    
    this.cameraState.targetX = targetPosition?.x ?? this.cameraState.x;
    this.cameraState.targetY = targetPosition?.y ?? this.cameraState.y;
    this.cameraState.targetScale = targetScale ?? this.cameraState.scale;
    this.cameraState.targetRotation = targetRotation ?? this.cameraState.rotation;
    this.cameraState.transitionDuration = duration;
    this.cameraState.transitionStartTime = this.gameTime;
    this.cameraState.isTransitioning = true;
  }

  /**
   * Linear interpolation
   */
  private lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  /**
   * Easing function
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Get current camera state
   */
  public getCameraState(): CameraState {
    return { ...this.cameraState };
  }

  /**
   * Check if camera is in cinematic mode
   */
  public isInCinematicMode(): boolean {
    return this.cameraState.isTransitioning || this.cameraState.isShaking || this.cinematicEvents.size > 0;
  }
} 