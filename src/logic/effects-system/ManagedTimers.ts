/**
 * ⏰ Managed Timer and Interval Utilities
 */

import { cleanupManager } from '../memory';

/**
 * Create a managed timer that will be automatically cleaned up
 */
export const createManagedTimer = (
  callback: () => void,
  delay: number,
  description?: string
): string => {
  const id = `timer_${Date.now()}_${Math.random()}`;
  const timerId = window.setTimeout(callback, delay);
  cleanupManager.registerTimer(id, timerId, description);
  return id;
};

/**
 * Create a managed interval that will be automatically cleaned up
 */
export const createManagedInterval = (
  callback: () => void,
  interval: number,
  description?: string
): string => {
  const id = `interval_${Date.now()}_${Math.random()}`;
  const intervalId = window.setInterval(callback, interval);
  cleanupManager.registerInterval(id, intervalId, description);
  return id;
};

/**
 * Create a managed event listener that will be automatically cleaned up
 */
export const createManagedEventListener = (
  element: EventTarget,
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions,
  description?: string
): string => {
  const id = `listener_${Date.now()}_${Math.random()}`;
  element.addEventListener(event, handler, options);
  cleanupManager.registerEventListener(id, element, event, handler, description);
  return id;
}; 