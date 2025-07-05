import React from 'react';
import type { TowerMenuProps } from '../types';

export const TowerMenu: React.FC<TowerMenuProps> = ({ 
  menuPos, 
  slot, 
  slotIdx, 
  onClose, 
  onBuildTower, 
  onPerformTileAction 
}) => {
  if (!menuPos) return null;

  return (
    <foreignObject 
      x={menuPos.x} 
      y={menuPos.y} 
      width="140" 
      height="110" 
      style={{ pointerEvents: 'auto' }}
    >
      <div 
        style={{ 
          background: '#222', 
          color: '#fff', 
          border: '1px solid #555', 
          fontSize: 12,
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
        {!slot.tower && (
          <div 
            style={{ 
              padding: 8, 
              cursor: 'pointer',
              borderBottom: '1px solid #555'
            }} 
            onClick={() => { 
              onBuildTower(slotIdx, 'economy'); 
              onClose(); 
            }}
          >
            Çıkarıcı Kur
          </div>
        )}
        <div 
          style={{ 
            padding: 8, 
            cursor: 'pointer',
            borderBottom: '1px solid #555'
          }} 
          onClick={() => { 
            onPerformTileAction(slotIdx, 'wall'); 
            onClose(); 
          }}
        >
          Duvar Kur
        </div>
        <div 
          style={{ 
            padding: 8, 
            cursor: 'pointer',
            borderBottom: '1px solid #555'
          }} 
          onClick={() => { 
            onPerformTileAction(slotIdx, 'trench'); 
            onClose(); 
          }}
        >
          Siper Kaz
        </div>
        <div 
          style={{ 
            padding: 8, 
            cursor: 'pointer'
          }} 
          onClick={() => { 
            onPerformTileAction(slotIdx, 'buff'); 
            onClose(); 
          }}
        >
          Güçlendirici Kur
        </div>
      </div>
    </foreignObject>
  );
}; 