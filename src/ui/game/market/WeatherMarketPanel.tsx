/**
 * 🌦️ Weather Effects Market Panel
 * Simplified market interface with progressive unlocks
 */

import React from 'react';
import { useGameStore } from '../../../models/store';
import { SimplifiedMarketUI } from './SimplifiedMarketUI';

interface WeatherMarketPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeatherMarketPanel: React.FC<WeatherMarketPanelProps> = ({ isOpen, onClose }) => {
  const setPaused = useGameStore(state => state.setPaused);

  // Handle pause state
  React.useEffect(() => {
    if (isOpen) setPaused(true);
    return () => setPaused(false);
  }, [isOpen, setPaused]);

  if (!isOpen) return null;

  return (
    <SimplifiedMarketUI 
      isOpen={isOpen} 
      onClose={onClose} 
      isModal={true} 
    />
  );
}; 