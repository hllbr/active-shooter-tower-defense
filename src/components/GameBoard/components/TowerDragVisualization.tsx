import React, { useMemo } from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';
import type { TowerSlot } from '../../../models/gameTypes';
import type { DragState, DropZoneState, DragFeedback } from '../types';

interface TowerDragVisualizationProps {
  dragState: DragState;
  dropZones: DropZoneState[];
  feedback: DragFeedback | null;
}

export const TowerDragVisualization: React.FC<TowerDragVisualizationProps> = ({ 
  dragState, 
  dropZones, 
  feedback 
}) => {
  const { towerSlots } = useGameStore();

  // Memoized calculations for performance
  const { draggedSlot, dragPosition, nearestValidSlot } = useMemo(() => {
    if (!dragState.isDragging || dragState.draggedTowerSlotIdx === null) {
      return { draggedSlot: null, dragPosition: null, nearestValidSlot: null };
    }

    const slot = towerSlots[dragState.draggedTowerSlotIdx];
    const position = {
      x: dragState.mousePosition.x - dragState.dragOffset.x,
      y: dragState.mousePosition.y - dragState.dragOffset.y
    };

    // Find nearest valid slot for connection line
    let nearest: { slot: TowerSlot; distance: number } | null = null;
    let minDist = Infinity;
    
    dropZones.forEach((zone) => {
      if (!zone.isValid) return;
      const slot = towerSlots[zone.slotIdx];
      const dist = Math.sqrt((slot.x - position.x) ** 2 + (slot.y - position.y) ** 2);
      if (dist < minDist && dist <= GAME_CONSTANTS.TOWER_SIZE * 3) {
        minDist = dist;
        nearest = { slot, distance: dist };
      }
    });

    return { draggedSlot: slot, dragPosition: position, nearestValidSlot: nearest };
  }, [dragState, dropZones, towerSlots]);

  if (!dragState.isDragging || !draggedSlot || !dragPosition) {
    return null;
  }

  // Animation keyframes for CSS
  const animationStyle = `
    @keyframes pulse {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 0.9; transform: scale(1.05); }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-2px); }
      75% { transform: translateX(2px); }
    }
    @keyframes highlight {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 0.8; }
    }
    @keyframes glow {
      0%, 100% { filter: drop-shadow(0 0 5px currentColor); }
      50% { filter: drop-shadow(0 0 15px currentColor); }
    }
  `;

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* CSS Animations */}
      <defs>
        <style>{animationStyle}</style>
        
        {/* Gradient definitions */}
        <radialGradient id="validZoneGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(34, 197, 94, 0.3)" />
          <stop offset="100%" stopColor="rgba(34, 197, 94, 0.1)" />
        </radialGradient>
        
        <radialGradient id="invalidZoneGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(239, 68, 68, 0.3)" />
          <stop offset="100%" stopColor="rgba(239, 68, 68, 0.1)" />
        </radialGradient>
        
        <radialGradient id="hoverGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
          <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
        </radialGradient>
      </defs>

      {/* Drop Zone Highlighting */}
      {dropZones.map((zone) => {
        const slot = towerSlots[zone.slotIdx];
        const isHovered = zone.slotIdx === dragState.hoveredSlot;
        
        // Base styling
        let fillColor = zone.isValid ? 'url(#validZoneGradient)' : 'url(#invalidZoneGradient)';
        let strokeColor = zone.isValid ? '#22c55e' : '#ef4444';
        let strokeWidth = 2;
        let animation = '';
        
        // Enhanced styling based on state
        if (isHovered) {
          fillColor = 'url(#hoverGradient)';
          strokeColor = '#3b82f6';
          strokeWidth = 3;
        }
        
        // Animation based on phase
        switch (zone.animationPhase) {
          case 'pulse':
            animation = 'pulse 1s infinite';
            break;
          case 'shake':
            animation = 'shake 0.5s ease-in-out infinite';
            break;
          case 'highlight':
            animation = 'highlight 2s infinite';
            break;
        }

        return (
          <g key={zone.slotIdx}>
            {/* Main drop zone circle */}
            <circle
              cx={slot.x}
              cy={slot.y}
              r={GAME_CONSTANTS.TOWER_SIZE / 2 + 8}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={zone.isValid ? "6 3" : "3 3"}
              style={{ animation }}
            />
            
            {/* Inner indicator circle */}
            <circle
              cx={slot.x}
              cy={slot.y}
              r={GAME_CONSTANTS.TOWER_SIZE / 2 - 4}
              fill="none"
              stroke={strokeColor}
              strokeWidth={1}
              opacity={0.6}
            />
            
            {/* Status icon */}
            <text
              x={slot.x}
              y={slot.y + 6}
              textAnchor="middle"
              fontSize={20}
              fill={strokeColor}
              style={{ 
                filter: isHovered ? 'drop-shadow(0 0 3px currentColor)' : 'none',
                animation: isHovered ? 'glow 1s infinite' : ''
              }}
            >
              {zone.isValid ? '✅' : '❌'}
            </text>
            
            {/* Hover info */}
            {isHovered && zone.reason && (
              <text
                x={slot.x}
                y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 15}
                textAnchor="middle"
                fontSize={12}
                fill="#ef4444"
                fontWeight="bold"
                style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))' }}
              >
                {zone.reason}
              </text>
            )}
            
            {/* Distance indicator for valid zones */}
            {zone.isValid && (
              <text
                x={slot.x}
                y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2 + 20}
                textAnchor="middle"
                fontSize={10}
                fill="#22c55e"
                opacity={0.8}
              >
                {Math.round(zone.distance)}px
              </text>
            )}
          </g>
        );
      })}

      {/* Connection line to nearest valid slot */}
      {nearestValidSlot && nearestValidSlot.slot && (
        <line
          x1={dragPosition.x}
          y1={dragPosition.y}
          x2={nearestValidSlot.slot.x}
          y2={nearestValidSlot.slot.y}
          stroke="#3b82f6"
          strokeWidth={3}
          strokeDasharray="8 4"
          opacity={0.7}
          style={{ animation: 'highlight 1s infinite' }}
        />
      )}

      {/* Dragged tower preview with enhanced visuals */}
      <g style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
        {/* Main tower circle */}
        <circle
          cx={dragPosition.x}
          cy={dragPosition.y}
          r={GAME_CONSTANTS.TOWER_SIZE / 2}
          fill="rgba(255, 255, 255, 0.4)"
          stroke="#00cfff"
          strokeWidth={3}
          strokeDasharray="6 3"
          style={{ animation: 'pulse 1.5s infinite' }}
        />
        
        {/* Inner core */}
        <circle
          cx={dragPosition.x}
          cy={dragPosition.y}
          r={GAME_CONSTANTS.TOWER_SIZE / 2 - 6}
          fill="rgba(0, 207, 255, 0.2)"
          stroke="#00cfff"
          strokeWidth={1}
        />
        
        {/* Tower type emoji */}
        <text
          x={dragPosition.x}
          y={dragPosition.y + 6}
          fill="#00cfff"
          fontSize={18}
          textAnchor="middle"
          fontWeight="bold"
          style={{ filter: 'drop-shadow(0 0 4px currentColor)' }}
        >
          {dragState.towerInfo?.emoji}
        </text>
      </g>

      {/* Energy cost indicator */}
      <g>
        <rect
          x={dragPosition.x - 30}
          y={dragPosition.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 35}
          width={60}
          height={20}
          rx={10}
          fill={dragState.canAffordMove ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)'}
          stroke={dragState.canAffordMove ? '#22c55e' : '#ef4444'}
          strokeWidth={1}
        />
        <text
          x={dragPosition.x}
          y={dragPosition.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 22}
          textAnchor="middle"
          fontSize={11}
          fill="white"
          fontWeight="bold"
        >
          ⚡{dragState.energyCost}
        </text>
      </g>

      {/* Tower info panel */}
      <g>
        <rect
          x={dragPosition.x - 45}
          y={dragPosition.y + GAME_CONSTANTS.TOWER_SIZE / 2 + 10}
          width={90}
          height={30}
          rx={5}
          fill="rgba(0, 0, 0, 0.8)"
          stroke="#00cfff"
          strokeWidth={1}
        />
        <text
          x={dragPosition.x}
          y={dragPosition.y + GAME_CONSTANTS.TOWER_SIZE / 2 + 25}
          textAnchor="middle"
          fontSize={10}
          fill="#00cfff"
          fontWeight="bold"
        >
          {dragState.towerInfo?.name}
        </text>
        <text
          x={dragPosition.x}
          y={dragPosition.y + GAME_CONSTANTS.TOWER_SIZE / 2 + 37}
          textAnchor="middle"
          fontSize={9}
          fill="#888"
        >
          Level {dragState.towerInfo?.level}
        </text>
      </g>

      {/* Instructions overlay */}
      <g>
        <rect
          x={dragPosition.x - 60}
          y={dragPosition.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 70}
          width={120}
          height={25}
          rx={12}
          fill="rgba(0, 0, 0, 0.7)"
          stroke="#00cfff"
          strokeWidth={1}
        />
        <text
          x={dragPosition.x}
          y={dragPosition.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 58}
          textAnchor="middle"
          fontSize={10}
          fill="#00cfff"
          fontWeight="bold"
        >
          {dragState.isTouchDevice ? 'Bırakın' : 'Yeşil alana bırakın'}
        </text>
        <text
          x={dragPosition.x}
          y={dragPosition.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 48}
          textAnchor="middle"
          fontSize={8}
          fill="#888"
        >
          {dragState.validDropZones.length} geçerli alan
        </text>
      </g>

      {/* Feedback toast */}
      {feedback && (
        <g>
          <rect
            x={feedback.showAt.x - 80}
            y={feedback.showAt.y - 40}
            width={160}
            height={35}
            rx={8}
            fill={
              feedback.type === 'success' ? 'rgba(34, 197, 94, 0.9)' :
              feedback.type === 'error' ? 'rgba(239, 68, 68, 0.9)' :
              feedback.type === 'warning' ? 'rgba(245, 158, 11, 0.9)' :
              'rgba(59, 130, 246, 0.9)'
            }
            stroke={
              feedback.type === 'success' ? '#22c55e' :
              feedback.type === 'error' ? '#ef4444' :
              feedback.type === 'warning' ? '#f59e0b' :
              '#3b82f6'
            }
            strokeWidth={2}
            style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
          />
          <text
            x={feedback.showAt.x}
            y={feedback.showAt.y - 20}
            textAnchor="middle"
            fontSize={12}
            fill="white"
            fontWeight="bold"
          >
            {feedback.message}
          </text>
        </g>
      )}
    </g>
  );
}; 