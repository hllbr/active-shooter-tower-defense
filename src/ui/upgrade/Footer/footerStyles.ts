import type { CSSProperties } from 'react';

export const footerStyles = {
  footerContainer: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: 12,
    borderTop: '2px solid rgba(255,215,0,0.3)',
    background: 'rgba(255,215,0,0.05)',
    borderRadius: 10,
    padding: 12
  } as CSSProperties,

  continueButton: {
    padding: '14px 32px',
    fontSize: 18,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #4ade80, #22c55e)',
    color: '#000',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 6px 18px rgba(74, 222, 128, 0.4)',
    transition: 'all 0.3s ease',
    minWidth: 180,
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
  } as CSSProperties,
}; 