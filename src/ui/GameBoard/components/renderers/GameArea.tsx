import React, { useMemo, useCallback } from 'react';
import { TowerSpot } from '../../../TowerSpot';
import { TowerDragVisualization } from './TowerDragVisualization';
import { useGameStore } from '../../../../models/store';
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
  timeOfDay?: 'dawn' | 'day' | 'dusk' | 'night';
  isMobile?: boolean;
}

export const GameArea: React.FC<GameAreaProps> = React.memo(({
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
  onTowerDragStart,
  timeOfDay = 'day',
  isMobile = false,
}) => {
  const { enemies, bullets, mines } = useGameStore();
  const ambientColors: Record<string, string> = useMemo(() => ({
    dawn: '#FFE4B5',
    day: '#FFFFFF',
    dusk: '#FF6347',
    night: '#191970',
  }), []);
  const ambientColor = ambientColors[timeOfDay] || '#FFFFFF';
  const overlayOpacity = isMobile ? 0.09 : 0.18;
  const saturation = isMobile ? 1.0 : 1.1;
  const contrast = isMobile ? 1.0 : 1.08;
  const brightness = isMobile ? 1.0 : 1.04;

  // Memoize event handlers if needed (example)
  const handleMouseDown = useCallback(() => useGameStore.getState().selectSlot(null), []);
  const handleTouchStart = useCallback(() => useGameStore.getState().selectSlot(null), []);

  return (
    <svg
      width={width}
      height={height}
      style={{ display: 'block', position: 'absolute', top: 0, left: 0 }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <rect x={0} y={0} width={width} height={height} fill={ambientColor} opacity={overlayOpacity} />

      <filter id="postprocess-filter">
        <feColorMatrix type="saturate" values={saturation.toString()} />
        <feComponentTransfer>
          <feFuncR type="linear" slope={contrast.toString()} intercept={(contrast > 1 ? 0.02 : 0).toString()} />
          <feFuncG type="linear" slope={contrast.toString()} intercept={(contrast > 1 ? 0.02 : 0).toString()} />
          <feFuncB type="linear" slope={contrast.toString()} intercept={(contrast > 1 ? 0.02 : 0).toString()} />
        </feComponentTransfer>
        <feComponentTransfer>
          <feFuncR type="linear" slope={brightness.toString()} />
          <feFuncG type="linear" slope={brightness.toString()} />
          <feFuncB type="linear" slope={brightness.toString()} />
        </feComponentTransfer>
      </filter>
      
      <g filter="url(#postprocess-filter)">
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

        {/* Simplified Game Elements */}
        {/* Enemies */}
        {enemies.map((enemy) => (
          <circle
            key={enemy.id}
            cx={enemy.position?.x || 0}
            cy={enemy.position?.y || 0}
            r={enemy.size || 8}
            fill={enemy.type === 'boss' ? '#DC2626' : '#EF4444'}
            stroke="#000"
            strokeWidth="1"
            opacity={0.9}
          />
        ))}

        {/* Bullets */}
        {bullets.map((bullet) => (
          <circle
            key={bullet.id}
            cx={bullet.position?.x || 0}
            cy={bullet.position?.y || 0}
            r={2}
            fill="#FCD34D"
            opacity={0.8}
          />
        ))}

        {/* Mines */}
        {mines.map((mine) => (
          <circle
            key={mine.id}
            cx={mine.position?.x || 0}
            cy={mine.position?.y || 0}
            r={4}
            fill="#8B5CF6"
            stroke="#6D28D9"
            strokeWidth="1"
            opacity={0.7}
          />
        ))}
      </g>
    </svg>
  );
}); 