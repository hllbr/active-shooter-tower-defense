import { useState, useCallback } from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { playSound } from '../../../utils/sound/soundEffects';
import { toast } from 'react-toastify';

interface MoveState {
  isMoveMode: boolean;
  moveSlotIdx: number | null;
  canMove: boolean;
  moveCost: number;
  canAffordMove: boolean;
  cooldownRemaining: number;
}

export const useTowerMoveManager = () => {
  const {
    towerSlots,
    isStarted,
    isRefreshing,
    waveStatus,
    energy,
    moveTower
  } = useGameStore();

  const [moveState, setMoveState] = useState<MoveState>({
    isMoveMode: false,
    moveSlotIdx: null,
    canMove: false,
    moveCost: GAME_CONSTANTS.ENERGY_COSTS.relocateTower,
    canAffordMove: false,
    cooldownRemaining: 0
  });

  // Check if tower can be moved
  const checkMoveAvailability = useCallback((slotIdx: number): {
    canMove: boolean;
    canAffordMove: boolean;
    cooldownRemaining: number;
  } => {
    const slot = towerSlots[slotIdx];
    if (!slot.tower || !isStarted || isRefreshing || waveStatus === 'idle') {
      return { canMove: false, canAffordMove: false, cooldownRemaining: 0 };
    }

    const now = performance.now();
    const cooldownRemaining = slot.tower.lastRelocated 
      ? Math.max(0, GAME_CONSTANTS.RELOCATE_COOLDOWN - (now - slot.tower.lastRelocated))
      : 0;

    const moveCost = GAME_CONSTANTS.ENERGY_COSTS.relocateTower;
    const canAffordMove = energy >= moveCost;
    const canMove = cooldownRemaining === 0 && canAffordMove;

    return { canMove, canAffordMove, cooldownRemaining };
  }, [towerSlots, isStarted, isRefreshing, waveStatus, energy]);

  // Initiate move mode
  const initiateMoveMode = useCallback((slotIdx: number) => {
    const { canMove, canAffordMove, cooldownRemaining } = checkMoveAvailability(slotIdx);
    
    if (!canMove) {
      if (cooldownRemaining > 0) {
        const seconds = Math.ceil(cooldownRemaining / 1000);
        toast.warning(`🕒 Tower can be moved in ${seconds} seconds`);
        playSound('error');
      } else if (!canAffordMove) {
        toast.warning(`⚡ Not enough energy! You need ${GAME_CONSTANTS.ENERGY_COSTS.relocateTower} energy to move tower.`);
        playSound('error');
      } else {
        toast.error('Cannot move tower at this time!');
        playSound('error');
      }
      return;
    }

    setMoveState({
      isMoveMode: true,
      moveSlotIdx: slotIdx,
      canMove: true,
      moveCost: GAME_CONSTANTS.ENERGY_COSTS.relocateTower,
      canAffordMove: true,
      cooldownRemaining: 0
    });

    playSound('tower-upgrade');
    toast.info('✋ Drag the tower to move it!');
  }, [checkMoveAvailability]);

  // Cancel move mode
  const cancelMoveMode = useCallback(() => {
    setMoveState({
      isMoveMode: false,
      moveSlotIdx: null,
      canMove: false,
      moveCost: GAME_CONSTANTS.ENERGY_COSTS.relocateTower,
      canAffordMove: false,
      cooldownRemaining: 0
    });
  }, []);

  // Execute move
  const executeMove = useCallback((targetSlotIdx: number) => {
    if (!moveState.isMoveMode || moveState.moveSlotIdx === null) {
      return false;
    }

    const fromSlot = towerSlots[moveState.moveSlotIdx];
    const toSlot = towerSlots[targetSlotIdx];

    // Validate move
    if (!fromSlot.tower || toSlot.tower || !toSlot.unlocked) {
      toast.error('Cannot move tower here!');
      playSound('error');
      return false;
    }

    // Execute move
    moveTower(moveState.moveSlotIdx, targetSlotIdx);
    
    // Reset move state
    setMoveState({
      isMoveMode: false,
      moveSlotIdx: null,
      canMove: false,
      moveCost: GAME_CONSTANTS.ENERGY_COSTS.relocateTower,
      canAffordMove: false,
      cooldownRemaining: 0
    });

    toast.success('Tower moved successfully!');
    playSound('tower-upgrade');
    return true;
  }, [moveState, towerSlots, moveTower]);

  // Get move state for a specific slot
  const getMoveStateForSlot = useCallback((slotIdx: number) => {
    const { canMove, canAffordMove, cooldownRemaining } = checkMoveAvailability(slotIdx);
    
    return {
      canMove,
      canAffordMove,
      cooldownRemaining,
      moveCost: GAME_CONSTANTS.ENERGY_COSTS.relocateTower,
      isMoveMode: moveState.isMoveMode && moveState.moveSlotIdx === slotIdx
    };
  }, [checkMoveAvailability, moveState]);

  return {
    moveState,
    initiateMoveMode,
    cancelMoveMode,
    executeMove,
    getMoveStateForSlot
  };
}; 