import { StateCreator } from 'zustand';
import type { Store } from '../index';

export interface NotificationSlice {
  notifications: {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: number;
    duration?: number;
  }[];
  addNotification: (notification: {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number;
  }) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const createNotificationSlice: StateCreator<Store, [], [], NotificationSlice> = (set, get) => ({
  notifications: [],

  addNotification: (notification) => set((state: Store) => {
    const newNotification = {
      ...notification,
      timestamp: Date.now(),
      duration: notification.duration || 3000
    };

    // Remove notification after duration
    setTimeout(() => {
      get().removeNotification(notification.id);
    }, newNotification.duration);

    return {
      notifications: [...state.notifications, newNotification]
    };
  }),

  removeNotification: (id) => set((state: Store) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  clearNotifications: () => set(() => ({
    notifications: []
  }))
}); 