import { responsiveUIManager } from './ResponsiveUIManager';

export interface TouchEvent {
  type: 'tap' | 'doubleTap' | 'longPress' | 'scroll';
  position: { x: number; y: number };
  target: EventTarget | null;
  timestamp: number;
}

export interface TouchHandler {
  onTap?: (event: TouchEvent) => void;
  onDoubleTap?: (event: TouchEvent) => void;
  onLongPress?: (event: TouchEvent) => void;
  onScroll?: (event: TouchEvent) => void;
}

export interface TouchState {
  isPressed: boolean;
  startPosition: { x: number; y: number } | null;
  startTime: number;
  lastTapTime: number;
  tapCount: number;
  longPressTimeout: number | null;
  scrollDistance: number;
}

/**
 * TouchControlManager - Handles touch interactions for mobile/tablet devices
 * Replaces hover-based interactions with touch-friendly alternatives
 */
export class TouchControlManager {
  private touchState: TouchState;
  private handlers: Map<EventTarget, TouchHandler> = new Map();
  private touchConfig = responsiveUIManager.getTouchConfig();

  constructor() {
    this.touchState = {
      isPressed: false,
      startPosition: null,
      startTime: 0,
      lastTapTime: 0,
      tapCount: 0,
      longPressTimeout: null,
      scrollDistance: 0
    };

    this.initializeGlobalListeners();
  }

  /**
   * Initialize global touch event listeners
   */
  private initializeGlobalListeners(): void {
    if (typeof window === 'undefined') return;

    // Prevent zoom on double-tap
    if (this.touchConfig.preventZoom) {
      let lastTouchEnd = 0;
      document.addEventListener('touchend', (event) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      }, { passive: false });
    }

    // Global touch start
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
  }

  /**
   * Handle touch start event
   */
  private handleTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    const position = { x: touch.clientX, y: touch.clientY };
    const timestamp = Date.now();

    this.touchState.isPressed = true;
    this.touchState.startPosition = position;
    this.touchState.startTime = timestamp;
    this.touchState.scrollDistance = 0;

    // Start long press timer
    this.touchState.longPressTimeout = window.setTimeout(() => {
      this.handleLongPress(event, position, timestamp);
    }, this.touchConfig.longPressDelay);

    // Check for double tap
    if (timestamp - this.touchState.lastTapTime < this.touchConfig.doubleTapDelay) {
      this.touchState.tapCount++;
    } else {
      this.touchState.tapCount = 1;
    }
  }

  /**
   * Handle touch end event
   */
  private handleTouchEnd(event: TouchEvent): void {
    if (!this.touchState.isPressed) return;

    const touch = event.changedTouches[0];
    const position = { x: touch.clientX, y: touch.clientY };
    const timestamp = Date.now();
    const duration = timestamp - this.touchState.startTime;

    // Clear long press timer
    if (this.touchState.longPressTimeout) {
      clearTimeout(this.touchState.longPressTimeout);
      this.touchState.longPressTimeout = null;
    }

    // Check if it's a scroll (significant movement)
    if (this.touchState.scrollDistance > this.touchConfig.scrollThreshold) {
      this.handleScroll(event, position, timestamp);
      this.resetTouchState();
      return;
    }

    // Check for tap vs double tap
    if (duration < this.touchConfig.longPressDelay) {
      if (this.touchState.tapCount === 2) {
        this.handleDoubleTap(event, position, timestamp);
      } else {
        this.handleTap(event, position, timestamp);
      }
    }

    this.resetTouchState();
  }

  /**
   * Handle touch move event
   */
  private handleTouchMove(event: TouchEvent): void {
    if (!this.touchState.isPressed || !this.touchState.startPosition) return;

    const touch = event.touches[0];
    const currentPosition = { x: touch.clientX, y: touch.clientY };
    
    // Calculate scroll distance
    const dx = currentPosition.x - this.touchState.startPosition.x;
    const dy = currentPosition.y - this.touchState.startPosition.y;
    this.touchState.scrollDistance = Math.sqrt(dx * dx + dy * dy);

    // Cancel long press if scrolling
    if (this.touchState.scrollDistance > this.touchConfig.scrollThreshold) {
      if (this.touchState.longPressTimeout) {
        clearTimeout(this.touchState.longPressTimeout);
        this.touchState.longPressTimeout = null;
      }
    }
  }

  /**
   * Handle tap event
   */
  private handleTap(event: TouchEvent, position: { x: number; y: number }, timestamp: number): void {
    const touchEvent: TouchEvent = {
      type: 'tap',
      position,
      target: event.target,
      timestamp
    };

    // Find and call appropriate handler
    const target = event.target as EventTarget;
    const handler = this.handlers.get(target);
    if (handler?.onTap) {
      handler.onTap(touchEvent);
    }

    // Provide haptic feedback
    this.provideHapticFeedback();
  }

  /**
   * Handle double tap event
   */
  private handleDoubleTap(event: TouchEvent, position: { x: number; y: number }, timestamp: number): void {
    const touchEvent: TouchEvent = {
      type: 'doubleTap',
      position,
      target: event.target,
      timestamp
    };

    // Find and call appropriate handler
    const target = event.target as EventTarget;
    const handler = this.handlers.get(target);
    if (handler?.onDoubleTap) {
      handler.onDoubleTap(touchEvent);
    }

    // Provide haptic feedback
    this.provideHapticFeedback();
  }

  /**
   * Handle long press event
   */
  private handleLongPress(event: TouchEvent, position: { x: number; y: number }, timestamp: number): void {
    const touchEvent: TouchEvent = {
      type: 'longPress',
      position,
      target: event.target,
      timestamp
    };

    // Find and call appropriate handler
    const target = event.target as EventTarget;
    const handler = this.handlers.get(target);
    if (handler?.onLongPress) {
      handler.onLongPress(touchEvent);
    }

    // Provide haptic feedback
    this.provideHapticFeedback();
  }

  /**
   * Handle scroll event
   */
  private handleScroll(event: TouchEvent, position: { x: number; y: number }, timestamp: number): void {
    const touchEvent: TouchEvent = {
      type: 'scroll',
      position,
      target: event.target,
      timestamp
    };

    // Find and call appropriate handler
    const target = event.target as EventTarget;
    const handler = this.handlers.get(target);
    if (handler?.onScroll) {
      handler.onScroll(touchEvent);
    }
  }

  /**
   * Reset touch state
   */
  private resetTouchState(): void {
    this.touchState.isPressed = false;
    this.touchState.startPosition = null;
    this.touchState.startTime = 0;
    this.touchState.scrollDistance = 0;
    
    if (this.touchState.longPressTimeout) {
      clearTimeout(this.touchState.longPressTimeout);
      this.touchState.longPressTimeout = null;
    }
  }

  /**
   * Provide haptic feedback if available
   */
  private provideHapticFeedback(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }

  /**
   * Register touch handlers for an element
   */
  public registerHandlers(element: EventTarget, handlers: TouchHandler): () => void {
    this.handlers.set(element, handlers);
    
    // Return unregister function
    return () => {
      this.handlers.delete(element);
    };
  }

  /**
   * Unregister touch handlers for an element
   */
  public unregisterHandlers(element: EventTarget): void {
    this.handlers.delete(element);
  }

  /**
   * Update touch configuration
   */
  public updateTouchConfig(config: Partial<typeof this.touchConfig>): void {
    this.touchConfig = { ...this.touchConfig, ...config };
  }

  /**
   * Check if element should use touch controls
   */
  public shouldUseTouchControls(element: HTMLElement): boolean {
    return responsiveUIManager.isTouchDevice() && 
           !element.hasAttribute('data-disable-touch');
  }

  /**
   * Get optimal tap target size for current device
   */
  public getOptimalTapTargetSize(): number {
    return responsiveUIManager.getOptimalTapTargetSize();
  }

  /**
   * Apply touch-friendly styles to an element
   */
  public applyTouchStyles(element: HTMLElement): void {
    if (!this.shouldUseTouchControls(element)) return;

    const tapTargetSize = this.getOptimalTapTargetSize();
    
    element.style.minHeight = `${tapTargetSize}px`;
    element.style.minWidth = `${tapTargetSize}px`;
    element.style.touchAction = 'manipulation';
    element.style.userSelect = 'none';
    element.style.webkitUserSelect = 'none';
    element.style.webkitTouchCallout = 'none';
  }

  /**
   * Remove touch-friendly styles from an element
   */
  public removeTouchStyles(element: HTMLElement): void {
    element.style.minHeight = '';
    element.style.minWidth = '';
    element.style.touchAction = '';
    element.style.userSelect = '';
    element.style.webkitUserSelect = '';
    element.style.webkitTouchCallout = '';
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.handlers.clear();
    this.resetTouchState();
  }
}

// Singleton instance
export const touchControlManager = new TouchControlManager();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    touchControlManager.destroy();
  });
} 