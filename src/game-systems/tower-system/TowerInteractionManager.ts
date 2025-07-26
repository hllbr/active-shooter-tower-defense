import { useGameStore } from '../../models/store';
import type { _TowerSlot } from '../../models/gameTypes';

/**
 * TowerInteractionManager
 * 
 * Manages tower interaction states and behaviors following SOLID principles:
 * - Single Responsibility: Handles only tower interaction logic
 * - Open/Closed: Extensible for new interaction types
 * - Liskov Substitution: Consistent interface for different interaction states
 * - Interface Segregation: Separate interfaces for hover vs click behaviors
 * - Dependency Inversion: Depends on abstractions (game store) not concrete implementations
 */
export class TowerInteractionManager {
  private static instance: TowerInteractionManager;
  private hoveredSlot: number | null = null;
  private selectedSlot: number | null = null;
  private clickTimeout: number | null = null;
  private hoverTimeout: number | null = null;

  private constructor() {
    this.initializeEventListeners();
  }

  public static getInstance(): TowerInteractionManager {
    if (!TowerInteractionManager.instance) {
      TowerInteractionManager.instance = new TowerInteractionManager();
    }
    return TowerInteractionManager.instance;
  }

  /**
   * Initialize global event listeners for interaction management
   */
  private initializeEventListeners(): void {
    // Global click handler to deselect when clicking elsewhere
    document.addEventListener('click', this.handleGlobalClick.bind(this));
    
    // Global mouse move handler to clear hover when moving away
    document.addEventListener('mousemove', this.handleGlobalMouseMove.bind(this));
  }

  /**
   * Handle tower hover start
   * @param slotIdx - The slot index being hovered
   */
  public handleTowerHoverStart(slotIdx: number): void {
    // Clear any existing hover timeout
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }

    this.hoveredSlot = slotIdx;
    
    // Update game store for UI components that need hover state
    const { towerSlots } = useGameStore.getState();
    if (towerSlots[slotIdx]?.tower) {
      // Only show hover effects for towers with actual towers
      this.updateHoverState(slotIdx, true);
    }
  }

  /**
   * Handle tower hover end
   * @param slotIdx - The slot index that was being hovered
   */
  public handleTowerHoverEnd(slotIdx: number): void {
    // Set a small delay to prevent flickering when moving between elements
    this.hoverTimeout = window.setTimeout(() => {
      if (this.hoveredSlot === slotIdx) {
        this.hoveredSlot = null;
        this.updateHoverState(slotIdx, false);
      }
    }, 50);
  }

  /**
   * Handle tower click
   * @param slotIdx - The slot index being clicked
   */
  public handleTowerClick(slotIdx: number): void {
    const { towerSlots, selectSlot } = useGameStore.getState();
    const slot = towerSlots[slotIdx];
    
    if (!slot?.tower) {
      // For empty slots, just select them (for building)
      selectSlot(slotIdx);
      return;
    }

    // For towers, toggle selection
    if (this.selectedSlot === slotIdx) {
      // Deselect if already selected
      selectSlot(null);
      this.selectedSlot = null;
    } else {
      // Select new tower
      selectSlot(slotIdx);
      this.selectedSlot = slotIdx;
    }

    // Clear any pending hover timeouts
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
  }

  /**
   * Handle global click to deselect when clicking elsewhere
   */
  private handleGlobalClick(event: MouseEvent): void {
    // Check if click is on a tower or tower-related element
    const target = event.target as Element;
    const isTowerElement = target.closest('[data-tower-slot]') || 
                          target.closest('[data-tower-controls]') ||
                          target.closest('[data-tower-tooltip]');

    if (!isTowerElement && this.selectedSlot !== null) {
      // Clicked outside tower elements, deselect
      const { selectSlot } = useGameStore.getState();
      selectSlot(null);
      this.selectedSlot = null;
    }
  }

  /**
   * Handle global mouse move to clear hover when moving away from towers
   */
  private handleGlobalMouseMove(event: MouseEvent): void {
    if (this.hoveredSlot === null) return;

    const target = event.target as Element;
    const isTowerElement = target.closest('[data-tower-slot]');

    if (!isTowerElement) {
      // Mouse moved away from tower elements, clear hover
      this.handleTowerHoverEnd(this.hoveredSlot);
    }
  }

  /**
   * Update hover state in the game store
   * @param _slotIdx - The slot index
   * @param _isHovered - Whether the slot is being hovered
   */
  private updateHoverState(_slotIdx: number, _isHovered: boolean): void {
    // This method can be extended to update any hover-related state
    // Currently, individual components handle their own hover state
    // but this provides a centralized place for future hover state management
  }

  /**
   * Get current hover state for a slot
   * @param slotIdx - The slot index to check
   * @returns Whether the slot is currently being hovered
   */
  public isSlotHovered(slotIdx: number): boolean {
    return this.hoveredSlot === slotIdx;
  }

  /**
   * Get current selection state for a slot
   * @param slotIdx - The slot index to check
   * @returns Whether the slot is currently selected
   */
  public isSlotSelected(slotIdx: number): boolean {
    return this.selectedSlot === slotIdx;
  }

  /**
   * Clear all interaction states
   */
  public clearAllStates(): void {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
    
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
    }

    this.hoveredSlot = null;
    this.selectedSlot = null;
  }

  /**
   * Cleanup method to remove event listeners
   */
  public destroy(): void {
    document.removeEventListener('click', this.handleGlobalClick.bind(this));
    document.removeEventListener('mousemove', this.handleGlobalMouseMove.bind(this));
    this.clearAllStates();
  }
}

// Export singleton instance
export const towerInteractionManager = TowerInteractionManager.getInstance(); 