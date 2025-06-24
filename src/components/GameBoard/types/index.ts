// GameBoard'a ait tüm type tanımları

export interface DragState {
  isDragging: boolean;
  draggedTowerSlotIdx: number | null;
  dragOffset: { x: number; y: number };
  mousePosition: { x: number; y: number };
}

export interface AnimatedCounterHookReturn {
  count: number;
}

export interface GameBoardProps {
  className?: string;
}

export interface TooltipProps {
  showTooltip: boolean;
  setShowTooltip: (show: boolean) => void;
}

export interface StatCardData {
  icon: string;
  label: string;
  value: string | number;
  color: string;
} 