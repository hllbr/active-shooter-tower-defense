import { useState, useCallback } from 'react';
import type { DropZoneState } from '../types';
import type { TowerSlot } from '../../../models/gameTypes';

export const useDropZoneAnalysis = () => {
  const [dropZones, setDropZones] = useState<DropZoneState[]>([]);

  const analyzeDropZones = useCallback((draggedSlotIdx: number, towerSlots: TowerSlot[]) => {
    const validZones: number[] = [];
    const invalidZones: number[] = [];
    const zones: DropZoneState[] = [];

    towerSlots.forEach((slot: TowerSlot, idx: number) => {
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
  }, []);

  const updateDropZoneAnimations = useCallback((animationType: 'highlight' | 'shake' | 'pulse' | 'idle', hoveredSlot?: number | null) => {
    setDropZones(zones => zones.map(zone => {
      if (hoveredSlot !== undefined && zone.slotIdx === hoveredSlot) {
        return { ...zone, animationPhase: zone.isValid ? 'pulse' : 'shake' };
      }
      return { ...zone, animationPhase: zone.isValid ? animationType : 'idle' };
    }));
  }, []);

  const clearDropZones = useCallback(() => {
    setDropZones([]);
  }, []);

  return {
    dropZones,
    analyzeDropZones,
    updateDropZoneAnimations,
    clearDropZones
  };
}; 