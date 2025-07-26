import { useRef, useEffect, useCallback } from 'react';
import { touchControlManager, type TouchHandler, type TouchEvent } from './TouchControlManager';
import { useResponsiveUI } from './useResponsiveUI';

/**
 * React hook for touch controls
 * Replaces hover-based interactions with touch-friendly alternatives
 */
export const useTouchControls = (handlers: TouchHandler) => {
  const elementRef = useRef<HTMLElement>(null);
  const { isTouchDevice, shouldDisableHover } = useResponsiveUI();
  const unregisterRef = useRef<(() => void) | null>(null);

  // Register touch handlers when element is available
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !isTouchDevice()) return;

    // Apply touch-friendly styles
    touchControlManager.applyTouchStyles(element);

    // Register touch handlers
    unregisterRef.current = touchControlManager.registerHandlers(element, handlers);

    // Cleanup on unmount
    return () => {
      if (unregisterRef.current) {
        unregisterRef.current();
        unregisterRef.current = null;
      }
      touchControlManager.removeTouchStyles(element);
    };
  }, [handlers, isTouchDevice]);

  // Enhanced click handler that works with touch
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (isTouchDevice()) {
      // For touch devices, let the touch manager handle it
      return;
    }

    // For mouse devices, simulate tap
    const touchEvent: TouchEvent = {
      type: 'tap',
      position: { x: event.clientX, y: event.clientY },
      target: event.target,
      timestamp: Date.now()
    };

    handlers.onTap?.(touchEvent);
  }, [handlers, isTouchDevice]);

  // Enhanced mouse enter handler (disabled for touch devices)
  const handleMouseEnter = useCallback((event: React.MouseEvent) => {
    if (shouldDisableHover()) return;

    // Only apply hover effects for mouse devices
    const element = event.currentTarget as HTMLElement;
    element.style.transform = 'scale(1.05)';
    element.style.transition = 'transform 0.2s ease';
  }, [shouldDisableHover]);

  // Enhanced mouse leave handler (disabled for touch devices)
  const handleMouseLeave = useCallback((event: React.MouseEvent) => {
    if (shouldDisableHover()) return;

    // Reset hover effects for mouse devices
    const element = event.currentTarget as HTMLElement;
    element.style.transform = 'scale(1)';
  }, [shouldDisableHover]);

  return {
    elementRef,
    handleClick,
    handleMouseEnter,
    handleMouseLeave,
    isTouchDevice,
    shouldDisableHover
  };
};

/**
 * Hook for tower interaction controls (replaces hover-based controls)
 */
export const useTowerTouchControls = (
  onUpgrade?: () => void,
  onRepair?: () => void,
  onDelete?: () => void,
  onMove?: () => void
) => {
  const { isTouchDevice } = useResponsiveUI();

  const handleUpgradeTap = useCallback(() => {
    onUpgrade?.();
  }, [onUpgrade]);

  const handleRepairTap = useCallback(() => {
    onRepair?.();
  }, [onRepair]);

  const handleDeleteTap = useCallback(() => {
    onDelete?.();
  }, [onDelete]);

  const handleMoveTap = useCallback(() => {
    onMove?.();
  }, [onMove]);

  // Double-tap for quick upgrade
  const handleUpgradeDoubleTap = useCallback(() => {
    onUpgrade?.();
  }, [onUpgrade]);

  // Long press for delete confirmation
  const handleDeleteLongPress = useCallback(() => {
    if (confirm('Are you sure you want to delete this tower?')) {
      onDelete?.();
    }
  }, [onDelete]);

  return {
    isTouchDevice,
    upgradeHandlers: {
      onTap: handleUpgradeTap,
      onDoubleTap: handleUpgradeDoubleTap
    },
    repairHandlers: {
      onTap: handleRepairTap
    },
    deleteHandlers: {
      onTap: handleDeleteTap,
      onLongPress: handleDeleteLongPress
    },
    moveHandlers: {
      onTap: handleMoveTap
    }
  };
};

/**
 * Hook for button touch controls
 */
export const useButtonTouchControls = (onClick?: () => void) => {
  const { isTouchDevice } = useResponsiveUI();

  const handleTap = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const handleDoubleTap = useCallback(() => {
    // Double-tap for quick action (optional)
    onClick?.();
  }, [onClick]);

  return {
    isTouchDevice,
    handlers: {
      onTap: handleTap,
      onDoubleTap: handleDoubleTap
    }
  };
};

/**
 * Hook for list item touch controls
 */
export const useListItemTouchControls = (
  onSelect?: (index: number) => void,
  onDelete?: (index: number) => void
) => {
  const { isTouchDevice } = useResponsiveUI();

  const handleSelectTap = useCallback((index: number) => {
    onSelect?.(index);
  }, [onSelect]);

  const handleDeleteLongPress = useCallback((index: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      onDelete?.(index);
    }
  }, [onDelete]);

  return {
    isTouchDevice,
    selectHandlers: (index: number) => ({
      onTap: () => handleSelectTap(index)
    }),
    deleteHandlers: (index: number) => ({
      onLongPress: () => handleDeleteLongPress(index)
    })
  };
}; 