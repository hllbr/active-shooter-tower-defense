import { useState } from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';
import type { DragState } from '../types';

export const useTowerDrag = () => {
  const {
    towerSlots,
    isStarted,
    isRefreshing,
    isPreparing,
    energy,
    moveTower
  } = useGameStore();

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedTowerSlotIdx: null,
    dragOffset: { x: 0, y: 0 },
    mousePosition: { x: 0, y: 0 },
  });

  const [debugMessage, setDebugMessage] = useState<string>('');

  const clearDebugMessage = () => setDebugMessage('');

  const handleTowerDragStart = (slotIdx: number, event: React.MouseEvent) => {
    const slot = towerSlots[slotIdx];
    if (!slot.tower || !isStarted || isRefreshing || isPreparing) return;
    
    // Check if tower can be relocated (cooldown check)
    const now = performance.now();
    if (slot.tower.lastRelocated && now - slot.tower.lastRelocated < GAME_CONSTANTS.RELOCATE_COOLDOWN) {
      // Show cooldown message
      setDebugMessage(`Kule ${Math.ceil((GAME_CONSTANTS.RELOCATE_COOLDOWN - (now - slot.tower.lastRelocated)) / 1000)} saniye sonra taşınabilir`);
      return;
    }

    // Check if player has enough energy
    if (energy < GAME_CONSTANTS.ENERGY_COSTS.relocateTower) {
      setDebugMessage("Yetersiz enerji! Kule taşımak için 15 enerji gerekli.");
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const svgElement = (event.currentTarget as SVGElement).closest('svg');
    if (!svgElement) return;
    
    const svgRect = svgElement.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;

    setDebugMessage(`${slot.tower.towerType === 'economy' ? 'Ekonomi' : 'Saldırı'} kulesi taşınıyor...`);

    setDragState({
      isDragging: true,
      draggedTowerSlotIdx: slotIdx,
      dragOffset: {
        x: mouseX - slot.x,
        y: mouseY - slot.y,
      },
      mousePosition: { x: mouseX, y: mouseY },
    });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!dragState.isDragging) return;
    
    event.preventDefault();
    const svgElement = event.currentTarget as SVGElement;
    const svgRect = svgElement.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;

    setDragState(prev => ({
      ...prev,
      mousePosition: { x: mouseX, y: mouseY },
    }));
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    if (!dragState.isDragging || dragState.draggedTowerSlotIdx === null) return;

    event.preventDefault();
    const svgElement = event.currentTarget as SVGElement;
    const svgRect = svgElement.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;

    // Find the target slot under the mouse with increased detection radius
    let targetSlotIdx = -1;
    let minDistance = Infinity;
    const detectionRadius = GAME_CONSTANTS.TOWER_SIZE * 2;

    towerSlots.forEach((slot, idx) => {
      if (idx === dragState.draggedTowerSlotIdx) return; // Can't drop on itself
      if (!slot.unlocked || slot.tower) return; // Must be unlocked and empty

      const distance = Math.sqrt(
        Math.pow(mouseX - slot.x, 2) + Math.pow(mouseY - slot.y, 2)
      );

      if (distance <= detectionRadius && distance < minDistance) {
        minDistance = distance;
        targetSlotIdx = idx;
      }
    });

    // Perform the move if valid target found
    if (targetSlotIdx !== -1) {
      setDebugMessage("Kule başarıyla taşındı!");
      moveTower(dragState.draggedTowerSlotIdx, targetSlotIdx);
    } else {
      setDebugMessage("Geçersiz hedef! Kule boş bir slota taşınmalı.");
    }

    // Reset drag state
    setDragState({
      isDragging: false,
      draggedTowerSlotIdx: null,
      dragOffset: { x: 0, y: 0 },
      mousePosition: { x: 0, y: 0 },
    });
  };

  return {
    dragState,
    debugMessage,
    clearDebugMessage,
    handleTowerDragStart,
    handleMouseMove,
    handleMouseUp
  };
}; 