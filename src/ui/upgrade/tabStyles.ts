import type { CSSProperties } from 'react';
import { sanitizeColor } from '../../utils/styleUtils';

export const tabStyles = {
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
    scrollbarWidth: 'thin' as const,
    scrollbarColor: '#4A5568 #1A202C',
    '&::-webkit-scrollbar': {
      width: '8px'
    },
    '&::-webkit-scrollbar-track': {
      background: '#1A202C',
      borderRadius: '4px'
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#4A5568',
      borderRadius: '4px',
      '&:hover': {
        background: '#6B7280'
      }
    }
  } as CSSProperties,

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
  isDiceTab: boolean = false,
  isHovered: boolean = false
): CSSProperties => {
  const safeColor = sanitizeColor(color, '#ffffff');
  const activeOrHover = isActive || isHovered;
  return {
    padding: isDiceTab ? '14px 16px' : '12px 14px',
    borderRadius: 10,
    border: `2px solid ${isActive ? safeColor : 'rgba(255,255,255,0.1)'}`,
    background: isActive
      ? `linear-gradient(135deg, ${safeColor}40, ${safeColor}20)`
      : 'rgba(0,0,0,0.3)',
    color: isActive ? safeColor : '#ccc',
    cursor: 'pointer',
    fontSize: isDiceTab ? 14 : 13,
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    position: 'relative',
    transform: activeOrHover ? 'translateY(-1px)' : 'none',
    boxShadow: activeOrHover ? `0 4px 16px ${safeColor}40` : 'none',
  };
};

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