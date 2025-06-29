import type { CSSProperties } from 'react';
import { GAME_CONSTANTS } from '../../../utils/Constants';

export const headerStyles = {
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    background: 'rgba(255,215,0,0.08)',
    borderRadius: 10,
    border: '2px solid rgba(255,215,0,0.3)'
  } as CSSProperties,

  headerTitle: {
    textAlign: 'center',
    flex: 1
  } as CSSProperties,

  titleText: {
    fontWeight: 'bold',
    fontSize: 22,
    color: GAME_CONSTANTS.GOLD_COLOR,
    textShadow: '0 0 20px rgba(255,215,0,0.5)'
  } as CSSProperties,

  goldDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,215,0,0.1))',
    padding: '8px 16px',
    borderRadius: 10,
    border: '2px solid rgba(255,215,0,0.4)',
    boxShadow: '0 4px 12px rgba(255,215,0,0.3)'
  } as CSSProperties,

  goldText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: GAME_CONSTANTS.GOLD_COLOR,
    textShadow: '0 0 10px rgba(255,215,0,0.5)',
    minWidth: 60,
    textAlign: 'right'
  } as CSSProperties,
}; 