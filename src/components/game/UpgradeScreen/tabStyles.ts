import type { CSSProperties } from 'react';

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