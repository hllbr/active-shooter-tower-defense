import { useEffect, useState } from 'react';
// import { playSound } from '../../../utils/sound'; // 🔇 SES SİSTEMİ DEVRE DIŞI

export const useCommandCenter = (
  isPreparing: boolean,
  isPaused: boolean,
  pausePreparation: () => void,
  resumePreparation: () => void
) => {
  const [commandCenterOpen, setCommandCenterOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 's' || event.key === 'S') {
        if (event.ctrlKey || event.metaKey) return; // Ignore Ctrl+S (save)
        
        event.preventDefault();
        setCommandCenterOpen(prev => {
          const newState = !prev;
          
          // Pause/resume game when command center opens/closes
          if (newState && isPreparing && !isPaused) {
            pausePreparation();
          } else if (!newState && isPreparing && isPaused) {
            resumePreparation();
          }
          
          if (newState) {
            // playSound('levelupwav'); // 🔇 COMMAND CENTER SESİ DEVRE DIŞI
          }
          
          return newState;
        });
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [commandCenterOpen, isPreparing, isPaused, pausePreparation, resumePreparation]);

  const closeCommandCenter = () => {
    setCommandCenterOpen(false);
    // Resume game if it was paused due to command center
    if (isPreparing && isPaused) {
      resumePreparation();
    }
  };

  return {
    commandCenterOpen,
    setCommandCenterOpen,
    closeCommandCenter
  };
}; 