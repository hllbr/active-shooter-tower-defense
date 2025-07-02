// GameBoard'a ait tüm type tanımları

export interface DragState {
  isDragging: boolean;
  draggedTowerSlotIdx: number | null;
  dragOffset: { x: number; y: number };
  mousePosition: { x: number; y: number };
  // Enhanced UX properties
  validDropZones: number[];
  invalidDropZones: number[];
  hoveredSlot: number | null;
  dragStartTime: number;
  energyCost: number;
  canAffordMove: boolean;
  cooldownRemaining: number;
  towerInfo: {
    type: 'attack' | 'economy';
    level: number;
    emoji: string;
    name: string;
  } | null;
  // Feedback states
  showFeedback: boolean;
  feedbackMessage: string;
  feedbackType: 'success' | 'error' | 'warning' | 'info';
  // Mobile support
  isTouchDevice: boolean;
  touchStartPosition: { x: number; y: number } | null;
}

export interface DropZoneState {
  slotIdx: number;
  isValid: boolean;
  reason?: string;
  distance: number;
  animationPhase: 'idle' | 'highlight' | 'pulse' | 'shake';
}

export interface DragFeedback {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
  showAt: { x: number; y: number };
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