import type { Store } from '../index';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: number;
  duration?: number; // milliseconds, default 3000
}

export interface NotificationSlice {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const createNotificationSlice = (set: (fn: (state: Store) => Partial<Store>) => void, get: () => Store): NotificationSlice => ({
  notifications: [],

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    set((state: Store) => ({
      notifications: [...state.notifications, newNotification]
    }));

    // Auto-remove notification after duration
    const duration = notification.duration || 3000;
    setTimeout(() => {
      get().removeNotification(newNotification.id);
    }, duration);
  },

  removeNotification: (id) => {
    set((state: Store) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  }
}); 