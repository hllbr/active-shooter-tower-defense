import React, { useState, useCallback } from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants';
import type { DragState } from '../types';
import { useDragFeedback } from './useDragFeedback';
import { useDropZoneAnalysis } from './useDropZoneAnalysis';
import { useSvgRectCache } from './useSvgRectCache';
import { useDragEventHandlers } from './useDragEventHandlers';
import { toast } from 'react-toastify';

export const useTowerDrag = () => {
  const {
    towerSlots,
    isStarted,
    isRefreshing,
    isPreparing,
    energy,
    moveTower
  } = useGameStore();

  // Enhanced drag state with UX features
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedTowerSlotIdx: null,
    dragOffset: { x: 0, y: 0 },
    mousePosition: { x: 0, y: 0 },
    validDropZones: [],
    invalidDropZones: [],
    hoveredSlot: null,
    dragStartTime: 0,
    energyCost: GAME_CONSTANTS.ENERGY_COSTS.relocateTower,
    canAffordMove: false,
    cooldownRemaining: 0,
    towerInfo: null,
    showFeedback: false,
    feedbackMessage: '',
    feedbackType: 'info',
    isTouchDevice: 'ontouchstart' in window,
    touchStartPosition: null,
  });

  // Sub-hooks
  const { feedback, showFeedback, clearFeedback } = useDragFeedback();
  const { dropZones, analyzeDropZones, updateDropZoneAnimations, clearDropZones } = useDropZoneAnalysis();
  const { getSvgRect } = useSvgRectCache();

  // Enhanced drag start with UX features
  const handleTowerDragStart = useCallback((slotIdx: number, event: React.MouseEvent | React.TouchEvent) => {
    const slot = towerSlots[slotIdx];
    if (!slot.tower || !isStarted || isRefreshing || isPreparing) return;
    
    const now = performance.now();
    
    // Enhanced cooldown check with visual feedback
    if (slot.tower.lastRelocated && now - slot.tower.lastRelocated < GAME_CONSTANTS.RELOCATE_COOLDOWN) {
      const cooldownRemaining = GAME_CONSTANTS.RELOCATE_COOLDOWN - (now - slot.tower.lastRelocated);
      const seconds = Math.ceil(cooldownRemaining / 1000);
      
      const eventPos = 'touches' in event ? 
        { x: event.touches[0].clientX, y: event.touches[0].clientY } :
        { x: event.clientX, y: event.clientY };
      
      showFeedback(
        `🕒 Kule ${seconds} saniye sonra taşınabilir`,
        'warning',
        eventPos,
        2000
      );
      return;
    }

    // Enhanced energy check
    const energyCost = GAME_CONSTANTS.ENERGY_COSTS.relocateTower;
    if (energy < energyCost) {
      const eventPos = 'touches' in event ? 
        { x: event.touches[0].clientX, y: event.touches[0].clientY } :
        { x: event.clientX, y: event.clientY };
      
      showFeedback(
        `⚡ Yetersiz enerji! ${energyCost} enerji gerekli`,
        'error',
        eventPos,
        2500
      );
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const svgElement = (event.currentTarget as Element).closest('svg');
    if (!svgElement) return;
    
    const svgRect = svgElement.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    const mouseX = clientX - svgRect.left;
    const mouseY = clientY - svgRect.top;

    // Analyze valid drop zones
    const { validZones, invalidZones } = analyzeDropZones(slotIdx, towerSlots);

    // Enhanced tower info
    const towerInfo = {
      type: slot.tower.towerType as 'attack' | 'economy',
      level: slot.tower.level,
      emoji: slot.tower.towerType === 'economy' ? '💰' : '🏰',
      name: slot.tower.towerType === 'economy' ? 'Ekonomi Kulesi' : 'Saldırı Kulesi'
    };

    setDragState({
      isDragging: true,
      draggedTowerSlotIdx: slotIdx,
      dragOffset: {
        x: mouseX - slot.x,
        y: mouseY - slot.y,
      },
      mousePosition: { x: mouseX, y: mouseY },
      validDropZones: validZones,
      invalidDropZones: invalidZones,
      hoveredSlot: null,
      dragStartTime: now,
      energyCost,
      canAffordMove: energy >= energyCost,
      cooldownRemaining: 0,
      towerInfo,
      showFeedback: true,
      feedbackMessage: `${towerInfo.emoji} ${towerInfo.name} taşınıyor`,
      feedbackType: 'info',
      isTouchDevice: 'touches' in event,
      touchStartPosition: 'touches' in event ? { x: clientX, y: clientY } : null,
    });

    // Update drop zone animations
    updateDropZoneAnimations('highlight');

  }, [towerSlots, isStarted, isRefreshing, isPreparing, energy, analyzeDropZones, showFeedback, updateDropZoneAnimations]);

  // Handle hover changes
  const handleHoverChange = useCallback((hoveredSlot: number | null) => {
    updateDropZoneAnimations('highlight', hoveredSlot);
  }, [updateDropZoneAnimations]);

  // Handle drop
  const handleDrop = useCallback((targetSlotIdx: number, invalidReason: string) => {
    if (targetSlotIdx !== -1) {
      moveTower(dragState.draggedTowerSlotIdx!, targetSlotIdx);
      toast.success('Kule başarıyla taşındı!');
    } else if (invalidReason) {
      toast.error('Kule buraya taşınamaz!');
    } else {
      toast.error('Kule buraya taşınamaz!');
    }

    // Reset all states
    setDragState({
      isDragging: false,
      draggedTowerSlotIdx: null,
      dragOffset: { x: 0, y: 0 },
      mousePosition: { x: 0, y: 0 },
      validDropZones: [],
      invalidDropZones: [],
      hoveredSlot: null,
      dragStartTime: 0,
      energyCost: GAME_CONSTANTS.ENERGY_COSTS.relocateTower,
      canAffordMove: false,
      cooldownRemaining: 0,
      towerInfo: null,
      showFeedback: false,
      feedbackMessage: '',
      feedbackType: 'info',
      isTouchDevice: dragState.isTouchDevice,
      touchStartPosition: null,
    });

    clearDropZones();
  }, [dragState, moveTower, clearDropZones]);

  // Event handlers
  const { handleMouseMove, handleMouseUp } = useDragEventHandlers(
    dragState,
    setDragState,
    towerSlots,
    getSvgRect,
    handleHoverChange
  );

  // Touch support
  const handleTouchStart = useCallback((slotIdx: number, event: React.TouchEvent) => {
    handleTowerDragStart(slotIdx, event);
  }, [handleTowerDragStart]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    handleMouseMove(event);
  }, [handleMouseMove]);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    handleMouseUp(event, handleDrop);
  }, [handleMouseUp, handleDrop]);

  // Enhanced mouse up handler
  const handleMouseUpEnhanced = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    handleMouseUp(event, handleDrop);
  }, [handleMouseUp, handleDrop]);

  return {
    // Core drag state
    dragState,
    dropZones,
    feedback,
    
    // Enhanced handlers
    handleTowerDragStart,
    handleMouseMove,
    handleMouseUp: handleMouseUpEnhanced,
    
    // Touch support
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    
    // Utility functions
    showFeedback,
    clearFeedback,
    
    // Legacy support (for backward compatibility)
    debugMessage: feedback?.message || '',
    clearDebugMessage: clearFeedback
  };
}; 