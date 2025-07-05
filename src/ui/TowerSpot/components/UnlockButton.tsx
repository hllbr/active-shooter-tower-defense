import React from 'react';
import { UI_TEXTS, formatCurrency } from '../../../utils/constants';

interface UnlockButtonProps {
  slotIdx: number;
  unlockCost: number;
  canUnlock: boolean;
  onClick: () => void;
}

export const UnlockButton: React.FC<UnlockButtonProps> = ({ unlockCost, canUnlock, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={!canUnlock}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: canUnlock 
          ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' 
          : 'linear-gradient(135deg, #6b7280, #4b5563)',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 12,
        fontWeight: 'bold',
        cursor: canUnlock ? 'pointer' : 'not-allowed',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        transition: 'all 0.2s',
        zIndex: 10,
        minWidth: 80,
        textAlign: 'center',
        opacity: canUnlock ? 1 : 0.7
      }}
      aria-label={canUnlock 
        ? UI_TEXTS.ARIA_LABELS.PURCHASE_BUTTON('Slot', unlockCost)
        : UI_TEXTS.ARIA_LABELS.LOCKED(`${formatCurrency(unlockCost)} gerekli`)
      }
    >
      {canUnlock 
        ? `${UI_TEXTS.BUTTONS.UNLOCK} (${formatCurrency(unlockCost)})` 
        : `${UI_TEXTS.BUTTONS.INSUFFICIENT} (${formatCurrency(unlockCost)})`
      }
    </button>
  );
}; 