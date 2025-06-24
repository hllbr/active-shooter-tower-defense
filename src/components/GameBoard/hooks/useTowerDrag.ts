import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';
import type { DragState, DropZoneState, DragFeedback } from '../types';

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

  const [dropZones, setDropZones] = useState<DropZoneState[]>([]);
  const [feedback, setFeedback] = useState<DragFeedback | null>(null);
  const feedbackTimeoutRef = useRef<number | undefined>(undefined);
  const hoverTimeoutRef = useRef<number | undefined>(undefined);

  // Enhanced feedback system
  const showFeedback = useCallback((message: string, type: DragFeedback['type'], position: { x: number; y: number }, duration = 3000) => {
    const newFeedback: DragFeedback = {
      message,
      type,
      duration,
      showAt: position
    };
    
    setFeedback(newFeedback);
    
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(null);
    }, duration);
  }, []);

  // Smart drop zone analysis
  const analyzeDropZones = useCallback((draggedSlotIdx: number) => {
    const validZones: number[] = [];
    const invalidZones: number[] = [];
    const zones: DropZoneState[] = [];

    towerSlots.forEach((slot, idx) => {
      if (idx === draggedSlotIdx) return;

      const distance = Math.sqrt(
        Math.pow(slot.x - towerSlots[draggedSlotIdx].x, 2) + 
        Math.pow(slot.y - towerSlots[draggedSlotIdx].y, 2)
      );

      let isValid = true;
      let reason = '';

      if (!slot.unlocked) {
        isValid = false;
        reason = 'Slot kilitli';
      } else if (slot.tower) {
        isValid = false;
        reason = 'Slot dolu';
      }

      const zoneState: DropZoneState = {
        slotIdx: idx,
        isValid,
        reason,
        distance,
        animationPhase: 'idle'
      };

      zones.push(zoneState);

      if (isValid) {
        validZones.push(idx);
      } else {
        invalidZones.push(idx);
      }
    });

    setDropZones(zones);
    return { validZones, invalidZones, zones };
  }, [towerSlots]);

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
    const { validZones, invalidZones } = analyzeDropZones(slotIdx);

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
    setDropZones(zones => zones.map(zone => ({
      ...zone,
      animationPhase: zone.isValid ? 'highlight' : 'shake'
    })));

  }, [towerSlots, isStarted, isRefreshing, isPreparing, energy, analyzeDropZones, showFeedback]);

  // Enhanced mouse/touch move with hover detection
  const handleMouseMove = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!dragState.isDragging) return;
    
    event.preventDefault();
    const svgElement = event.currentTarget as SVGElement;
    const svgRect = svgElement.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    const mouseX = clientX - svgRect.left;
    const mouseY = clientY - svgRect.top;

    // Find nearest slot for hover detection
    let hoveredSlot: number | null = null;
    let minDistance = Infinity;
    const hoverRadius = GAME_CONSTANTS.TOWER_SIZE * 1.5;

    towerSlots.forEach((slot, idx) => {
      if (idx === dragState.draggedTowerSlotIdx) return;
      
      const distance = Math.sqrt(
        Math.pow(mouseX - slot.x, 2) + Math.pow(mouseY - slot.y, 2)
      );

      if (distance <= hoverRadius && distance < minDistance) {
        minDistance = distance;
        hoveredSlot = idx;
      }
    });

    // Update hover state with debouncing
    if (hoveredSlot !== dragState.hoveredSlot) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      hoverTimeoutRef.current = setTimeout(() => {
        setDragState(prev => ({ ...prev, hoveredSlot }));
        
        // Update drop zone animations based on hover
        setDropZones(zones => zones.map(zone => {
          if (zone.slotIdx === hoveredSlot) {
            return { ...zone, animationPhase: zone.isValid ? 'pulse' : 'shake' };
          }
          return { ...zone, animationPhase: zone.isValid ? 'highlight' : 'idle' };
        }));
      }, 50);
    }

    setDragState(prev => ({
      ...prev,
      mousePosition: { x: mouseX, y: mouseY },
    }));
  }, [dragState.isDragging, dragState.draggedTowerSlotIdx, dragState.hoveredSlot, towerSlots]);

  // Enhanced drop with comprehensive feedback
  const handleMouseUp = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!dragState.isDragging || dragState.draggedTowerSlotIdx === null) return;

    event.preventDefault();
    const svgElement = event.currentTarget as SVGElement;
    const svgRect = svgElement.getBoundingClientRect();
    const clientX = 'touches' in event ? event.changedTouches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.changedTouches[0].clientY : event.clientY;
    const mouseX = clientX - svgRect.left;
    const mouseY = clientY - svgRect.top;

    // Enhanced target detection
    let targetSlotIdx = -1;
    let minDistance = Infinity;
    let invalidReason = '';
    const detectionRadius = GAME_CONSTANTS.TOWER_SIZE * 2;

    towerSlots.forEach((slot, idx) => {
      if (idx === dragState.draggedTowerSlotIdx) return;

      const distance = Math.sqrt(
        Math.pow(mouseX - slot.x, 2) + Math.pow(mouseY - slot.y, 2)
      );

      if (distance <= detectionRadius && distance < minDistance) {
        minDistance = distance;
        
        if (!slot.unlocked) {
          invalidReason = 'Hedef slot kilitli';
        } else if (slot.tower) {
          invalidReason = 'Hedef slot dolu';
        } else {
          targetSlotIdx = idx;
          invalidReason = '';
        }
      }
    });

    const feedbackPos = { x: clientX, y: clientY };

         // Perform move with enhanced feedback
     if (targetSlotIdx !== -1) {
       moveTower(dragState.draggedTowerSlotIdx, targetSlotIdx);
       showFeedback(
         `✅ ${dragState.towerInfo?.emoji} Kule başarıyla taşındı!`,
         'success',
         feedbackPos,
         2000
       );
    } else if (invalidReason) {
      showFeedback(
        `⚠️ ${invalidReason}`,
        'warning',
        feedbackPos
      );
    } else {
      showFeedback(
        `❌ Geçersiz hedef! Boş bir slota taşıyın`,
        'error',
        feedbackPos
      );
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

    setDropZones([]);

    // Clear timeouts
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  }, [dragState, towerSlots, moveTower, showFeedback]);

  // Touch support
  const handleTouchStart = useCallback((slotIdx: number, event: React.TouchEvent) => {
    handleTowerDragStart(slotIdx, event);
  }, [handleTowerDragStart]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    handleMouseMove(event);
  }, [handleMouseMove]);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    handleMouseUp(event);
  }, [handleMouseUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Core drag state
    dragState,
    dropZones,
    feedback,
    
    // Enhanced handlers
    handleTowerDragStart,
    handleMouseMove,
    handleMouseUp,
    
    // Touch support
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    
    // Utility functions
    showFeedback,
    
    // Legacy support (for backward compatibility)
    debugMessage: feedback?.message || '',
    clearDebugMessage: () => setFeedback(null)
  };
}; 