import type { CSSProperties } from 'react';
import { GAME_CONSTANTS } from '../../../utils/Constants';

// Re-export styles from specialized files
export { headerStyles } from './headerStyles';
export { tabStyles, getTabButtonStyle, getPriorityBadgeStyle } from './tabStyles';
export { diceSystemStyles } from './diceSystemStyles';
export { discountStyles, getDiscountStatusStyle, getDiscountStatusTitleStyle } from './discountStyles';
export { footerStyles } from './footerStyles';

export const upgradeScreenStyles = {
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    backdropFilter: 'blur(6px)',
  } as CSSProperties,

  mainContainer: {
    background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
    color: '#ffffff',
    padding: 16,
    borderRadius: 16,
    width: '90%',
    maxWidth: 1000,
    maxHeight: '88vh',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    border: `3px solid ${GAME_CONSTANTS.GOLD_COLOR}`,
    boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
  } as CSSProperties,

  categoryCard: {
    background: 'linear-gradient(145deg, #2a2a3e, #1e1e2e)',
    padding: 16,
    borderRadius: 12,
    border: '2px solid #3a3a4e',
    marginBottom: 12,
  } as CSSProperties,

  categoryTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: 8,
  } as CSSProperties,

  categoryDescription: {
    fontSize: '0.9rem',
    color: '#cccccc',
    lineHeight: 1.4,
  } as CSSProperties,

  discountCategoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 12,
    marginTop: 16,
  } as CSSProperties,
}; 