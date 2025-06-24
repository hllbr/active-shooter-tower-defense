import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';

export const EnergyWarning: React.FC = () => {
  const { energyWarning, clearEnergyWarning } = useGameStore();

  React.useEffect(() => {
    if (!energyWarning) return;
    const timer = setTimeout(() => clearEnergyWarning(), 1500);
    return () => clearTimeout(timer);
  }, [energyWarning, clearEnergyWarning]);

  if (!energyWarning) return null;

  return (
    <div style={{ 
      position: 'absolute', 
      top: 80, 
      left: 32, 
      color: '#ff5555', 
      font: GAME_CONSTANTS.UI_FONT, 
      textShadow: GAME_CONSTANTS.UI_SHADOW, 
      zIndex: 2 
    }}>
      {energyWarning}
    </div>
  );
}; 