import React, { useEffect } from 'react';
import { useGameStore } from '../../../models/store';
import './NotificationSystem.css';

export const NotificationSystem: React.FC = () => {
  const { notifications, removeNotification } = useGameStore();

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

interface NotificationCardProps {
  notification: {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: number;
    duration?: number;
  };
  onRemove: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onRemove }) => {
  useEffect(() => {
    // Auto-dismiss if duration is specified (backup to store timeout)
    if (notification.duration) {
      const timer = setTimeout(onRemove, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration, onRemove]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getTypeClass = () => {
    return `notification-${notification.type}`;
  };

  return (
    <div className={`notification-card ${getTypeClass()}`}>
      <div className="notification-icon">
        {getIcon()}
      </div>
      <div className="notification-content">
        <div className="notification-message">
          {notification.message}
        </div>
        <div className="notification-timestamp">
          {new Date(notification.timestamp).toLocaleTimeString()}
        </div>
      </div>
      <button 
        className="notification-close" 
        onClick={onRemove}
        title="Kapat"
      >
        ×
      </button>
    </div>
  );
}; 