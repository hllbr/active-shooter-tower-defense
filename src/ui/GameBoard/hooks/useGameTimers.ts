import { useEffect, useRef } from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
// import { playContextualSound } from '../../../utils/sound'; // 🔇 SES SİSTEMİ DEVRE DIŞI

export const useGameTimers = (
  isStarted: boolean,
  waveStatus: string,
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
    if (waveStatus !== 'in_progress') return;
    const id = setInterval(() => tickPreparation(1000), 1000);
    return () => clearInterval(id);
  }, [waveStatus, tickPreparation]);

  // Preparation warning and auto-start
  useEffect(() => {
    if (waveStatus === 'in_progress' && prepRemaining <= GAME_CONSTANTS.PREP_WARNING_THRESHOLD && !warningPlayed.current) {
      // playContextualSound('warning'); // 🔇 UYARI SESİ DEVRE DIŞI
      warningPlayed.current = true;
    }
    if (waveStatus === 'in_progress' && prepRemaining <= 0) {
      startWave();
    }
    if (waveStatus !== 'in_progress') warningPlayed.current = false;
  }, [waveStatus, startWave, prepRemaining]);

  // Energy regeneration timer - 5 second intervals
  useEffect(() => {
    if (!isStarted || waveStatus === 'idle') return;
    
    const energyTimer = setInterval(() => {
      tickEnergyRegen(5000);
    }, 5000);
    
    return () => clearInterval(energyTimer);
  }, [isStarted, waveStatus, tickEnergyRegen]);

  // Action regeneration timer
  useEffect(() => {
    if (!isStarted || waveStatus === 'idle') return;
    
    const actionTimer = setInterval(() => {
      tickActionRegen(1000);
    }, 1000);
    
    return () => clearInterval(actionTimer);
  }, [isStarted, waveStatus, tickActionRegen]);
}; 