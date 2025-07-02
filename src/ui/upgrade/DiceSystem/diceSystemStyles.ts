import type { CSSProperties } from 'react';

export const diceSystemStyles = {
  diceSystemContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  } as CSSProperties,

  diceSystemMain: {
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.1))',
    borderRadius: 16,
    padding: 20,
    border: '3px solid #ef4444',
    textAlign: 'center'
  } as CSSProperties,

  diceSystemTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 16
  } as CSSProperties,

  diceSystemDescription: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 16,
    lineHeight: 1.5,
    maxWidth: 550,
    margin: '16px auto 0'
  } as CSSProperties,
}; 