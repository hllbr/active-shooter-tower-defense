import React, { useState, useEffect } from 'react';
import { GAME_CONSTANTS } from '../../../utils/Constants';

interface DebugMessageProps {
  message: string;
  onClear: () => void;
}

export const DebugMessage: React.FC<DebugMessageProps> = ({ message, onClear }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => onClear(), 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClear]);

  if (!message) return null;

  return (
    <div style={{ 
      position: 'absolute', 
      top: '50%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)', 
      color: '#00cfff', 
      font: 'bold 20px Arial', 
      textShadow: GAME_CONSTANTS.UI_SHADOW, 
      zIndex: 10,
      background: 'rgba(0,0,0,0.8)',
      padding: '12px 24px',
      borderRadius: '8px',
      border: '2px solid #00cfff'
    }}>
      {message}
    </div>
  );
};

// Hook for managing debug messages
export const useDebugMessage = () => {
  const [debugMessage, setDebugMessage] = useState<string>('');

  const showMessage = (message: string) => {
    setDebugMessage(message);
  };

  const clearMessage = () => {
    setDebugMessage('');
  };

  return {
    debugMessage,
    showMessage,
    clearMessage
  };
}; 