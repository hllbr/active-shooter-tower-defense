import React from 'react';

interface TowerDragWrapperProps {
  slotIdx: number;
  draggedTowerSlotIdx: number | null | undefined;
  onTowerDragStart?: (slotIdx: number, event: React.MouseEvent | React.TouchEvent) => void;
  children: React.ReactNode;
}

export const TowerDragWrapper: React.FC<TowerDragWrapperProps> = ({
  slotIdx,
  draggedTowerSlotIdx,
  onTowerDragStart,
  children
}) => {
  return (
    <g 
      style={{ 
        cursor: 'grab',
        opacity: draggedTowerSlotIdx === slotIdx ? 0.5 : 1,
        filter: draggedTowerSlotIdx === slotIdx ? 'brightness(0.7)' : 'none',
        touchAction: 'none' // Prevent default touch behaviors
      }}
      onMouseDown={(e) => {
        if (onTowerDragStart) {
          onTowerDragStart(slotIdx, e);
        }
      }}
      onTouchStart={(e) => {
        if (onTowerDragStart) {
          e.preventDefault(); // Prevent default touch behaviors
          onTowerDragStart(slotIdx, e);
        }
      }}
    >
      {children}
    </g>
  );
}; 