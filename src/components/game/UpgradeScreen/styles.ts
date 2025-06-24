import type { CSSProperties } from 'react';
import { GAME_CONSTANTS } from '../../../utils/Constants';

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

  tabNavigation: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 8
  } as CSSProperties,

  tabContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 20px',
    background: 'rgba(0,0,0,0.15)',
    borderRadius: 12,
    border: '2px solid rgba(255,255,255,0.1)',
  } as CSSProperties,

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

  // Dice System Styles
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

  discountStatusContainer: {
    padding: 18,
    borderRadius: 12,
    textAlign: 'center'
  } as CSSProperties,

  discountStatusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12
  } as CSSProperties,

  discountCategoriesGrid: {
    fontSize: 13,
    color: '#ddd',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 10,
    marginTop: 14
  } as CSSProperties,

  categoryCard: {
    padding: 10,
    background: 'rgba(0,0,0,0.3)',
    borderRadius: 6
  } as CSSProperties,

  categoryTitle: {
    fontWeight: 'bold',
    fontSize: 12
  } as CSSProperties,

  categoryDescription: {
    fontSize: 10,
    opacity: 0.8
  } as CSSProperties,

  // Tab styles
  coreTabContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  } as CSSProperties,
};

export const getTabButtonStyle = (
  isActive: boolean, 
  color: string, 
  isDiceTab: boolean = false
): CSSProperties => ({
  padding: isDiceTab ? '14px 16px' : '12px 14px',
  borderRadius: 10,
  border: `2px solid ${isActive ? color : 'rgba(255,255,255,0.1)'}`,
  background: isActive 
    ? `linear-gradient(135deg, ${color}40, ${color}20)` 
    : 'rgba(0,0,0,0.3)',
  color: isActive ? color : '#ccc',
  cursor: 'pointer',
  fontSize: isDiceTab ? 14 : 13,
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  textAlign: 'center',
  position: 'relative',
  transform: isActive ? 'translateY(-1px)' : 'none',
  boxShadow: isActive ? `0 4px 16px ${color}40` : 'none',
});

export const getPriorityBadgeStyle = (): CSSProperties => ({
  position: 'absolute',
  top: -6,
  right: -6,
  background: '#ff4444',
  color: 'white',
  fontSize: 9,
  fontWeight: 'bold',
  padding: '2px 6px',
  borderRadius: 8,
  animation: 'pulse 2s infinite'
});

export const getDiscountStatusStyle = (discountMultiplier: number) => {
  const isDisabled = discountMultiplier === 0;
  const isSuper = discountMultiplier > 1;
  
  const color = isDisabled ? '#ff4444' : isSuper ? '#4ade80' : '#fbbf24';
  const bgColor = isDisabled ? 'rgba(255, 68, 68, 0.2)' : isSuper ? 'rgba(74, 222, 128, 0.2)' : 'rgba(251, 191, 36, 0.2)';
  
  return {
    ...upgradeScreenStyles.discountStatusContainer,
    border: `2px solid ${color}`,
    background: `linear-gradient(135deg, ${bgColor}, rgba(0,0,0,0.1))`,
  };
};

export const getDiscountStatusTitleStyle = (discountMultiplier: number): CSSProperties => {
  const isDisabled = discountMultiplier === 0;
  const isSuper = discountMultiplier > 1;
  
  const color = isDisabled ? '#ff4444' : isSuper ? '#4ade80' : '#fbbf24';
  
  return {
    ...upgradeScreenStyles.discountStatusTitle,
    color,
  };
}; 