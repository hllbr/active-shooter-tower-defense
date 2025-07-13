import React, { useState, useCallback } from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { playSound } from '../../../utils/sound/soundEffects';
import { toast } from 'react-toastify';
import type { TowerSlot } from '../../../models/gameTypes';

interface TileActionMenuProps {
  slot: TowerSlot;
  slotIdx: number;
  onTileAction: (slotIdx: number, action: 'wall' | 'trench' | 'buff') => void;
  onClose: () => void;
  isVisible: boolean;
  actionsRemaining: number;
}

interface TileActionOption {
  action: 'wall' | 'trench' | 'buff';
  icon: string;
  name: string;
  description: string;
  energyCost: number;
  color: string;
}

const TILE_ACTIONS: TileActionOption[] = [
  {
    action: 'wall',
    icon: '🧱',
    name: 'Build Wall',
    description: 'Creates a defensive barrier',
    energyCost: GAME_CONSTANTS.MAP_ACTION_ENERGY.wall,
    color: '#8b5cf6'
  },
  {
    action: 'trench',
    icon: '🕳️',
    name: 'Dig Trench',
    description: 'Slows enemy movement',
    energyCost: GAME_CONSTANTS.MAP_ACTION_ENERGY.trench,
    color: '#f59e0b'
  },
  {
    action: 'buff',
    icon: '⚡',
    name: 'Call Reinforcement',
    description: 'Increases tower range',
    energyCost: GAME_CONSTANTS.MAP_ACTION_ENERGY.buff,
    color: '#10b981'
  }
];

export const TileActionMenu: React.FC<TileActionMenuProps> = ({
  slot,
  slotIdx,
  onTileAction,
  onClose,
  isVisible,
  actionsRemaining
}) => {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const handleActionClick = useCallback((action: 'wall' | 'trench' | 'buff') => {
    if (actionsRemaining <= 0) {
      toast.warning('No actions remaining!');
      playSound('error');
      return;
    }

    onTileAction(slotIdx, action);
    playSound('tower-upgrade');
    toast.success(`${TILE_ACTIONS.find(a => a.action === action)?.name} applied!`);
    onClose();
  }, [actionsRemaining, onTileAction, slotIdx, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isVisible) return null;

  const slotCenterX = slot.x;
  const slotCenterY = slot.y;

  return (
    <>
      {/* Backdrop */}
      <foreignObject
        x={0}
        y={0}
        width="100%"
        height="100%"
        style={{ pointerEvents: 'auto' }}
        onClick={handleBackdropClick}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000
          }}
        />
      </foreignObject>

      {/* Menu */}
      <foreignObject
        x={slotCenterX - 120}
        y={slotCenterY - 100}
        width={240}
        height={200}
        style={{ pointerEvents: 'auto' }}
      >
        <div
          style={{
            background: '#1f2937',
            border: '2px solid #374151',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            animation: 'menuSlideIn 0.2s ease-out'
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px solid #374151'
            }}
          >
            <span style={{ color: '#f9fafb', fontWeight: 'bold', fontSize: '14px' }}>
              Tile Actions
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '4px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {TILE_ACTIONS.map((actionOption) => (
              <div
                key={actionOption.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: hoveredAction === actionOption.action ? '#374151' : 'transparent',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  border: `1px solid ${actionOption.color}40`
                }}
                onClick={() => handleActionClick(actionOption.action)}
                onMouseEnter={() => setHoveredAction(actionOption.action)}
                onMouseLeave={() => setHoveredAction(null)}
              >
                <span style={{ fontSize: '20px', marginRight: '12px' }}>
                  {actionOption.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#f9fafb', fontWeight: 'bold', fontSize: '13px' }}>
                    {actionOption.name}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '11px' }}>
                    {actionOption.description}
                  </div>
                </div>
                <div style={{ 
                  color: actionOption.color, 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  background: `${actionOption.color}20`,
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  ⚡{actionOption.energyCost}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: '12px',
              paddingTop: '8px',
              borderTop: '1px solid #374151',
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '12px'
            }}
          >
            Actions remaining: {actionsRemaining}
          </div>
        </div>
      </foreignObject>
    </>
  );
}; 