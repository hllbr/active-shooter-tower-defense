import type { StateCreator } from 'zustand';
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
  addNotification: (notification: Omit<Notification, 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const createNotificationSlice: StateCreator<Store, [], [], NotificationSlice> = (set, get) => ({
  notifications: [],

  addNotification: (notification) => set((state: Store) => {
    const newNotification: Notification = {
      ...notification,
      timestamp: Date.now()
    };

    // Add notification to the beginning of the array
    const updatedNotifications = [newNotification, ...state.notifications];

    // Keep only the last 10 notifications
    const limitedNotifications = updatedNotifications.slice(0, 10);

    return { notifications: limitedNotifications };
  }),

  removeNotification: (id) => set((state: Store) => ({
    notifications: state.notifications.filter(notification => notification.id !== id)
  })),

  clearNotifications: () => set({ notifications: [] })
}); 