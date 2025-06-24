import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';
import type { DragState } from '../types';

interface TowerDragVisualizationProps {
  dragState: DragState;
}

export const TowerDragVisualization: React.FC<TowerDragVisualizationProps> = ({ dragState }) => {
  const { towerSlots } = useGameStore();

  if (!dragState.isDragging || dragState.draggedTowerSlotIdx === null) {
    return null;
  }

  const draggedSlot = towerSlots[dragState.draggedTowerSlotIdx];
  
  // Find nearest valid slot for connection line
  const mouseX = dragState.mousePosition.x - dragState.dragOffset.x;
  const mouseY = dragState.mousePosition.y - dragState.dragOffset.y;
  
  let nearestSlotX = 0;
  let nearestSlotY = 0;
  let hasNearestSlot = false;
  let minDist = Infinity;
  
  towerSlots.forEach((slot, idx) => {
    if (idx === dragState.draggedTowerSlotIdx || !slot.unlocked || slot.tower) return;
    const dist = Math.sqrt((slot.x - mouseX) ** 2 + (slot.y - mouseY) ** 2);
    if (dist < minDist && dist <= GAME_CONSTANTS.TOWER_SIZE * 2) {
      minDist = dist;
      nearestSlotX = slot.x;
      nearestSlotY = slot.y;
      hasNearestSlot = true;
    }
  });

  return (
    <g style={{ pointerEvents: 'none', opacity: 0.8 }}>
      {/* Dragged tower preview */}
      <circle
        cx={mouseX}
        cy={mouseY}
        r={GAME_CONSTANTS.TOWER_SIZE / 2}
        fill="rgba(255, 255, 255, 0.3)"
        stroke="#00cfff"
        strokeWidth={2}
        strokeDasharray="4 2"
      />
      
      {/* Tower type indicator */}
      <text
        x={mouseX}
        y={mouseY + 4}
        fill="#00cfff"
        fontSize={16}
        textAnchor="middle"
        fontWeight="bold"
      >
        {draggedSlot?.tower?.towerType === 'economy' ? '💰' : '🏰'}
      </text>
      
      {/* Instructions */}
      <text
        x={mouseX}
        y={mouseY - GAME_CONSTANTS.TOWER_SIZE / 2 - 10}
        fill="#00cfff"
        fontSize={12}
        textAnchor="middle"
        fontWeight="bold"
      >
        Boş slota bırakın
      </text>
      
      {/* Connection line to nearest valid slot */}
      {hasNearestSlot && (
        <line
          x1={mouseX}
          y1={mouseY}
          x2={nearestSlotX}
          y2={nearestSlotY}
          stroke="#00cfff"
          strokeWidth={2}
          strokeDasharray="4 2"
          opacity={0.6}
        />
      )}
    </g>
  );
}; 