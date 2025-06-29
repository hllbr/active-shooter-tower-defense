import React from 'react';
import { TowerSpot } from '../../../TowerSpot';
import { TowerDragVisualization } from './TowerDragVisualization';
import { SVGEffectsRenderer } from './SVGEffectsRenderer';
import type { TowerSlot } from '../../../../models/gameTypes';
import type { DragState, DropZoneState, DragFeedback } from '../../types';

interface GameAreaProps {
  width: number;
  height: number;
  towerSlots: TowerSlot[];
  dragState: DragState;
  dropZones: DropZoneState[];
  feedback: DragFeedback | null;
  onMouseMove: (event: React.MouseEvent | React.TouchEvent) => void;
  onMouseUp: (event: React.MouseEvent | React.TouchEvent) => void;
  onTouchMove: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
  onTowerDragStart: (slotIdx: number, event: React.MouseEvent | React.TouchEvent) => void;
}

export const GameArea: React.FC<GameAreaProps> = ({
  width,
  height,
  towerSlots,
  dragState,
  dropZones,
  feedback,
  onMouseMove,
  onMouseUp,
  onTouchMove,
  onTouchEnd,
  onTowerDragStart
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      style={{ display: 'block', position: 'absolute', top: 0, left: 0 }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Tower Slots with Enhanced Drag Support */}
      {towerSlots.map((slot: TowerSlot, i: number) => (
        <TowerSpot 
          key={i} 
          slot={slot} 
          slotIdx={i} 
          onTowerDragStart={(slotIdx, event) => {
            // Support both mouse and touch events
            if ('touches' in event) {
              onTowerDragStart(slotIdx, event as React.TouchEvent);
            } else {
              onTowerDragStart(slotIdx, event as React.MouseEvent);
            }
          }}
          isDragTarget={dragState.isDragging && i !== dragState.draggedTowerSlotIdx && slot.unlocked && !slot.tower}
          draggedTowerSlotIdx={dragState.draggedTowerSlotIdx}
        />
      ))}

      {/* Enhanced Drag Visualization System */}
      <TowerDragVisualization 
        dragState={dragState}
        dropZones={dropZones}
        feedback={feedback}
      />

      {/* SVG Effects (Enemies, Bullets, Effects, Mines) */}
      <SVGEffectsRenderer />
    </svg>
  );
}; 