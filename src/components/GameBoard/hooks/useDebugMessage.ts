import { useState } from 'react';

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