import { useEffect, useRef } from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
// import { playContextualSound } from '../../../utils/sound'; // 🔇 SES SİSTEMİ DEVRE DIŞI

export const useGameTimers = (
  isStarted: boolean,
  isPreparing: boolean,
  isPaused: boolean,
  prepRemaining: number,
  startWave: () => void,
  tickPreparation: (delta: number) => void,
  tickEnergyRegen: (delta: number) => void,
  tickActionRegen: (delta: number) => void
) => {
  // Warning system
  const warningPlayed = useRef(false);

  // Preparation timer
  useEffect(() => {
    if (!isPreparing || isPaused) return;
    const id = setInterval(() => tickPreparation(1000), 1000);
    return () => clearInterval(id);
  }, [isPreparing, isPaused, tickPreparation]);

  // Preparation warning and auto-start
  useEffect(() => {
    if (isPreparing && prepRemaining <= GAME_CONSTANTS.PREP_WARNING_THRESHOLD && !warningPlayed.current) {
      // playContextualSound('warning'); // 🔇 UYARI SESİ DEVRE DIŞI
      warningPlayed.current = true;
    }
    if (isPreparing && prepRemaining <= 0) {
      startWave();
    }
    if (!isPreparing) warningPlayed.current = false;
  }, [isPreparing, startWave, prepRemaining]);

  // Energy regeneration timer - 5 second intervals
  useEffect(() => {
    if (!isStarted || isPaused) return;
    
    const energyTimer = setInterval(() => {
      tickEnergyRegen(5000);
    }, 5000);
    
    return () => clearInterval(energyTimer);
  }, [isStarted, isPaused, tickEnergyRegen]);

  // Action regeneration timer
  useEffect(() => {
    if (!isStarted || isPaused) return;
    
    const actionTimer = setInterval(() => {
      tickActionRegen(1000);
    }, 1000);
    
    return () => clearInterval(actionTimer);
  }, [isStarted, isPaused, tickActionRegen]);
}; 